import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import * as GeoJSON from 'geojson';
import { State } from './state.entity';

@Entity('cities')
export class City {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 100 })
    name: string;

    @Column({ name: 'state_id', type: 'int' })
    stateId: number;

    @Index('idx_cities_center', { spatial: true })
    @Column({
        type: 'geography',
        spatialFeatureType: 'POINT',
        srid: 4326,
    })
    centerPoint: GeoJSON.Point;

    @ManyToOne(() => State, (state) => state.cities, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'state_id' })
    state: State;
}
