import { Injectable, NotFoundException, BadRequestException, ForbiddenException,UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Zaposleni } from '../korisnik/entities/zaposleni.entity.js';
import { VlasnikLokala } from '../korisnik/entities/vlasnikLokala.entity.js';
import { Lokal } from '../lokal/entities/lokal.entity.js';
import { CreateLokalDTO } from './dtos/CreateLokalDTO.js';
import { Vlasnistvo } from './entities/vlasnistvo.entity.js';
import { Korisnik } from '../korisnik/entities/korisnik.entity.js';
import { Administrator } from '../korisnik/entities/administrator.entity.js';

@Injectable()
export class LokalService {
    constructor(
        @InjectRepository(VlasnikLokala)
        private readonly vlasnikLokalaRepository: Repository<VlasnikLokala>,
        @InjectRepository(Zaposleni)
        private readonly zaposleniRepository: Repository<Zaposleni>,

        private readonly dataSource: DataSource,
    ) {}

    async getKorisnickiLokali(userID: number): Promise<Lokal[]> {
        try {            
            const vlasnikLokala = await this.vlasnikLokalaRepository.findOne({
                where: { ID: userID },
                relations: {
                    Vlasnistva: {
                        Lokal: true,
                    },
                },
            });

            if(!vlasnikLokala){
                throw new NotFoundException(`Vlasnik lokala sa ID-jem ${userID} ne postoji.`);
            }
            if (!vlasnikLokala.Vlasnistva || vlasnikLokala.Vlasnistva.length === 0) {
                return [];
            }
            
            return vlasnikLokala.Vlasnistva
                .map((vlasnistvo) => vlasnistvo.Lokal)
                .filter((lokal) => lokal != null);
                
        } catch (error) {
            console.error('GREŠKA U getKorisnickiLokali:', error);
            throw error; // Prikazuje originalnu grešku u docker terminalu
        }
    }

    // Treba da proveri da li je current user zapravo neko od vlasnika
    async AddLokal(dto: CreateLokalDTO, currentUserID: number): Promise<Lokal> {
        // Da l je zbir 100%
        const zbirProcenata = dto.Vlasnici.reduce((sum, v) => sum + v.Procenat, 0);
        if (zbirProcenata !== 100) 
            throw new BadRequestException(`Zbir procenata vlasništva mora biti tačno 100%. Trenutni zbir je ${zbirProcenata}%.`);

        if (!currentUserID) {
            throw new UnauthorizedException('Korisnik nije autentifikovan.');
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const currentUser = await queryRunner.manager.findOne(VlasnikLokala, {
                where: { ID: currentUserID },
                relations: { Korisnik: true }
            });
            // registered user check
            if(!currentUser)
                throw new ForbiddenException('Samo registrovani vlasnici mogu kreirati lokal.');
            const daLiJeUListiVlasnika = dto.Vlasnici.some(
                (v) => v.Username === currentUser.Korisnik.Username
            );
            // am i adding my own local check
            if (!daLiJeUListiVlasnika) {
                throw new ForbiddenException('Vi morate biti jedan od vlasnika!');
            }
            // Pravim savuvaniLokal da bi imao i ID lokala
            const noviLokal = queryRunner.manager.create(Lokal, {
                NazivLokala: dto.NazivLokala,
                TipLokala: dto.TipLokala,
            });
            const sacuvaniLokal = await queryRunner.manager.save(noviLokal);

            // prolazak svih vlasnika
            for (const vData of dto.Vlasnici) {
                const vlasnik = await queryRunner.manager.findOne(VlasnikLokala, {
                    where: { Korisnik: { Username: vData.Username } },
                    relations: {Korisnik: true},
                });
                //check da li postoji taj korisnik
                if (!vlasnik) 
                    throw new NotFoundException(`Vlasnik sa korisničkim imenom '${vData.Username}' ne postoji.`);
                
                //cuvanje
                const vlasnistvo = queryRunner.manager.create(Vlasnistvo, {
                    LokalID: sacuvaniLokal.ID,
                    VlasnikID: vlasnik.ID,
                    ProcentualniUdeo: vData.Procenat,
                });
                await queryRunner.manager.save(vlasnistvo);
            }

            await queryRunner.commitTransaction();
            return sacuvaniLokal;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async deleteLokal(lokalID: number, currentUserID: number): Promise<{ message: string }> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        console.log("Delete log:")
        console.log(currentUserID);

        try {
            // admin check
            const admin = await queryRunner.manager.findOne(Administrator, {
                where: { ID: currentUserID }
            });
            const isAdmin = !!admin;

            let lokal: Lokal | null = null;

            if (isAdmin) {
                // Ako je admin, boli ga uvo ko je vlasnik, samo dohvati lokal po ID
                lokal = await queryRunner.manager.findOne(Lokal, {
                    where: { ID: lokalID }
                });
            } else {
                // trazi se lokal samo ako je korisnik koji nije admin vlasnik
                lokal = await queryRunner.manager.findOne(Lokal, {
                    where: { 
                        ID: lokalID, 
                        Vlasnici: { VlasnikID: currentUserID } 
                    }
                });
            }

            if (!lokal) {
                if (isAdmin) 
                    throw new NotFoundException(`Lokal sa ID-jem ${lokalID} ne postoji.`);
                else 
                    throw new ForbiddenException('Nemate pravo da obrišete ovaj lokal jer niste njegov vlasnik (ili lokal ne postoji).');
            }

            // Brisanje lokala
            await queryRunner.manager.remove(Lokal, lokal);

            await queryRunner.commitTransaction();
            return { message: `Lokal "${lokal.NazivLokala}" je uspešno obrisan.` };

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}