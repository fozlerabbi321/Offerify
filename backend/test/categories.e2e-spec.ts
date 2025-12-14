import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import contentParser from '@fastify/multipart';

// Increase timeout for E2E tests with database operations
jest.setTimeout(30000);

describe('CategoriesController (e2e)', () => {
    let app: NestFastifyApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication<NestFastifyApplication>(
            new FastifyAdapter(),
        );

        // Register multipart plugin
        await app.register(contentParser);

        app.setGlobalPrefix('api');
        await app.init();
        await app.getHttpAdapter().getInstance().ready();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/api/categories (POST)', () => {
        return request(app.getHttpServer())
            .post('/api/categories')
            .field('name', 'Test Category')
            .attach('file', Buffer.from('fake image content'), 'test-image.png')
            .expect(201)
            .expect((res) => {
                expect(res.body).toHaveProperty('id');
                expect(res.body.name).toEqual('Test Category');
            });
    });

    it('/api/categories (GET)', () => {
        return request(app.getHttpServer())
            .get('/api/categories')
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
                expect(res.body.length).toBeGreaterThan(0);
            });
    });
});
