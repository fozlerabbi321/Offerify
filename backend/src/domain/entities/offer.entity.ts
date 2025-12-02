import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    TableInheritance,
    ChildEntity,
    RelationId,
    OneToMany,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { VendorProfile } from './vendor-profile.entity';
import { City } from './city.entity';
import { Favorite } from './favorite.entity';
import { Category } from './category.entity';

export enum OfferType {
    DISCOUNT = 'discount',
    COUPON = 'coupon',
    VOUCHER = 'voucher',
}

@Entity('offers')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class Offer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({
        type: 'enum',
        enum: OfferType,
    })
    type: OfferType;

    @Column({ nullable: true, name: 'image_path' })
    @Exclude()
    imagePath: string;

    @Expose()
    get image(): string | null {
        if (!this.imagePath) return null;
        return `${process.env.APP_URL || 'http://localhost:3000'}${this.imagePath}`;
    }

    @ManyToOne(() => VendorProfile, (vendor) => vendor.offers)
    @JoinColumn({ name: 'vendor_id' })
    vendor: VendorProfile;

    @RelationId((offer: Offer) => offer.vendor)
    vendorId: string;

    @ManyToOne(() => City)
    @JoinColumn({ name: 'city_id' })
    city: City;

    @RelationId((offer: Offer) => offer.city)
    cityId: number;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'int', default: 0, nullable: true })
    voucherLimit: number;

    @Column({ type: 'int', default: 0, nullable: true })
    voucherClaimedCount: number;

    @Column({ default: false })
    featured: boolean;

    @Column({ type: 'int', default: 0 })
    views: number;

    @OneToMany(() => Favorite, (favorite) => favorite.offer)
    favorites: Favorite[];

    @ManyToOne(() => Category)
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @RelationId((offer: Offer) => offer.category)
    categoryId: string;
}

@ChildEntity(OfferType.DISCOUNT)
export class DiscountOffer extends Offer {
    @Column({ type: 'float', nullable: true })
    discountPercentage: number;
}

@ChildEntity(OfferType.COUPON)
export class CouponOffer extends Offer {
    @Column({ nullable: true })
    couponCode: string;
}

@ChildEntity(OfferType.VOUCHER)
export class VoucherOffer extends Offer {
    @Column({ type: 'int', nullable: true })
    voucherValue: number;
}
