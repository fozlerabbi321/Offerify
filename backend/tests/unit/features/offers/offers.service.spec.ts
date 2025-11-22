import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { OffersService } from '../../../../src/features/offers/offers.service';
import { Offer, OfferType } from '../../../../src/domain/entities/offer.entity';
import { VendorProfile } from '../../../../src/domain/entities/vendor-profile.entity';

describe('OffersService', () => {
    let service: OffersService;
    let offerRepository: Repository<Offer>;
    let vendorRepository: Repository<VendorProfile>;

    const mockVendor = {
        id: 'vendor-uuid',
        businessName: 'Test Business',
        cityId: 1,
        city: {
            id: 1,
            name: 'Gulshan 1',
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OffersService,
                {
                    provide: getRepositoryToken(Offer),
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        find: jest.fn(),
                        findOne: jest.fn(),
                        createQueryBuilder: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(VendorProfile),
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<OffersService>(OffersService);
        offerRepository = module.get<Repository<Offer>>(getRepositoryToken(Offer));
        vendorRepository = module.get<Repository<VendorProfile>>(
            getRepositoryToken(VendorProfile),
        );
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createOffer', () => {
        it('should create a discount offer with vendor\'s operating city by default', async () => {
            const createOfferDto = {
                title: '50% Off',
                description: 'Half price on all items',
                type: OfferType.DISCOUNT,
                vendorId: 'vendor-uuid',
                discountPercentage: 50,
            };

            const savedOffer = {
                id: 'offer-uuid',
                ...createOfferDto,
                cityId: 1,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const offerWithCity = {
                ...savedOffer,
                city: {
                    id: 1,
                    name: 'Gulshan 1',
                },
            };

            jest.spyOn(vendorRepository, 'findOne').mockResolvedValue(mockVendor as any);
            jest.spyOn(offerRepository, 'create').mockReturnValue(savedOffer as any);
            jest.spyOn(offerRepository, 'save').mockResolvedValue(savedOffer as any);
            jest.spyOn(offerRepository, 'findOne').mockResolvedValue(offerWithCity as any);

            const result = await service.createOffer(createOfferDto);

            expect(vendorRepository.findOne).toHaveBeenCalledWith({
                where: { id: 'vendor-uuid' },
                relations: ['city'],
            });
            expect(offerRepository.create).toHaveBeenCalledWith({
                ...createOfferDto,
                cityId: 1, // Should use vendor's operating city
            });
            expect(result.city).toBeDefined();
            expect(result.city.id).toBe(1);
        });

        it('should use provided cityId instead of vendor operating city (Multi-Branch)', async () => {
            const createOfferDto = {
                title: '50% Off',
                description: 'Half price on all items',
                type: OfferType.DISCOUNT,
                vendorId: 'vendor-uuid',
                cityId: 99, // Different from vendor's city (id: 1)
                discountPercentage: 50,
            };

            const savedOffer = {
                id: 'offer-uuid',
                ...createOfferDto,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const offerWithCity = {
                ...savedOffer,
                city: {
                    id: 99,
                    name: 'Dhanmondi',
                },
            };

            jest.spyOn(vendorRepository, 'findOne').mockResolvedValue(mockVendor as any);
            jest.spyOn(offerRepository, 'create').mockReturnValue(savedOffer as any);
            jest.spyOn(offerRepository, 'save').mockResolvedValue(savedOffer as any);
            jest.spyOn(offerRepository, 'findOne').mockResolvedValue(offerWithCity as any);

            const result = await service.createOffer(createOfferDto);

            expect(offerRepository.create).toHaveBeenCalledWith({
                ...createOfferDto,
                cityId: 99, // Should use provided cityId, not vendor's city
            });
            expect(result.cityId).toBe(99);
            expect(result.city.id).toBe(99);
        });

        it('should throw NotFoundException if vendor not found', async () => {
            const createOfferDto = {
                title: '50% Off',
                description: 'Half price on all items',
                type: OfferType.DISCOUNT,
                vendorId: 'non-existent-vendor',
                discountPercentage: 50,
            };

            jest.spyOn(vendorRepository, 'findOne').mockResolvedValue(null);

            await expect(service.createOffer(createOfferDto)).rejects.toThrow(
                NotFoundException,
            );
            await expect(service.createOffer(createOfferDto)).rejects.toThrow(
                'Vendor with ID non-existent-vendor not found',
            );
        });
    });
});
