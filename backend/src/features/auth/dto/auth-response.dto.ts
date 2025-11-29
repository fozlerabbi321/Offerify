import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../domain/user.entity';

export class AuthResponseDto {
    @ApiProperty({ type: () => User })
    user: User;

    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
    access_token: string;
}
