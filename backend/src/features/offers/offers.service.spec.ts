import { Test, TestingModule } from '@nestjs/testing';
import { OffersService } from './offers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Offer } from '../../domain/entities/offer.entity';
import { VendorProfile } from '../../domain/entities/vendor-profile.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { OfferType } from '../../domain/entities/offer.entity';
import { NotFoundException } from '@nestjs/common';

const mockOfferRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
};

const mockVendorRepository = {
    findOne: jest.fn(),
};

describe('OffersService', () => {
    let service: OffersService;

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
            ],
        }).compile();

        service = module.get<OffersService>(OffersService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createOffer', () => {
        it('should create an offer for the authenticated vendor', async () => {
            const userId = 'user-uuid';
            const dto: CreateOfferDto = {
                title: 'Test Offer',
                description: 'Desc',
                type: OfferType.DISCOUNT,
            };

            const vendorProfile = { id: 'vendor-uuid', cityId: 1, user: { id: userId } };
            const savedOffer = { id: 'offer-uuid', ...dto, cityId: 1 };

            mockVendorRepository.findOne.mockResolvedValue(vendorProfile);
            mockOfferRepository.create.mockReturnValue(savedOffer);
            mockOfferRepository.save.mockResolvedValue(savedOffer);
            mockOfferRepository.findOne.mockResolvedValue(savedOffer);

            // @ts-ignore - Ignoring type check for TDD RED phase as signature is not updated yet
            const result = await service.createOffer(userId, dto);

            expect(result).toEqual(savedOffer);
            expect(mockVendorRepository.findOne).toHaveBeenCalledWith({
                where: { user: { id: userId } },
                relations: ['city'],
            });
            expect(mockOfferRepository.create).toHaveBeenCalledWith({
                ...dto,
                cityId: vendorProfile.cityId,
            });
        });

        it('should throw NotFoundException if vendor profile not found', async () => {
            const userId = 'user-uuid';
            const dto: CreateOfferDto = {
                title: 'Test Offer',
                description: 'Desc',
                type: OfferType.DISCOUNT,
            };

            mockVendorRepository.findOne.mockResolvedValue(null);

            // @ts-ignore
            await expect(service.createOffer(userId, dto)).rejects.toThrow(NotFoundException);
        });
    });
});
