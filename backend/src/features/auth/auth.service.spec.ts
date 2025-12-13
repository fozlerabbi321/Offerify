import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from '../../domain/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
};

const mockJwtService = {
    sign: jest.fn(),
};

describe('AuthService', () => {
    let service: AuthService;
    let userRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        userRepository = module.get(getRepositoryToken(User));

        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('register', () => {
        it('should successfully register a user', async () => {
            const dto: RegisterDto = { email: 'test@example.com', password: 'password123' };
            const hashedPassword = 'hashedPassword';
            const savedUser = {
                id: 'uuid',
                email: dto.email,
                passwordHash: hashedPassword,
                role: UserRole.CUSTOMER,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Mock bcrypt.hash
            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

            mockUserRepository.create.mockReturnValue(savedUser);
            mockUserRepository.save.mockResolvedValue(savedUser);
            mockJwtService.sign.mockReturnValue('jwt_token'); // Added mock for jwtService.sign

            const result = await service.register(dto);

            expect(result).toEqual({
                user: savedUser,
                access_token: 'jwt_token',
            });
            expect(mockUserRepository.create).toHaveBeenCalledWith({
                email: dto.email,
                passwordHash: hashedPassword,
                role: UserRole.CUSTOMER,
            });
            expect(mockUserRepository.save).toHaveBeenCalled();
            expect(mockJwtService.sign).toHaveBeenCalledWith({
                sub: savedUser.id,
                email: savedUser.email,
                role: savedUser.role
            });
        });
    });

    describe('validateUser', () => {
        it('should return user without password if validation is successful', async () => {
            const email = 'test@example.com';
            const password = 'password123';
            const user = { id: 'uuid', email, passwordHash: 'hashedPassword', role: UserRole.CUSTOMER };

            mockUserRepository.findOne.mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.validateUser(email, password);

            expect(result).toEqual({ id: 'uuid', email, role: UserRole.CUSTOMER });
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { email },
                select: ['id', 'email', 'passwordHash', 'role', 'createdAt', 'updatedAt'],
            });
        });

        it('should return null if user not found', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);
            const result = await service.validateUser('test@example.com', 'pass');
            expect(result).toBeNull();
        });

        it('should return null if password incorrect', async () => {
            const user = { id: 'uuid', email: 'test@example.com', passwordHash: 'hashed' };
            mockUserRepository.findOne.mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            const result = await service.validateUser('test@example.com', 'wrong');
            expect(result).toBeNull();
        });
    });

    describe('login', () => {
        it('should return access token and user', async () => {
            const user = { id: 'uuid', email: 'test@example.com', role: UserRole.CUSTOMER };
            const token = 'jwt_token';
            mockJwtService.sign.mockReturnValue(token);

            const result = await service.login(user as any);

            expect(result).toEqual({
                access_token: token,
                user: user
            });
            expect(mockJwtService.sign).toHaveBeenCalledWith({
                sub: user.id,
                email: user.email,
                role: user.role
            });
        });
    });

    describe('updateProfile', () => {
        it('should successfully update user profile', async () => {
            const userId = 'user-uuid';
            const updateDto = { name: 'John Doe', phone: '+8801712345678', avatarUrl: 'https://example.com/avatar.jpg' };
            const existingUser = { id: userId, email: 'test@example.com', role: UserRole.CUSTOMER };
            const updatedUser = { ...existingUser, ...updateDto };

            mockUserRepository.findOne.mockResolvedValue(existingUser);
            mockUserRepository.save.mockResolvedValue(updatedUser);

            const result = await service.updateProfile(userId, updateDto);

            expect(result).toEqual(updatedUser);
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
            expect(mockUserRepository.save).toHaveBeenCalledWith({ ...existingUser, ...updateDto });
        });

        it('should throw NotFoundException if user not found', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);

            await expect(service.updateProfile('invalid-id', { name: 'John' }))
                .rejects
                .toThrow('User not found');
        });

        it('should throw ConflictException if phone already exists', async () => {
            const userId = 'user-uuid';
            const updateDto = { phone: '+8801712345678' };
            const existingUser = { id: userId, email: 'test@example.com' };

            mockUserRepository.findOne.mockResolvedValue(existingUser);
            mockUserRepository.save.mockRejectedValue({ code: '23505' }); // Unique violation

            await expect(service.updateProfile(userId, updateDto))
                .rejects
                .toThrow('Phone number already in use');
        });
    });

    describe('changePassword', () => {
        it('should successfully change password with correct current password', async () => {
            const userId = 'user-uuid';
            const changePasswordDto = { currentPassword: 'oldPassword', newPassword: 'newPassword123' };
            const user = { id: userId, email: 'test@example.com', passwordHash: 'hashedOldPassword' };
            const newHashedPassword = 'hashedNewPassword';

            mockUserRepository.findOne.mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
            (bcrypt.hash as jest.Mock).mockResolvedValue(newHashedPassword);
            mockUserRepository.save.mockResolvedValue({ ...user, passwordHash: newHashedPassword });

            const result = await service.changePassword(userId, changePasswordDto);

            expect(result).toEqual({ message: 'Password changed successfully' });
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { id: userId },
                select: ['id', 'email', 'passwordHash', 'role', 'createdAt', 'updatedAt']
            });
            expect(bcrypt.hash).toHaveBeenCalledWith(changePasswordDto.newPassword, expect.any(String));
            expect(mockUserRepository.save).toHaveBeenCalled();
        });

        it('should throw UnauthorizedException if current password is wrong', async () => {
            const userId = 'user-uuid';
            const changePasswordDto = { currentPassword: 'wrongPassword', newPassword: 'newPassword123' };
            const user = { id: userId, email: 'test@example.com', passwordHash: 'hashedOldPassword' };

            mockUserRepository.findOne.mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.changePassword(userId, changePasswordDto))
                .rejects
                .toThrow('Current password is incorrect');
        });

        it('should throw NotFoundException if user not found', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);

            await expect(service.changePassword('invalid-id', { currentPassword: 'old', newPassword: 'new' }))
                .rejects
                .toThrow('User not found');
        });
    });
});
