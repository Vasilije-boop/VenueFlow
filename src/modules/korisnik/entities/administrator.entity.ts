import { 
    Entity,
    OneToOne, 
    JoinColumn,
    PrimaryColumn
} from "typeorm";
import type { Korisnik } from "./korisnik.entity.js";

@Entity('administratori')
export class Administrator {
    @PrimaryColumn({ name: 'ID' })
    ID: number;

    @OneToOne('Korisnik', 'Administrator', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ID' })
    Korisnik: Korisnik;
}