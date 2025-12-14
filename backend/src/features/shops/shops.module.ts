import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from '../../domain/entities/shop.entity';
import { VendorProfile } from '../../domain/entities/vendor-profile.entity';
import { City } from '../../domain/entities/city.entity';
import { ShopsService } from './shops.service';
import { ShopsController } from './shops.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Shop, VendorProfile, City]),
    ],
    controllers: [ShopsController],
    providers: [ShopsService],
    exports: [ShopsService],
})
export class ShopsModule { }
