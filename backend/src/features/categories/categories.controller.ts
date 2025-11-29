import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new category' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'The category has been successfully created.' })
    async create(@Req() req: FastifyRequest) {
        const parts = req.parts();
        let name: string | undefined;
        let file: any;

        for await (const part of parts) {
            if (part.type === 'file') {
                file = part;
            } else {
                if (part.fieldname === 'name') {
                    name = part.value as string;
                }
            }
        }

        if (!name) {
            throw new Error('Name is required');
        }

        const createCategoryDto: CreateCategoryDto = { name, file: undefined }; // file is handled separately
        return this.categoriesService.create(createCategoryDto, file);
    }

    @Get()
    @ApiOperation({ summary: 'Get all categories' })
    @ApiResponse({ status: 200, description: 'Return all categories' })
    findAll() {
        return this.categoriesService.findAll();
    }
}
