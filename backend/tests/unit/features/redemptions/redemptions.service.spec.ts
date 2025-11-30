import { Test, TestingModule } from '@nestjs/testing';
import { RedemptionsService } from '../../../../src/features/redemptions/redemptions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OfferRedemption } from '../../../../src/domain/entities/offer-redemption.entity';
import { Offer, OfferType, VoucherOffer } from '../../../../src/domain/entities/offer.entity';
import { Repository } from 'typeorm';
import { BadRequestException, ConflictException } from '@nestjs/common';

import { VendorProfile } from '../../../../src/domain/entities/vendor-profile.entity';

describe('RedemptionsService', () => {
    let service: RedemptionsService;
    let redemptionRepo: Repository<OfferRedemption>;
    let offerRepo: Repository<Offer>;
    let vendorRepo: Repository<VendorProfile>;

    const mockRedemptionRepo = {
        findOne: jest.fn(),
        save: jest.fn(),
        insert: jest.fn(),
        create: jest.fn().mockReturnValue({ id: 'redemption-123', isUsed: false }),
    };

    const mockOfferRepo = {
        findOne: jest.fn(),
        increment: jest.fn(),
        createQueryBuilder: jest.fn(() => ({
            update: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValue({ affected: 1 }),
        })),
    };

    const mockVendorRepo = {
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RedemptionsService,
                {
                    provide: getRepositoryToken(OfferRedemption),
                    useValue: mockRedemptionRepo,
                },
                {
                    provide: getRepositoryToken(Offer),
                    useValue: mockOfferRepo,
                },
                {
                    provide: getRepositoryToken(VendorProfile),
                    useValue: mockVendorRepo,
                },
            ],
        }).compile();

        service = module.get<RedemptionsService>(RedemptionsService);
        redemptionRepo = module.get<Repository<OfferRedemption>>(getRepositoryToken(OfferRedemption));
        offerRepo = module.get<Repository<Offer>>(getRepositoryToken(Offer));
        vendorRepo = module.get<Repository<VendorProfile>>(getRepositoryToken(VendorProfile));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('claim', () => {
        const userId = 'user-123';
        const offerId = 'offer-123';

        it('should successfully claim if stock available', async () => {
            mockRedemptionRepo.findOne
                .mockResolvedValueOnce(null) // Not already claimed
                .mockResolvedValueOnce({ id: 'redemption-123', isUsed: false }); // Return created redemption

            // mockOfferRepo.createQueryBuilder already returns affected: 1 by default
            mockRedemptionRepo.insert.mockResolvedValue({ identifiers: [{ id: 'redemption-123' }] });

            const result = await service.claim(userId, offerId);

            expect(mockRedemptionRepo.findOne).toHaveBeenCalledWith({ where: { user: { id: userId }, offer: { id: offerId } } });
            expect(mockOfferRepo.createQueryBuilder).toHaveBeenCalled();
            expect(mockRedemptionRepo.insert).toHaveBeenCalled();
            expect(result).toEqual({ id: 'redemption-123', isUsed: false });
        });

        it('should throw ConflictException if already claimed', async () => {
            mockRedemptionRepo.findOne.mockResolvedValue({ id: 'redemption-123' });

            await expect(service.claim(userId, offerId)).rejects.toThrow(ConflictException);
            expect(mockOfferRepo.createQueryBuilder).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException if limit reached', async () => {
            mockRedemptionRepo.findOne.mockResolvedValue(null);

            // Mock execute to return affected: 0
            mockOfferRepo.createQueryBuilder.mockReturnValue({
                update: jest.fn().mockReturnThis(),
                set: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                execute: jest.fn().mockResolvedValue({ affected: 0 }),
            });

            await expect(service.claim(userId, offerId)).rejects.toThrow(BadRequestException);
        });
    });

    describe('verify', () => {
        const vendorId = 'vendor-123';
        const redemptionId = 'redemption-123';

        it('should verify valid redemption for the vendor\'s offer', async () => {
            const mockRedemption = {
                id: redemptionId,
                isUsed: false,
                offer: {
                    vendor: { id: vendorId },
                },
            };
            mockRedemptionRepo.findOne.mockResolvedValue(mockRedemption);
            mockRedemptionRepo.save.mockResolvedValue({ ...mockRedemption, isUsed: true });

            const result = await service.verify(vendorId, redemptionId);

            expect(mockRedemptionRepo.findOne).toHaveBeenCalledWith({
                where: { id: redemptionId },
                relations: ['offer', 'offer.vendor'],
            });
            expect(mockRedemptionRepo.save).toHaveBeenCalledWith(expect.objectContaining({ isUsed: true }));
            expect(result.isUsed).toBe(true);
        });

        it('should throw ForbiddenException if vendor does not own the offer', async () => {
            const mockRedemption = {
                id: redemptionId,
                offer: {
                    vendor: { id: 'other-vendor' },
                },
            };
            mockRedemptionRepo.findOne.mockResolvedValue(mockRedemption);

            await expect(service.verify(vendorId, redemptionId)).rejects.toThrow('You are not authorized to verify this redemption');
        });

        it('should throw NotFoundException if redemption not found', async () => {
            mockRedemptionRepo.findOne.mockResolvedValue(null);

            await expect(service.verify(vendorId, redemptionId)).rejects.toThrow('Redemption not found');
        });

        it('should throw ConflictException if already used', async () => {
            const mockRedemption = {
                id: redemptionId,
                isUsed: true,
                offer: {
                    vendor: { id: vendorId },
                },
            };
            mockRedemptionRepo.findOne.mockResolvedValue(mockRedemption);

            await expect(service.verify(vendorId, redemptionId)).rejects.toThrow('Redemption already used');
        });
    });

    describe('verifyRedemptionAsVendor', () => {
        const userId = 'user-123';
        const vendorId = 'vendor-123';
        const redemptionId = 'redemption-123';

        it('should find vendor profile and call verify', async () => {
            mockVendorRepo.findOne.mockResolvedValue({ id: vendorId });

            const mockRedemption = {
                id: redemptionId,
                isUsed: false,
                offer: {
                    vendor: { id: vendorId },
                },
            };
            mockRedemptionRepo.findOne.mockResolvedValue(mockRedemption);
            mockRedemptionRepo.save.mockResolvedValue({ ...mockRedemption, isUsed: true });

            const result = await service.verifyRedemptionAsVendor(userId, redemptionId);

            expect(mockVendorRepo.findOne).toHaveBeenCalledWith({ where: { user: { id: userId } } });
            expect(mockRedemptionRepo.findOne).toHaveBeenCalledWith({
                where: { id: redemptionId },
                relations: ['offer', 'offer.vendor'],
            });
            expect(result.isUsed).toBe(true);
        });

        it('should throw ForbiddenException if user is not a vendor', async () => {
            mockVendorRepo.findOne.mockResolvedValue(null);

            await expect(service.verifyRedemptionAsVendor(userId, redemptionId)).rejects.toThrow('User is not a vendor');
        });
    });
});
