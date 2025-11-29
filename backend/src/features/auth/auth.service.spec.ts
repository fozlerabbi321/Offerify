import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from '../../domain/user.entity';
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
                role: UserRole.USER,
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
                role: UserRole.USER,
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
            const user = { id: 'uuid', email, passwordHash: 'hashedPassword', role: UserRole.USER };

            mockUserRepository.findOne.mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.validateUser(email, password);

            expect(result).toEqual({ id: 'uuid', email, role: UserRole.USER });
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email } });
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
            const user = { id: 'uuid', email: 'test@example.com', role: UserRole.USER };
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
});
