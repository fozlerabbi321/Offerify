import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { VendorProfile } from './vendor-profile.entity';

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'user_id' })
    userId: string;

    @Column('uuid', { name: 'vendor_id' })
    vendorId: string;

    @Column('int')
    rating: number;

    @Column('text', { nullable: true })
    comment: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.reviews)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => VendorProfile, (vendor) => vendor.reviews)
    @JoinColumn({ name: 'vendor_id' })
    vendor: VendorProfile;
}
