import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../../domain/entities/review.entity';
import { VendorProfile } from '../../domain/entities/vendor-profile.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review)
        private readonly reviewsRepository: Repository<Review>,
        @InjectRepository(VendorProfile)
        private readonly vendorRepository: Repository<VendorProfile>,
    ) { }

    async create(userId: string, dto: CreateReviewDto): Promise<Review> {
        const existing = await this.reviewsRepository.findOne({
            where: { userId, vendorId: dto.vendorId },
        });

        if (existing) {
            throw new ConflictException('You have already reviewed this vendor');
        }

        const review = this.reviewsRepository.create({
            ...dto,
            userId,
        });

        const savedReview = await this.reviewsRepository.save(review);

        // Recalculate stats
        const avg = await this.reviewsRepository.average('rating', {
            vendorId: dto.vendorId,
        });
        const count = await this.reviewsRepository.count({
            where: { vendorId: dto.vendorId },
        });

        await this.vendorRepository.update(dto.vendorId, {
            ratingAvg: avg || 0,
            reviewCount: count,
        });

        return savedReview;
    }

    async getReviews(vendorId: string): Promise<Review[]> {
        return this.reviewsRepository.find({
            where: { vendorId },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }
}
