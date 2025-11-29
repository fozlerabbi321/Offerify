import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../domain/entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import defaultSlugify from 'slugify';
import { FileUploadUtil } from '../../common/utils/file-upload.util';
import { MultipartFile } from '@fastify/multipart';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) { }

    async create(createCategoryDto: CreateCategoryDto, file?: MultipartFile): Promise<Category> {
        const slug = defaultSlugify(createCategoryDto.name, { lower: true });

        // Check for duplicate slug
        const existing = await this.categoryRepository.findOneBy({ slug });
        if (existing) {
            throw new ConflictException('Category with this name already exists');
        }

        let iconPath: string | undefined;
        if (file) {
            iconPath = await FileUploadUtil.saveFile(file, 'categories');
        }

        const category = this.categoryRepository.create({
            ...createCategoryDto,
            slug,
            iconPath: iconPath || undefined,
        });

        return this.categoryRepository.save(category);
    }

    async findAll(): Promise<Category[]> {
        return this.categoryRepository.find();
    }

    async findOne(id: string): Promise<Category | null> {
        return this.categoryRepository.findOneBy({ id });
    }
}
