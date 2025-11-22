import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCityToOffers1763816786881 implements MigrationInterface {
    name = 'AddCityToOffers1763816786881'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add city_id column as nullable first
        await queryRunner.query(`ALTER TABLE "offers" ADD "city_id" integer`);

        // Update existing offers to use their vendor's operating city
        await queryRunner.query(`
            UPDATE "offers" 
            SET "city_id" = "vendor_profiles"."city_id"
            FROM "vendor_profiles"
            WHERE "offers"."vendor_id" = "vendor_profiles"."id"
        `);

        // Now make it NOT NULL since all existing offers have city_id
        await queryRunner.query(`ALTER TABLE "offers" ALTER COLUMN "city_id" SET NOT NULL`);

        // Add foreign key constraint
        await queryRunner.query(`ALTER TABLE "offers" ADD CONSTRAINT "FK_d113c91dafb633f9e7904240297" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offers" DROP CONSTRAINT "FK_d113c91dafb633f9e7904240297"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "city_id"`);
    }

}
