import { 
    Entity,
    OneToOne, 
    OneToMany,
    JoinColumn,
    PrimaryColumn
} from "typeorm";
import type { Korisnik } from "./korisnik.entity.js";
import type { Vlasnistvo } from "../../lokal/entities/vlasnistvo.entity.js";

@Entity('vlasnici_lokala')
export class VlasnikLokala{
    @PrimaryColumn({name : 'ID'})
    ID : number

    @OneToOne('Korisnik', (korisnik: Korisnik) => korisnik.VlasnikLokala, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ID' })
    Korisnik: Korisnik;

    @OneToMany('Vlasnistvo', 'VlasnikLokala')
    Vlasnistva: Vlasnistvo[];
}