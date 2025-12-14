import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { UserRole } from './../src/domain/entities/user.entity';

// Increase timeout for E2E tests with database operations
jest.setTimeout(30000);

describe('AuthController (e2e)', () => {
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

    it('POST /api/auth/register (Success)', async () => {
        const payload = {
            email: 'test@example.com',
            password: 'password123',
            role: UserRole.CUSTOMER,
        };

        const response = await request(app.getHttpServer())
            .post('/api/auth/register')
            .send(payload)
            .expect(201);

        expect(response.body).toHaveProperty('access_token');
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user.email).toBe(payload.email);
    });

    it('POST /api/auth/login (Success)', async () => {
        // Register first
        const registerPayload = {
            email: 'login@example.com',
            password: 'password123',
            role: UserRole.CUSTOMER,
        };

        await request(app.getHttpServer())
            .post('/api/auth/register')
            .send(registerPayload)
            .expect(201);

        // Login
        const loginPayload = {
            email: 'login@example.com',
            password: 'password123',
        };

        const response = await request(app.getHttpServer())
            .post('/api/auth/login')
            .send(loginPayload)
            .expect(201);

        expect(response.body).toHaveProperty('access_token');
        expect(response.body.user.email).toBe(loginPayload.email);
    });

    it('POST /api/auth/login (Invalid Credentials)', async () => {
        const loginPayload = {
            email: 'wrong@example.com',
            password: 'wrongpassword',
        };

        await request(app.getHttpServer())
            .post('/api/auth/login')
            .send(loginPayload)
            .expect(401);
    });
});
