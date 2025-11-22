import { IsString, IsEnum, IsUUID, IsOptional, IsNumber, Min, Max, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OfferType } from '../../../domain/entities/offer.entity';

export class CreateOfferDto {
    @ApiProperty({ example: '50% Off Whopper' })
    @IsString()
    title: string;

    @ApiProperty({ example: 'Get 50% off on your favorite Whopper burger.' })
    @IsString()
    description: string;

    @ApiProperty({ enum: OfferType, example: OfferType.DISCOUNT })
    @IsEnum(OfferType)
    type: OfferType;

    @ApiProperty({ example: '0fd62dc5-b7aa-4d10-a0e2-d5b0f2ac1213' })
    @IsUUID()
    vendorId: string;

    @ApiPropertyOptional({
        example: 1,
        description: 'Target city ID for this offer. If not provided, defaults to vendor\'s operating city (Multi-Branch Support).'
    })
    @IsOptional()
    @IsInt()
    cityId?: number;

    @ApiPropertyOptional({ example: 50, minimum: 0, maximum: 100 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    discountPercentage?: number;

    @ApiPropertyOptional({ example: 'FRIES24' })
    @IsOptional()
    @IsString()
    couponCode?: string;

    @ApiPropertyOptional({ example: 100, minimum: 0 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    voucherValue?: number;
}
