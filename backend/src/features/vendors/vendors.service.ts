import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { VendorProfile } from '../../domain/entities/vendor-profile.entity';
import { User, UserRole } from '../../domain/entities/user.entity';
import { City } from '../../domain/entities/city.entity';
import { CreateVendorDto } from './dto/create-vendor.dto';

@Injectable()
export class VendorsService {
    constructor(
        @InjectRepository(VendorProfile)
        private readonly vendorRepo: Repository<VendorProfile>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(City)
        private readonly cityRepo: Repository<City>,
        private readonly dataSource: DataSource,
    ) { }

    async create(userId: string, dto: CreateVendorDto): Promise<VendorProfile> {
        return this.dataSource.transaction(async (manager) => {
            // 1. Check if profile already exists (using manager to be safe, though read-only check is fine)
            const existingProfile = await manager.findOne(VendorProfile, { where: { user: { id: userId } } });
            if (existingProfile) {
                throw new ConflictException('User already has a vendor profile');
            }

            // 2. Fetch User Entity (CRITICAL: Need full entity for relation)
            const user = await manager.findOne(User, { where: { id: userId } });
            if (!user) {
                throw new NotFoundException('User not found');
            }

            // 3. Fetch City Entity
            const city = await manager.findOne(City, { where: { id: dto.operatingCityId } });
            if (!city) {
                throw new NotFoundException('City not found');
            }

            // 4. Create VendorProfile instance with FULL entities
            const vendor = manager.create(VendorProfile, {
                ...dto,
                city: city, // Pass full City entity
                user: user, // Pass full User entity
                location: {
                    type: 'Point',
                    coordinates: [dto.longitude, dto.latitude],
                },
                slug: dto.businessName.toLowerCase().replace(/ /g, '-'),
            });

            // 5. Save VendorProfile
            const savedVendor = await manager.save(vendor);

            // 6. Update User role
            user.role = UserRole.VENDOR;
            await manager.save(user);

            // 7. Update memory object to reflect the change
            vendor.user = user;

            return savedVendor;
        });
    }

    async findMyProfile(userId: string): Promise<VendorProfile> {
        const profile = await this.vendorRepo.findOne({
            where: { user: { id: userId } },
            relations: ['city'],
        });

        if (!profile) {
            throw new NotFoundException('Vendor profile not found');
        }

        return profile;
    }
}

