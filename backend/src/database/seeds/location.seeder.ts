import { DataSource } from 'typeorm';
import { Country } from '../../domain/entities/country.entity';
import { State } from '../../domain/entities/state.entity';
import { City } from '../../domain/entities/city.entity';
import { databaseConfig } from '../../config/database.config';
import * as dotenv from 'dotenv';

dotenv.config();

async function seed() {
    const config = databaseConfig() as any;

    // Override entities path for seeder context if needed, 
    // but importing entities directly is safer for DataSource in standalone script
    const dataSource = new DataSource({
        ...config,
        entities: [Country, State, City], // Explicitly list entities
    });

    await dataSource.initialize();

    const countryRepo = dataSource.getRepository(Country);
    const stateRepo = dataSource.getRepository(State);
    const cityRepo = dataSource.getRepository(City);

    console.log('🌱 Seeding Location Data...');

    // 1. Country: Bangladesh
    let country = await countryRepo.findOne({ where: { isoCode: 'BGD' } });
    if (!country) {
        country = countryRepo.create({
            name: 'Bangladesh',
            isoCode: 'BGD',
        });
        await countryRepo.save(country);
        console.log('✅ Created Country: Bangladesh');
    } else {
        console.log('ℹ️ Country Bangladesh already exists');
    }

    // 2. State: Dhaka Division
    let state = await stateRepo.findOne({ where: { name: 'Dhaka Division', countryId: country.id } });
    if (!state) {
        state = stateRepo.create({
            name: 'Dhaka Division',
            country: country,
        });
        await stateRepo.save(state);
        console.log('✅ Created State: Dhaka Division');
    } else {
        console.log('ℹ️ State Dhaka Division already exists');
    }

    // 3. Cities (Zones)
    const citiesData = [
        {
            name: 'Gulshan 1',
            lat: 23.7925,
            long: 90.4078,
        },
        {
            name: 'Dhanmondi',
            lat: 23.7461,
            long: 90.3742,
        },
        {
            name: 'Uttara',
            lat: 23.8759,
            long: 90.3795,
        },
    ];

    for (const data of citiesData) {
        let city = await cityRepo.findOne({ where: { name: data.name, stateId: state.id } });

        const centerPoint = {
            type: 'Point',
            coordinates: [data.long, data.lat], // GeoJSON: [Longitude, Latitude]
        };

        if (!city) {
            city = cityRepo.create({
                name: data.name,
                state: state,
                centerPoint: centerPoint as any, // Cast to any to avoid TS issues with GeoJSON types in seed
            });
            await cityRepo.save(city);
            console.log(`✅ Created City: ${data.name}`);
        } else {
            // Update coordinates if exists
            city.centerPoint = centerPoint as any;
            await cityRepo.save(city);
            console.log(`🔄 Updated City: ${data.name}`);
        }
    }

    console.log('🎉 Seeding Complete!');
    await dataSource.destroy();
}

seed().catch((error) => {
    console.error('❌ Seeding Failed:', error);
    process.exit(1);
});
