import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateShopsTable1765602100000 implements MigrationInterface {
    name = 'CreateShopsTable1765602100000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create shops table
        await queryRunner.query(`
            CREATE TABLE "shops" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" varchar NOT NULL,
                "vendor_id" uuid NOT NULL,
                "city_id" int NOT NULL,
                "location" geography(Point, 4326),
                "address" text,
                "contact_number" varchar,
                "is_default" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_shops" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "shops" 
            ADD CONSTRAINT "FK_shops_vendor" 
            FOREIGN KEY ("vendor_id") 
            REFERENCES "vendor_profiles"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "shops" 
            ADD CONSTRAINT "FK_shops_city" 
            FOREIGN KEY ("city_id") 
            REFERENCES "cities"("id") 
            ON DELETE RESTRICT 
            ON UPDATE NO ACTION
        `);

        // Create indexes
        await queryRunner.query(`CREATE INDEX "IDX_shops_vendor" ON "shops" ("vendor_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_shops_city" ON "shops" ("city_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_shops_location" ON "shops" USING GIST ("location")`);

        // Add shop_id column to offers table
        await queryRunner.query(`ALTER TABLE "offers" ADD COLUMN "shop_id" uuid`);

        // Add foreign key for shop_id
        await queryRunner.query(`
            ALTER TABLE "offers" 
            ADD CONSTRAINT "FK_offers_shop" 
            FOREIGN KEY ("shop_id") 
            REFERENCES "shops"("id") 
            ON DELETE SET NULL 
            ON UPDATE NO ACTION
        `);

        // Create index on shop_id
        await queryRunner.query(`CREATE INDEX "IDX_offers_shop" ON "offers" ("shop_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove shop_id from offers
        await queryRunner.query(`DROP INDEX "IDX_offers_shop"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP CONSTRAINT "FK_offers_shop"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "shop_id"`);

        // Drop shops table
        await queryRunner.query(`DROP INDEX "IDX_shops_location"`);
        await queryRunner.query(`DROP INDEX "IDX_shops_city"`);
        await queryRunner.query(`DROP INDEX "IDX_shops_vendor"`);
        await queryRunner.query(`ALTER TABLE "shops" DROP CONSTRAINT "FK_shops_city"`);
        await queryRunner.query(`ALTER TABLE "shops" DROP CONSTRAINT "FK_shops_vendor"`);
        await queryRunner.query(`DROP TABLE "shops"`);
    }
}
