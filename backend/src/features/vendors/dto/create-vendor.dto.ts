import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVendorDto {
    @ApiProperty({ example: 'My Awesome Store' })
    @IsNotEmpty()
    @IsString()
    businessName: string;

    @ApiProperty({ example: 1 })
    @IsNotEmpty()
    @IsNumber()
    operatingCityId: number;

    @ApiProperty({ example: '123 Main St' })
    @IsNotEmpty()
    @IsString()
    address: string;

    @ApiProperty({ example: 40.7128 })
    @IsNotEmpty()
    @IsNumber()
    latitude: number;

    @ApiProperty({ example: -74.0060 })
    @IsNotEmpty()
    @IsNumber()
    longitude: number;
}
