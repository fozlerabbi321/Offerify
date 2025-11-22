import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';

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
}
