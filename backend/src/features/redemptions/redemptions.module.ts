import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedemptionsService } from './redemptions.service';
import { RedemptionsController } from './redemptions.controller';
import { OfferRedemption } from '../../domain/entities/offer-redemption.entity';
import { Offer } from '../../domain/entities/offer.entity';
import { User } from '../../domain/entities/user.entity';
import { VendorProfile } from '../../domain/entities/vendor-profile.entity';

@Module({
    imports: [TypeOrmModule.forFeature([OfferRedemption, Offer, User, VendorProfile])],
    controllers: [RedemptionsController],
    providers: [RedemptionsService],
})
export class RedemptionsModule { }
