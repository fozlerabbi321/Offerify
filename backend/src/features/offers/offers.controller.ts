import { Controller, Post, Body, Get, Param, Patch, Delete, HttpCode, HttpStatus, Query, UseGuards, Request, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../domain/entities/user.entity';

@ApiTags('Offers')
@ApiBearerAuth()
@Controller('offers')
export class OffersController {
    constructor(private readonly offersService: OffersService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    // @Roles(UserRole.VENDOR)
    @ApiOperation({ summary: 'Create a new offer' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                type: { type: 'string', enum: ['discount', 'coupon', 'voucher'] },
                categoryId: { type: 'string', format: 'uuid' },
                cityId: { type: 'integer', nullable: true },
                discountPercentage: { type: 'number', nullable: true },
                couponCode: { type: 'string', nullable: true },
                voucherValue: { type: 'integer', nullable: true },
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
            required: ['title', 'description', 'type', 'categoryId'],
        },
    })
    @ApiResponse({ status: 201, description: 'Offer created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input' })
    async createOffer(@Req() req: FastifyRequest) {
        const parts = req.parts();
        let fileData: { buffer: Buffer; filename: string; mimetype: string } | undefined;
        const body: any = {};

        for await (const part of parts) {
            if (part.type === 'file') {
                const buffer = await part.toBuffer();
                fileData = {
                    buffer,
                    filename: part.filename,
                    mimetype: part.mimetype,
                };
            } else {
                body[part.fieldname] = part.value;
            }
        }

        const createOfferDto: CreateOfferDto = {
            ...body,
            // Convert string numbers to actual numbers
            cityId: body.cityId ? parseInt(body.cityId) : undefined,
            discountPercentage: body.discountPercentage ? parseFloat(body.discountPercentage) : undefined,
            voucherValue: body.voucherValue ? parseInt(body.voucherValue) : undefined,
            file: undefined, // Handled separately
        };

        const file = fileData ? {
            toBuffer: async () => fileData.buffer,
            filename: fileData.filename,
            mimetype: fileData.mimetype,
            type: 'file',
            fieldname: 'file',
            encoding: '7bit',
            fields: {},
        } as any : undefined;

        return this.offersService.createOffer((req as any).user.userId, createOfferDto, file);
    }

    @Get()
    @ApiOperation({ summary: 'Get offers (Smart Feed)' })
    @ApiResponse({ status: 200, description: 'List of offers' })
    async findAll(
        @Query('cityId') cityId?: number,
        @Query('featured') featured?: boolean,
        @Query('sort') sort?: 'popularity' | 'newest' | 'price_asc' | 'price_desc',
        @Query('lat') lat?: number,
        @Query('long') long?: number,
        @Query('limit') limit?: number,
        @Query('categoryId') categoryId?: string,
    ) {
        return this.offersService.findAll({ cityId, featured, sort, lat, long, limit, categoryId });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get an offer by ID' })
    @ApiParam({ name: 'id', description: 'Offer UUID' })
    @ApiResponse({ status: 200, description: 'Offer found' })
    @ApiResponse({ status: 404, description: 'Offer not found' })
    async findOne(@Param('id') id: string) {
        return this.offersService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an offer' })
    @ApiParam({ name: 'id', description: 'Offer UUID' })
    @ApiResponse({ status: 200, description: 'Offer updated successfully' })
    @ApiResponse({ status: 404, description: 'Offer not found' })
    async update(@Param('id') id: string, @Body() updateOfferDto: UpdateOfferDto) {
        return this.offersService.update(id, updateOfferDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete an offer' })
    @ApiParam({ name: 'id', description: 'Offer UUID' })
    @ApiResponse({ status: 204, description: 'Offer deleted successfully' })
    @ApiResponse({ status: 404, description: 'Offer not found' })
    async remove(@Param('id') id: string) {
        return this.offersService.remove(id);
    }
}
