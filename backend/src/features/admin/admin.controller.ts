import {
    Controller,
    Get,
    Patch,
    Put,
    Delete,
    Param,
    Query,
    Body,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../domain/entities/user.entity';
import { AdminService } from './admin.service';
import { ListUsersDto } from './dto/list-users.dto';
import { ListVendorsDto } from './dto/list-vendors.dto';
import { ListReviewsDto } from './dto/list-reviews.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    // ============================================================
    // DASHBOARD
    // ============================================================

    @Get('stats')
    @ApiOperation({ summary: 'Get dashboard statistics' })
    @ApiResponse({ status: 200, description: 'Returns dashboard stats' })
    async getDashboardStats() {
        return this.adminService.getDashboardStats();
    }

    // ============================================================
    // USER MANAGEMENT
    // ============================================================

    @Get('users')
    @ApiOperation({ summary: 'List all users with pagination and search' })
    @ApiResponse({ status: 200, description: 'Returns paginated list of users' })
    async listUsers(@Query() dto: ListUsersDto) {
        return this.adminService.listUsers(dto);
    }

    @Patch('users/:id/ban')
    @ApiOperation({ summary: 'Toggle user ban status' })
    @ApiResponse({ status: 200, description: 'User ban status toggled' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async toggleBan(@Param('id') userId: string) {
        return this.adminService.toggleBan(userId);
    }

    // ============================================================
    // VENDOR MANAGEMENT
    // ============================================================

    @Get('vendors')
    @ApiOperation({ summary: 'List all vendors with pagination' })
    @ApiResponse({ status: 200, description: 'Returns paginated list of vendors' })
    async listVendors(@Query() dto: ListVendorsDto) {
        return this.adminService.listVendors(dto);
    }

    // ============================================================
    // REVIEW MODERATION

    // ============================================================

    @Get('reviews')
    @ApiOperation({ summary: 'List all reviews with pagination' })
    @ApiResponse({ status: 200, description: 'Returns paginated list of reviews' })
    async listReviews(@Query() dto: ListReviewsDto) {
        return this.adminService.listReviews(dto);
    }

    @Delete('reviews/:id')
    @ApiOperation({ summary: 'Delete a review' })
    @ApiResponse({ status: 200, description: 'Review deleted successfully' })
    @ApiResponse({ status: 404, description: 'Review not found' })
    async deleteReview(@Param('id') reviewId: string) {
        return this.adminService.deleteReview(reviewId);
    }

    // ============================================================
    // CMS - PAGE CONTENT
    // ============================================================

    @Get('pages/:slug')
    @ApiOperation({ summary: 'Get page content by slug' })
    @ApiResponse({ status: 200, description: 'Returns page content' })
    async getPageContent(@Param('slug') slug: string) {
        return this.adminService.getPageContent(slug);
    }

    @Put('pages/:slug')
    @ApiOperation({ summary: 'Update page content' })
    @ApiResponse({ status: 200, description: 'Page content updated' })
    async updatePageContent(@Param('slug') slug: string, @Body() dto: UpdatePageDto) {
        return this.adminService.updatePageContent(slug, dto);
    }

    // ============================================================
    // GLOBAL SETTINGS
    // ============================================================

    @Get('settings')
    @ApiOperation({ summary: 'Get all app settings' })
    @ApiResponse({ status: 200, description: 'Returns all settings' })
    async getAllSettings() {
        return this.adminService.getAllSettings();
    }

    @Put('settings')
    @ApiOperation({ summary: 'Update app settings' })
    @ApiResponse({ status: 200, description: 'Settings updated successfully' })
    async updateSettings(@Body() dto: UpdateSettingsDto) {
        return this.adminService.updateSettings(dto);
    }
}
