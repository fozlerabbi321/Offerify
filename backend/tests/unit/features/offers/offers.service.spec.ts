import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { OffersService } from '../../../../src/features/offers/offers.service';
import { Offer, OfferType } from '../../../../src/domain/entities/offer.entity';
import { VendorProfile } from '../../../../src/domain/entities/vendor-profile.entity';
import { CategoriesService } from '../../../../src/features/categories/categories.service';

describe('OffersService', () => {
    let service: OffersService;
    let offerRepository: Repository<Offer>;
    let vendorRepository: Repository<VendorProfile>;
    let categoriesService: CategoriesService;

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
                        remove: jest.fn(),
                        createQueryBuilder: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(VendorProfile),
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: CategoriesService,
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
        categoriesService = module.get<CategoriesService>(CategoriesService);
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
                categoryId: 'category-uuid',
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
            jest.spyOn(categoriesService, 'findOne').mockResolvedValue({ id: 1, name: 'Food' } as any);
            jest.spyOn(offerRepository, 'create').mockReturnValue(savedOffer as any);
            jest.spyOn(offerRepository, 'save').mockResolvedValue(savedOffer as any);
            jest.spyOn(offerRepository, 'findOne').mockResolvedValue(offerWithCity as any);

            const result = await service.createOffer('user-uuid', createOfferDto);

            expect(vendorRepository.findOne).toHaveBeenCalledWith({
                where: { user: { id: 'user-uuid' } },
                relations: ['city'],
            });
            expect(offerRepository.create).toHaveBeenCalledWith({
                ...createOfferDto,
                city: { id: 1 },
                category: { id: 'category-uuid' },
                vendor: mockVendor,
                imagePath: undefined,
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
                categoryId: 'category-uuid',
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
            jest.spyOn(categoriesService, 'findOne').mockResolvedValue({ id: 1, name: 'Food' } as any);
            jest.spyOn(offerRepository, 'create').mockReturnValue(savedOffer as any);
            jest.spyOn(offerRepository, 'save').mockResolvedValue(savedOffer as any);
            jest.spyOn(offerRepository, 'findOne').mockResolvedValue(offerWithCity as any);

            const result = await service.createOffer('user-uuid', createOfferDto);

            expect(offerRepository.create).toHaveBeenCalledWith({
                ...createOfferDto,
                city: { id: 99 },
                category: { id: 'category-uuid' },
                vendor: mockVendor,
                imagePath: undefined,
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
                categoryId: 'category-uuid',
            };

            jest.spyOn(vendorRepository, 'findOne').mockResolvedValue(null);

            await expect(service.createOffer('user-uuid', createOfferDto)).rejects.toThrow(
                NotFoundException,
            );
            await expect(service.createOffer('user-uuid', createOfferDto)).rejects.toThrow(
                'Vendor profile not found for user user-uuid',
            );
        });
    });

    describe('findOne', () => {
        it('should return an offer if found', async () => {
            const offerId = 'offer-uuid';
            const mockOffer = {
                id: offerId,
                title: '50% Off Whopper',
                description: 'Get 50% off',
                type: OfferType.DISCOUNT,
                vendorId: 'vendor-uuid',
                cityId: 1,
                city: {
                    id: 1,
                    name: 'Gulshan 1',
                },
                vendor: {
                    id: 'vendor-uuid',
                    businessName: 'Burger King',
                },
                isActive: true,
                discountPercentage: 50,
            };

            jest.spyOn(offerRepository, 'findOne').mockResolvedValue(mockOffer as any);

            const result = await service.findOne(offerId);

            expect(offerRepository.findOne).toHaveBeenCalledWith({
                where: { id: offerId },
                relations: ['city', 'vendor'],
            });
            expect(result).toEqual(mockOffer);
            expect(result.city).toBeDefined();
            expect(result.vendor).toBeDefined();
        });

        it('should throw NotFoundException if offer not found', async () => {
            const offerId = 'non-existent-offer-id';

            jest.spyOn(offerRepository, 'findOne').mockResolvedValue(null);

            await expect(service.findOne(offerId)).rejects.toThrow(NotFoundException);
            await expect(service.findOne(offerId)).rejects.toThrow(
                `Offer with ID ${offerId} not found`,
            );
        });
    });

    describe('update', () => {
        it('should update and return the offer', async () => {
            const userId = 'user-uuid';
            const offerId = 'offer-uuid';
            const updateOfferDto = {
                title: 'Updated Title',
                discountPercentage: 75,
            };

            const existingOffer = {
                id: offerId,
                title: '50% Off Whopper',
                description: 'Get 50% off',
                type: OfferType.DISCOUNT,
                vendorId: 'vendor-uuid',
                cityId: 1,
                discountPercentage: 50,
                vendor: {
                    id: 'vendor-uuid',
                    user: {
                        id: userId,
                    },
                },
            };

            const updatedOffer = {
                ...existingOffer,
                title: 'Updated Title',
                discountPercentage: 75,
                city: {
                    id: 1,
                    name: 'Gulshan 1',
                },
            };

            jest.spyOn(offerRepository, 'findOne')
                .mockResolvedValueOnce(existingOffer as any)
                .mockResolvedValueOnce(updatedOffer as any);
            jest.spyOn(offerRepository, 'save').mockResolvedValue(updatedOffer as any);

            const result = await service.update(offerId, userId, updateOfferDto);

            expect(offerRepository.findOne).toHaveBeenCalledWith({
                where: { id: offerId },
                relations: ['vendor', 'vendor.user'],
            });
            expect(offerRepository.save).toHaveBeenCalled();
            expect(result.title).toBe('Updated Title');
            expect((result as any).discountPercentage).toBe(75);
        });

        it('should throw NotFoundException if offer not found', async () => {
            const userId = 'user-uuid';
            const offerId = 'non-existent-offer-id';
            const updateOfferDto = {
                title: 'Updated Title',
            };

            jest.spyOn(offerRepository, 'findOne').mockResolvedValue(null);

            await expect(service.update(offerId, userId, updateOfferDto)).rejects.toThrow(
                NotFoundException,
            );
            await expect(service.update(offerId, userId, updateOfferDto)).rejects.toThrow(
                `Offer with ID ${offerId} not found`,
            );
        });
    });

    describe('remove', () => {
        it('should delete the offer successfully', async () => {
            const userId = 'user-uuid';
            const offerId = 'offer-uuid';
            const mockOffer = {
                id: offerId,
                title: '50% Off Whopper',
                vendor: {
                    id: 'vendor-uuid',
                    user: {
                        id: userId,
                    },
                },
            };

            jest.spyOn(offerRepository, 'findOne').mockResolvedValue(mockOffer as any);
            jest.spyOn(offerRepository, 'remove').mockResolvedValue(mockOffer as any);

            await service.remove(offerId, userId);

            expect(offerRepository.findOne).toHaveBeenCalledWith({
                where: { id: offerId },
                relations: ['vendor', 'vendor.user'],
            });
            expect(offerRepository.remove).toHaveBeenCalledWith(mockOffer);
        });

        it('should throw NotFoundException if offer not found', async () => {
            const userId = 'user-uuid';
            const offerId = 'non-existent-offer-id';

            jest.spyOn(offerRepository, 'findOne').mockResolvedValue(null);

            await expect(service.remove(offerId, userId)).rejects.toThrow(NotFoundException);
            await expect(service.remove(offerId, userId)).rejects.toThrow(
                `Offer with ID ${offerId} not found`,
            );
        });
    });
});
