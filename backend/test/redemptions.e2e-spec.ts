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

// Increase timeout for E2E tests with database operations
jest.setTimeout(30000);

describe('RedemptionsController (e2e)', () => {
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

    it('Redemption Flow (Claim & Verify)', async () => {
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
        const vendorToken = jwtService.sign({ email: vendorUser.email, sub: vendorUser.id, role: vendorUser.role });

        // Offer (Voucher)
        const offer = await offerRepo.save({
            title: 'Free Burger',
            description: 'Yum',
            type: OfferType.VOUCHER,
            vendor,
            cityId: city.id,
            isActive: true,
            voucherLimit: 10,
            voucherClaimedCount: 0,
            voucherValue: 100,
        });

        // Customer
        const customer = await userRepo.save({
            email: 'customer@example.com',
            passwordHash: 'hash',
            role: UserRole.CUSTOMER,
        });
        const customerToken = jwtService.sign({ email: customer.email, sub: customer.id, role: customer.role });

        // 2. Test: Claim Offer (Customer)
        const claimRes = await request(app.getHttpServer())
            .post(`/api/redemptions/${offer.id}/claim`)
            .set('Authorization', `Bearer ${customerToken}`)
            .expect(201);

        const redemptionId = claimRes.body.id;
        expect(redemptionId).toBeDefined();

        // 3. Test: Verify Redemption (Vendor)
        const verifyRes = await request(app.getHttpServer())
            .patch(`/api/redemptions/${redemptionId}/verify`)
            .set('Authorization', `Bearer ${vendorToken}`)
            .expect(200);

        expect(verifyRes.body.isUsed).toBe(true);
        expect(verifyRes.body.redeemedAt).toBeDefined();

        // 4. Test: Verify Again (Should Fail)
        await request(app.getHttpServer())
            .patch(`/api/redemptions/${redemptionId}/verify`)
            .set('Authorization', `Bearer ${vendorToken}`)
            .expect(409);
    });
});
