import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../domain/entities/user.entity';
import { Review } from '../../domain/entities/review.entity';
import { PageContent } from '../../domain/entities/page-content.entity';
import { AppSetting } from '../../domain/entities/app-setting.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

import { VendorProfile } from '../../domain/entities/vendor-profile.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Review, PageContent, AppSetting, VendorProfile]),
    ],
    controllers: [AdminController],
    providers: [AdminService],
    exports: [AdminService],
})
export class AdminModule { }
