import { Controller, Post, Get, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FavoritesService } from './favorites.service';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { VendorsService } from '../vendors/vendors.service';

@ApiTags('Engagement')
@Controller()
export class EngagementController {
    constructor(
        private readonly favoritesService: FavoritesService,
        private readonly reviewsService: ReviewsService,
        private readonly vendorsService: VendorsService,
    ) { }

    @Post('offers/:id/favorite')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async toggleFavorite(@Param('id') offerId: string, @Request() req) {
        return this.favoritesService.toggle(req.user.userId, offerId);
    }

    @Delete('offers/:id/favorite')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async removeFavorite(@Param('id') offerId: string, @Request() req) {
        return this.favoritesService.remove(req.user.userId, offerId);
    }

    @Get('account/favorites')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async getMyFavorites(@Request() req) {
        return this.favoritesService.getMyFavorites(req.user.userId);
    }

    @Post('vendors/:id/reviews')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async createReview(@Param('id') vendorId: string, @Body() dto: CreateReviewDto, @Request() req) {
        dto.vendorId = vendorId;
        return this.reviewsService.create(req.user.userId, dto);
    }

    @Get('vendors/:id/reviews')
    async getVendorReviews(@Param('id') vendorId: string) {
        return this.reviewsService.getReviews(vendorId);
    }

    @Get('vendors/reviews/recent')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get recent reviews for logged-in vendor' })
    @ApiResponse({ status: 200, description: 'Returns last 5 reviews for vendor' })
    @ApiResponse({ status: 404, description: 'Vendor profile not found' })
    async getMyRecentReviews(@Request() req) {
        const vendor = await this.vendorsService.findMyProfile(req.user.userId);
        return this.reviewsService.getRecentReviewsForVendor(vendor.id, 5);
    }
}
