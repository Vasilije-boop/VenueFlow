import { Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import type { Lokal } from "../../lokal/entities/lokal.entity.js";
import type { StanjeUSmeni } from "../../smena/entities/stanjeusmeni.entity.js";

@Entity('proizvodi')
export class Proizvod {
    @PrimaryGeneratedColumn()
    ID: number;

    @Column({ type: 'decimal' })
    Cena: number;

    @Column({ type: 'decimal' })
    Profit: number;

    @Column({ type: 'varchar', length: 3 })
    Valuta: string;

    @Column({ type: 'varchar', length: 300 })
    Slika: string;

    @Column({ type: 'int' })
    Kolicina: number;

    @Column({ type: 'int' })
    MinKolicina: number;

    @ManyToOne('Lokal', 'Proizvodi', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'lokalID' })
    Lokal: Lokal;

    @OneToMany('StanjeUSmeni', 'Proizvod')
    StanjaUSmenama: StanjeUSmeni[];
}