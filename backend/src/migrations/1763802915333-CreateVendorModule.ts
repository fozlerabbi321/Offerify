import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateVendorModule1763802915333 implements MigrationInterface {
    name = 'CreateVendorModule1763802915333'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('customer', 'vendor', 'admin')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'customer', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."offers_type_enum" AS ENUM('discount', 'coupon', 'voucher')`);
        await queryRunner.query(`CREATE TABLE "offers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text NOT NULL, "type" "public"."offers_type_enum" NOT NULL, "vendor_id" uuid NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "discount_percentage" double precision, "coupon_code" character varying, "voucher_value" integer, CONSTRAINT "PK_4c88e956195bba85977da21b8f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8101f7169d0e4bf3695de1c4eb" ON "offers" ("type") `);
        await queryRunner.query(`CREATE TABLE "vendor_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "business_name" character varying NOT NULL, "slug" character varying NOT NULL, "location" geography(Point,4326) NOT NULL, "user_id" uuid NOT NULL, "city_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_700ef502426f5a7e5943894a3fd" UNIQUE ("slug"), CONSTRAINT "REL_193d7cc6d4254e2098da2eda45" UNIQUE ("user_id"), CONSTRAINT "PK_bcb47b1a47f4f1447447eaf73a1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_10f3caf247bc795f8c08024a3f" ON "vendor_profiles" USING GiST ("location") `);
        await queryRunner.query(`ALTER TABLE "offers" ADD CONSTRAINT "FK_7c044cd5d10464ecd931e4c3296" FOREIGN KEY ("vendor_id") REFERENCES "vendor_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vendor_profiles" ADD CONSTRAINT "FK_193d7cc6d4254e2098da2eda45b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vendor_profiles" ADD CONSTRAINT "FK_bc138d58d3e01393f20eb86d8d1" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vendor_profiles" DROP CONSTRAINT "FK_bc138d58d3e01393f20eb86d8d1"`);
        await queryRunner.query(`ALTER TABLE "vendor_profiles" DROP CONSTRAINT "FK_193d7cc6d4254e2098da2eda45b"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP CONSTRAINT "FK_7c044cd5d10464ecd931e4c3296"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_10f3caf247bc795f8c08024a3f"`);
        await queryRunner.query(`DROP TABLE "vendor_profiles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8101f7169d0e4bf3695de1c4eb"`);
        await queryRunner.query(`DROP TABLE "offers"`);
        await queryRunner.query(`DROP TYPE "public"."offers_type_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
