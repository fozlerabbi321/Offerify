import { Test, TestingModule } from '@nestjs/testing';
import { VendorsService } from './vendors.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VendorProfile } from '../../domain/entities/vendor-profile.entity';
import { User, UserRole } from '../../domain/entities/user.entity';
import { City } from '../../domain/entities/city.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { DataSource } from 'typeorm';

describe('VendorsService', () => {
    let service: VendorsService;
    let vendorRepo: any;
    let userRepo: any;
    let cityRepo: any;
    let dataSource: any;

    const mockVendorRepo = {
        findOne: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
    };

    const mockUserRepo = {
        findOne: jest.fn(),
        save: jest.fn(),
    };

    const mockCityRepo = {
        findOne: jest.fn(),
    };

    const mockEntityManager = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    const mockDataSource = {
        transaction: jest.fn((cb) => cb(mockEntityManager)),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VendorsService,
                { provide: getRepositoryToken(VendorProfile), useValue: mockVendorRepo },
                { provide: getRepositoryToken(User), useValue: mockUserRepo },
                { provide: getRepositoryToken(City), useValue: mockCityRepo },
                { provide: DataSource, useValue: mockDataSource },
            ],
        }).compile();

        service = module.get<VendorsService>(VendorsService);
        vendorRepo = module.get(getRepositoryToken(VendorProfile));
        userRepo = module.get(getRepositoryToken(User));
        cityRepo = module.get(getRepositoryToken(City));
        dataSource = module.get(DataSource);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        const userId = 'user-uuid';
        const dto: CreateVendorDto = {
            businessName: 'My Shop',
            operatingCityId: 1,
            address: '123 St',
            latitude: 40.0,
            longitude: -74.0,
        };

        it('should create profile and update user role to VENDOR', async () => {
            // Mock transaction manager calls
            mockEntityManager.findOne
                .mockResolvedValueOnce(null) // Check existing profile
                .mockResolvedValueOnce({ id: userId, role: UserRole.CUSTOMER }) // Fetch User
                .mockResolvedValueOnce({ id: 1 }); // Fetch City

            const mockVendor = { ...dto, id: 'vendor-uuid', user: { id: userId } };
            mockEntityManager.create.mockReturnValue(mockVendor);
            mockEntityManager.save.mockResolvedValue(mockVendor);

            const result = await service.create(userId, dto);

            expect(result).toEqual(mockVendor);
            expect(mockEntityManager.create).toHaveBeenCalled();
            expect(mockEntityManager.save).toHaveBeenCalledTimes(2); // Vendor + User
            expect(mockEntityManager.save).toHaveBeenCalledWith(expect.objectContaining({
                id: userId,
                role: UserRole.VENDOR,
            }));
        });

        it('should throw ConflictException if user already has a vendor profile', async () => {
            mockEntityManager.findOne.mockResolvedValueOnce({ id: 'existing-profile' });

            await expect(service.create(userId, dto)).rejects.toThrow(ConflictException);
        });

        it('should throw NotFoundException if city does not exist', async () => {
            mockEntityManager.findOne
                .mockResolvedValueOnce(null) // No existing profile
                .mockResolvedValueOnce({ id: userId }) // User exists
                .mockResolvedValueOnce(null); // City not found

            await expect(service.create(userId, dto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findMyProfile', () => {
        it('should return profile for logged-in user', async () => {
            const userId = 'user-uuid';
            const mockProfile = { id: 'vendor-uuid', businessName: 'My Shop' };
            mockVendorRepo.findOne.mockResolvedValue(mockProfile);

            const result = await service.findMyProfile(userId);

            expect(result).toEqual(mockProfile);
            expect(mockVendorRepo.findOne).toHaveBeenCalledWith({
                where: { user: { id: userId } },
                relations: ['city'],
            });
        });

        it('should throw NotFoundException if profile not found', async () => {
            mockVendorRepo.findOne.mockResolvedValue(null);
            await expect(service.findMyProfile('user-uuid')).rejects.toThrow(NotFoundException);
        });
    });
});
