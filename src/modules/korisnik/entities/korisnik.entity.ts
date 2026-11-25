import { 
    Entity,
    PrimaryGeneratedColumn, 
    Column, 
    OneToOne, 
    CreateDateColumn,
    OneToMany
} from "typeorm";
import type { Zaposleni } from "./zaposleni.entity.js";
import type { VlasnikLokala } from "./vlasnikLokala.entity.js";
import type { BrojTelefona } from "./brojTelefona.entity.js";
import type { Administrator } from "./administrator.entity.js";
import type { ZahtevZaPosao } from "../../lokal/entities/zahtevZaPosao.entity.js";

@Entity('korisnici')
export class Korisnik {
    @PrimaryGeneratedColumn()
    ID: number;

    @Column({ type: 'varchar', length: 100 })
    Ime: string;

    @Column({ type: 'varchar', length: 100 })
    Prezime: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    Email: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    Username: string;

    @Column({ type: 'varchar', length: 255 })
    Sifra: string;

    @CreateDateColumn()
    DatumKreiranjaNaloga: Date;

    @OneToOne('Zaposleni', 'Korisnik', { nullable: true, onDelete: 'CASCADE' })
    Zaposleni: Zaposleni;

    @OneToOne('VlasnikLokala', 'Korisnik', { nullable: true, onDelete: 'CASCADE' })
    VlasnikLokala: VlasnikLokala;

    @OneToOne('Administrator', 'Korisnik', { nullable: true, onDelete: 'CASCADE'})
    Administrator: Administrator;

    @OneToMany('BrojTelefona', 'Korisnik', { cascade: true })
    BrojeviTelefona: BrojTelefona[];

    @OneToMany('ZahtevZaPosao', 'Korisnik')
    ZahteviZaPosao: ZahtevZaPosao[];
}