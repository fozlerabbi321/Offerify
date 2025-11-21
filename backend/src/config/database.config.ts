import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm';
import { snakeCase } from 'typeorm/util/StringUtils';

export class SnakeNamingStrategy
    extends DefaultNamingStrategy
    implements NamingStrategyInterface {
    tableName(targetName: string, userSpecifiedName: string): string {
        return userSpecifiedName ? userSpecifiedName : snakeCase(targetName);
    }

    columnName(
        propertyName: string,
        customName: string,
        embeddedPrefixes: string[],
    ): string {
        return snakeCase(
            embeddedPrefixes.concat(customName ? customName : propertyName).join('_'),
        );
    }

    relationName(propertyName: string): string {
        return snakeCase(propertyName);
    }

    joinColumnName(relationName: string, referencedColumnName: string): string {
        return snakeCase(relationName + '_' + referencedColumnName);
    }

    joinTableName(
        firstTableName: string,
        secondTableName: string,
        firstPropertyName: string,
        secondPropertyName: string,
    ): string {
        return snakeCase(
            firstTableName +
            '_' +
            firstPropertyName.replace(/\./gi, '_') +
            '_' +
            secondTableName,
        );
    }

    joinTableColumnName(
        tableName: string,
        propertyName: string,
        columnName?: string,
    ): string {
        return snakeCase(
            tableName + '_' + (columnName ? columnName : propertyName),
        );
    }

    classTableInheritanceParentColumnName(
        parentTableName: string,
        parentTableIdPropertyName: string,
    ): string {
        return snakeCase(parentTableName + '_' + parentTableIdPropertyName);
    }
}

export const databaseConfig = (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false, // STRICTLY FALSE for production/migrations
    namingStrategy: new SnakeNamingStrategy(),
    logging: process.env.NODE_ENV === 'development',
});
