import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesService } from '../../../../src/features/engagement/favorites.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Favorite } from '../../../../src/domain/entities/favorite.entity';
import { Repository } from 'typeorm';

const mockFavoriteRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
};

describe('FavoritesService', () => {
    let service: FavoritesService;
    let repository: Repository<Favorite>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FavoritesService,
                {
                    provide: getRepositoryToken(Favorite),
                    useValue: mockFavoriteRepository,
                },
            ],
        }).compile();

        service = module.get<FavoritesService>(FavoritesService);
        repository = module.get<Repository<Favorite>>(getRepositoryToken(Favorite));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('toggle', () => {
        it('should add favorite if not exists', async () => {
            mockFavoriteRepository.findOne.mockResolvedValue(null);
            mockFavoriteRepository.create.mockReturnValue({ userId: 'u1', offerId: 'o1' });
            mockFavoriteRepository.save.mockResolvedValue({ userId: 'u1', offerId: 'o1' });

            await service.toggle('u1', 'o1');

            expect(mockFavoriteRepository.findOne).toHaveBeenCalledWith({ where: { userId: 'u1', offerId: 'o1' } });
            expect(mockFavoriteRepository.create).toHaveBeenCalledWith({ userId: 'u1', offerId: 'o1' });
            expect(mockFavoriteRepository.save).toHaveBeenCalled();
        });

        it('should remove favorite if already exists', async () => {
            const existingFavorite = { userId: 'u1', offerId: 'o1' };
            mockFavoriteRepository.findOne.mockResolvedValue(existingFavorite);
            mockFavoriteRepository.remove.mockResolvedValue(existingFavorite);

            await service.toggle('u1', 'o1');

            expect(mockFavoriteRepository.findOne).toHaveBeenCalledWith({ where: { userId: 'u1', offerId: 'o1' } });
            expect(mockFavoriteRepository.remove).toHaveBeenCalledWith(existingFavorite);
            expect(mockFavoriteRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('remove', () => {
        it('should remove favorite if exists', async () => {
            const existingFavorite = { userId: 'u1', offerId: 'o1' };
            mockFavoriteRepository.findOne.mockResolvedValue(existingFavorite);
            mockFavoriteRepository.remove.mockResolvedValue(existingFavorite);

            await service.remove('u1', 'o1');

            expect(mockFavoriteRepository.findOne).toHaveBeenCalledWith({ where: { userId: 'u1', offerId: 'o1' } });
            expect(mockFavoriteRepository.remove).toHaveBeenCalledWith(existingFavorite);
        });

        it('should do nothing if favorite does not exist', async () => {
            mockFavoriteRepository.findOne.mockResolvedValue(null);

            await service.remove('u1', 'o1');

            expect(mockFavoriteRepository.findOne).toHaveBeenCalledWith({ where: { userId: 'u1', offerId: 'o1' } });
            expect(mockFavoriteRepository.remove).not.toHaveBeenCalled();
        });
    });

    describe('getMyFavorites', () => {
        it('should return list of user favorites with relations', async () => {
            const favorites = [
                { userId: 'u1', offerId: 'o1', offer: { id: 'o1', title: 'Offer 1' } },
            ];
            mockFavoriteRepository.find.mockResolvedValue(favorites);

            const result = await service.getMyFavorites('u1');

            expect(result).toEqual(favorites);
            expect(mockFavoriteRepository.find).toHaveBeenCalledWith({
                where: { userId: 'u1' },
                relations: ['offer', 'offer.vendor'],
                order: { createdAt: 'DESC' },
            });
        });
    });
});
