import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import type { Smena } from "./smena.entity.js";
import type { Zaposleni } from "../../korisnik/entities/zaposleni.entity.js";

@Entity('radnik_u_smeni')
export class RadnikUSmeni {
    @PrimaryGeneratedColumn()
    ID: number;

    @Column({ type: 'timestamp', nullable: true })
    VremeCekiranja: Date;

    @Column({ type: 'timestamp', nullable: true })
    VremeOdcekiranja: Date;

    @ManyToOne('Smena', 'RadniciUSmeni', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'SmenaID' })
    Smena: Smena;

    @ManyToOne('Zaposleni', 'RadniciUSmeni', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'RadnikID' })
    Radnik: Zaposleni;
}