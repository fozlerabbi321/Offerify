import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import contentParser from '@fastify/multipart';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { City } from './../src/domain/entities/city.entity';
import { State } from './../src/domain/entities/state.entity';
import { Country } from './../src/domain/entities/country.entity';
import { User, UserRole } from './../src/domain/entities/user.entity';
import { VendorProfile } from './../src/domain/entities/vendor-profile.entity';
import { Offer, OfferType } from './../src/domain/entities/offer.entity';
import { Category } from './../src/domain/entities/category.entity';
import { Favorite } from './../src/domain/entities/favorite.entity';
import { OfferRedemption } from './../src/domain/entities/offer-redemption.entity';

// Increase timeout for E2E tests with database operations
jest.setTimeout(30000);

describe('OffersController (e2e)', () => {
    let app: NestFastifyApplication;
    let dataSource: DataSource;
    let jwtService: JwtService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication<NestFastifyApplication>(
            new FastifyAdapter(),
        );

        // Register multipart for E2E app instance
        await app.register(contentParser);

        app.setGlobalPrefix('api');
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );
        // app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
        await app.init();
        await app.getHttpAdapter().getInstance().ready();

        dataSource = app.get(DataSource);
        jwtService = app.get(JwtService);
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        // Clean database
        if (dataSource.isInitialized) {
            const entities = dataSource.entityMetadatas;
            for (const entity of entities) {
                const repository = dataSource.getRepository(entity.name);
                try {
                    await repository.query(`TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE;`);
                } catch (error) {
                    // console.warn(`Could not truncate table ${entity.tableName}: ${error.message}`);
                }
            }
        }
    });

    it('POST /api/offers (Create Offer)', async () => {
        // Seed data
        const countryRepo = dataSource.getRepository(Country);
        const stateRepo = dataSource.getRepository(State);
        const cityRepo = dataSource.getRepository(City);
        const userRepo = dataSource.getRepository(User);
        const vendorRepo = dataSource.getRepository(VendorProfile);

        const country = await countryRepo.save({
            name: 'Bangladesh',
            isoCode: 'BD',
        });

        const state = await stateRepo.save({
            name: 'Dhaka',
            country: country,
        });

        const city = await cityRepo.save({
            name: 'Gulshan',
            state: state,
            centerPoint: {
                type: 'Point',
                coordinates: [90.4078, 23.7925],
            },
        });

        const user = await userRepo.save({
            email: 'vendor@example.com',
            passwordHash: 'hashedpassword',
            role: UserRole.VENDOR,
        });

        const vendor = await vendorRepo.save({
            businessName: 'Burger King',
            slug: 'burger-king',
            user: user,
            city: city,
            location: {
                type: 'Point',
                coordinates: [90.4078, 23.7925],
            },
        });

        const categoryRepo = dataSource.getRepository(Category);
        const category = await categoryRepo.save({
            name: 'Food',
            slug: 'food',
            icon: 'utensils',
        });

        // Generate Token
        const token = jwtService.sign({ email: user.email, sub: user.id, role: user.role });

        // Test
        const payload = {
            title: 'Test Deal',
            description: 'Best deal ever',
            type: OfferType.DISCOUNT,
            vendorId: vendor.id,
            discountPercentage: 50,
            categoryId: category.id,
        };

        const response = await request(app.getHttpServer())
            .post('/api/offers')
            .set('Authorization', `Bearer ${token}`)
            .field('title', payload.title)
            .field('description', payload.description)
            .field('type', payload.type)
            .field('vendorId', payload.vendorId)
            .field('discountPercentage', payload.discountPercentage)
            .field('categoryId', payload.categoryId)
            .attach('file', Buffer.from('fake image content'), 'offer-image.png')
            .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.city.id).toBe(city.id);
    });

    it('GET /api/offers (Smart Feed)', async () => {
        const countryRepo = dataSource.getRepository(Country);
        const stateRepo = dataSource.getRepository(State);
        const cityRepo = dataSource.getRepository(City);
        const userRepo = dataSource.getRepository(User);
        const vendorRepo = dataSource.getRepository(VendorProfile);

        const country = await countryRepo.save({ name: 'Bangladesh', isoCode: 'BD' });
        const state = await stateRepo.save({ name: 'Dhaka', country });
        const city = await cityRepo.save({
            name: 'Gulshan',
            state,
            centerPoint: { type: 'Point', coordinates: [90.4078, 23.7925] },
        });
        const user = await userRepo.save({ email: 'vendor@example.com', passwordHash: 'hash', role: UserRole.VENDOR });
        const vendor = await vendorRepo.save({
            businessName: 'Burger King',
            slug: 'burger-king',
            user,
            city,
            location: { type: 'Point', coordinates: [90.4078, 23.7925] },
        });

        const categoryRepo = dataSource.getRepository(Category);
        const category = await categoryRepo.save({
            name: 'Food',
            slug: 'food',
            icon: 'utensils',
        });

        // Generate Token
        const token = jwtService.sign({ email: user.email, sub: user.id, role: user.role });

        const payload = {
            title: 'Test Deal',
            description: 'Best deal ever',
            type: OfferType.DISCOUNT,
            vendorId: vendor.id,
            discountPercentage: 50,
            categoryId: category.id,
        };

        await request(app.getHttpServer())
            .post('/api/offers')
            .set('Authorization', `Bearer ${token}`)
            .field('title', payload.title)
            .field('description', payload.description)
            .field('type', payload.type)
            .field('vendorId', payload.vendorId)
            .field('discountPercentage', payload.discountPercentage)
            .field('categoryId', payload.categoryId)
            .expect(201);

        const response = await request(app.getHttpServer())
            .get('/api/offers')
            .query({ cityId: city.id })
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0].title).toBe('Test Deal');
    });

    it('PATCH /api/offers/:id (Update with ownership verification)', async () => {
        // Setup data
        const countryRepo = dataSource.getRepository(Country);
        const stateRepo = dataSource.getRepository(State);
        const cityRepo = dataSource.getRepository(City);
        const userRepo = dataSource.getRepository(User);
        const vendorRepo = dataSource.getRepository(VendorProfile);
        const categoryRepo = dataSource.getRepository(Category);

        const country = await countryRepo.save({ name: 'Bangladesh', isoCode: 'BD' });
        const state = await stateRepo.save({ name: 'Dhaka', country });
        const city = await cityRepo.save({
            name: 'Gulshan',
            state,
            centerPoint: { type: 'Point', coordinates: [90.4078, 23.7925] },
        });

        const user = await userRepo.save({
            email: 'vendor@example.com',
            passwordHash: 'hash',
            role: UserRole.VENDOR,
        });

        const otherUser = await userRepo.save({
            email: 'other@example.com',
            passwordHash: 'hash',
            role: UserRole.VENDOR,
        });

        const vendor = await vendorRepo.save({
            businessName: 'Burger King',
            slug: 'burger-king',
            user,
            city,
            location: { type: 'Point', coordinates: [90.4078, 23.7925] },
        });

        const otherVendor = await vendorRepo.save({
            businessName: 'Pizza Hut',
            slug: 'pizza-hut',
            user: otherUser,
            city,
            location: { type: 'Point', coordinates: [90.4078, 23.7925] },
        });

        const category = await categoryRepo.save({
            name: 'Food',
            slug: 'food',
            icon: 'utensils',
        });

        const token = jwtService.sign({ email: user.email, sub: user.id, role: user.role });
        const otherToken = jwtService.sign({ email: otherUser.email, sub: otherUser.id, role: otherUser.role });

        // Create offer
        const createResponse = await request(app.getHttpServer())
            .post('/api/offers')
            .set('Authorization', `Bearer ${token}`)
            .field('title', 'Original Title')
            .field('description', 'Original description')
            .field('type', OfferType.DISCOUNT)
            .field('discountPercentage', 50)
            .field('categoryId', category.id)
            .expect(201);

        const offerId = createResponse.body.id;

        // Try to update with wrong user (should fail)
        await request(app.getHttpServer())
            .patch(`/api/offers/${offerId}`)
            .set('Authorization', `Bearer ${otherToken}`)
            .send({ title: 'Hacked Title' })
            .expect(403);

        // Update with correct user (should succeed)
        const updateResponse = await request(app.getHttpServer())
            .patch(`/api/offers/${offerId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Updated Title' })
            .expect(200);

        expect(updateResponse.body.title).toBe('Updated Title');
    });

    it('DELETE /api/offers/:id (Delete with ownership verification)', async () => {
        // Setup data
        const countryRepo = dataSource.getRepository(Country);
        const stateRepo = dataSource.getRepository(State);
        const cityRepo = dataSource.getRepository(City);
        const userRepo = dataSource.getRepository(User);
        const vendorRepo = dataSource.getRepository(VendorProfile);
        const categoryRepo = dataSource.getRepository(Category);

        const country = await countryRepo.save({ name: 'Bangladesh', isoCode: 'BD' });
        const state = await stateRepo.save({ name: 'Dhaka', country });
        const city = await cityRepo.save({
            name: 'Gulshan',
            state,
            centerPoint: { type: 'Point', coordinates: [90.4078, 23.7925] },
        });

        const user = await userRepo.save({
            email: 'vendor@example.com',
            passwordHash: 'hash',
            role: UserRole.VENDOR,
        });

        const otherUser = await userRepo.save({
            email: 'other@example.com',
            passwordHash: 'hash',
            role: UserRole.VENDOR,
        });

        const vendor = await vendorRepo.save({
            businessName: 'Burger King',
            slug: 'burger-king',
            user,
            city,
            location: { type: 'Point', coordinates: [90.4078, 23.7925] },
        });

        const category = await categoryRepo.save({
            name: 'Food',
            slug: 'food',
            icon: 'utensils',
        });

        const token = jwtService.sign({ email: user.email, sub: user.id, role: user.role });
        const otherToken = jwtService.sign({ email: otherUser.email, sub: otherUser.id, role: otherUser.role });

        // Create offer
        const createResponse = await request(app.getHttpServer())
            .post('/api/offers')
            .set('Authorization', `Bearer ${token}`)
            .field('title', 'To Delete')
            .field('description', 'Will be deleted')
            .field('type', OfferType.DISCOUNT)
            .field('discountPercentage', 50)
            .field('categoryId', category.id)
            .expect(201);

        const offerId = createResponse.body.id;

        // Try to delete with wrong user (should fail)
        await request(app.getHttpServer())
            .delete(`/api/offers/${offerId}`)
            .set('Authorization', `Bearer ${otherToken}`)
            .expect(403);

        // Delete with correct user (should succeed)
        await request(app.getHttpServer())
            .delete(`/api/offers/${offerId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204);

        // Verify offer is deleted
        await request(app.getHttpServer())
            .get(`/api/offers/${offerId}`)
            .expect(404);
    });

    it('GET /api/offers/my-offers (Get vendor\'s offers)', async () => {
        // Setup data
        const countryRepo = dataSource.getRepository(Country);
        const stateRepo = dataSource.getRepository(State);
        const cityRepo = dataSource.getRepository(City);
        const userRepo = dataSource.getRepository(User);
        const vendorRepo = dataSource.getRepository(VendorProfile);
        const categoryRepo = dataSource.getRepository(Category);

        const country = await countryRepo.save({ name: 'Bangladesh', isoCode: 'BD' });
        const state = await stateRepo.save({ name: 'Dhaka', country });
        const city = await cityRepo.save({
            name: 'Gulshan',
            state,
            centerPoint: { type: 'Point', coordinates: [90.4078, 23.7925] },
        });

        const user = await userRepo.save({
            email: 'vendor@example.com',
            passwordHash: 'hash',
            role: UserRole.VENDOR,
        });

        const vendor = await vendorRepo.save({
            businessName: 'Burger King',
            slug: 'burger-king',
            user,
            city,
            location: { type: 'Point', coordinates: [90.4078, 23.7925] },
        });

        const category = await categoryRepo.save({
            name: 'Food',
            slug: 'food',
            icon: 'utensils',
        });

        const token = jwtService.sign({ email: user.email, sub: user.id, role: user.role });

        // Create multiple offers
        await request(app.getHttpServer())
            .post('/api/offers')
            .set('Authorization', `Bearer ${token}`)
            .field('title', 'Offer 1')
            .field('description', 'First offer')
            .field('type', OfferType.DISCOUNT)
            .field('discountPercentage', 30)
            .field('categoryId', category.id)
            .expect(201);

        await request(app.getHttpServer())
            .post('/api/offers')
            .set('Authorization', `Bearer ${token}`)
            .field('title', 'Offer 2')
            .field('description', 'Second offer')
            .field('type', OfferType.DISCOUNT)
            .field('discountPercentage', 50)
            .field('categoryId', category.id)
            .expect(201);

        // Get my offers
        const response = await request(app.getHttpServer())
            .get('/api/offers/my-offers')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(2);
        expect(response.body[0].title).toBe('Offer 2'); // Most recent first
        expect(response.body[1].title).toBe('Offer 1');
    });

    it('GET /api/offers/:id should return isFavorite and isClaimed for authenticated user', async () => {
        // Setup data
        const countryRepo = dataSource.getRepository(Country);
        const stateRepo = dataSource.getRepository(State);
        const cityRepo = dataSource.getRepository(City);
        const userRepo = dataSource.getRepository(User);
        const vendorRepo = dataSource.getRepository(VendorProfile);
        const categoryRepo = dataSource.getRepository(Category);
        const offerRepo = dataSource.getRepository(Offer);
        const favoriteRepo = dataSource.getRepository(Favorite);
        const redemptionRepo = dataSource.getRepository(OfferRedemption);

        const country = await countryRepo.save({ name: 'Bangladesh', isoCode: 'BD' });
        const state = await stateRepo.save({ name: 'Dhaka', country });
        const city = await cityRepo.save({
            name: 'Gulshan',
            state,
            centerPoint: { type: 'Point', coordinates: [90.4078, 23.7925] },
        });

        // Vendor User
        const vendorUser = await userRepo.save({
            email: 'vendor@example.com',
            passwordHash: 'hash',
            role: UserRole.VENDOR,
        });
        const vendor = await vendorRepo.save({
            businessName: 'Burger King',
            slug: 'burger-king',
            user: vendorUser,
            city,
            location: { type: 'Point', coordinates: [90.4078, 23.7925] },
        });

        const category = await categoryRepo.save({
            name: 'Food',
            slug: 'food',
            icon: 'utensils',
        });

        // Create an offer directly
        const offer = await offerRepo.save({
            title: 'Test Voucher',
            description: 'Test description',
            type: OfferType.VOUCHER,
            vendor,
            city,
            category,
            isActive: true,
            voucherLimit: 10,
            voucherClaimedCount: 0,
            voucherValue: 100,
        });

        // Customer User
        const customer = await userRepo.save({
            email: 'customer@example.com',
            passwordHash: 'hash',
            role: UserRole.CUSTOMER,
        });
        const customerToken = jwtService.sign({ email: customer.email, sub: customer.id, role: customer.role });

        // Test 1: Initially, isFavorite and isClaimed should be false
        const response1 = await request(app.getHttpServer())
            .get(`/api/offers/${offer.id}`)
            .set('Authorization', `Bearer ${customerToken}`)
            .expect(200);

        expect(response1.body.isFavorite).toBe(false);
        expect(response1.body.isClaimed).toBe(false);

        // Add favorite
        await favoriteRepo.save({
            userId: customer.id,
            offerId: offer.id,
        });

        // Test 2: After favoriting, isFavorite should be true
        const response2 = await request(app.getHttpServer())
            .get(`/api/offers/${offer.id}`)
            .set('Authorization', `Bearer ${customerToken}`)
            .expect(200);

        expect(response2.body.isFavorite).toBe(true);
        expect(response2.body.isClaimed).toBe(false);

        // Claim the offer
        await redemptionRepo.save({
            user: customer,
            offer,
            isUsed: false,
        });

        // Test 3: After claiming, isClaimed should be true
        const response3 = await request(app.getHttpServer())
            .get(`/api/offers/${offer.id}`)
            .set('Authorization', `Bearer ${customerToken}`)
            .expect(200);

        expect(response3.body.isFavorite).toBe(true);
        expect(response3.body.isClaimed).toBe(true);
    });

    it('GET /api/offers/:id should return isFavorite=false and isClaimed=false for unauthenticated', async () => {
        // Setup data
        const countryRepo = dataSource.getRepository(Country);
        const stateRepo = dataSource.getRepository(State);
        const cityRepo = dataSource.getRepository(City);
        const userRepo = dataSource.getRepository(User);
        const vendorRepo = dataSource.getRepository(VendorProfile);
        const categoryRepo = dataSource.getRepository(Category);
        const offerRepo = dataSource.getRepository(Offer);

        const country = await countryRepo.save({ name: 'Bangladesh', isoCode: 'BD' });
        const state = await stateRepo.save({ name: 'Dhaka', country });
        const city = await cityRepo.save({
            name: 'Gulshan',
            state,
            centerPoint: { type: 'Point', coordinates: [90.4078, 23.7925] },
        });

        const vendorUser = await userRepo.save({
            email: 'vendor@example.com',
            passwordHash: 'hash',
            role: UserRole.VENDOR,
        });
        const vendor = await vendorRepo.save({
            businessName: 'Burger King',
            slug: 'burger-king',
            user: vendorUser,
            city,
            location: { type: 'Point', coordinates: [90.4078, 23.7925] },
        });

        const category = await categoryRepo.save({
            name: 'Food',
            slug: 'food',
            icon: 'utensils',
        });

        const offer = await offerRepo.save({
            title: 'Test Offer',
            description: 'Test description',
            type: OfferType.DISCOUNT,
            vendor,
            city,
            category,
            isActive: true,
        });

        // Test: Unauthenticated request should return isFavorite=false and isClaimed=false
        const response = await request(app.getHttpServer())
            .get(`/api/offers/${offer.id}`)
            .expect(200);

        expect(response.body.isFavorite).toBe(false);
        expect(response.body.isClaimed).toBe(false);
        expect(response.body.vendor).toBeDefined();
        expect(response.body.vendor.businessName).toBe('Burger King');
    });
});
