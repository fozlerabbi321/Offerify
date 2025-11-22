import { Controller, Post, Body, Get, Param, Patch, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

@ApiTags('Offers')
@Controller('offers')
export class OffersController {
    constructor(private readonly offersService: OffersService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new offer' })
    @ApiResponse({ status: 201, description: 'Offer created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input' })
    async createOffer(@Body() createOfferDto: CreateOfferDto) {
        return this.offersService.createOffer(createOfferDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get offers (Smart Feed)' })
    @ApiResponse({ status: 200, description: 'List of offers' })
    async findAll(@Query('cityId') cityId: number) {
        return this.offersService.findAll(cityId);
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
