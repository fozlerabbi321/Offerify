import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule } from '@nestjs/config';

import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { LocationModule } from './features/location/location.module';
import { OffersModule } from './features/offers/offers.module';
import { AuthModule } from './features/auth/auth.module';
import { VendorsModule } from './features/vendors/vendors.module';
import { RedemptionsModule } from './features/redemptions/redemptions.module';
import { EngagementModule } from './features/engagement/engagement.module';
import { MediaModule } from './features/media/media.module';
import { CategoriesModule } from './features/categories/categories.module';
import { AdminModule } from './features/admin/admin.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
    }),
    LocationModule,
    OffersModule,
    AuthModule,
    VendorsModule,
    RedemptionsModule,
    EngagementModule,
    MediaModule,
    CategoriesModule,
    AdminModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
