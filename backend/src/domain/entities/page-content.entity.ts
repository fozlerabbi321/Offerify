import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    UpdateDateColumn,
} from 'typeorm';

@Entity('page_contents')
export class PageContent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    slug: string; // 'about', 'privacy', 'terms'

    @Column()
    title: string;

    @Column('text')
    body: string;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
