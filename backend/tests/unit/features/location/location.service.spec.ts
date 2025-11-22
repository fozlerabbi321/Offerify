import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocationService } from '../../../../src/features/location/location.service';
import { City } from '../../../../src/domain/entities/city.entity';
import { NotFoundException } from '@nestjs/common';

describe('LocationService', () => {
    let service: LocationService;
    let cityRepository: Repository<City>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LocationService,
                {
                    provide: getRepositoryToken(City),
                    useValue: {
                        createQueryBuilder: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<LocationService>(LocationService);
        cityRepository = module.get<Repository<City>>(getRepositoryToken(City));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findNearestZone', () => {
        it('should return the nearest city struct when valid lat/long are provided', async () => {
            const mockCity = {
                id: 1,
                name: 'Dhaka',
                stateId: 1,
                centerPoint: { type: 'Point', coordinates: [90.4125, 23.8103] },
            } as City;

            const createQueryBuilder: any = {
                select: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                setParameters: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(mockCity),
            };

            jest.spyOn(cityRepository, 'createQueryBuilder').mockReturnValue(createQueryBuilder);

            const result = await service.findNearestZone(23.8103, 90.4125);
            expect(result).toEqual(mockCity);
        });

        it('should throw NotFoundException if no city is found within range', async () => {
            const createQueryBuilder: any = {
                select: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                setParameters: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(null),
            };

            jest.spyOn(cityRepository, 'createQueryBuilder').mockReturnValue(createQueryBuilder);

            await expect(service.findNearestZone(0, 0)).rejects.toThrow(NotFoundException);
        });
    });
});
