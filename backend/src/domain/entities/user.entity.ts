import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    OneToMany,
} from 'typeorm';
import { VendorProfile } from './vendor-profile.entity';
import { Favorite } from './favorite.entity';
import { Review } from './review.entity';
import { Exclude } from 'class-transformer';

export enum UserRole {
    CUSTOMER = 'customer',
    VENDOR = 'vendor',
    ADMIN = 'admin',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false })
    @Exclude()
    passwordHash: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.CUSTOMER,
    })
    role: UserRole;

    @OneToOne(() => VendorProfile, (vendor) => vendor.user, { nullable: true })
    vendorProfile: VendorProfile;

    @OneToMany(() => Favorite, (favorite) => favorite.user)
    favorites: Favorite[];

    @OneToMany(() => Review, (review) => review.user)
    reviews: Review[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
