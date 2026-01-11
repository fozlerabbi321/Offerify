import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { Offer } from '../../domain/entities/offer.entity';
import { Category } from '../../domain/entities/category.entity';
import { VendorProfile } from '../../domain/entities/vendor-profile.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Offer, Category, VendorProfile]),
    ],
    controllers: [SearchController],
    providers: [SearchService],
})
export class SearchModule { }
