import { Entity, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Offer } from './offer.entity';

@Entity('favorites')
export class Favorite {
    @PrimaryColumn('uuid', { name: 'user_id' })
    userId: string;

    @PrimaryColumn('uuid', { name: 'offer_id' })
    offerId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Offer, (offer) => offer.favorites, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'offer_id' })
    offer: Offer;
}
