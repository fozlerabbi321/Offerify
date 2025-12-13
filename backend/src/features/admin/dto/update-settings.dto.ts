import { IsArray, ValidateNested, IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class SettingItem {
    @ApiProperty({ description: 'Setting key', example: 'support_email' })
    @IsString()
    @IsNotEmpty()
    key: string;

    @ApiProperty({ description: 'Setting value', example: 'support@offerify.com' })
    @IsString()
    value: string;
}

export class UpdateSettingsDto {
    @ApiProperty({ type: [SettingItem], description: 'Array of settings to update' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SettingItem)
    settings: SettingItem[];
}
