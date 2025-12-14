import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from './../src/domain/entities/user.entity';
import { Review } from './../src/domain/entities/review.entity';
import { VendorProfile } from './../src/domain/entities/vendor-profile.entity';
import { PageContent } from './../src/domain/entities/page-content.entity';
import { AppSetting } from './../src/domain/entities/app-setting.entity';
import { Country } from './../src/domain/entities/country.entity';
import { State } from './../src/domain/entities/state.entity';
import { City } from './../src/domain/entities/city.entity';
import { ResponseInterceptor } from './../src/common/interceptors/response.interceptor';

// Increase timeout for E2E tests with database operations
jest.setTimeout(30000);

describe('AdminController (e2e)', () => {
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

        // Apply interceptors and pipes matching production
        app.useGlobalInterceptors(
            new ClassSerializerInterceptor(app.get(Reflector)),
            new ResponseInterceptor(),
        );
        app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

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
                    // Some tables may not exist yet
                }
            }
        }
    });

    // Helper to create an admin user and return token
    const createAdminUser = async () => {
        const userRepo = dataSource.getRepository(User);
        const admin = await userRepo.save({
            email: 'admin@test.com',
            passwordHash: 'hash',
            role: UserRole.ADMIN,
            name: 'Test Admin',
        });
        return {
            user: admin,
            token: jwtService.sign({ email: admin.email, sub: admin.id, role: admin.role }),
        };
    };

    // Helper to create a regular customer user
    const createCustomerUser = async () => {
        const userRepo = dataSource.getRepository(User);
        const customer = await userRepo.save({
            email: 'customer@test.com',
            passwordHash: 'hash',
            role: UserRole.CUSTOMER,
            name: 'Test Customer',
        });
        return {
            user: customer,
            token: jwtService.sign({ email: customer.email, sub: customer.id, role: customer.role }),
        };
    };

    // ============================================================
    // USER MANAGEMENT TESTS
    // ============================================================

    describe('User Management', () => {
        it('GET /api/admin/users - should return paginated users (admin only)', async () => {
            const { token } = await createAdminUser();
            const userRepo = dataSource.getRepository(User);

            // Create additional test users
            await userRepo.save([
                { email: 'user1@test.com', passwordHash: 'hash', role: UserRole.CUSTOMER, name: 'User One' },
                { email: 'user2@test.com', passwordHash: 'hash', role: UserRole.CUSTOMER, name: 'User Two' },
            ]);

            const response = await request(app.getHttpServer())
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body.data).toHaveProperty('items');
            expect(response.body.data).toHaveProperty('meta');
            expect(response.body.data.items.length).toBeGreaterThanOrEqual(3); // admin + 2 users
            expect(response.body.data.meta).toHaveProperty('total');
            expect(response.body.data.meta).toHaveProperty('page');
        });

        it('GET /api/admin/users?search=user1 - should filter users by search', async () => {
            const { token } = await createAdminUser();
            const userRepo = dataSource.getRepository(User);

            await userRepo.save([
                { email: 'user1@test.com', passwordHash: 'hash', role: UserRole.CUSTOMER, name: 'User One' },
                { email: 'user2@test.com', passwordHash: 'hash', role: UserRole.CUSTOMER, name: 'User Two' },
            ]);

            const response = await request(app.getHttpServer())
                .get('/api/admin/users?search=user1')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body.data.items.length).toBe(1);
            expect(response.body.data.items[0].email).toBe('user1@test.com');
        });

        it('GET /api/admin/users - should return 403 for non-admin users', async () => {
            const { token } = await createCustomerUser();

            await request(app.getHttpServer())
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${token}`)
                .expect(403);
        });

        it('PATCH /api/admin/users/:id/ban - should toggle user ban status', async () => {
            const { token } = await createAdminUser();
            const { user: customer } = await createCustomerUser();

            // Ban the user
            const banResponse = await request(app.getHttpServer())
                .patch(`/api/admin/users/${customer.id}/ban`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(banResponse.body.data.isBanned).toBe(true);

            // Unban the user
            const unbanResponse = await request(app.getHttpServer())
                .patch(`/api/admin/users/${customer.id}/ban`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(unbanResponse.body.data.isBanned).toBe(false);
        });

        it('PATCH /api/admin/users/:id/ban - should return 404 for non-existent user', async () => {
            const { token } = await createAdminUser();

            await request(app.getHttpServer())
                .patch('/api/admin/users/00000000-0000-0000-0000-000000000000/ban')
                .set('Authorization', `Bearer ${token}`)
                .expect(404);
        });
    });

    // ============================================================
    // REVIEW MODERATION TESTS
    // ============================================================

    describe('Review Moderation', () => {
        const setupReviewData = async () => {
            const countryRepo = dataSource.getRepository(Country);
            const stateRepo = dataSource.getRepository(State);
            const cityRepo = dataSource.getRepository(City);
            const userRepo = dataSource.getRepository(User);
            const vendorRepo = dataSource.getRepository(VendorProfile);
            const reviewRepo = dataSource.getRepository(Review);

            const country = await countryRepo.save({ name: 'Bangladesh', isoCode: 'BD' });
            const state = await stateRepo.save({ name: 'Dhaka', country });
            const city = await cityRepo.save({
                name: 'Gulshan',
                state,
                centerPoint: { type: 'Point', coordinates: [90.4078, 23.7925] },
            });

            const vendorUser = await userRepo.save({
                email: 'vendor@test.com',
                passwordHash: 'hash',
                role: UserRole.VENDOR,
            });

            const vendor = await vendorRepo.save({
                businessName: 'Test Vendor',
                slug: 'test-vendor',
                user: vendorUser,
                city,
                location: { type: 'Point', coordinates: [90.4078, 23.7925] },
            });

            const reviewer = await userRepo.save({
                email: 'reviewer@test.com',
                passwordHash: 'hash',
                role: UserRole.CUSTOMER,
            });

            const review = await reviewRepo.save({
                user: reviewer,
                vendor,
                rating: 5,
                comment: 'Great service!',
            });

            return { vendor, reviewer, review };
        };

        it('GET /api/admin/reviews - should return all reviews', async () => {
            const { token } = await createAdminUser();
            await setupReviewData();

            const response = await request(app.getHttpServer())
                .get('/api/admin/reviews')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body.data).toHaveProperty('items');
            expect(response.body.data.items.length).toBeGreaterThanOrEqual(1);
            expect(response.body.data.items[0]).toHaveProperty('rating');
            expect(response.body.data.items[0]).toHaveProperty('comment');
        });

        it('GET /api/admin/reviews - should return 403 for non-admin', async () => {
            const { token } = await createCustomerUser();

            await request(app.getHttpServer())
                .get('/api/admin/reviews')
                .set('Authorization', `Bearer ${token}`)
                .expect(403);
        });

        it('DELETE /api/admin/reviews/:id - should delete a review', async () => {
            const { token } = await createAdminUser();
            const { review } = await setupReviewData();

            await request(app.getHttpServer())
                .delete(`/api/admin/reviews/${review.id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            // Verify review is deleted
            const reviewRepo = dataSource.getRepository(Review);
            const deletedReview = await reviewRepo.findOne({ where: { id: review.id } });
            expect(deletedReview).toBeNull();
        });

        it('DELETE /api/admin/reviews/:id - should return 404 for non-existent review', async () => {
            const { token } = await createAdminUser();

            await request(app.getHttpServer())
                .delete('/api/admin/reviews/00000000-0000-0000-0000-000000000000')
                .set('Authorization', `Bearer ${token}`)
                .expect(404);
        });
    });

    // ============================================================
    // CMS PAGE CONTENT TESTS
    // ============================================================

    describe('CMS Page Content', () => {
        it('GET /api/admin/pages/:slug - should return empty page for new slug', async () => {
            const { token } = await createAdminUser();

            const response = await request(app.getHttpServer())
                .get('/api/admin/pages/about')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body.data.slug).toBe('about');
            expect(response.body.data.body).toBe('');
        });

        it('PUT /api/admin/pages/:slug - should create/update page content', async () => {
            const { token } = await createAdminUser();

            const updatePayload = {
                title: 'About Us',
                body: 'This is about our company.',
            };

            const response = await request(app.getHttpServer())
                .put('/api/admin/pages/about')
                .set('Authorization', `Bearer ${token}`)
                .send(updatePayload)
                .expect(200);

            expect(response.body.data.title).toBe(updatePayload.title);
            expect(response.body.data.body).toBe(updatePayload.body);

            // Verify it can be fetched
            const getResponse = await request(app.getHttpServer())
                .get('/api/admin/pages/about')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(getResponse.body.data.title).toBe(updatePayload.title);
        });

        it('GET/PUT /api/admin/pages/:slug - should return 403 for non-admin', async () => {
            const { token } = await createCustomerUser();

            await request(app.getHttpServer())
                .get('/api/admin/pages/about')
                .set('Authorization', `Bearer ${token}`)
                .expect(403);

            await request(app.getHttpServer())
                .put('/api/admin/pages/about')
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Test', body: 'Test' })
                .expect(403);
        });
    });

    // ============================================================
    // GLOBAL SETTINGS TESTS
    // ============================================================

    describe('Global Settings', () => {
        it('GET /api/admin/settings - should return all settings', async () => {
            const { token } = await createAdminUser();

            const response = await request(app.getHttpServer())
                .get('/api/admin/settings')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body.data).toHaveProperty('items');
            expect(response.body.data).toHaveProperty('config');
        });

        it('PUT /api/admin/settings - should update settings', async () => {
            const { token } = await createAdminUser();

            const updatePayload = {
                settings: [
                    { key: 'support_email', value: 'support@offerify.com' },
                    { key: 'app_version', value: '1.0.0' },
                ],
            };

            const response = await request(app.getHttpServer())
                .put('/api/admin/settings')
                .set('Authorization', `Bearer ${token}`)
                .send(updatePayload)
                .expect(200);

            expect(response.body.data.items.length).toBe(2);

            // Verify settings are saved
            const getResponse = await request(app.getHttpServer())
                .get('/api/admin/settings')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(getResponse.body.data.config.support_email).toBe('support@offerify.com');
            expect(getResponse.body.data.config.app_version).toBe('1.0.0');
        });

        it('GET/PUT /api/admin/settings - should return 403 for non-admin', async () => {
            const { token } = await createCustomerUser();

            await request(app.getHttpServer())
                .get('/api/admin/settings')
                .set('Authorization', `Bearer ${token}`)
                .expect(403);

            await request(app.getHttpServer())
                .put('/api/admin/settings')
                .set('Authorization', `Bearer ${token}`)
                .send({ settings: [] })
                .expect(403);
        });
    });

    // ============================================================
    // DASHBOARD STATS TESTS
    // ============================================================

    describe('Dashboard Stats', () => {
        it('GET /api/admin/stats - should return dashboard statistics', async () => {
            const { token } = await createAdminUser();

            const response = await request(app.getHttpServer())
                .get('/api/admin/stats')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body.data).toHaveProperty('totalUsers');
            expect(response.body.data).toHaveProperty('totalReviews');
        });

        it('GET /api/admin/stats - should return 403 for non-admin', async () => {
            const { token } = await createCustomerUser();

            await request(app.getHttpServer())
                .get('/api/admin/stats')
                .set('Authorization', `Bearer ${token}`)
                .expect(403);
        });
    });
});
