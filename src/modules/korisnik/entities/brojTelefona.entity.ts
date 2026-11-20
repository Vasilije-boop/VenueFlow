import { Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, Entity } from "typeorm";
import type { Korisnik } from "./korisnik.entity.js";

@Entity('brojevi_telefona')
export class BrojTelefona {
    @PrimaryGeneratedColumn()
    ID: number;

    @Column({ type: 'varchar', length: 100, nullable: false })
    BrojTelefona: string;

    @ManyToOne('Korisnik', 'BrojeviTelefona', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'korisnikID' })
    Korisnik: Korisnik;
}