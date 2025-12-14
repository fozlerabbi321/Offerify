import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from '../../domain/entities/shop.entity';
import { VendorProfile } from '../../domain/entities/vendor-profile.entity';
import { City } from '../../domain/entities/city.entity';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

@Injectable()
export class ShopsService {
    constructor(
        @InjectRepository(Shop)
        private readonly shopRepository: Repository<Shop>,
        @InjectRepository(VendorProfile)
        private readonly vendorRepository: Repository<VendorProfile>,
        @InjectRepository(City)
        private readonly cityRepository: Repository<City>,
    ) { }

    /**
     * Create a new shop for the vendor
     */
    async create(userId: string, dto: CreateShopDto): Promise<Shop> {
        // Find vendor profile
        const vendor = await this.vendorRepository.findOne({
            where: { user: { id: userId } },
        });

        if (!vendor) {
            throw new NotFoundException('Vendor profile not found');
        }

        // Validate city exists
        const city = await this.cityRepository.findOne({
            where: { id: dto.cityId },
        });

        if (!city) {
            throw new NotFoundException('City not found');
        }

        // If this is the first shop or marked as default, handle default logic
        if (dto.isDefault) {
            await this.shopRepository.update(
                { vendor: { id: vendor.id } },
                { isDefault: false },
            );
        }

        const shop = this.shopRepository.create({
            name: dto.name,
            vendor,
            city,
            location: {
                type: 'Point',
                coordinates: [dto.longitude, dto.latitude],
            },
            address: dto.address,
            contactNumber: dto.contactNumber,
            isDefault: dto.isDefault || false,
        });

        return await this.shopRepository.save(shop);
    }

    /**
     * Get all shops for the logged-in vendor
     */
    async findAllForVendor(userId: string): Promise<Shop[]> {
        const vendor = await this.vendorRepository.findOne({
            where: { user: { id: userId } },
        });

        if (!vendor) {
            throw new NotFoundException('Vendor profile not found');
        }

        return await this.shopRepository.find({
            where: { vendor: { id: vendor.id } },
            relations: ['city'],
            order: { isDefault: 'DESC', createdAt: 'ASC' },
        });
    }

    /**
     * Get a specific shop by ID
     */
    async findOne(userId: string, shopId: string): Promise<Shop> {
        const vendor = await this.vendorRepository.findOne({
            where: { user: { id: userId } },
        });

        if (!vendor) {
            throw new NotFoundException('Vendor profile not found');
        }

        const shop = await this.shopRepository.findOne({
            where: { id: shopId, vendor: { id: vendor.id } },
            relations: ['city'],
        });

        if (!shop) {
            throw new NotFoundException('Shop not found');
        }

        return shop;
    }

    /**
     * Update a shop
     */
    async update(userId: string, shopId: string, dto: UpdateShopDto): Promise<Shop> {
        const shop = await this.findOne(userId, shopId);

        // If marking as default, unset other defaults
        if (dto.isDefault) {
            await this.shopRepository.update(
                { vendor: { id: shop.vendorId } },
                { isDefault: false },
            );
        }

        // Update city if provided
        if (dto.cityId) {
            const city = await this.cityRepository.findOne({
                where: { id: dto.cityId },
            });
            if (!city) {
                throw new NotFoundException('City not found');
            }
            shop.city = city;
        }

        // Update location if coordinates provided
        if (dto.latitude !== undefined && dto.longitude !== undefined) {
            shop.location = {
                type: 'Point',
                coordinates: [dto.longitude, dto.latitude],
            };
        }

        // Update other fields
        if (dto.name) shop.name = dto.name;
        if (dto.address !== undefined) shop.address = dto.address;
        if (dto.contactNumber !== undefined) shop.contactNumber = dto.contactNumber;
        if (dto.isDefault !== undefined) shop.isDefault = dto.isDefault;

        return await this.shopRepository.save(shop);
    }

    /**
     * Delete a shop (cannot delete default shop)
     */
    async remove(userId: string, shopId: string): Promise<void> {
        const shop = await this.findOne(userId, shopId);

        if (shop.isDefault) {
            throw new BadRequestException('Cannot delete the default shop. Set another shop as default first.');
        }

        await this.shopRepository.remove(shop);
    }

    /**
     * Get default shop for a vendor (used during offer creation)
     */
    async getDefaultShop(vendorId: string): Promise<Shop | null> {
        return await this.shopRepository.findOne({
            where: { vendor: { id: vendorId }, isDefault: true },
            relations: ['city'],
        });
    }

    /**
     * Create default shop during vendor registration
     */
    async createDefaultShop(
        vendor: VendorProfile,
        city: City,
        location: { latitude: number; longitude: number },
    ): Promise<Shop> {
        const shop = this.shopRepository.create({
            name: `${vendor.businessName} - Main Branch`,
            vendor,
            city,
            location: {
                type: 'Point',
                coordinates: [location.longitude, location.latitude],
            },
            isDefault: true,
        });

        return await this.shopRepository.save(shop);
    }
}
