import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class NearestZoneDto {
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    lat: number;

    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    long: number;
}
