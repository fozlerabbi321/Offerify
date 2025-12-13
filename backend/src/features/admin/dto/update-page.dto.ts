import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePageDto {
    @ApiProperty({ description: 'Page title' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ description: 'Page body content' })
    @IsString()
    @IsNotEmpty()
    body: string;
}
