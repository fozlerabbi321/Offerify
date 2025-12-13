import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorsService } from './vendors.service';
import { VendorsController, VendorsPublicController } from './vendors.controller';
import { VendorProfile } from '../../domain/entities/vendor-profile.entity';
import { User } from '../../domain/entities/user.entity';
import { City } from '../../domain/entities/city.entity';

@Module({
    imports: [TypeOrmModule.forFeature([VendorProfile, User, City])],
    controllers: [VendorsController, VendorsPublicController],
    providers: [VendorsService],
    exports: [VendorsService],
})
export class VendorsModule { }
