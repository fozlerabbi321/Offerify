import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
    Index,
    RelationId,
} from 'typeorm';
import type { Point } from 'geojson';
import { VendorProfile } from './vendor-profile.entity';
import { City } from './city.entity';
import { Offer } from './offer.entity';

@Entity('shops')
export class Shop {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @ManyToOne(() => VendorProfile, (vendor) => vendor.shops, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'vendor_id' })
    vendor: VendorProfile;

    @RelationId((shop: Shop) => shop.vendor)
    vendorId: string;

    @ManyToOne(() => City)
    @JoinColumn({ name: 'city_id' })
    city: City;

    @Column({ name: 'city_id' })
    cityId: number;

    @Column({
        type: 'geography',
        spatialFeatureType: 'Point',
        srid: 4326,
    })
    @Index({ spatial: true })
    location: Point;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ nullable: true, name: 'contact_number' })
    contactNumber: string;

    @Column({ default: false, name: 'is_default' })
    isDefault: boolean;

    @OneToMany(() => Offer, (offer) => offer.shop)
    offers: Offer[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
