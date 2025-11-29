import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';

import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../domain/entities/user.entity';

@Module({
    imports: [
        PassportModule,
        TypeOrmModule.forFeature([User]),
    ],
    providers: [AuthService, JwtStrategy],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }
