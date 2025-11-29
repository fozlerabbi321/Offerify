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

describe('VendorsController (e2e)', () => {
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

    it('POST /api/vendors (Create Profile)', async () => {
        // Seed Location
        const countryRepo = dataSource.getRepository(Country);
        const stateRepo = dataSource.getRepository(State);
        const cityRepo = dataSource.getRepository(City);
        const userRepo = dataSource.getRepository(User);

        const country = await countryRepo.save({ name: 'Bangladesh', isoCode: 'BD' });
        const state = await stateRepo.save({ name: 'Dhaka', country });
        const city = await cityRepo.save({
            name: 'Gulshan',
            state,
            centerPoint: { type: 'Point', coordinates: [90.4078, 23.7925] },
        });

        // Seed User
        const user = await userRepo.save({
            email: 'vendor@example.com',
            passwordHash: 'hash',
            role: UserRole.CUSTOMER, // Initially Customer
        });

        const token = jwtService.sign({ email: user.email, sub: user.id, role: user.role });

        const payload = {
            businessName: 'My Awesome Store',
            operatingCityId: city.id,
            address: '123 Main St',
            latitude: 23.7925,
            longitude: 90.4078,
        };

        const response = await request(app.getHttpServer())
            .post('/api/vendors')
            .set('Authorization', `Bearer ${token}`)
            .send(payload)
            .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.businessName).toBe(payload.businessName);

        // Verify Role Upgrade
        const updatedUser = await userRepo.findOne({ where: { id: user.id } });
        expect(updatedUser.role).toBe(UserRole.VENDOR);
    });

    it('GET /api/vendors/me (Get My Profile)', async () => {
        // Seed Location
        const countryRepo = dataSource.getRepository(Country);
        const stateRepo = dataSource.getRepository(State);
        const cityRepo = dataSource.getRepository(City);
        const userRepo = dataSource.getRepository(User);

        const country = await countryRepo.save({ name: 'Bangladesh', isoCode: 'BD' });
        const state = await stateRepo.save({ name: 'Dhaka', country });
        const city = await cityRepo.save({
            name: 'Gulshan',
            state,
            centerPoint: { type: 'Point', coordinates: [90.4078, 23.7925] },
        });

        // Seed User
        const user = await userRepo.save({
            email: 'vendor@example.com',
            passwordHash: 'hash',
            role: UserRole.CUSTOMER,
        });

        const token = jwtService.sign({ email: user.email, sub: user.id, role: user.role });

        // Create Profile
        const payload = {
            businessName: 'My Awesome Store',
            operatingCityId: city.id,
            address: '123 Main St',
            latitude: 23.7925,
            longitude: 90.4078,
        };

        await request(app.getHttpServer())
            .post('/api/vendors')
            .set('Authorization', `Bearer ${token}`)
            .send(payload)
            .expect(201);

        // Get Profile
        const response = await request(app.getHttpServer())
            .get('/api/vendors/me')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body.businessName).toBe(payload.businessName);
    });
});
