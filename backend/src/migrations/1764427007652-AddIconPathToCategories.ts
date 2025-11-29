import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIconPathToCategories1764427007652 implements MigrationInterface {
    name = 'AddIconPathToCategories1764427007652'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" RENAME COLUMN "icon" TO "icon_path"`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "image_path" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "image_path"`);
        await queryRunner.query(`ALTER TABLE "categories" RENAME COLUMN "icon_path" TO "icon"`);
    }

}
