import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVendorProfileFields1765480207349 implements MigrationInterface {
    name = 'AddVendorProfileFields1765480207349'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vendor_profiles" ADD "description" text`);
        await queryRunner.query(`ALTER TABLE "vendor_profiles" ADD "contact_phone" character varying`);
        await queryRunner.query(`ALTER TABLE "vendor_profiles" ADD "logo_url" character varying`);
        await queryRunner.query(`ALTER TABLE "vendor_profiles" ADD "cover_image_url" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vendor_profiles" DROP COLUMN "cover_image_url"`);
        await queryRunner.query(`ALTER TABLE "vendor_profiles" DROP COLUMN "logo_url"`);
        await queryRunner.query(`ALTER TABLE "vendor_profiles" DROP COLUMN "contact_phone"`);
        await queryRunner.query(`ALTER TABLE "vendor_profiles" DROP COLUMN "description"`);
    }

}
