
import { Controller, Post, Body, UseGuards, Req, Get, Patch, Param } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Vendors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vendors')
export class VendorsController {
    constructor(private readonly vendorsService: VendorsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a vendor profile and upgrade user to VENDOR role' })
    @ApiResponse({ status: 201, description: 'Vendor profile created successfully.' })
    @ApiResponse({ status: 409, description: 'User already has a vendor profile.' })
    async create(@Req() req, @Body() createVendorDto: CreateVendorDto) {
        return this.vendorsService.create(req.user.userId, createVendorDto);
    }

    @Get('me')
    @ApiOperation({ summary: 'Get current user vendor profile' })
    @ApiResponse({ status: 200, description: 'Return the vendor profile.' })
    @ApiResponse({ status: 404, description: 'Vendor profile not found.' })
    async findMyProfile(@Req() req) {
        return this.vendorsService.findMyProfile(req.user.userId);
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get vendor stats' })
    @ApiResponse({ status: 200, description: 'Return vendor stats.' })
    async getStats(@Req() req) {
        return this.vendorsService.getStats(req.user.userId);
    }

    @Patch('me')
    @ApiOperation({ summary: 'Update vendor profile' })
    @ApiResponse({ status: 200, description: 'Vendor profile updated successfully.' })
    async updateProfile(@Req() req, @Body() updateVendorDto: UpdateVendorDto) {
        return this.vendorsService.updateProfile(req.user.userId, updateVendorDto);
    }
}

@ApiTags('Vendors')
@Controller('vendors')
export class VendorsPublicController {
    constructor(private readonly vendorsService: VendorsService) { }

    @Get(':id')
    @ApiOperation({ summary: 'Get public vendor profile' })
    @ApiResponse({ status: 200, description: 'Return the vendor profile.' })
    async findById(@Param('id') id: string) {
        return this.vendorsService.findById(id);
    }
}

