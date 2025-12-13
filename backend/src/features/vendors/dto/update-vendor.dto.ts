import { IsOptional, IsString, IsNumber, MinLength, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVendorDto {
    @ApiPropertyOptional({ example: 'My Updated Store Name' })
    @IsOptional()
    @IsString()
    @MinLength(2)
    businessName?: string;

    @ApiPropertyOptional({ example: 'A great store offering amazing deals on electronics and accessories.' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: '+8801712345678' })
    @IsOptional()
    @IsString()
    @Matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, {
        message: 'Contact phone must be a valid phone number',
    })
    contactPhone?: string;

    @ApiPropertyOptional({ example: 'https://example.com/logo.jpg' })
    @IsOptional()
    @IsString()
    logoUrl?: string;

    @ApiPropertyOptional({ example: 'https://example.com/cover.jpg' })
    @IsOptional()
    @IsString()
    coverImageUrl?: string;

    @ApiPropertyOptional({ example: 40.7128 })
    @IsOptional()
    @IsNumber()
    latitude?: number;

    @ApiPropertyOptional({ example: -74.0060 })
    @IsOptional()
    @IsNumber()
    longitude?: number;
}
