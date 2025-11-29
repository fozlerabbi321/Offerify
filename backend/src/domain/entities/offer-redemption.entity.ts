import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Offer } from './offer.entity';
import { User } from './user.entity';

@Entity('offer_redemptions')
export class OfferRedemption {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Offer)
    @JoinColumn({ name: 'offer_id' })
    offer: Offer;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ default: false })
    isUsed: boolean;

    @Column({ type: 'timestamp', nullable: true })
    redeemedAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}
