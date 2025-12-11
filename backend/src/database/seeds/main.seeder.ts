import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import { Country } from '../../domain/entities/country.entity';
import { State } from '../../domain/entities/state.entity';
import { City } from '../../domain/entities/city.entity';
import { Category } from '../../domain/entities/category.entity';
import { User, UserRole } from '../../domain/entities/user.entity';
import { VendorProfile } from '../../domain/entities/vendor-profile.entity';
import { Offer, OfferType, DiscountOffer, VoucherOffer, CouponOffer } from '../../domain/entities/offer.entity';
import { Favorite } from '../../domain/entities/favorite.entity';
import { Review } from '../../domain/entities/review.entity';
import { OfferRedemption } from '../../domain/entities/offer-redemption.entity';
import { SnakeNamingStrategy } from '../../config/database.config';

dotenv.config();

const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [
        Country,
        State,
        City,
        Category,
        User,
        VendorProfile,
        Offer,
        DiscountOffer,
        VoucherOffer,
        CouponOffer,
        Favorite,
        Review,
        OfferRedemption
    ],
    synchronize: true, // Auto-sync schema for seeding to ensure all columns exist
    namingStrategy: new SnakeNamingStrategy(),
});

async function seed() {
    console.log('🌱 Starting Master Seeder...');

    try {
        await dataSource.initialize();
        console.log('✅ Database Connected');

        // 1. Cleanup
        console.log('🧹 Cleaning up database...');
        await dataSource.query(`TRUNCATE TABLE offers, vendor_profiles, users, cities, states, countries, categories RESTART IDENTITY CASCADE`);

        // 2. Locations
        console.log('🗺️ Seeding Locations...');
        const countryRepo = dataSource.getRepository(Country);
        const stateRepo = dataSource.getRepository(State);
        const cityRepo = dataSource.getRepository(City);

        const country = await countryRepo.save({ name: 'Bangladesh', isoCode: 'BD' });
        const state = await stateRepo.save({ name: 'Dhaka Division', country });

        const citiesData = [
            { name: 'Gulshan 1', lat: 23.7925, long: 90.4078 },
            { name: 'Banani', lat: 23.7937, long: 90.4043 },
            { name: 'Dhanmondi', lat: 23.7461, long: 90.3742 },
        ];

        const cities: City[] = [];
        for (const c of citiesData) {
            const city = await cityRepo.save({
                name: c.name,
                state,
                centerPoint: { type: 'Point', coordinates: [c.long, c.lat] } as any // Cast to any or Point to avoid strict type mismatch with GeoJSON
            });
            cities.push(city);
        }

        // 3. Categories
        console.log('🏷️ Seeding Categories...');
        const categoryRepo = dataSource.getRepository(Category);
        const categoriesData = [
            { name: 'Food', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' },
            { name: 'Electronics', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400' },
            { name: 'Fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400' },
            { name: 'Lifestyle', image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=400' },
        ];

        const categories: Record<string, Category> = {};
        for (const cat of categoriesData) {
            categories[cat.name] = await categoryRepo.save({
                name: cat.name,
                slug: cat.name.toLowerCase(),
                iconPath: cat.image // Store external URL directly in iconPath
            });
        }

        // 4. Vendors
        console.log('🏪 Seeding Vendors...');
        const userRepo = dataSource.getRepository(User);
        const vendorRepo = dataSource.getRepository(VendorProfile);
        const passwordHash = await bcrypt.hash('123456', 10);

        const vendorsData = [
            {
                email: 'burgerking@example.com',
                businessName: 'Burger King',
                cityIndex: 0, // Gulshan
                category: 'Food',
                slug: 'burger-king-bd'
            },
            {
                email: 'applegadgets@example.com',
                businessName: 'Apple Gadgets',
                cityIndex: 1, // Banani
                category: 'Electronics',
                slug: 'apple-gadgets-bd'
            },
            {
                email: 'aarong@example.com',
                businessName: 'Aarong',
                cityIndex: 2, // Dhanmondi
                category: 'Fashion',
                slug: 'aarong-bd'
            }
        ];

        const vendors: (VendorProfile & { categoryName: string })[] = [];
        for (const v of vendorsData) {
            const user = await userRepo.save({
                email: v.email,
                passwordHash,
                role: UserRole.VENDOR
            });

            const city = cities[v.cityIndex];
            const vendor = await vendorRepo.save({
                user,
                businessName: v.businessName,
                slug: v.slug,
                city,
                location: city.centerPoint, // Use city center as vendor location for simplicity
                ratingAvg: (4 + Math.random()),
                reviewCount: Math.floor(Math.random() * 100),
                followerCount: Math.floor(Math.random() * 1000)
            });
            vendors.push({ ...vendor, categoryName: v.category });
        }

        // 5. Offers
        console.log('🎟️ Seeding Offers...');
        const offerRepo = dataSource.getRepository(Offer);
        const discountRepo = dataSource.getRepository(DiscountOffer);
        const voucherRepo = dataSource.getRepository(VoucherOffer);
        const couponRepo = dataSource.getRepository(CouponOffer);

        const offersData = [
            {
                title: 'Whopper Meal Deal',
                description: 'Get a free drink with every Whopper meal.',
                type: OfferType.DISCOUNT,
                vendorIndex: 0,
                discountPercentage: 15,
                image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800'
            },
            {
                title: '50% Off on Accessories',
                description: 'Flat 50% off on all iPhone cases and chargers.',
                type: OfferType.DISCOUNT,
                vendorIndex: 1,
                discountPercentage: 50,
                image: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=800'
            },
            {
                title: 'Eid Collection Voucher',
                description: 'Buy worth 5000 BDT and get 1000 BDT off.',
                type: OfferType.VOUCHER,
                vendorIndex: 2,
                voucherValue: 1000,
                image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800'
            },
            {
                title: 'Buy 1 Get 1 Free',
                description: 'Buy one Chicken Royale and get another one absolutely free!',
                type: OfferType.COUPON,
                vendorIndex: 0,
                couponCode: 'BOGO2025',
                image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800'
            },
            {
                title: 'MacBook Pro Special',
                description: 'Special discount on MacBook Pro M3 models.',
                type: OfferType.DISCOUNT,
                vendorIndex: 1,
                discountPercentage: 10,
                featured: true,
                image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=800'
            },
            {
                title: 'Weekend Pizza Special',
                description: 'Family size pizza with unlimited toppings at amazing prices.',
                type: OfferType.DISCOUNT,
                vendorIndex: 0,
                discountPercentage: 25,
                image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800'
            },
            {
                title: 'AirPods Pro Deal',
                description: 'Get the latest AirPods Pro with noise cancellation.',
                type: OfferType.VOUCHER,
                vendorIndex: 1,
                voucherValue: 2000,
                image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800'
            },
            {
                title: 'Summer Fashion Sale',
                description: 'Exclusive summer collection with up to 40% off.',
                type: OfferType.DISCOUNT,
                vendorIndex: 2,
                discountPercentage: 40,
                image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800'
            },
            {
                title: 'Coffee & Dessert Combo',
                description: 'Premium coffee with your favorite dessert.',
                type: OfferType.COUPON,
                vendorIndex: 0,
                couponCode: 'COFFEE2025',
                image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800'
            },
            {
                title: 'Smartwatch Collection',
                description: 'Latest smartwatches with fitness tracking features.',
                type: OfferType.DISCOUNT,
                vendorIndex: 1,
                discountPercentage: 20,
                image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'
            },
            {
                title: 'Designer Handbags',
                description: 'Premium designer handbags for every occasion.',
                type: OfferType.VOUCHER,
                vendorIndex: 2,
                voucherValue: 1500,
                image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800'
            },
            {
                title: 'Gaming Headset Promo',
                description: 'Professional gaming headsets with surround sound.',
                type: OfferType.DISCOUNT,
                vendorIndex: 1,
                discountPercentage: 30,
                image: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=800'
            }
        ];

        for (const o of offersData) {
            const vendor = vendors[o.vendorIndex];
            const category = categories[vendor.categoryName]; // Use vendor's category

            const baseOffer = {
                title: o.title,
                description: o.description,
                type: o.type,
                vendor,
                city: vendor.city,
                category,
                isActive: true,
                featured: o.featured || false,
                views: Math.floor(Math.random() * 5000),
                imagePath: o.image // Store external URL directly (entity getter now handles it)
            };

            if (o.type === OfferType.DISCOUNT) {
                await discountRepo.save({ ...baseOffer, discountPercentage: o.discountPercentage });
            } else if (o.type === OfferType.VOUCHER) {
                await voucherRepo.save({ ...baseOffer, voucherValue: o.voucherValue, voucherLimit: 100 });
            } else if (o.type === OfferType.COUPON) {
                await couponRepo.save({ ...baseOffer, couponCode: o.couponCode });
            }
        }

        // Step E: Customers (Buyers)
        console.log('🙋 Seeding Customers...');
        const customer1 = await userRepo.save({
            email: 'customer1@test.com',
            passwordHash,
            role: UserRole.CUSTOMER
        });

        const customer2 = await userRepo.save({
            email: 'customer2@test.com',
            passwordHash,
            role: UserRole.CUSTOMER
        });

        // Step F: Redemptions (Populate Wallet & Stats)
        console.log('🎟️ Seeding Redemptions...');
        const redemptionRepo = dataSource.getRepository(OfferRedemption);

        // Fetch offers from database to get their IDs
        const allOffers = await offerRepo.find({ relations: ['vendor'] });
        const voucherOffers = allOffers.filter(o => o.type === OfferType.VOUCHER);
        const couponOffers = allOffers.filter(o => o.type === OfferType.COUPON);

        // Customer1 claims 3 offers (2 vouchers, 1 coupon)
        if (voucherOffers.length >= 2 && couponOffers.length >= 1) {
            const claimedOffers = [
                voucherOffers[0],
                voucherOffers[1],
                couponOffers[0]
            ];

            for (const offer of claimedOffers) {
                await redemptionRepo.save({
                    offer,
                    user: customer1,
                    isUsed: false
                });

                // Manually increment voucherClaimedCount
                offer.voucherClaimedCount = (offer.voucherClaimedCount || 0) + 1;
                await offerRepo.save(offer);
            }
        }

        // Customer2 claims 1 offer
        if (voucherOffers.length >= 1) {
            const offer = voucherOffers[0]; // Same voucher as customer1
            await redemptionRepo.save({
                offer,
                user: customer2,
                isUsed: false
            });

            // Manually increment voucherClaimedCount
            offer.voucherClaimedCount = (offer.voucherClaimedCount || 0) + 1;
            await offerRepo.save(offer);
        }

        // Step G: Reviews (Populate Engagement)
        console.log('⭐ Seeding Reviews...');
        const reviewRepo = dataSource.getRepository(Review);

        // Customer1 leaves 5-star review for Burger King
        const burgerKingVendor = vendors.find(v => v.businessName === 'Burger King');
        if (burgerKingVendor) {
            await reviewRepo.save({
                userId: customer1.id,
                vendorId: burgerKingVendor.id,
                rating: 5,
                comment: 'Amazing food quality! The Whopper is the best burger in town. Fast service and friendly staff.',
                user: customer1,
                vendor: burgerKingVendor
            });

            // Update Burger King stats
            const burgerKingReviews = await reviewRepo.find({ where: { vendorId: burgerKingVendor.id } });
            const avgRating = burgerKingReviews.reduce((sum, r) => sum + r.rating, 0) / burgerKingReviews.length;
            burgerKingVendor.ratingAvg = parseFloat(avgRating.toFixed(2));
            burgerKingVendor.reviewCount = burgerKingReviews.length;
            await vendorRepo.save(burgerKingVendor);
        }

        // Customer2 leaves 4-star review for Apple Gadgets
        const appleGadgetsVendor = vendors.find(v => v.businessName === 'Apple Gadgets');
        if (appleGadgetsVendor) {
            await reviewRepo.save({
                userId: customer2.id,
                vendorId: appleGadgetsVendor.id,
                rating: 4,
                comment: 'Great products and good deals. The accessories are genuine. Could improve delivery time.',
                user: customer2,
                vendor: appleGadgetsVendor
            });

            // Update Apple Gadgets stats
            const appleReviews = await reviewRepo.find({ where: { vendorId: appleGadgetsVendor.id } });
            const avgRating = appleReviews.reduce((sum, r) => sum + r.rating, 0) / appleReviews.length;
            appleGadgetsVendor.ratingAvg = parseFloat(avgRating.toFixed(2));
            appleGadgetsVendor.reviewCount = appleReviews.length;
            await vendorRepo.save(appleGadgetsVendor);
        }

        console.log('✅ Seeding Complete!');
    } catch (error) {
        console.error('❌ Seeding Failed:', error);
    } finally {
        await dataSource.destroy();
    }
}

seed();
