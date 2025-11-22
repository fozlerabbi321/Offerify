import { DataSource } from 'typeorm';
import { databaseConfig } from './src/config/database.config';
import * as dotenv from 'dotenv';

dotenv.config();

const config = databaseConfig() as any;

export default new DataSource({
    ...config,
    migrations: ['src/migrations/*.ts'],
});
