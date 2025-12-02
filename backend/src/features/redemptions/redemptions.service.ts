import { Injectable, BadRequestException, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OfferRedemption } from '../../domain/entities/offer-redemption.entity';
import { Offer } from '../../domain/entities/offer.entity';
import { VendorProfile } from '../../domain/entities/vendor-profile.entity';

@Injectable()
export class RedemptionsService {
    constructor(
        @InjectRepository(OfferRedemption)
        private redemptionRepo: Repository<OfferRedemption>,
        @InjectRepository(Offer)
        private offerRepo: Repository<Offer>,
        @InjectRepository(VendorProfile)
        private vendorRepo: Repository<VendorProfile>,
    ) { }

    async claim(userId: string, offerId: string) {
        // 1. Check if already claimed
        const existingRedemption = await this.redemptionRepo.findOne({
            where: {
                user: { id: userId },
                offer: { id: offerId },
            },
        });

        if (existingRedemption) {
            throw new ConflictException('You have already claimed this offer');
        }

        // 2. Atomic Update: Increment claimed count if limit not reached
        // We need to check the limit first. Since we don't have the offer loaded, we can do it in the update query
        // BUT TypeORM increment doesn't support complex conditions easily in one go without custom query builder or raw query for atomic check-and-update.
        // However, the requirement says: "offerRepo.increment({ id: offerId, voucherClaimedCount: LessThan(voucherLimit) }, 'voucherClaimedCount', 1)"
        // Let's try to use that pattern if possible, or use a query builder for atomic update.

        // Using update with criteria is safer for atomicity
        const result = await this.offerRepo
            .createQueryBuilder()
            .update(Offer)
            .set({ voucherClaimedCount: () => 'voucher_claimed_count + 1' })
            .where('id = :id', { id: offerId })
            .andWhere('voucher_claimed_count < voucher_limit')
            .execute();

        if (result.affected === 0) {
            // It could be that offer doesn't exist OR limit reached. 
            // For better error message we might want to check existence, but for high concurrency, failing fast is good.
            // Let's assume it's limit reached or invalid offer.
            throw new BadRequestException('Vouchers sold out or offer unavailable');
        }

        // 3. Create Redemption Record
        const insertResult = await this.redemptionRepo.insert({
            user: { id: userId },
            offer: { id: offerId },
            isUsed: false,
        });

        const redemptionId = insertResult.identifiers[0].id;

        return this.redemptionRepo.findOne({
            where: { id: redemptionId },
            relations: ['offer', 'offer.vendor'],
        });
    }

    async verifyRedemptionAsVendor(userId: string, redemptionId: string) {
        const vendorProfile = await this.vendorRepo.findOne({
            where: { user: { id: userId } },
        });

        if (!vendorProfile) {
            throw new ForbiddenException('User is not a vendor');
        }

        return this.verify(vendorProfile.id, redemptionId);
    }

    async verify(vendorId: string, redemptionId: string) {
        const redemption = await this.redemptionRepo.findOne({
            where: { id: redemptionId },
            relations: ['offer', 'offer.vendor'],
        });

        if (!redemption) {
            throw new NotFoundException('Redemption not found');
        }

        if (redemption.offer.vendor.id !== vendorId) {
            throw new ForbiddenException('You are not authorized to verify this redemption');
        }

        if (redemption.isUsed) {
            throw new ConflictException('Redemption already used');
        }

        redemption.isUsed = true;
        redemption.redeemedAt = new Date();

        return this.redemptionRepo.save(redemption);
    }

    async getMyRedemptions(userId: string) {
        return this.redemptionRepo.find({
            where: { user: { id: userId } },
            relations: ['offer', 'offer.vendor'],
            order: { createdAt: 'DESC' },
        });
    }
}
