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
import { VendorProfile } from './vendor-profile.entity';
import { City } from './city.entity';
import { Favorite } from './favorite.entity';

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

    @OneToMany(() => Favorite, (favorite) => favorite.offer)
    favorites: Favorite[];
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
