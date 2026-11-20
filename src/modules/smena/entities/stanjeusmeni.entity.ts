import { Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from "typeorm";
import { Proizvod } from "../../proizvod/entities/proizvod.entity.js";
import { Smena } from "./smena.entity.js";

@Entity('stanje_u_smeni')
export class StanjeUSmeni {
    @PrimaryGeneratedColumn()
    ID: number;

    @Column({ type: 'int' })
    PocetnaKolicina: number;

    @Column({ type: 'int', nullable: true })
    KrajnjaKolicina: number;

    @ManyToOne(() => Proizvod, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ProizvodID' })
    Proizvod: Proizvod;

    @ManyToOne(() => Smena, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'SmenaID' })
    Smena: Smena;
}