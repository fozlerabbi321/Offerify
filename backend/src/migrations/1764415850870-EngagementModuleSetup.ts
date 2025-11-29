import { MigrationInterface, QueryRunner } from "typeorm";

export class EngagementModuleSetup1764415850870 implements MigrationInterface {
    name = 'EngagementModuleSetup1764415850870'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "favorites" ("user_id" uuid NOT NULL, "offer_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3665f1bc342d692db67b7d21c73" PRIMARY KEY ("user_id", "offer_id"))`);
        await queryRunner.query(`CREATE TABLE "reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "vendor_id" uuid NOT NULL, "rating" integer NOT NULL, "comment" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "vendor_profiles" ADD "rating_avg" numeric(3,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "vendor_profiles" ADD "review_count" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "vendor_profiles" ADD "follower_count" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD CONSTRAINT "FK_35a6b05ee3b624d0de01ee50593" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD CONSTRAINT "FK_b2c6872cf67e85819f02df453f7" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_9ac2c42bb939e88ca13e0c6b288" FOREIGN KEY ("vendor_id") REFERENCES "vendor_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_9ac2c42bb939e88ca13e0c6b288"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf"`);
        await queryRunner.query(`ALTER TABLE "favorites" DROP CONSTRAINT "FK_b2c6872cf67e85819f02df453f7"`);
        await queryRunner.query(`ALTER TABLE "favorites" DROP CONSTRAINT "FK_35a6b05ee3b624d0de01ee50593"`);
        await queryRunner.query(`ALTER TABLE "vendor_profiles" DROP COLUMN "follower_count"`);
        await queryRunner.query(`ALTER TABLE "vendor_profiles" DROP COLUMN "review_count"`);
        await queryRunner.query(`ALTER TABLE "vendor_profiles" DROP COLUMN "rating_avg"`);
        await queryRunner.query(`DROP TABLE "reviews"`);
        await queryRunner.query(`DROP TABLE "favorites"`);
    }

}
