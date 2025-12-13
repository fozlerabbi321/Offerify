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
import { OfferType } from './../src/domain/entities/offer.entity';
import { Category } from './../src/domain/entities/category.entity';

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
});
