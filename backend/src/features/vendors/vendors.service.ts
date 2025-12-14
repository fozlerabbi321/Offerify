import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { VendorProfile } from '../../domain/entities/vendor-profile.entity';
import { User, UserRole } from '../../domain/entities/user.entity';
import { City } from '../../domain/entities/city.entity';
import { Offer } from '../../domain/entities/offer.entity';
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

    async getStats(userId: string): Promise<{
        totalViews: number;
        totalRedemptions: number;
        activeOffers: number;
        inactiveOffers: number;
        totalOffers: number;
        ratingAvg: number;
        reviewCount: number;
    }> {
        const vendor = await this.findMyProfile(userId);

        const stats = await this.dataSource.getRepository(Offer)
            .createQueryBuilder('offer')
            .select('COUNT(offer.id)', 'totalOffers')
            .addSelect('SUM(CASE WHEN offer.isActive = true THEN 1 ELSE 0 END)', 'activeOffers')
            .addSelect('SUM(CASE WHEN offer.isActive = false THEN 1 ELSE 0 END)', 'inactiveOffers')
            .addSelect('SUM(offer.views)', 'totalViews')
            .addSelect('SUM(offer.voucherClaimedCount)', 'totalRedemptions')
            .where('offer.vendor = :vendorId', { vendorId: vendor.id })
            .getRawOne();

        const safeStats = stats || {};

        return {
            totalViews: parseInt(safeStats.totalViews) || 0,
            totalRedemptions: parseInt(safeStats.totalRedemptions) || 0,
            activeOffers: parseInt(safeStats.activeOffers) || 0,
            inactiveOffers: parseInt(safeStats.inactiveOffers) || 0,
            totalOffers: parseInt(safeStats.totalOffers) || 0,
            ratingAvg: Number(vendor.ratingAvg) || 0,
            reviewCount: Number(vendor.reviewCount) || 0,
        };
    }

    async updateProfile(userId: string, updateDto: any): Promise<VendorProfile> {
        const vendor = await this.vendorRepo.findOne({
            where: { user: { id: userId } },
        });

        if (!vendor) {
            throw new NotFoundException('Vendor profile not found');
        }

        // Update basic fields
        if (updateDto.businessName) vendor.businessName = updateDto.businessName;
        if (updateDto.description) vendor.description = updateDto.description;
        if (updateDto.contactPhone) vendor.contactPhone = updateDto.contactPhone;
        if (updateDto.logoUrl) vendor.logoUrl = updateDto.logoUrl;
        if (updateDto.coverImageUrl) vendor.coverImageUrl = updateDto.coverImageUrl;

        // Update location if lat/long provided
        if (updateDto.latitude !== undefined && updateDto.longitude !== undefined) {
            vendor.location = {
                type: 'Point',
                coordinates: [updateDto.longitude, updateDto.latitude],
            };
        }

        // Update slug if business name changed
        if (updateDto.businessName) {
            vendor.slug = updateDto.businessName.toLowerCase().replace(/ /g, '-');
        }

        return await this.vendorRepo.save(vendor);
    }

    async findById(vendorId: string): Promise<VendorProfile> {
        const vendor = await this.vendorRepo.findOne({
            where: { id: vendorId },
            relations: ['city'],
        });

        if (!vendor) {
            throw new NotFoundException('Vendor profile not found');
        }

        return vendor;
    }
}
