import { DataSource } from 'typeorm';
import { User, UserRole } from '../../domain/entities/user.entity';
import { VendorProfile } from '../../domain/entities/vendor-profile.entity';
import { Offer, OfferType, DiscountOffer, CouponOffer, VoucherOffer } from '../../domain/entities/offer.entity';
import { City } from '../../domain/entities/city.entity';
import { Country } from '../../domain/entities/country.entity';
import { State } from '../../domain/entities/state.entity';
import { databaseConfig } from '../../config/database.config';
import * as dotenv from 'dotenv';

dotenv.config();

async function seed() {
    const config = databaseConfig() as any;

    const dataSource = new DataSource({
        ...config,
        entities: [User, VendorProfile, Offer, DiscountOffer, CouponOffer, VoucherOffer, City, Country, State],
    });

    await dataSource.initialize();

    const userRepo = dataSource.getRepository(User);
    const vendorRepo = dataSource.getRepository(VendorProfile);
    const offerRepo = dataSource.getRepository(Offer);
    const cityRepo = dataSource.getRepository(City);

    console.log('🌱 Seeding Vendor Data...');

    // 1. Find a City (Gulshan 1)
    const city = await cityRepo.findOne({ where: { name: 'Gulshan 1' } });
    if (!city) {
        console.error('❌ City "Gulshan 1" not found. Please run location seeder first.');
        process.exit(1);
    }

    // 2. Create Vendor User
    let user = await userRepo.findOne({ where: { email: 'vendor@example.com' } });
    if (!user) {
        user = userRepo.create({
            email: 'vendor@example.com',
            passwordHash: 'hashed_password_placeholder', // In real app, use bcrypt
            role: UserRole.VENDOR,
        });
        await userRepo.save(user);
        console.log('✅ Created Vendor User: vendor@example.com');
    } else {
        console.log('ℹ️ Vendor User already exists');
    }

    // 3. Create Vendor Profile
    let vendor = await vendorRepo.findOne({ where: { slug: 'burger-king-gulshan' } });
    if (!vendor) {
        vendor = vendorRepo.create({
            businessName: 'Burger King Gulshan',
            slug: 'burger-king-gulshan',
            user: user,
            city: city,
            location: {
                type: 'Point',
                coordinates: [90.4078, 23.7925], // Same as Gulshan 1 center for demo
            },
        });
        await vendorRepo.save(vendor);
        console.log('✅ Created Vendor Profile: Burger King Gulshan');
    } else {
        console.log('ℹ️ Vendor Profile already exists');
    }

    // 4. Create Offers
    const offersData = [
        {
            title: '50% Off Whopper',
            description: 'Get 50% off on your favorite Whopper burger.',
            type: OfferType.DISCOUNT,
            discountPercentage: 50,
        },
        {
            title: 'Free Fries Coupon',
            description: 'Use code FRIES24 for free fries.',
            type: OfferType.COUPON,
            couponCode: 'FRIES24',
        },
        {
            title: '100 BDT Voucher',
            description: 'Get 100 BDT off on orders above 500 BDT.',
            type: OfferType.VOUCHER,
            voucherValue: 100,
        },
    ];

    for (const data of offersData) {
        const existingOffer = await offerRepo.findOne({
            where: { title: data.title, vendor: { id: vendor.id } }
        });

        if (!existingOffer) {
            let offer: Offer;
            if (data.type === OfferType.DISCOUNT) {
                offer = offerRepo.create({ ...data, vendor } as DiscountOffer);
            } else if (data.type === OfferType.COUPON) {
                offer = offerRepo.create({ ...data, vendor } as CouponOffer);
            } else {
                offer = offerRepo.create({ ...data, vendor } as VoucherOffer);
            }

            await offerRepo.save(offer);
            console.log(`✅ Created Offer: ${data.title}`);
        } else {
            console.log(`ℹ️ Offer ${data.title} already exists`);
        }
    }

    console.log('🎉 Vendor Seeding Complete!');
    await dataSource.destroy();
}

seed().catch((error) => {
    console.error('❌ Seeding Failed:', error);
    process.exit(1);
});
