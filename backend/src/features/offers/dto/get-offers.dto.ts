import { IsOptional, IsString, IsNumber, IsBoolean, IsEnum, IsInt, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetOffersDto {
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    cityId?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    featured?: boolean;

    @ApiPropertyOptional({ enum: ['popularity', 'newest', 'price_asc', 'price_desc'] })
    @IsOptional()
    @IsEnum(['popularity', 'newest', 'price_asc', 'price_desc'])
    sort?: 'popularity' | 'newest' | 'price_asc' | 'price_desc';

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    lat?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    long?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    categoryId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    vendorId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;
}
