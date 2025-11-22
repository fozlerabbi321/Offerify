import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialLocationSchema1763799961971 implements MigrationInterface {
    name = 'InitialLocationSchema1763799961971'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "countries" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "iso_code" character varying(3) NOT NULL, CONSTRAINT "UQ_31d60a54633e88225b40081e187" UNIQUE ("iso_code"), CONSTRAINT "PK_b2d7006793e8697ab3ae2deff18" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cities" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "state_id" integer NOT NULL, "center_point" geography(POINT,4326) NOT NULL, CONSTRAINT "PK_4762ffb6e5d198cfec5606bc11e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_cities_center" ON "cities" USING GiST ("center_point") `);
        await queryRunner.query(`CREATE TABLE "states" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "country_id" integer NOT NULL, CONSTRAINT "PK_09ab30ca0975c02656483265f4f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "cities" ADD CONSTRAINT "FK_1229b56aa12cae674b824fccd13" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "states" ADD CONSTRAINT "FK_f3bbd0bc19bb6d8a887add08461" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "states" DROP CONSTRAINT "FK_f3bbd0bc19bb6d8a887add08461"`);
        await queryRunner.query(`ALTER TABLE "cities" DROP CONSTRAINT "FK_1229b56aa12cae674b824fccd13"`);
        await queryRunner.query(`DROP TABLE "states"`);
        await queryRunner.query(`DROP INDEX "public"."idx_cities_center"`);
        await queryRunner.query(`DROP TABLE "cities"`);
        await queryRunner.query(`DROP TABLE "countries"`);
    }

}
