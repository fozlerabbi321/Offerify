import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
    @ApiProperty({ example: 'Food' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ type: 'string', format: 'binary', description: 'Category icon image' })
    @IsOptional()
    file?: any;
}
