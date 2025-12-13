import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../domain/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto): Promise<{ user: User; access_token: string }> {
        const { email, password, role } = registerDto;

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        const user = this.userRepository.create({
            email,
            passwordHash,
            role: role || UserRole.CUSTOMER,
        });

        try {
            const savedUser = await this.userRepository.save(user);
            const payload = { email: savedUser.email, sub: savedUser.id, role: savedUser.role };
            return {
                user: savedUser,
                access_token: this.jwtService.sign(payload),
            };
        } catch (error) {
            if (error.code === '23505') { // Unique violation
                throw new ConflictException('Email already exists');
            }
            throw error;
        }
    }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.userRepository.findOne({
            where: { email },
            select: ['id', 'email', 'passwordHash', 'role', 'createdAt', 'updatedAt'] // Explicitly select passwordHash
        });
        if (user && await bcrypt.compare(pass, user.passwordHash)) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            user: user,
            access_token: this.jwtService.sign(payload),
        };
    }

    async findById(userId: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        Object.assign(user, updateProfileDto);

        try {
            return await this.userRepository.save(user);
        } catch (error) {
            if (error.code === '23505') { // Unique violation for phone
                throw new ConflictException('Phone number already in use');
            }
            throw error;
        }
    }

    async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['id', 'email', 'passwordHash', 'role', 'createdAt', 'updatedAt']
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        const salt = await bcrypt.genSalt();
        user.passwordHash = await bcrypt.hash(changePasswordDto.newPassword, salt);

        await this.userRepository.save(user);

        return { message: 'Password changed successfully' };
    }
}
