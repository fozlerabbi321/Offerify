import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { Review } from '../../domain/entities/review.entity';
import { VendorProfile } from '../../domain/entities/vendor-profile.entity';
import { PageContent } from '../../domain/entities/page-content.entity';
import { AppSetting } from '../../domain/entities/app-setting.entity';
import { ListUsersDto } from './dto/list-users.dto';
import { ListReviewsDto } from './dto/list-reviews.dto';
import { ListVendorsDto } from './dto/list-vendors.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Review)
        private readonly reviewRepository: Repository<Review>,
        @InjectRepository(PageContent)
        private readonly pageContentRepository: Repository<PageContent>,
        @InjectRepository(AppSetting)
        private readonly appSettingRepository: Repository<AppSetting>,
        @InjectRepository(VendorProfile)
        private readonly vendorRepository: Repository<VendorProfile>,
    ) { }

    // ============================================================
    // USER MANAGEMENT
    // ============================================================

    async listUsers(dto: ListUsersDto) {
        const { page = 1, limit = 10, search } = dto;
        const skip = (page - 1) * limit;

        const queryBuilder = this.userRepository.createQueryBuilder('user');

        if (search) {
            queryBuilder.where(
                'user.email ILIKE :search OR user.name ILIKE :search',
                { search: `%${search}%` },
            );
        }

        const [users, total] = await queryBuilder
            .orderBy('user.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return {
            items: users,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async toggleBan(userId: string) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.isBanned = !user.isBanned;
        await this.userRepository.save(user);

        return {
            message: user.isBanned ? 'User has been banned' : 'User has been unbanned',
        };
    }

    async updateUser(userId: string, data: Partial<User>) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Only allow updating name and role for now
        if (data.name) user.name = data.name;
        if (data.role) user.role = data.role;

        await this.userRepository.save(user);

        return user;
    }

    async deleteUser(userId: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['vendorProfile', 'favorites', 'reviews'],
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        await this.userRepository.remove(user); // Cascade delete should handle details
        return { message: 'User deleted successfully' };
    }

    // ============================================================
    // VENDOR MANAGEMENT
    // ============================================================

    async listVendors(dto: ListVendorsDto) {
        const { page = 1, limit = 10, search } = dto;
        const skip = (page - 1) * limit;

        const queryBuilder = this.vendorRepository.createQueryBuilder('vendor');

        if (search) {
            queryBuilder.where(
                'vendor.businessName ILIKE :search',
                { search: `%${search}%` },
            );
        }

        const [vendors, total] = await queryBuilder
            .orderBy('vendor.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();


        return {
            items: vendors,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async updateVendorStatus(vendorId: string, status: string) {
        const vendor = await this.vendorRepository.findOne({ where: { id: vendorId } });
        if (!vendor) {
            throw new NotFoundException('Vendor not found');
        }

        vendor.status = status as any;
        await this.vendorRepository.save(vendor);

        return vendor;
    }

    async updateVendorProfile(vendorId: string, data: Partial<VendorProfile>) {
        const vendor = await this.vendorRepository.findOne({ where: { id: vendorId } });
        if (!vendor) {
            throw new NotFoundException('Vendor not found');
        }

        if (data.businessName) vendor.businessName = data.businessName;
        if (data.contactPhone) vendor.contactPhone = data.contactPhone;

        await this.vendorRepository.save(vendor);
        return vendor;
    }

    async deleteVendor(vendorId: string) {
        const vendor = await this.vendorRepository.findOne({ where: { id: vendorId } });
        if (!vendor) {
            throw new NotFoundException('Vendor not found');
        }

        await this.vendorRepository.remove(vendor);
        return { message: 'Vendor deleted successfully' };
    }

    // ============================================================
    // REVIEW MODERATION

    // ============================================================

    async listReviews(dto: ListReviewsDto) {
        const { page = 1, limit = 10 } = dto;
        const skip = (page - 1) * limit;

        const [reviews, total] = await this.reviewRepository.findAndCount({
            relations: ['user', 'vendor'],
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });

        return {
            items: reviews,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async deleteReview(reviewId: string) {
        const review = await this.reviewRepository.findOne({ where: { id: reviewId } });
        if (!review) {
            throw new NotFoundException('Review not found');
        }

        await this.reviewRepository.remove(review);

        return { message: 'Review deleted successfully' };
    }

    // ============================================================
    // CMS - PAGE CONTENT
    // ============================================================

    async getPageContent(slug: string) {
        const page = await this.pageContentRepository.findOne({ where: { slug } });
        if (!page) {
            // Return a default empty page if not found
            return {
                slug,
                title: this.slugToTitle(slug),
                body: '',
                updatedAt: null,
            };
        }
        return page;
    }

    async updatePageContent(slug: string, dto: UpdatePageDto) {
        let page = await this.pageContentRepository.findOne({ where: { slug } });

        if (!page) {
            // Create new page content
            page = this.pageContentRepository.create({
                slug,
                title: dto.title,
                body: dto.body,
            });
        } else {
            page.title = dto.title;
            page.body = dto.body;
        }

        await this.pageContentRepository.save(page);

        return page;
    }

    // ============================================================
    // GLOBAL SETTINGS
    // ============================================================

    async getAllSettings() {
        const settings = await this.appSettingRepository.find({
            order: { key: 'ASC' },
        });

        // Return as key-value object for easier frontend consumption
        const settingsObject: Record<string, string> = {};
        settings.forEach((s) => {
            settingsObject[s.key] = s.value;
        });

        return {
            items: settings,
            config: settingsObject,
        };
    }

    async updateSettings(dto: UpdateSettingsDto) {
        const updatedSettings: AppSetting[] = [];

        for (const item of dto.settings) {
            let setting = await this.appSettingRepository.findOne({
                where: { key: item.key },
            });

            if (!setting) {
                setting = this.appSettingRepository.create({
                    key: item.key,
                    value: item.value,
                });
            } else {
                setting.value = item.value;
            }

            await this.appSettingRepository.save(setting);
            updatedSettings.push(setting);
        }

        return {
            message: 'Settings updated successfully',
            items: updatedSettings,
        };
    }

    // ============================================================
    // DASHBOARD STATS
    // ============================================================

    async getDashboardStats() {
        const [totalUsers, totalReviews] = await Promise.all([
            this.userRepository.count(),
            this.reviewRepository.count(),
        ]);

        return {
            totalUsers,
            totalReviews,
        };
    }

    // ============================================================
    // HELPER METHODS
    // ============================================================

    private slugToTitle(slug: string): string {
        return slug
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
}
