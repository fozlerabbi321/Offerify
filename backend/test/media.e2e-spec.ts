import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import contentParser from '@fastify/multipart';
import { join } from 'path';

describe('MediaController (e2e)', () => {
    let app: NestFastifyApplication;

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
        await app.init();
        await app.getHttpAdapter().getInstance().ready();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/api/media/upload (POST)', async () => {
        const buffer = Buffer.from('fake-image-data');

        const response = await request(app.getHttpServer())
            .post('/api/media/upload')
            .attach('file', buffer, 'test.png')
            .expect(201);

        expect(response.body).toHaveProperty('url');
        expect(response.body.url).toMatch(/\/public\/.*\.png$/);
    });
});
