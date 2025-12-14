import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateShopDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @Type(() => Number)
    cityId: number;

    @IsNumber()
    @Type(() => Number)
    latitude: number;

    @IsNumber()
    @Type(() => Number)
    longitude: number;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    contactNumber?: string;

    @IsBoolean()
    @IsOptional()
    @Type(() => Boolean)
    isDefault?: boolean;
}
