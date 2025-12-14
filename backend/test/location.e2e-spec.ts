import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { City } from './../src/domain/entities/city.entity';
import { State } from './../src/domain/entities/state.entity';
import { Country } from './../src/domain/entities/country.entity';

// Increase timeout for E2E tests with database operations
jest.setTimeout(30000);

describe('LocationController (e2e)', () => {
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

    it('GET /api/location/nearest (Success)', async () => {
        // Seed data
        const countryRepo = dataSource.getRepository(Country);
        const stateRepo = dataSource.getRepository(State);
        const cityRepo = dataSource.getRepository(City);

        const country = await countryRepo.save({
            name: 'Bangladesh',
            isoCode: 'BD',
        });

        const state = await stateRepo.save({
            name: 'Dhaka',
            country: country,
        });

        await cityRepo.save({
            name: 'Gulshan',
            state: state,
            centerPoint: {
                type: 'Point',
                coordinates: [90.4078, 23.7925], // Longitude, Latitude
            },
        });

        // Test
        const response = await request(app.getHttpServer())
            .get('/api/location/nearest')
            .query({ lat: 23.7925, long: 90.4078 })
            .expect(200);

        expect(response.body).toHaveProperty('name', 'Gulshan');
    });

    it('GET /api/location/nearest (Not Found)', async () => {
        // No seed or far away
        await request(app.getHttpServer())
            .get('/api/location/nearest')
            .query({ lat: 0, long: 0 })
            .expect(404);
    });
});
