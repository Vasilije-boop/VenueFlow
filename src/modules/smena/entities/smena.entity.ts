import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import type { Lokal } from "../../lokal/entities/lokal.entity.js";
import type { StanjeUSmeni } from "./stanjeusmeni.entity.js";
import type { RadnikUSmeni } from "./radnikusmeni.entity.js";

@Entity('smene')
export class Smena {
    @PrimaryGeneratedColumn()
    ID: number;

    @Column({ type: 'timestamp' })
    PocetakSmene: Date;

    @Column({ type: 'timestamp' })
    KrajSmene: Date;

    @ManyToOne('Lokal', 'Smene', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'LokalID' })
    Lokal: Lokal;

    @OneToMany('StanjeUSmeni', 'Smena')
    StanjaProizvoda: StanjeUSmeni[];

    @OneToMany('RadnikUSmeni', 'Smena')
    RadiciUSmeni: RadnikUSmeni[];
}