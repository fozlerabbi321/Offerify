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
    RelationId,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import type { Point } from 'geojson';
import { User } from './user.entity';
import { City } from './city.entity';
import { Offer } from './offer.entity';
import { Review } from './review.entity';

@Entity('vendor_profiles')
export class VendorProfile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    businessName: string;

    @Column({ unique: true })
    slug: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ nullable: true, name: 'contact_phone' })
    contactPhone: string;

    @Column({ nullable: true, name: 'logo_url' })
    logoUrl: string;

    @Column({ nullable: true, name: 'cover_image_url' })
    coverImageUrl: string;

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

    @RelationId((profile: VendorProfile) => profile.user)
    @Exclude()
    userId: string;

    @ManyToOne(() => City)
    @JoinColumn({ name: 'city_id' })
    city: City;

    @Column({ name: 'city_id' })
    @Exclude()
    cityId: number;

    @OneToMany(() => Offer, (offer) => offer.vendor)
    offers: Offer[];

    @OneToMany(() => Review, (review) => review.vendor)
    reviews: Review[];

    @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.00, name: 'rating_avg' })
    ratingAvg: number;

    @Column({ type: 'int', default: 0, name: 'review_count' })
    reviewCount: number;

    @Column({ type: 'int', default: 0, name: 'follower_count' })
    followerCount: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
