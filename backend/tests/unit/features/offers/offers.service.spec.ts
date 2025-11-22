import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OffersService } from '../../../../src/features/offers/offers.service';
import { Offer, OfferType } from '../../../../src/domain/entities/offer.entity';

describe('OffersService', () => {
    let service: OffersService;
    let offerRepository: Repository<Offer>;

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
            ],
        }).compile();

        service = module.get<OffersService>(OffersService);
        offerRepository = module.get<Repository<Offer>>(getRepositoryToken(Offer));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createOffer', () => {
        it('should create a discount offer successfully', async () => {
            const createOfferDto = {
                title: '50% Off',
                description: 'Half price on all items',
                type: OfferType.DISCOUNT,
                vendorId: 'vendor-uuid',
                discountPercentage: 50,
            };

            const expectedOffer = {
                id: 'offer-uuid',
                ...createOfferDto,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(offerRepository, 'create').mockReturnValue(expectedOffer as any);
            jest.spyOn(offerRepository, 'save').mockResolvedValue(expectedOffer as any);

            const result = await service.createOffer(createOfferDto);

            expect(offerRepository.create).toHaveBeenCalledWith(createOfferDto);
            expect(offerRepository.save).toHaveBeenCalledWith(expectedOffer);
            expect(result).toEqual(expectedOffer);
        });

        it('should create a coupon offer successfully', async () => {
            const createOfferDto = {
                title: 'Free Coffee',
                description: 'Get a free coffee with code',
                type: OfferType.COUPON,
                vendorId: 'vendor-uuid',
                couponCode: 'COFFEE24',
            };

            const expectedOffer = {
                id: 'offer-uuid',
                ...createOfferDto,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(offerRepository, 'create').mockReturnValue(expectedOffer as any);
            jest.spyOn(offerRepository, 'save').mockResolvedValue(expectedOffer as any);

            const result = await service.createOffer(createOfferDto);

            expect(result).toEqual(expectedOffer);
            expect(result.type).toBe(OfferType.COUPON);
        });

        it('should create a voucher offer successfully', async () => {
            const createOfferDto = {
                title: '100 BDT Voucher',
                description: 'Get 100 BDT off',
                type: OfferType.VOUCHER,
                vendorId: 'vendor-uuid',
                voucherValue: 100,
            };

            const expectedOffer = {
                id: 'offer-uuid',
                ...createOfferDto,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(offerRepository, 'create').mockReturnValue(expectedOffer as any);
            jest.spyOn(offerRepository, 'save').mockResolvedValue(expectedOffer as any);

            const result = await service.createOffer(createOfferDto);

            expect(result).toEqual(expectedOffer);
            expect(result.type).toBe(OfferType.VOUCHER);
        });
    });
});
