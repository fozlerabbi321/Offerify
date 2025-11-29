import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCategoryToOffers1764425305714 implements MigrationInterface {
    name = 'AddCategoryToOffers1764425305714'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offers" ADD "category_id" uuid`);
        await queryRunner.query(`ALTER TABLE "offers" ADD CONSTRAINT "FK_05ce793b33cbb292cfe94c00fd2" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offers" DROP CONSTRAINT "FK_05ce793b33cbb292cfe94c00fd2"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "category_id"`);
    }

}
