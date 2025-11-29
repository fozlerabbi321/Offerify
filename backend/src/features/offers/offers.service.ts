import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { MultipartFile } from '@fastify/multipart';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from '../../domain/entities/offer.entity';
import { VendorProfile } from '../../domain/entities/vendor-profile.entity';
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
        private readonly categoriesService: CategoriesService,
    ) { }

    async createOffer(userId: string, createOfferDto: CreateOfferDto, file?: MultipartFile): Promise<Offer> {
        // Fetch vendor with city relation to get operating city
        const vendor = await this.vendorRepository.findOne({
            where: { user: { id: userId } },
            relations: ['city'],
        });

        if (!vendor) {
            throw new NotFoundException(`Vendor profile not found for user ${userId}`);
        }

        // Validate Category
        const category = await this.categoriesService.findOne(createOfferDto.categoryId);
        if (!category) {
            throw new NotFoundException(`Category with ID ${createOfferDto.categoryId} not found`);
        }

        // Multi-Branch Logic: Use provided cityId or fallback to vendor's operating city
        const targetCityId = createOfferDto.cityId || vendor.cityId;

        let imagePath: string | undefined;
        if (file) {
            try {
                imagePath = await FileUploadUtil.saveFile(file, 'offers');
            } catch (error) {
                console.error('File upload failed:', error);
                throw error;
            }
        }

        // Create offer with the target city and vendor
        const offer = this.offerRepository.create({
            ...createOfferDto,
            city: { id: targetCityId } as any, // Link to City entity
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

        // Fetch the offer again with city relation populated for response
        const offerWithCity = await this.offerRepository.findOne({
            where: { id: savedOffer.id },
            relations: ['city', 'category'],
        });

        if (!offerWithCity) {
            throw new NotFoundException(`Failed to retrieve created offer`);
        }

        return offerWithCity;
    }

    async findAll(cityId?: number): Promise<Offer[]> {
        const where: any = { isActive: true };
        if (cityId) {
            where.city = { id: cityId };
        }
        return this.offerRepository.find({
            where,
            relations: ['city', 'vendor'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Offer> {
        const offer = await this.offerRepository.findOne({
            where: { id },
            relations: ['city', 'vendor'],
        });

        if (!offer) {
            throw new NotFoundException(`Offer with ID ${id} not found`);
        }

        return offer;
    }

    async update(id: string, updateOfferDto: UpdateOfferDto): Promise<Offer> {
        // Check if offer exists
        const offer = await this.offerRepository.findOne({
            where: { id },
        });

        if (!offer) {
            throw new NotFoundException(`Offer with ID ${id} not found`);
        }

        // Update offer properties
        Object.assign(offer, updateOfferDto);

        // Save updated offer
        await this.offerRepository.save(offer);

        // Fetch with relations for response
        return await this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        // Check if offer exists
        const offer = await this.offerRepository.findOne({
            where: { id },
        });

        if (!offer) {
            throw new NotFoundException(`Offer with ID ${id} not found`);
        }

        // Delete the offer
        await this.offerRepository.remove(offer);
    }
}
