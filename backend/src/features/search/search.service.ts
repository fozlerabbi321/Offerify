import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Offer } from '../../domain/entities/offer.entity';
import { Category } from '../../domain/entities/category.entity';
import { VendorProfile } from '../../domain/entities/vendor-profile.entity';

@Injectable()
export class SearchService {
    constructor(
        @InjectRepository(Offer)
        private readonly offerRepository: Repository<Offer>,
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
        @InjectRepository(VendorProfile)
        private readonly vendorRepository: Repository<VendorProfile>,
    ) { }

    async getSuggestions(query: string, cityId?: number): Promise<string[]> {
        if (!query || query.length < 2) return [];

        const suggestionsArr: string[] = [];

        // 1. Check Categories
        const categories = await this.categoryRepository.find({
            where: { name: ILike(`%${query}%`) },
            take: 3,
        });
        categories.forEach(c => suggestionsArr.push(c.name));

        // 2. Check Vendors
        const vendorQuery = this.vendorRepository.createQueryBuilder('vendor')
            .where('vendor.businessName ILIKE :q', { q: `%${query}%` });

        if (cityId) {
            vendorQuery.andWhere('vendor.city_id = :cityId', { cityId });
        }

        const vendors = await vendorQuery.take(3).getMany();
        vendors.forEach(v => suggestionsArr.push(v.businessName));

        // 3. Check Offers
        const offerQuery = this.offerRepository.createQueryBuilder('offer')
            .select('DISTINCT offer.title', 'title')
            .where('offer.title ILIKE :q', { q: `%${query}%` })
            .andWhere('offer.isActive = :active', { active: true });

        if (cityId) {
            offerQuery.andWhere('offer.city_id = :cityId', { cityId });
        }

        const offers = await offerQuery.take(5).getRawMany();
        offers.forEach(o => suggestionsArr.push(o.title));

        // De-duplicate and limit
        return Array.from(new Set(suggestionsArr)).slice(0, 8);
    }
}
