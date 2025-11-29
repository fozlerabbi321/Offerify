import { ApiProperty } from '@nestjs/swagger';
import { User, UserRole } from '../../../domain/entities/user.entity';

export class AuthResponseDto {
    @ApiProperty({ type: () => User })
    user: User;

    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
    access_token: string;
}
