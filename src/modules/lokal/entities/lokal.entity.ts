import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { TipLokala } from "../enums/tipLokala.enum.js";
import type { Zaposleni } from "../../korisnik/entities/zaposleni.entity.js";
import type { Vlasnistvo } from "./vlasnistvo.entity.js";
import type { Proizvod } from "../../proizvod/entities/proizvod.entity.js";

@Entity('lokali')
export class Lokal {
    @PrimaryGeneratedColumn()
    ID: number;

    @Column({ name: 'nazivLokala', type: 'varchar', length: 150 })
    NazivLokala: string;

    @Column({ name: 'tipLokala', type: 'enum', enum: TipLokala })
    TipLokala: TipLokala;

    @OneToMany('Vlasnistvo', 'Lokal')
    Vlasnici: Vlasnistvo[];

    @OneToMany('Zaposleni', 'Lokal')
    Zaposleni: Zaposleni[];

    @OneToMany('Proizvod', 'Lokal')
    Proizvodi: Proizvod[];
}