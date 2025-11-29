import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from '../../../../src/features/engagement/reviews.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Review } from '../../../../src/domain/entities/review.entity';
import { VendorProfile } from '../../../../src/domain/entities/vendor-profile.entity';
import { Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';

const mockReviewRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    average: jest.fn(),
    count: jest.fn(),
};

const mockVendorRepository = {
    update: jest.fn(),
};

describe('ReviewsService', () => {
    let service: ReviewsService;
    let reviewRepo: Repository<Review>;
    let vendorRepo: Repository<VendorProfile>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReviewsService,
                {
                    provide: getRepositoryToken(Review),
                    useValue: mockReviewRepository,
                },
                {
                    provide: getRepositoryToken(VendorProfile),
                    useValue: mockVendorRepository,
                },
            ],
        }).compile();

        service = module.get<ReviewsService>(ReviewsService);
        reviewRepo = module.get<Repository<Review>>(getRepositoryToken(Review));
        vendorRepo = module.get<Repository<VendorProfile>>(getRepositoryToken(VendorProfile));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create review and update vendor stats', async () => {
            const dto = { vendorId: 'v1', rating: 5, comment: 'Great!' };
            const userId = 'u1';

            mockReviewRepository.findOne.mockResolvedValue(null);
            mockReviewRepository.create.mockReturnValue({ ...dto, userId });
            mockReviewRepository.save.mockResolvedValue({ ...dto, userId, id: 'r1' });

            // Mock average calculation
            mockReviewRepository.average.mockResolvedValue(4.5);
            mockReviewRepository.count.mockResolvedValue(10);

            const result = await service.create(userId, dto);

            expect(result).toEqual(expect.objectContaining({ id: 'r1' }));
            expect(mockReviewRepository.findOne).toHaveBeenCalledWith({ where: { userId, vendorId: dto.vendorId } });
            expect(mockReviewRepository.save).toHaveBeenCalled();

            // Verify stats update
            expect(mockReviewRepository.average).toHaveBeenCalledWith('rating', { vendorId: dto.vendorId });
            expect(mockReviewRepository.count).toHaveBeenCalledWith({ where: { vendorId: dto.vendorId } });
            expect(mockVendorRepository.update).toHaveBeenCalledWith(dto.vendorId, {
                ratingAvg: 4.5,
                reviewCount: 10,
            });
        });

        it('should prevent duplicate reviews from same user to same vendor', async () => {
            const dto = { vendorId: 'v1', rating: 5 };
            const userId = 'u1';

            mockReviewRepository.findOne.mockResolvedValue({ id: 'r1' });

            await expect(service.create(userId, dto)).rejects.toThrow(ConflictException);
        });
    });
});
