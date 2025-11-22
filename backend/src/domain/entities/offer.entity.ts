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
} from 'typeorm';
import { VendorProfile } from './vendor-profile.entity';
import { City } from './city.entity';

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

    @Column({ name: 'vendor_id' })
    vendorId: string;

    @ManyToOne(() => City)
    @JoinColumn({ name: 'city_id' })
    city: City;

    @Column({ name: 'city_id' })
    cityId: number;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
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
