import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
    ManyToOne,
    OneToMany,
    Index,
} from 'typeorm';
import type { Point } from 'geojson';
import { User } from './user.entity';
import { City } from './city.entity';
import { Offer } from './offer.entity';

@Entity('vendor_profiles')
export class VendorProfile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    businessName: string;

    @Column({ unique: true })
    slug: string;

    @Column({
        type: 'geography',
        spatialFeatureType: 'Point',
        srid: 4326,
    })
    @Index({ spatial: true })
    location: Point;

    @OneToOne(() => User, (user) => user.vendorProfile)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'user_id' })
    userId: string;

    @ManyToOne(() => City)
    @JoinColumn({ name: 'city_id' })
    city: City;

    @Column({ name: 'city_id' })
    cityId: number;

    @OneToMany(() => Offer, (offer) => offer.vendor)
    offers: Offer[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
