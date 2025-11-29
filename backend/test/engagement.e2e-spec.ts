import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { City } from './../src/domain/entities/city.entity';
import { State } from './../src/domain/entities/state.entity';
import { Country } from './../src/domain/entities/country.entity';
import { User, UserRole } from './../src/domain/entities/user.entity';
import { VendorProfile } from './../src/domain/entities/vendor-profile.entity';
import { Offer, OfferType } from './../src/domain/entities/offer.entity';

describe('EngagementController (e2e)', () => {
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
        app.setGlobalPrefix('api');
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

    it('Engagement Flow (Favorites & Reviews)', async () => {
        // 1. Seed Data
        const countryRepo = dataSource.getRepository(Country);
        const stateRepo = dataSource.getRepository(State);
        const cityRepo = dataSource.getRepository(City);
        const userRepo = dataSource.getRepository(User);
        const vendorRepo = dataSource.getRepository(VendorProfile);
        const offerRepo = dataSource.getRepository(Offer);

        const country = await countryRepo.save({ name: 'Bangladesh', isoCode: 'BD' });
        const state = await stateRepo.save({ name: 'Dhaka', country });
        const city = await cityRepo.save({
            name: 'Gulshan',
            state,
            centerPoint: { type: 'Point', coordinates: [90.4078, 23.7925] },
        });

        // Vendor
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

        // Offer
        const offer = await offerRepo.save({
            title: 'Whopper Deal',
            description: 'Yum',
            type: OfferType.DISCOUNT,
            vendor,
            cityId: city.id,
            isActive: true,
        });

        // Customer
        const customer = await userRepo.save({
            email: 'customer@example.com',
            passwordHash: 'hash',
            role: UserRole.CUSTOMER,
        });

        // Generate Token
        const token = jwtService.sign({ email: customer.email, sub: customer.id, role: customer.role });

        // 2. Test: Toggle Favorite (Add)
        await request(app.getHttpServer())
            .post(`/api/offers/${offer.id}/favorite`)
            .set('Authorization', `Bearer ${token}`)
            .expect(201);

        // 3. Test: Get My Favorites
        const favRes = await request(app.getHttpServer())
            .get('/api/account/favorites')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(favRes.body).toHaveLength(1);
        expect(favRes.body[0].offer.id).toBe(offer.id);

        // 4. Test: Create Review
        await request(app.getHttpServer())
            .post(`/api/vendors/${vendor.id}/reviews`)
            .set('Authorization', `Bearer ${token}`)
            .send({ rating: 5, comment: 'Great food!' })
            .expect(201);

        // 5. Test: Get Vendor Reviews (Public)
        const reviewRes = await request(app.getHttpServer())
            .get(`/api/vendors/${vendor.id}/reviews`)
            .expect(200);

        expect(reviewRes.body).toHaveLength(1);
        expect(reviewRes.body[0].rating).toBe(5);
        expect(reviewRes.body[0].comment).toBe('Great food!');

        // 6. Test: Remove Favorite
        await request(app.getHttpServer())
            .delete(`/api/offers/${offer.id}/favorite`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        const favRes2 = await request(app.getHttpServer())
            .get('/api/account/favorites')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(favRes2.body).toHaveLength(0);
    });
});
