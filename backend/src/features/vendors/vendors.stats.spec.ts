import { Test, TestingModule } from '@nestjs/testing';
import { VendorsService } from './vendors.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VendorProfile } from '../../domain/entities/vendor-profile.entity';
import { User } from '../../domain/entities/user.entity';
import { City } from '../../domain/entities/city.entity';
import { Offer } from '../../domain/entities/offer.entity';
import { DataSource } from 'typeorm';

describe('VendorsService - getStats', () => {
    let service: VendorsService;
    let mockDataSource: any;
    let mockQueryBuilder: any;
    let mockVendorRepo: any;

    const mockStats = {
        totalViews: '100',
        totalRedemptions: '50',
        activeOffers: '5',
        totalOffers: '8', // 5 active + 3 inactive
        inactiveOffers: '3',
    };

    beforeEach(async () => {
        mockQueryBuilder = {
            select: jest.fn().mockReturnThis(),
            addSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getRawOne: jest.fn(),
        };

        const mockRepo = {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
        };

        mockDataSource = {
            getRepository: jest.fn().mockReturnValue(mockRepo),
        };

        mockVendorRepo = {
            findOne: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VendorsService,
                { provide: getRepositoryToken(VendorProfile), useValue: mockVendorRepo },
                { provide: getRepositoryToken(User), useValue: {} },
                { provide: getRepositoryToken(City), useValue: {} },
                { provide: DataSource, useValue: mockDataSource },
            ],
        }).compile();

        service = module.get<VendorsService>(VendorsService);
    });

    it('should return stats correctly when data exists', async () => {
        const userId = 'user-1';
        const vendorId = 'vendor-1';

        mockVendorRepo.findOne.mockResolvedValue({
            id: vendorId,
            ratingAvg: 4.5,
            reviewCount: 10
        });

        mockQueryBuilder.getRawOne.mockResolvedValue(mockStats);

        const result = await service.getStats(userId);

        expect(result).toEqual({
            totalViews: 100,
            totalRedemptions: 50,
            activeOffers: 5,
            totalOffers: 8,
            inactiveOffers: 3,
            ratingAvg: 4.5,
            reviewCount: 10,
        });
    });

    it('should handle null values from aggregation (no interactions yet)', async () => {
        const userId = 'user-1';
        mockVendorRepo.findOne.mockResolvedValue({
            id: 'vendor-1',
            ratingAvg: 0,
            reviewCount: 0
        });

        // SUM returns null if no rows match or values are null
        mockQueryBuilder.getRawOne.mockResolvedValue({
            totalViews: null,
            totalRedemptions: null,
            activeOffers: '0',
            inactiveOffers: '0',
            totalOffers: '0',
        });

        const result = await service.getStats(userId);

        expect(result.totalViews).toBe(0);
        expect(result.totalRedemptions).toBe(0);
        expect(result.activeOffers).toBe(0);
        expect(result.inactiveOffers).toBe(0);
        expect(result.totalOffers).toBe(0);
    });

    it('should return 0s if getRawOne returns undefined (GRACEFUL HANDLING)', async () => {
        const userId = 'user-1';
        mockVendorRepo.findOne.mockResolvedValue({
            id: 'vendor-1',
            ratingAvg: 0,
            reviewCount: 0
        });

        // Simulate getRawOne returning undefined
        mockQueryBuilder.getRawOne.mockResolvedValue(undefined);

        const result = await service.getStats(userId);

        expect(result).toEqual({
            totalViews: 0,
            totalRedemptions: 0,
            activeOffers: 0,
            totalOffers: 0,
            inactiveOffers: 0,
            ratingAvg: 0,
            reviewCount: 0,
        });
    });
});
