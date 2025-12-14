import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { Offer } from '../../domain/entities/offer.entity';
import { VendorProfile } from '../../domain/entities/vendor-profile.entity';
import { City } from '../../domain/entities/city.entity';
import { Favorite } from '../../domain/entities/favorite.entity';
import { OfferRedemption } from '../../domain/entities/offer-redemption.entity';
import { Shop } from '../../domain/entities/shop.entity';

import { CategoriesModule } from '../categories/categories.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Offer, VendorProfile, City, Favorite, OfferRedemption, Shop]),
        CategoriesModule,
    ],
    controllers: [OffersController],
    providers: [OffersService],
    exports: [OffersService],
})
export class OffersModule { }
