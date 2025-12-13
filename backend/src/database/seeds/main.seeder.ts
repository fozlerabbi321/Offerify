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
    synchronize: true,
    namingStrategy: new SnakeNamingStrategy(),
});

async function seed() {
    console.log('🌱 Starting Enhanced Master Seeder...');

    try {
        await dataSource.initialize();
        console.log('✅ Database Connected');

        // Repositories
        const countryRepo = dataSource.getRepository(Country);
        const stateRepo = dataSource.getRepository(State);
        const cityRepo = dataSource.getRepository(City);
        const categoryRepo = dataSource.getRepository(Category);
        const userRepo = dataSource.getRepository(User);
        const vendorRepo = dataSource.getRepository(VendorProfile);
        const offerRepo = dataSource.getRepository(Offer);
        const discountRepo = dataSource.getRepository(DiscountOffer);
        const voucherRepo = dataSource.getRepository(VoucherOffer);
        const couponRepo = dataSource.getRepository(CouponOffer);
        const favoriteRepo = dataSource.getRepository(Favorite);
        const reviewRepo = dataSource.getRepository(Review);
        const redemptionRepo = dataSource.getRepository(OfferRedemption);

        // ============================================================
        // 1. CLEANUP
        // ============================================================
        console.log('🧹 Cleaning up database...');
        await dataSource.query(`TRUNCATE TABLE offer_redemptions, favorites, reviews, offers, vendor_profiles, users, cities, states, countries, categories RESTART IDENTITY CASCADE`);

        const passwordHash = await bcrypt.hash('123456', 10);

        // ============================================================
        // 2. LOCATIONS
        // ============================================================
        console.log('🗺️ Seeding Locations...');
        const country = await countryRepo.save({ name: 'Bangladesh', isoCode: 'BD' });
        const state = await stateRepo.save({ name: 'Dhaka Division', country });

        const citiesData = [
            { name: 'Gulshan 1', lat: 23.7925, long: 90.4078 },
            { name: 'Banani', lat: 23.7937, long: 90.4043 },
            { name: 'Dhanmondi', lat: 23.7461, long: 90.3742 },
            { name: 'Uttara', lat: 23.8759, long: 90.3795 },
            { name: 'Mirpur', lat: 23.8223, long: 90.3654 },
        ];

        const cities: City[] = [];
        for (const c of citiesData) {
            const city = await cityRepo.save({
                name: c.name,
                state,
                centerPoint: { type: 'Point', coordinates: [c.long, c.lat] } as any
            });
            cities.push(city);
        }

        // ============================================================
        // 3. CATEGORIES (8 Categories)
        // ============================================================
        console.log('🏷️ Seeding 8 Categories...');
        const categoriesData = [
            { name: 'Food', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' },
            { name: 'Electronics', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400' },
            { name: 'Fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400' },
            { name: 'Lifestyle', image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=400' },
            { name: 'Health', image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400' },
            { name: 'Beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400' },
            { name: 'Travel', image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400' },
            { name: 'Home & Garden', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400' },
        ];

        const categories: Record<string, Category> = {};
        for (const cat of categoriesData) {
            categories[cat.name] = await categoryRepo.save({
                name: cat.name,
                slug: cat.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and'),
                iconPath: cat.image
            });
        }

        // ============================================================
        // 4. SUPER ADMIN ACCOUNT
        // ============================================================
        console.log('👑 Creating Super Admin...');
        await userRepo.save({
            email: 'admin@offerify.com',
            passwordHash,
            role: UserRole.ADMIN,
            name: 'Super Admin'
        });

        // ============================================================
        // 5. HERO VENDOR - "Tech World Official"
        // ============================================================
        console.log('🏪 Creating Hero Vendor - Tech World Official...');
        const bananiCity = cities.find(c => c.name === 'Banani')!;

        const vendorUser = await userRepo.save({
            email: 'vendor@offerify.com',
            passwordHash,
            role: UserRole.VENDOR,
            name: 'Tech World Owner'
        });

        const techWorldVendor = await vendorRepo.save({
            user: vendorUser,
            businessName: 'Tech World Official',
            slug: 'tech-world-official',
            description: 'Your one-stop shop for all tech gadgets and accessories. Authorized retailer with genuine products.',
            city: bananiCity,
            location: bananiCity.centerPoint,
            logoUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200',
            coverImageUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800',
            contactPhone: '+8801700000000',
            ratingAvg: 0,
            reviewCount: 0,
            followerCount: 250
        });

        // Create 7 offers for Tech World
        console.log('🎟️ Creating offers for Tech World Official...');
        const techWorldOffersData = [
            { title: 'iPhone 15 Pro Max Deal', description: 'Get the latest iPhone 15 Pro Max with special discount. Titanium design, A17 Pro chip.', type: OfferType.DISCOUNT, discountPercentage: 15, image: 'https://images.unsplash.com/photo-1632661674596-df8be59a4be7?w=800', views: 189, featured: true },
            { title: 'MacBook Air M3 Special', description: 'Ultralight laptop with all-day battery life. Perfect for professionals.', type: OfferType.DISCOUNT, discountPercentage: 10, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=800', views: 156 },
            { title: 'AirPods Pro 2 Bundle', description: 'Get AirPods Pro 2 with USB-C and free silicone case.', type: OfferType.VOUCHER, voucherValue: 2000, image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800', views: 145 },
            { title: 'Gaming Accessories Pack', description: 'Complete gaming setup with headset, mouse pad, and RGB lighting.', type: OfferType.COUPON, couponCode: 'GAME2024', image: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=800', views: 132 },
            { title: 'Apple Watch Series 9', description: 'Advanced health monitoring, fitness tracking, and seamless integration.', type: OfferType.DISCOUNT, discountPercentage: 12, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', views: 128 },
            { title: 'iPad Pro M2 Offer', description: 'The ultimate iPad experience with M2 chip and Liquid Retina XDR.', type: OfferType.DISCOUNT, discountPercentage: 8, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800', views: 115 },
            { title: 'Samsung Galaxy S24 Ultra', description: 'Experience the power of Galaxy AI with stunning camera system.', type: OfferType.VOUCHER, voucherValue: 3000, image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800', views: 98 },
        ];

        const techWorldOffers: Offer[] = [];
        for (const o of techWorldOffersData) {
            const baseOffer = { title: o.title, description: o.description, type: o.type, vendor: techWorldVendor, city: bananiCity, category: categories['Electronics'], isActive: true, featured: o.featured || false, views: o.views, imagePath: o.image, voucherLimit: 100, voucherClaimedCount: 0 };
            let savedOffer: Offer;
            if (o.type === OfferType.DISCOUNT) savedOffer = await discountRepo.save({ ...baseOffer, discountPercentage: o.discountPercentage });
            else if (o.type === OfferType.VOUCHER) savedOffer = await voucherRepo.save({ ...baseOffer, voucherValue: o.voucherValue });
            else savedOffer = await couponRepo.save({ ...baseOffer, couponCode: o.couponCode });
            techWorldOffers.push(savedOffer);
        }

        // ============================================================
        // 6. ADDITIONAL VENDORS (6 More Vendors)
        // ============================================================
        console.log('🏪 Creating 6 additional vendors...');
        const vendorsData = [
            { email: 'burgerking@example.com', name: 'Burger King Owner', businessName: 'Burger King BD', cityIndex: 0, category: 'Food', slug: 'burger-king-bd', logo: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200' },
            { email: 'aarong@example.com', name: 'Aarong Owner', businessName: 'Aarong', cityIndex: 2, category: 'Fashion', slug: 'aarong-bd', logo: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=200' },
            { email: 'fitlife@example.com', name: 'FitLife Owner', businessName: 'FitLife Gym & Wellness', cityIndex: 3, category: 'Health', slug: 'fitlife-wellness', logo: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200' },
            { email: 'beautyhub@example.com', name: 'BeautyHub Owner', businessName: 'BeautyHub Salon', cityIndex: 1, category: 'Beauty', slug: 'beautyhub-salon', logo: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200' },
            { email: 'travelbd@example.com', name: 'TravelBD Owner', businessName: 'TravelBD Tours', cityIndex: 4, category: 'Travel', slug: 'travelbd-tours', logo: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200' },
            { email: 'homestyle@example.com', name: 'HomeStyle Owner', businessName: 'HomeStyle Decor', cityIndex: 0, category: 'Home & Garden', slug: 'homestyle-decor', logo: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200' },
        ];

        const allVendors: VendorProfile[] = [techWorldVendor];
        for (const v of vendorsData) {
            const user = await userRepo.save({ email: v.email, passwordHash, role: UserRole.VENDOR, name: v.name });
            const city = cities[v.cityIndex];
            const vendor = await vendorRepo.save({
                user, businessName: v.businessName, slug: v.slug, city, location: city.centerPoint, logoUrl: v.logo,
                ratingAvg: 0, reviewCount: 0, followerCount: Math.floor(Math.random() * 300) + 50
            });
            allVendors.push(vendor);
        }

        // ============================================================
        // 7. MORE OFFERS (15+ More Offers)
        // ============================================================
        console.log('🎟️ Creating 15+ additional offers...');
        const moreOffersData = [
            // Burger King (index 1)
            { title: 'Whopper Meal Deal', description: 'Get a free drink and fries with every Whopper meal!', type: OfferType.DISCOUNT, vendorIndex: 1, category: 'Food', discountPercentage: 20, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', featured: true },
            { title: 'Buy 1 Get 1 Burger', description: 'Buy one Chicken Royale and get another one free!', type: OfferType.COUPON, vendorIndex: 1, category: 'Food', couponCode: 'BOGO2024', image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800' },
            { title: 'Family Feast Voucher', description: 'Family meal for 4 with extra savings.', type: OfferType.VOUCHER, vendorIndex: 1, category: 'Food', voucherValue: 500, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800' },
            // Aarong (index 2)
            { title: 'Eid Collection Sale', description: 'Up to 40% off on exclusive Eid collection.', type: OfferType.DISCOUNT, vendorIndex: 2, category: 'Fashion', discountPercentage: 40, image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800', featured: true },
            { title: 'Gift Voucher Special', description: 'Buy worth 5000 BDT and get 1000 BDT voucher.', type: OfferType.VOUCHER, vendorIndex: 2, category: 'Fashion', voucherValue: 1000, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800' },
            { title: 'Winter Collection Launch', description: 'New winter arrivals with exclusive discounts.', type: OfferType.DISCOUNT, vendorIndex: 2, category: 'Fashion', discountPercentage: 25, image: 'https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=800' },
            // FitLife (index 3)
            { title: '3 Month Membership Deal', description: 'Join now and get 30% off on 3-month membership.', type: OfferType.DISCOUNT, vendorIndex: 3, category: 'Health', discountPercentage: 30, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800', featured: true },
            { title: 'Personal Training Session', description: 'Free personal training session with annual membership.', type: OfferType.COUPON, vendorIndex: 3, category: 'Health', couponCode: 'TRAINER2024', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800' },
            // BeautyHub (index 4)
            { title: 'Bridal Makeover Package', description: 'Complete bridal package with 20% discount.', type: OfferType.DISCOUNT, vendorIndex: 4, category: 'Beauty', discountPercentage: 20, image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800' },
            { title: 'Spa Day Voucher', description: 'Full spa day experience at discounted price.', type: OfferType.VOUCHER, vendorIndex: 4, category: 'Beauty', voucherValue: 1500, image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800' },
            { title: 'Hair Treatment Special', description: 'Premium hair treatment with keratin included.', type: OfferType.DISCOUNT, vendorIndex: 4, category: 'Beauty', discountPercentage: 35, image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800', featured: true },
            // TravelBD (index 5)
            { title: "Cox's Bazar Package", description: "3 days 2 nights Cox's Bazar tour package.", type: OfferType.DISCOUNT, vendorIndex: 5, category: 'Travel', discountPercentage: 15, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800' },
            { title: 'Sundarbans Adventure', description: 'Explore the mangroves with guided tour.', type: OfferType.VOUCHER, vendorIndex: 5, category: 'Travel', voucherValue: 2500, image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800' },
            // HomeStyle (index 6)
            { title: 'Living Room Makeover', description: 'Complete living room decor at 25% off.', type: OfferType.DISCOUNT, vendorIndex: 6, category: 'Home & Garden', discountPercentage: 25, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800' },
            { title: 'Garden Furniture Sale', description: 'Outdoor furniture collection with great savings.', type: OfferType.DISCOUNT, vendorIndex: 6, category: 'Home & Garden', discountPercentage: 30, image: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800' },
        ];

        const allOffers: Offer[] = [...techWorldOffers];
        for (const o of moreOffersData) {
            const vendor = allVendors[o.vendorIndex];
            const category = categories[o.category];
            const baseOffer = { title: o.title, description: o.description, type: o.type, vendor, city: vendor.city, category, isActive: true, featured: o.featured || false, views: Math.floor(Math.random() * 150) + 30, imagePath: o.image, voucherLimit: 100, voucherClaimedCount: 0 };
            let savedOffer: Offer;
            if (o.type === OfferType.DISCOUNT) savedOffer = await discountRepo.save({ ...baseOffer, discountPercentage: o.discountPercentage });
            else if (o.type === OfferType.VOUCHER) savedOffer = await voucherRepo.save({ ...baseOffer, voucherValue: o.voucherValue });
            else savedOffer = await couponRepo.save({ ...baseOffer, couponCode: o.couponCode });
            allOffers.push(savedOffer);
        }

        // ============================================================
        // 8. CUSTOMERS (5 Customers for Reviews)
        // ============================================================
        console.log('🙋 Creating 5 customers...');
        const customersData = [
            { email: 'user@offerify.com', name: 'Test Customer' },
            { email: 'john@example.com', name: 'John Doe' },
            { email: 'jane@example.com', name: 'Jane Smith' },
            { email: 'mike@example.com', name: 'Mike Wilson' },
            { email: 'sara@example.com', name: 'Sara Ahmed' },
        ];

        const customers: User[] = [];
        for (const c of customersData) {
            const customer = await userRepo.save({ email: c.email, passwordHash, role: UserRole.CUSTOMER, name: c.name });
            customers.push(customer);
        }

        // ============================================================
        // 9. REDEMPTIONS FOR MAIN CUSTOMER
        // ============================================================
        console.log('🎫 Creating redemptions for main customer...');
        for (let i = 0; i < 3; i++) {
            const offer = techWorldOffers[i];
            await redemptionRepo.save({ offer, user: customers[0], isUsed: false });
            offer.voucherClaimedCount = (offer.voucherClaimedCount || 0) + 1;
            await offerRepo.save(offer);
        }

        // ============================================================
        // 10. FAVORITES
        // ============================================================
        console.log('❤️ Adding favorites...');
        await favoriteRepo.save({ userId: customers[0].id, offerId: techWorldOffers[0].id, user: customers[0], offer: techWorldOffers[0] });
        await favoriteRepo.save({ userId: customers[0].id, offerId: allOffers[7].id, user: customers[0], offer: allOffers[7] });

        // ============================================================
        // 11. REVIEWS (12 Reviews for Pagination Testing)
        // ============================================================
        console.log('⭐ Creating 12 reviews for pagination testing...');
        const reviewsData = [
            // Tech World Reviews (5 reviews)
            { customerIndex: 0, vendorIndex: 0, rating: 5, comment: 'Excellent products and amazing service! The iPhone deal was fantastic. Highly recommend!' },
            { customerIndex: 1, vendorIndex: 0, rating: 5, comment: 'Best tech store in Banani. Genuine products and great after-sales support.' },
            { customerIndex: 2, vendorIndex: 0, rating: 4, comment: 'Good variety of products. Delivery was a bit slow but overall satisfied.' },
            { customerIndex: 3, vendorIndex: 0, rating: 5, comment: 'Amazing deals on Apple products. Will definitely shop here again!' },
            { customerIndex: 4, vendorIndex: 0, rating: 4, comment: 'Quality products at reasonable prices. Staff was very helpful.' },
            // Burger King Reviews (3 reviews)
            { customerIndex: 0, vendorIndex: 1, rating: 5, comment: 'Best burgers in Dhaka! The Whopper is absolutely delicious.' },
            { customerIndex: 1, vendorIndex: 1, rating: 4, comment: 'Great food and quick service. The meal deals are worth it.' },
            { customerIndex: 2, vendorIndex: 1, rating: 4, comment: 'Consistently good quality. My go-to place for burgers.' },
            // Aarong Reviews (2 reviews)
            { customerIndex: 3, vendorIndex: 2, rating: 5, comment: 'Beautiful traditional wear. The Eid collection was stunning!' },
            { customerIndex: 4, vendorIndex: 2, rating: 5, comment: 'Premium quality fabrics and excellent craftsmanship.' },
            // FitLife Reviews (1 review)
            { customerIndex: 0, vendorIndex: 3, rating: 4, comment: 'Clean gym with modern equipment. The trainers are very professional.' },
            // BeautyHub Reviews (1 review)
            { customerIndex: 2, vendorIndex: 4, rating: 5, comment: 'Amazing spa experience! The staff was very professional and caring.' },
        ];

        for (const r of reviewsData) {
            await reviewRepo.save({
                userId: customers[r.customerIndex].id,
                vendorId: allVendors[r.vendorIndex].id,
                rating: r.rating,
                comment: r.comment,
                user: customers[r.customerIndex],
                vendor: allVendors[r.vendorIndex]
            });
        }

        // Update vendor ratings based on reviews
        console.log('📊 Updating vendor ratings...');
        for (const vendor of allVendors) {
            const reviews = await reviewRepo.find({ where: { vendorId: vendor.id } });
            if (reviews.length > 0) {
                const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
                vendor.ratingAvg = parseFloat(avgRating.toFixed(2));
                vendor.reviewCount = reviews.length;
                await vendorRepo.save(vendor);
            }
        }

        // ============================================================
        // SUMMARY
        // ============================================================
        const totalOffers = allOffers.length;
        const totalVendors = allVendors.length;
        const totalReviews = reviewsData.length;
        const totalCategories = Object.keys(categories).length;

        console.log('\n✅ Enhanced Seeding Complete!');
        console.log('═══════════════════════════════════════════════');
        console.log('📧 Test Accounts:');
        console.log('   👑 Admin:    admin@offerify.com / 123456');
        console.log('   🏪 Vendor:   vendor@offerify.com / 123456');
        console.log('   🙋 Customer: user@offerify.com / 123456');
        console.log('═══════════════════════════════════════════════');
        console.log('📊 Database Stats:');
        console.log(`   • Categories: ${totalCategories}`);
        console.log(`   • Vendors: ${totalVendors}`);
        console.log(`   • Offers: ${totalOffers}`);
        console.log(`   • Reviews: ${totalReviews}`);
        console.log(`   • Customers: ${customers.length}`);
        console.log('═══════════════════════════════════════════════');

    } catch (error) {
        console.error('❌ Seeding Failed:', error);
    } finally {
        await dataSource.destroy();
    }
}

seed();
