import { Controller, Post, Body, UnauthorizedException, UseGuards, Get, Request, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @ApiCreatedResponse({ type: AuthResponseDto })
    async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @ApiOkResponse({ type: AuthResponseDto })
    async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }

    @Get('profile')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async getProfile(@Request() req) {
        // Fetch full user from database instead of relying on JWT payload
        const user = await this.authService.findById(req.user.userId);
        // Remove passwordHash from response
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    @Patch('profile')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOkResponse({ description: 'Profile updated successfully' })
    async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
        return this.authService.updateProfile(req.user.userId, updateProfileDto);
    }

    @Post('change-password')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOkResponse({ description: 'Password changed successfully' })
    async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
        return this.authService.changePassword(req.user.userId, changePasswordDto);
    }
}
