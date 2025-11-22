import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { Country } from '../../domain/entities/country.entity';
import { State } from '../../domain/entities/state.entity';
import { City } from '../../domain/entities/city.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Country, State, City])],
    controllers: [LocationController],
    providers: [LocationService],
    exports: [LocationService],
})
export class LocationModule { }
