import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import type { VlasnikLokala } from "../../korisnik/entities/vlasnikLokala.entity.js";
import type { Lokal } from "./lokal.entity.js";

@Entity('vlasnistva')
export class Vlasnistvo {
    @PrimaryColumn({ name: 'vlasnikID' })
    VlasnikID: number;

    @PrimaryColumn({ name: 'lokalID' })
    LokalID: number;

    @Column({ name: 'procentualniUdeo', type: 'int' })
    ProcentualniUdeo: number;

    @ManyToOne('VlasnikLokala', 'Vlasnistva', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'vlasnikID' })
    VlasnikLokala: VlasnikLokala;

    @ManyToOne('Lokal', 'Vlasnici', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'lokalID' })
    Lokal: Lokal;
}