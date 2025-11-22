import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from '../../domain/entities/offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class OffersService {
    constructor(
        @InjectRepository(Offer)
        private readonly offerRepository: Repository<Offer>,
    ) { }

    async createOffer(createOfferDto: CreateOfferDto): Promise<Offer> {
        const offer = this.offerRepository.create(createOfferDto);
        return await this.offerRepository.save(offer);
    }
}
