import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from '../../domain/entities/city.entity';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) { }

  async findNearestZone(lat: number, long: number): Promise<City> {
    // Default search radius: 10km (10,000 meters)
    const SEARCH_RADIUS_METERS = 10000;

    const city = await this.cityRepository
      .createQueryBuilder('city')
      .where(
        `ST_DWithin(
          city.centerPoint, 
          ST_SetSRID(ST_MakePoint(:long, :lat), 4326), 
          :range
        )`,
      )
      .orderBy(
        `ST_Distance(
          city.centerPoint, 
          ST_SetSRID(ST_MakePoint(:long, :lat), 4326)
        )`,
        'ASC',
      )
      .setParameters({
        lat,
        long,
        range: SEARCH_RADIUS_METERS,
      })
      .limit(1)
      .getOne();

    if (!city) {
      throw new NotFoundException('No zone found within range.');
    }

    return city;
  }

  async findAll(): Promise<City[]> {
    return this.cityRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }
}
