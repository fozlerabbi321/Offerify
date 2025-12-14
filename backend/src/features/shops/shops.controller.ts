import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../domain/entities/user.entity';
import { ShopsService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

@Controller('vendor/shops')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.VENDOR)
export class ShopsController {
    constructor(private readonly shopsService: ShopsService) { }

    @Post()
    async create(@Request() req, @Body() createShopDto: CreateShopDto) {
        return await this.shopsService.create(req.user.userId, createShopDto);
    }

    @Get()
    async findAll(@Request() req) {
        return await this.shopsService.findAllForVendor(req.user.userId);
    }

    @Get(':id')
    async findOne(@Request() req, @Param('id') id: string) {
        return await this.shopsService.findOne(req.user.userId, id);
    }

    @Patch(':id')
    async update(
        @Request() req,
        @Param('id') id: string,
        @Body() updateShopDto: UpdateShopDto,
    ) {
        return await this.shopsService.update(req.user.userId, id, updateShopDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Request() req, @Param('id') id: string) {
        await this.shopsService.remove(req.user.userId, id);
    }
}
