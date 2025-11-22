import { Controller, Get, Query } from '@nestjs/common';
import { LocationService } from './location.service';
import { NearestZoneDto } from './dto/nearest-zone.dto';
import { City } from '../../domain/entities/city.entity';

@Controller('location')
export class LocationController {
    constructor(private readonly locationService: LocationService) { }

    @Get('nearest')
    async getNearestZone(@Query() query: NearestZoneDto): Promise<City> {
        return this.locationService.findNearestZone(query.lat, query.long);
    }
}
