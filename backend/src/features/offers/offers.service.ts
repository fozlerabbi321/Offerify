import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from '../../domain/entities/offer.entity';
import { VendorProfile } from '../../domain/entities/vendor-profile.entity';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class OffersService {
    constructor(
        @InjectRepository(Offer)
        private readonly offerRepository: Repository<Offer>,
        @InjectRepository(VendorProfile)
        private readonly vendorRepository: Repository<VendorProfile>,
    ) { }

    async createOffer(createOfferDto: CreateOfferDto): Promise<Offer> {
        // Fetch vendor with city relation to get operating city
        const vendor = await this.vendorRepository.findOne({
            where: { id: createOfferDto.vendorId },
            relations: ['city'],
        });

        if (!vendor) {
            throw new NotFoundException(`Vendor with ID ${createOfferDto.vendorId} not found`);
        }

        // Multi-Branch Logic: Use provided cityId or fallback to vendor's operating city
        const targetCityId = createOfferDto.cityId || vendor.cityId;

        // Create offer with the target city
        const offer = this.offerRepository.create({
            ...createOfferDto,
            cityId: targetCityId,
        });

        // Save the offer
        const savedOffer = await this.offerRepository.save(offer);

        // Fetch the offer again with city relation populated for response
        const offerWithCity = await this.offerRepository.findOne({
            where: { id: savedOffer.id },
            relations: ['city'],
        });

        if (!offerWithCity) {
            throw new NotFoundException(`Failed to retrieve created offer`);
        }

        return offerWithCity;
    }
}
