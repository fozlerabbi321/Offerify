import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { State } from './state.entity';

@Entity('countries')
export class Country {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 100 })
    name: string;

    @Column({ name: 'iso_code', type: 'varchar', length: 3, unique: true })
    isoCode: string;

    @OneToMany(() => State, (state) => state.country)
    states: State[];
}
