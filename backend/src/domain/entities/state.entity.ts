import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Country } from './country.entity';
import { City } from './city.entity';

@Entity('states')
export class State {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 100 })
    name: string;

    @Column({ name: 'country_id', type: 'int' })
    countryId: number;

    @ManyToOne(() => Country, (country) => country.states, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'country_id' })
    country: Country;

    @OneToMany(() => City, (city) => city.state)
    cities: City[];
}
