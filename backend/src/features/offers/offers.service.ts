import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { MultipartFile } from '@fastify/multipart';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from '../../domain/entities/offer.entity';
import { VendorProfile } from '../../domain/entities/vendor-profile.entity';
import { Favorite } from '../../domain/entities/favorite.entity';
import { OfferRedemption } from '../../domain/entities/offer-redemption.entity';
import { Shop } from '../../domain/entities/shop.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

import { CategoriesService } from '../categories/categories.service';
import { FileUploadUtil } from '../../common/utils/file-upload.util';

@Injectable()
export class OffersService {
    constructor(
        @InjectRepository(Offer)
        private readonly offerRepository: Repository<Offer>,
        @InjectRepository(VendorProfile)
        private readonly vendorRepository: Repository<VendorProfile>,
        @InjectRepository(Favorite)
        private readonly favoriteRepository: Repository<Favorite>,
        @InjectRepository(OfferRedemption)
        private readonly redemptionRepository: Repository<OfferRedemption>,
        @InjectRepository(Shop)
        private readonly shopRepository: Repository<Shop>,
        private readonly categoriesService: CategoriesService,
    ) { }

    async createOffer(userId: string, createOfferDto: CreateOfferDto, file?: MultipartFile): Promise<Offer> {
        // Fetch vendor with city and shops relations
        const vendor = await this.vendorRepository.findOne({
            where: { user: { id: userId } },
            relations: ['city', 'shops'],
        });

        if (!vendor) {
            throw new NotFoundException(`Vendor profile not found for user ${userId}`);
        }

        // Validate Category
        const category = await this.categoriesService.findOne(createOfferDto.categoryId);
        if (!category) {
            throw new NotFoundException(`Category with ID ${createOfferDto.categoryId} not found`);
        }

        // Resolve shop: Use provided shopId or fallback to default shop
        let shop: Shop | null = null;
        if (createOfferDto.shopId) {
            shop = await this.shopRepository.findOne({
                where: { id: createOfferDto.shopId, vendor: { id: vendor.id } },
                relations: ['city'],
            });
            if (!shop) {
                throw new NotFoundException(`Shop with ID ${createOfferDto.shopId} not found or does not belong to vendor`);
            }
        } else {
            // Find default shop
            shop = await this.shopRepository.findOne({
                where: { vendor: { id: vendor.id }, isDefault: true },
                relations: ['city'],
            });
        }

        // City comes from shop (if available) or fallback to vendor's city
        const targetCityId = shop?.cityId || createOfferDto.cityId || vendor.cityId;

        let imagePath: string | undefined;
        if (file) {
            try {
                imagePath = await FileUploadUtil.saveFile(file, 'offers');
            } catch (error) {
                console.error('File upload failed:', error);
                throw error;
            }
        }

        // Create offer with shop, city, and vendor
        const offer = this.offerRepository.create({
            ...createOfferDto,
            shop: shop || undefined,
            city: { id: targetCityId } as any,
            category: { id: createOfferDto.categoryId } as any,
            vendor: vendor,
            imagePath: imagePath,
        });

        // Save the offer
        let savedOffer: Offer;
        try {
            savedOffer = await this.offerRepository.save(offer);
        } catch (error) {
            console.error('Save failed:', error);
            throw error;
        }

        // Fetch the offer again with relations populated for response
        const offerWithRelations = await this.offerRepository.findOne({
            where: { id: savedOffer.id },
            relations: ['city', 'category', 'shop'],
        });

        if (!offerWithRelations) {
            throw new NotFoundException(`Failed to retrieve created offer`);
        }

        return offerWithRelations;
    }

    async findAll(options: {
        cityId?: number;
        featured?: boolean;
        sort?: 'popularity' | 'newest' | 'price_asc' | 'price_desc';
        lat?: number;
        long?: number;
        limit?: number;
        categoryId?: string;
        vendorId?: string;
    }): Promise<Offer[]> {
        const { cityId, featured, sort, lat, long, limit, categoryId, vendorId } = options;
        const query = this.offerRepository.createQueryBuilder('offer')
            .leftJoinAndSelect('offer.city', 'city')
            .leftJoinAndSelect('offer.vendor', 'vendor')
            .where('offer.isActive = :isActive', { isActive: true });

        if (vendorId) {
            query.andWhere('vendor.id = :vendorId', { vendorId });
        }

        if (cityId) {
            query.andWhere('city.id = :cityId', { cityId });
        }

        if (categoryId) {
            query.andWhere('offer.category = :categoryId', { categoryId });
        }

        if (featured) {
            query.andWhere('offer.featured = :featured', { featured: true });
        }

        if (lat && long) {
            // PostGIS ST_DWithin or order by distance
            // Assuming we want to sort by distance if lat/long are present
            // Note: This requires PostGIS extension and geometry column on City or VendorProfile
            // But here we are sorting offers. Offers are linked to City.
            // Or maybe we use the Vendor's location?
            // The requirement says "Near You: Horizontal Scroll of offers sorted by distance (using lat/long from store)"
            // Offers have a city. Cities have coordinates.
            // Or Vendors have coordinates.
            // Let's assume we use the offer's city location for now as offers are linked to city.
            // But wait, VendorProfile has `location` (Point).
            // Let's use Vendor's location for more precision if available, or City's.
            // The Offer entity has `vendor` and `city`.
            // Let's check VendorProfile entity. It has `location`.

            // We need to join vendor to sort by distance
            query.addSelect(
                `ST_Distance(
                    vendor.location, 
                    ST_SetSRID(ST_MakePoint(:long, :lat), 4326)::geography
                )`,
                'distance'
            )
                .setParameter('long', long)
                .setParameter('lat', lat)
                .orderBy('distance', 'ASC');
        }

        if (sort === 'popularity') {
            query.orderBy('offer.views', 'DESC');
        } else if (sort === 'newest') {
            query.orderBy('offer.createdAt', 'DESC');
        } else if (sort === 'price_asc') {
            // This is tricky because price is in child entities.
            // For now, let's skip complex price sorting or implement basic check
            // DiscountOffer has discountPercentage, VoucherOffer has voucherValue.
            // We can't easily sort by "price" across different types without a common column.
            // Let's ignore price sort for now or default to createdAt
            query.orderBy('offer.createdAt', 'DESC');
        } else if (sort === 'price_desc') {
            query.orderBy('offer.createdAt', 'DESC');
        } else if (!lat || !long) {
            // Default sort if not sorting by distance
            query.orderBy('offer.createdAt', 'DESC');
        }

        if (limit) {
            query.take(limit);
        }

        return query.getMany();
    }

    async findOne(id: string, userId?: string | null): Promise<Offer & { isFavorite: boolean; isClaimed: boolean }> {
        const offer = await this.offerRepository.findOne({
            where: { id },
            relations: ['city', 'vendor', 'vendor.city', 'category'],
        });

        if (!offer) {
            throw new NotFoundException(`Offer with ID ${id} not found`);
        }

        // Default values for unauthenticated users
        let isFavorite = false;
        let isClaimed = false;

        if (userId) {
            // Check if user has favorited this offer
            const favorite = await this.favoriteRepository.findOne({
                where: { userId, offerId: id },
            });
            isFavorite = !!favorite;

            // Check if user has claimed this offer
            const redemption = await this.redemptionRepository.findOne({
                where: { user: { id: userId }, offer: { id } },
            });
            isClaimed = !!redemption;
        }

        // Use Object.assign to preserve getter-based properties like 'image'
        return Object.assign(offer, { isFavorite, isClaimed }) as Offer & { isFavorite: boolean; isClaimed: boolean };
    }

    async update(id: string, userId: string, updateOfferDto: UpdateOfferDto): Promise<Offer> {
        // Verify ownership
        const offer = await this.verifyOwnership(id, userId);

        // Update offer properties
        Object.assign(offer, updateOfferDto);

        // Save updated offer
        await this.offerRepository.save(offer);

        // Fetch with relations for response
        return await this.findOne(id);
    }

    async remove(id: string, userId: string): Promise<void> {
        // Verify ownership
        const offer = await this.verifyOwnership(id, userId);

        // Delete the offer
        await this.offerRepository.remove(offer);
    }

    /**
     * Verify that the user owns the offer
     * @param offerId - Offer ID
     * @param userId - User ID
     * @returns Offer if user owns it
     * @throws NotFoundException if offer doesn't exist
     * @throws ForbiddenException if user doesn't own the offer
     */
    async verifyOwnership(offerId: string, userId: string): Promise<Offer> {
        const offer = await this.offerRepository.findOne({
            where: { id: offerId },
            relations: ['vendor', 'vendor.user'],
        });

        if (!offer) {
            throw new NotFoundException(`Offer with ID ${offerId} not found`);
        }

        if (offer.vendor.user.id !== userId) {
            throw new ForbiddenException('You do not have permission to modify this offer');
        }

        return offer;
    }

    /**
     * Get all offers for a specific vendor
     * @param vendorId - Vendor ID
     * @returns List of offers
     */
    async findByVendor(vendorId: string): Promise<Offer[]> {
        return this.offerRepository
            .createQueryBuilder('offer')
            .where('offer.vendor_id = :vendorId', { vendorId })
            .leftJoinAndSelect('offer.city', 'city')
            .leftJoinAndSelect('offer.category', 'category')
            .leftJoinAndSelect('offer.vendor', 'vendor')
            .orderBy('offer.createdAt', 'DESC')
            .getMany();
    }
}
