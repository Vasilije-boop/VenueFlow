import { Injectable, NotFoundException, BadRequestException, ForbiddenException,UnauthorizedException, ConflictException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Zaposleni } from '../korisnik/entities/zaposleni.entity.js';
import { VlasnikLokala } from '../korisnik/entities/vlasnikLokala.entity.js';
import { Lokal } from '../lokal/entities/lokal.entity.js';
import { CreateLokalDTO } from './dtos/CreateLokalDTO.js';
import { Vlasnistvo } from './entities/vlasnistvo.entity.js';
import { Korisnik } from '../korisnik/entities/korisnik.entity.js';
import { Administrator } from '../korisnik/entities/administrator.entity.js';
import { ZahtevZaPosao } from './entities/zahtevZaPosao.entity.js';
import { ApplicationResponseDTO } from './dtos/ApplicationResponseDTO.js';
import { KorisnikService } from '../korisnik/korisnik.service.js';

@Injectable()
export class LokalService {
    constructor(
        @InjectRepository(Vlasnistvo)
        private readonly vlastnistvoRepository: Repository<Vlasnistvo>,
        @InjectRepository(VlasnikLokala)
        private readonly vlasnikLokalaRepository: Repository<VlasnikLokala>,
        @InjectRepository(Zaposleni)
        private readonly zaposleniRepository: Repository<Zaposleni>,        
        @InjectRepository(Lokal)
        private readonly lokalRepository: Repository<Lokal>,
        @InjectRepository(ZahtevZaPosao)
        private readonly zahtevRepository: Repository<ZahtevZaPosao>,

        private readonly korisnikService: KorisnikService,
        private readonly dataSource: DataSource,
    ) {}

    async checkVenue(ID:number){
        const lokal = await this.lokalRepository.findOne({ where: { ID: ID } });
        if (!lokal)
            throw new NotFoundException('Venue has not been found.');
        return lokal
    }

    async checkOwnership(userID: number, venueID: number){
        const isOwner = await this.vlastnistvoRepository.findOne({
            where: {
                VlasnikID: userID,
                LokalID: venueID,
            },
        });
        if (!isOwner) {
            throw new ForbiddenException(
                'You dont have premission for this action!',
            );
        }
        return isOwner
    }

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
            // promenio sam da vise ne trazi u VlasniciLokala vec korisnici za first time dodavanje lokala
            const currentUser = await queryRunner.manager.findOne(Korisnik, {
                where: { ID: currentUserID },
            });
            if(!currentUser)
                throw new UnauthorizedException('User was not found.');

            const daLiJeUListiVlasnika = dto.Vlasnici.some(
                (v) => v.Username === currentUser.Username
            );

            // am i adding my own local check
            if (!daLiJeUListiVlasnika) {
                throw new ForbiddenException('You need to be one of the owners!');
            }

            //Ako trenutni korisnik još nije VlasnikLokala, postaje VlasnikLokala
            let currentVlasnik = await queryRunner.manager.findOne(VlasnikLokala, {
                where: { Korisnik: { ID: currentUser.ID } },
                relations: { Korisnik: true },
            });
            if (!currentVlasnik) {
                const noviVlasnik = queryRunner.manager.create(VlasnikLokala, {
                    Korisnik: currentUser,
                });
                currentVlasnik = await queryRunner.manager.save(noviVlasnik);
            }

            // Pravim sacuvaniLokal da bi imao i ID lokala
            const noviLokal = queryRunner.manager.create(Lokal, {
                NazivLokala: dto.NazivLokala,
                TipLokala: dto.TipLokala,
            });
            const sacuvaniLokal = await queryRunner.manager.save(noviLokal);

            // prolazak svih vlasnika
            for (const vData of dto.Vlasnici) {
                // kako vise ne mora covek unapred da bude vlasnik sad moram da proverim prvo da li postoji takav
                // korisnik pa tek onda da li ima je i vlasnik
                const korisnik = await this.korisnikService.findByUsername(vData.Username)
                if (!korisnik) {
                    throw new NotFoundException(`Korisnik sa korisničkim imenom '${vData.Username}' ne postoji.`);
                }

                let vlasnik = await queryRunner.manager.findOne(VlasnikLokala, {
                    where: { Korisnik: { Username: vData.Username } },
                    relations: {Korisnik: true},
                });
                //check da li je vlasnik
                if (!vlasnik) {
                    const noviVlasnik = queryRunner.manager.create(VlasnikLokala, {
                        Korisnik: korisnik,
                    });
                    vlasnik = await queryRunner.manager.save(noviVlasnik);
                }
                
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

    async applyForJob(userID: number, lokalID: number, opis: string): Promise<{message: string}>{
        const cistOpis = opis?.trim();
        if (!cistOpis) {
            throw new BadRequestException('You cant send empty application');
        }

        const lokal = await this.checkVenue(lokalID)

        const vecRadi = await this.zaposleniRepository.findOne({
            where: {
                Korisnik: { ID: userID },
                Lokal: { ID: lokalID },
            },
        });
        if (vecRadi) {
            throw new ConflictException('You are already employed by this venue.');
        }

        const postojeciZahtev = await this.zahtevRepository.findOne({
            where: {
                KorisnikID: userID,
                LokalID: lokalID,
            },
        });
        if (postojeciZahtev) {
            throw new ConflictException('You have already sent an application.');
        }

        const noviZahtev = this.zahtevRepository.create({
            KorisnikID: userID,
            LokalID: lokalID,
            Opis: cistOpis,
        });

        this.zahtevRepository.save(noviZahtev);
        return {
            message: `You have successfully applied for a job at ${lokal.NazivLokala}`,
        };
    }

    async getApplications(lokalId: number, korisnikId: number): Promise<ApplicationResponseDTO[]> {
        const lokal = await this.checkVenue(lokalId)
        const jeVlasnik = await this.checkOwnership(korisnikId, lokalId)

        return this.zahtevRepository.find({
            where: { LokalID: lokalId },
            relations: {'Korisnik' : true},
            select: {
                ID: true,
                Opis: true,
                DatumKreiranja: true,
                Korisnik: {
                    ID: true,
                    Username: true,
                },
            },
            order: {
                DatumKreiranja: 'DESC',
            },
        });
    }

    async hireWorker(lokalID: number, workerID: number, currentUserID: number, pozicija: string,): Promise<{ message: string }> {
        const cistaPozicija = pozicija?.trim();
        if (!cistaPozicija) {
            throw new BadRequestException('position is required');
        }

        // Provera da li lokal postoji
        const lokal = await this.checkVenue(lokalID);

        // Provera da li kandidat postoji
        const worker = await this.korisnikService.findByID(workerID);
        if (!worker) {
            throw new NotFoundException('there is no user with that applicants ID');
        }

        // Provera da li je trenutni korisnik vlasnik lokala
        await this.checkOwnership(currentUserID, lokalID);

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Provera da li korisnik vec ima zapis u tabeli zaposleni
            let zaposleni = await queryRunner.manager.findOne(Zaposleni, {
                where: { ID: worker.ID },
                relations: { Lokal: true, Korisnik: true },
            });

            if (zaposleni) {
                // Provera da li vec radi u nekom lokalu
                if (zaposleni.Lokal) {
                    throw new ConflictException('user is already employed');
                }

                // Azuriranje postojeceg zapisa zaposlenog
                zaposleni.Lokal = lokal;
                zaposleni.DatumZaposljenja = new Date();
                zaposleni.Pozicija = cistaPozicija;
            } else {
                // Kreiranje novog zapisa zaposlenog jer do sada nije bio radnik
                zaposleni = queryRunner.manager.create(Zaposleni, {
                    ID: worker.ID,
                    Korisnik: worker,
                    Lokal: lokal,
                    DatumZaposljenja: new Date(),
                    Pozicija: cistaPozicija,
                });
            }

            await queryRunner.manager.save(Zaposleni, zaposleni);

            await queryRunner.commitTransaction();

            return {
                message: `Korisnik ${worker.Username} je uspesno zaposlen u lokalu ${lokal.NazivLokala} na poziciji ${cistaPozicija}.`,
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}