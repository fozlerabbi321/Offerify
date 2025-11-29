import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ unique: true })
    slug: string;

    @Column({ nullable: true, name: 'icon_path' })
    @Exclude()
    iconPath: string;

    @Expose()
    get icon(): string | null {
        if (!this.iconPath) return null;
        return `${process.env.APP_URL || 'http://localhost:3000'}${this.iconPath}`;
    }

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
