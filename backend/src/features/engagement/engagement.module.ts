import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from '../../domain/entities/favorite.entity';
import { Review } from '../../domain/entities/review.entity';
import { VendorProfile } from '../../domain/entities/vendor-profile.entity';
import { FavoritesService } from './favorites.service';
import { ReviewsService } from './reviews.service';
import { EngagementController } from './engagement.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Favorite, Review, VendorProfile])],
    providers: [FavoritesService, ReviewsService],
    controllers: [EngagementController],
    exports: [FavoritesService, ReviewsService],
})
export class EngagementModule { }
