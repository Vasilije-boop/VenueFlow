import { 
    Entity,
    Column,
    OneToOne,
    CreateDateColumn, 
    JoinColumn,
    ManyToOne, 
    PrimaryColumn
} from "typeorm";
import type { Korisnik } from "./korisnik.entity.js";
import type { Lokal } from "../../lokal/entities/lokal.entity.js";

@Entity('zaposleni')
export class Zaposleni {
    @PrimaryColumn({ name: 'ID' })
    ID: number;

    @Column({ type: 'varchar', length: 100, nullable: true })
    Pozicija: string;

    @Column({ type: 'timestamp', nullable: true }) 
    DatumZaposljenja: Date | null;

    @OneToOne('Korisnik', 'Zaposleni', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ID' }) // ID je i FK i PK
    Korisnik: Korisnik;

    @ManyToOne('Lokal', 'Zaposleni', { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'LokalID' })
    Lokal: Lokal;
}