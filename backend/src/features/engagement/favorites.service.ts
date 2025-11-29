import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../../domain/entities/favorite.entity';

@Injectable()
export class FavoritesService {
    constructor(
        @InjectRepository(Favorite)
        private readonly favoritesRepository: Repository<Favorite>,
    ) { }

    async toggle(userId: string, offerId: string): Promise<void> {
        const existing = await this.favoritesRepository.findOne({
            where: { userId, offerId },
        });

        if (existing) {
            await this.favoritesRepository.remove(existing);
        } else {
            const favorite = this.favoritesRepository.create({ userId, offerId });
            await this.favoritesRepository.save(favorite);
        }
    }

    async remove(userId: string, offerId: string): Promise<void> {
        const existing = await this.favoritesRepository.findOne({
            where: { userId, offerId },
        });

        if (existing) {
            await this.favoritesRepository.remove(existing);
        }
    }

    async getMyFavorites(userId: string): Promise<Favorite[]> {
        return this.favoritesRepository.find({
            where: { userId },
            relations: ['offer', 'offer.vendor'],
            order: { createdAt: 'DESC' },
        });
    }
}
