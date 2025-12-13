import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    UpdateDateColumn,
} from 'typeorm';

@Entity('app_settings')
export class AppSetting {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    key: string; // 'support_email', 'app_version', 'maintenance_mode'

    @Column('text')
    value: string;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
