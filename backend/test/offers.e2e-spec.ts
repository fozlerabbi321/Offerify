import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { City } from './../src/domain/entities/city.entity';
import { State } from './../src/domain/entities/state.entity';
import { Country } from './../src/domain/entities/country.entity';
import { User, UserRole } from './../src/domain/entities/user.entity';
import { VendorProfile } from './../src/domain/entities/vendor-profile.entity';
import { OfferType } from './../src/domain/entities/offer.entity';

describe('OffersController (e2e)', () => {
    let app: NestFastifyApplication;
    let dataSource: DataSource;

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

        // Test
        const payload = {
            title: 'Test Deal',
            description: 'Best deal ever',
            type: OfferType.DISCOUNT,
            vendorId: vendor.id,
            discountPercentage: 50,
        };

        const response = await request(app.getHttpServer())
            .post('/api/offers')
            .send(payload)
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

        const payload = {
            title: 'Test Deal',
            description: 'Best deal ever',
            type: OfferType.DISCOUNT,
            vendorId: vendor.id,
            discountPercentage: 50,
        };

        await request(app.getHttpServer())
            .post('/api/offers')
            .send(payload)
            .expect(201);

        const response = await request(app.getHttpServer())
            .get('/api/offers')
            .query({ cityId: city.id })
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0].title).toBe('Test Deal');
    });
});
