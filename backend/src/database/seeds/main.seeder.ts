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
            { name: 'Food', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80' },
            { name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?auto=format&fit=crop&w=800&q=80' },
            { name: 'Fashion', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80' },
            { name: 'Lifestyle', image: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=800&q=80' },
        ];

        const categories: Record<string, Category> = {};
        for (const cat of categoriesData) {
            categories[cat.name] = await categoryRepo.save({
                name: cat.name,
                slug: cat.name.toLowerCase(),
                icon: cat.image // Using image as icon for now
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
                image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&q=80'
            },
            {
                title: '50% Off on Accessories',
                description: 'Flat 50% off on all iPhone cases and chargers.',
                type: OfferType.DISCOUNT,
                vendorIndex: 1,
                discountPercentage: 50,
                image: 'https://images.unsplash.com/photo-1603539278716-4a92917d098e?auto=format&fit=crop&w=800&q=80'
            },
            {
                title: 'Eid Collection Voucher',
                description: 'Buy worth 5000 BDT and get 1000 BDT off.',
                type: OfferType.VOUCHER,
                vendorIndex: 2,
                voucherValue: 1000,
                image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80'
            },
            {
                title: 'Buy 1 Get 1 Free',
                description: 'Buy one Chicken Royale and get another one absolutely free!',
                type: OfferType.COUPON,
                vendorIndex: 0,
                couponCode: 'BOGO2025',
                image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80'
            },
            {
                title: 'MacBook Pro Special',
                description: 'Special discount on MacBook Pro M3 models.',
                type: OfferType.DISCOUNT,
                vendorIndex: 1,
                discountPercentage: 10,
                featured: true,
                image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&w=800&q=80'
            }
        ];

        // Generate more dummy offers to reach 10-15
        for (let i = 0; i < 7; i++) {
            offersData.push({
                title: `Special Offer ${i + 1}`,
                description: 'Limited time offer! Grab it now.',
                type: OfferType.DISCOUNT,
                vendorIndex: i % 3,
                discountPercentage: 10 + (i * 5),
                image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80'
            } as any);
        }

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
                imagePath: o.image.replace('http://localhost:3000', ''), // Hack for now, usually we store relative path
                // But wait, the entity getter prepends the URL. 
                // If I store full URL in imagePath, the getter will double it.
                // I should probably just store the full URL in imagePath and adjust the entity getter or just store a dummy path.
                // The entity getter: return `${process.env.APP_URL}${this.imagePath}`;
                // So I should store a path like '/uploads/seed/image.jpg'.
                // But I want to use Unsplash.
                // I will store the Unsplash URL directly and maybe the entity getter will mess it up if I don't handle it.
                // Let's check the entity getter again.
                // `return `${process.env.APP_URL || 'http://localhost:3000'}${this.imagePath}`;`
                // It blindly prepends. 
                // I will override the getter or just set imagePath to something that works?
                // Actually, I can't easily change the entity logic here without modifying the entity file.
                // I will modify the entity file to check if imagePath starts with http.
            };

            // Fix for image path in entity
            // I will modify the Offer entity in a separate step to handle absolute URLs.
            // For now, I will just store it.

            if (o.type === OfferType.DISCOUNT) {
                await discountRepo.save({ ...baseOffer, discountPercentage: o.discountPercentage });
            } else if (o.type === OfferType.VOUCHER) {
                await voucherRepo.save({ ...baseOffer, voucherValue: o.voucherValue, voucherLimit: 100 });
            } else if (o.type === OfferType.COUPON) {
                await couponRepo.save({ ...baseOffer, couponCode: o.couponCode });
            }
        }

        console.log('✅ Seeding Complete!');
    } catch (error) {
        console.error('❌ Seeding Failed:', error);
    } finally {
        await dataSource.destroy();
    }
}

seed();
