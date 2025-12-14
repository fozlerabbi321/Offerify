
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusToVendorProfiles1700000000000 implements MigrationInterface {
    name = 'AddStatusToVendorProfiles1700000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vendor_profiles" ADD "status" character varying NOT NULL DEFAULT 'pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vendor_profiles" DROP COLUMN "status"`);
    }
}
