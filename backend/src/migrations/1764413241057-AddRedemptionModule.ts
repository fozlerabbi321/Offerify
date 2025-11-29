import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRedemptionModule1764413241057 implements MigrationInterface {
    name = 'AddRedemptionModule1764413241057'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "offer_redemptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "is_used" boolean NOT NULL DEFAULT false, "redeemed_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "offer_id" uuid, "user_id" uuid, CONSTRAINT "PK_a48942abc9cc81feec975a5c142" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "voucher_limit" integer DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "voucher_claimed_count" integer DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "offers" DROP CONSTRAINT "FK_7c044cd5d10464ecd931e4c3296"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP CONSTRAINT "FK_d113c91dafb633f9e7904240297"`);
        await queryRunner.query(`ALTER TABLE "offers" ALTER COLUMN "vendor_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "offers" ALTER COLUMN "city_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "vendor_profiles" DROP CONSTRAINT "FK_193d7cc6d4254e2098da2eda45b"`);
        await queryRunner.query(`ALTER TABLE "vendor_profiles" ALTER COLUMN "user_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "offers" ADD CONSTRAINT "FK_7c044cd5d10464ecd931e4c3296" FOREIGN KEY ("vendor_id") REFERENCES "vendor_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "offers" ADD CONSTRAINT "FK_d113c91dafb633f9e7904240297" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vendor_profiles" ADD CONSTRAINT "FK_193d7cc6d4254e2098da2eda45b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "offer_redemptions" ADD CONSTRAINT "FK_ccc05c510834178775281530feb" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "offer_redemptions" ADD CONSTRAINT "FK_4eea60a303d43aee3884358635a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offer_redemptions" DROP CONSTRAINT "FK_4eea60a303d43aee3884358635a"`);
        await queryRunner.query(`ALTER TABLE "offer_redemptions" DROP CONSTRAINT "FK_ccc05c510834178775281530feb"`);
        await queryRunner.query(`ALTER TABLE "vendor_profiles" DROP CONSTRAINT "FK_193d7cc6d4254e2098da2eda45b"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP CONSTRAINT "FK_d113c91dafb633f9e7904240297"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP CONSTRAINT "FK_7c044cd5d10464ecd931e4c3296"`);
        await queryRunner.query(`ALTER TABLE "vendor_profiles" ALTER COLUMN "user_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "vendor_profiles" ADD CONSTRAINT "FK_193d7cc6d4254e2098da2eda45b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "offers" ALTER COLUMN "city_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "offers" ALTER COLUMN "vendor_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "offers" ADD CONSTRAINT "FK_d113c91dafb633f9e7904240297" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "offers" ADD CONSTRAINT "FK_7c044cd5d10464ecd931e4c3296" FOREIGN KEY ("vendor_id") REFERENCES "vendor_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "voucher_claimed_count"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "voucher_limit"`);
        await queryRunner.query(`DROP TABLE "offer_redemptions"`);
    }

}
