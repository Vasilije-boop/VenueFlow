import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from "typeorm";
import type { Korisnik } from "../../korisnik/entities/korisnik.entity.js";
import type { Lokal } from "../../lokal/entities/lokal.entity.js";

@Entity('zahtevi_za_posao')
export class ZahtevZaPosao {
    @PrimaryGeneratedColumn()
    ID: number;

    @Column({ name: 'korisnikId', type: 'int' })
    KorisnikID: number;

    @Column({ name: 'lokalId', type: 'int' })
    LokalID: number;

    @Column({ name: 'opis', type: 'text' })
    Opis: string;

    @CreateDateColumn({ name: 'datumKreiranja' })
    DatumKreiranja: Date;

    @ManyToOne('Korisnik', 'ZahteviZaPosao', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'korisnikId' })
    Korisnik: Korisnik;

    @ManyToOne('Lokal', 'ZahteviZaPosao', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'lokalId' })
    Lokal: Lokal;
}