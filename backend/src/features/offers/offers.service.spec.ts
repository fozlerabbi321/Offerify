import { Test, TestingModule } from '@nestjs/testing';
import { OffersService } from './offers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Offer } from '../../domain/entities/offer.entity';
import { VendorProfile } from '../../domain/entities/vendor-profile.entity';
import { CategoriesService } from '../categories/categories.service';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UpdateOfferDto } from './dto/update-offer.dto';

describe('OffersService', () => {
    let service: OffersService;
    let offerRepository: Repository<Offer>;
    let vendorRepository: Repository<VendorProfile>;
    let categoriesService: CategoriesService;

    const mockOfferRepository = {
        findOne: jest.fn(),
        save: jest.fn(),
        remove: jest.fn(),
        create: jest.fn(),
        createQueryBuilder: jest.fn(),
    };

    const mockVendorRepository = {
        findOne: jest.fn(),
    };

    const mockCategoriesService = {
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OffersService,
                {
                    provide: getRepositoryToken(Offer),
                    useValue: mockOfferRepository,
                },
                {
                    provide: getRepositoryToken(VendorProfile),
                    useValue: mockVendorRepository,
                },
                {
                    provide: CategoriesService,
                    useValue: mockCategoriesService,
                },
            ],
        }).compile();

        service = module.get<OffersService>(OffersService);
        offerRepository = module.get<Repository<Offer>>(getRepositoryToken(Offer));
        vendorRepository = module.get<Repository<VendorProfile>>(getRepositoryToken(VendorProfile));
        categoriesService = module.get<CategoriesService>(CategoriesService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('verifyOwnership', () => {
        it('should throw NotFoundException if offer does not exist', async () => {
            mockOfferRepository.findOne.mockResolvedValue(null);

            await expect(
                service.verifyOwnership('offer-id', 'user-id')
            ).rejects.toThrow(NotFoundException);

            expect(mockOfferRepository.findOne).toHaveBeenCalledWith({
                where: { id: 'offer-id' },
                relations: ['vendor', 'vendor.user'],
            });
        });

        it('should throw ForbiddenException if user does not own the offer', async () => {
            const mockOffer = {
                id: 'offer-id',
                vendor: {
                    id: 'vendor-id',
                    user: {
                        id: 'different-user-id',
                    },
                },
            };

            mockOfferRepository.findOne.mockResolvedValue(mockOffer);

            await expect(
                service.verifyOwnership('offer-id', 'user-id')
            ).rejects.toThrow(ForbiddenException);
        });

        it('should return offer if user owns it', async () => {
            const mockOffer = {
                id: 'offer-id',
                vendor: {
                    id: 'vendor-id',
                    user: {
                        id: 'user-id',
                    },
                },
            };

            mockOfferRepository.findOne.mockResolvedValue(mockOffer);

            const result = await service.verifyOwnership('offer-id', 'user-id');

            expect(result).toEqual(mockOffer);
        });
    });

    describe('update with ownership verification', () => {
        it('should throw ForbiddenException if user does not own the offer', async () => {
            const mockOffer = {
                id: 'offer-id',
                vendor: {
                    user: { id: 'different-user-id' },
                },
            };

            mockOfferRepository.findOne.mockResolvedValue(mockOffer);

            const updateDto: UpdateOfferDto = { title: 'Updated Title' };

            await expect(
                service.update('offer-id', 'user-id', updateDto)
            ).rejects.toThrow(ForbiddenException);
        });

        it('should update offer if user owns it', async () => {
            const mockOffer = {
                id: 'offer-id',
                title: 'Old Title',
                vendor: {
                    user: { id: 'user-id' },
                },
            };

            const updatedOffer = {
                ...mockOffer,
                title: 'Updated Title',
            };

            mockOfferRepository.findOne
                .mockResolvedValueOnce(mockOffer) // First call for ownership check
                .mockResolvedValueOnce(updatedOffer); // Second call in findOne after save

            mockOfferRepository.save.mockResolvedValue(updatedOffer);

            const updateDto: UpdateOfferDto = { title: 'Updated Title' };
            const result = await service.update('offer-id', 'user-id', updateDto);

            expect(result.title).toBe('Updated Title');
            expect(mockOfferRepository.save).toHaveBeenCalled();
        });
    });

    describe('remove with ownership verification', () => {
        it('should throw ForbiddenException if user does not own the offer', async () => {
            const mockOffer = {
                id: 'offer-id',
                vendor: {
                    user: { id: 'different-user-id' },
                },
            };

            mockOfferRepository.findOne.mockResolvedValue(mockOffer);

            await expect(
                service.remove('offer-id', 'user-id')
            ).rejects.toThrow(ForbiddenException);
        });

        it('should delete offer if user owns it', async () => {
            const mockOffer = {
                id: 'offer-id',
                vendor: {
                    user: { id: 'user-id' },
                },
            };

            mockOfferRepository.findOne.mockResolvedValue(mockOffer);
            mockOfferRepository.remove.mockResolvedValue(mockOffer);

            await service.remove('offer-id', 'user-id');

            expect(mockOfferRepository.remove).toHaveBeenCalledWith(mockOffer);
        });
    });

    describe('findByVendor', () => {
        it('should return offers for a specific vendor', async () => {
            const mockOffers = [
                { id: '1', title: 'Offer 1' },
                { id: '2', title: 'Offer 2' },
            ];

            const mockQueryBuilder = {
                where: jest.fn().mockReturnThis(),
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue(mockOffers),
            };

            mockOfferRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            const result = await service.findByVendor('vendor-id');

            expect(result).toEqual(mockOffers);
            expect(mockQueryBuilder.where).toHaveBeenCalledWith('offer.vendorId = :vendorId', { vendorId: 'vendor-id' });
        });
    });
});
