import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from '../../../../src/features/categories/categories.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from '../../../../src/domain/entities/category.entity';
import { Repository } from 'typeorm';
import { FileUploadUtil } from '../../../../src/common/utils/file-upload.util';
import { ConflictException } from '@nestjs/common';

describe('CategoriesService', () => {
    let service: CategoriesService;
    let repo: Repository<Category>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CategoriesService,
                {
                    provide: getRepositoryToken(Category),
                    useValue: {
                        find: jest.fn(),
                        save: jest.fn(),
                        create: jest.fn(),
                        findOneBy: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<CategoriesService>(CategoriesService);
        repo = module.get<Repository<Category>>(getRepositoryToken(Category));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return an array of categories', async () => {
            const result = [new Category()];
            jest.spyOn(repo, 'find').mockResolvedValue(result);

            expect(await service.findAll()).toBe(result);
        });
    });

    describe('create', () => {
        it('should create category, save image, and generate slug', async () => {
            const dto = { name: 'Food & Drinks' };
            const mockFile = { filename: 'test.png' };
            const expectedSlug = 'food-and-drinks';
            const expectedIconPath = '/public/categories/uuid.png';

            const category = new Category();
            category.name = dto.name;
            category.slug = expectedSlug;
            category.iconPath = expectedIconPath;

            jest.spyOn(repo, 'create').mockReturnValue(category);
            jest.spyOn(repo, 'save').mockResolvedValue(category);
            jest.spyOn(repo, 'findOneBy').mockResolvedValue(null); // No duplicate
            jest.spyOn(FileUploadUtil, 'saveFile').mockResolvedValue(expectedIconPath);

            const result = await service.create(dto, mockFile as any);

            expect(result.slug).toBe(expectedSlug);
            expect(result.iconPath).toBe(expectedIconPath);
        });

        it('should throw conflict if slug exists', async () => {
            const dto = { name: 'Food' };
            // Mock findOneBy to return existing category to trigger conflict check in service
            jest.spyOn(repo, 'findOneBy').mockResolvedValue(new Category());

            await expect(service.create(dto)).rejects.toThrow(ConflictException);
        });
    });

    describe('findOne', () => {
        it('should return a category by id', async () => {
            const category = new Category();
            category.id = 'uuid';
            jest.spyOn(repo, 'findOneBy').mockResolvedValue(category);

            expect(await service.findOne('uuid')).toBe(category);
        });
    });
});
