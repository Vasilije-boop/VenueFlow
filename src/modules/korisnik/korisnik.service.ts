import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Korisnik } from './entities/korisnik.entity.js';
import { CreateKorisnikDTO } from './dtos/CreateKorisnikDTO.js';
import { BrojTelefona } from './entities/brojTelefona.entity.js';
import * as bcrypt from 'bcrypt';
import { Zaposleni } from './entities/zaposleni.entity.js';
import { VlasnikLokala } from './entities/vlasnikLokala.entity.js';
import { LoginKorisnikDTO } from './dtos/LoginKorisnikDTO.js';
import { Lokal } from '../lokal/entities/lokal.entity.js';

@Injectable()
export class KorisnikService {
    constructor(
        @InjectRepository(Korisnik)
        private readonly korisnikRepository: Repository<Korisnik>,
        @InjectRepository(BrojTelefona)
        private readonly brojTelefonaRepository: Repository<BrojTelefona>,
        @InjectRepository(VlasnikLokala)
        private readonly vlasnikLokalaRepository: Repository<VlasnikLokala>,
        @InjectRepository(Zaposleni)
        private readonly zaposleniRepository: Repository<Zaposleni>,

        private readonly dataSource: DataSource,
    ) {}

    async findAllKorisnici(): Promise<Korisnik[]> {
        return await this.korisnikRepository.find();
    }

    async createKorisnik(newUser: CreateKorisnikDTO): Promise<Korisnik> {
        const existingEmail = await this.korisnikRepository.findOne({
            where: { Email: newUser.Email },
        });
        if (existingEmail) {
            throw new ConflictException('This email is already in use!');
        }

        const existingUsername = await this.korisnikRepository.findOne({
            where: { Username: newUser.Username },
        });
        if (existingUsername) {
            throw new ConflictException('Username is taken!');
        }

        const { BrojTelefona: brojTel, Sifra: preHashed, ...korisnikPodaci } = newUser;

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(preHashed, saltRounds);

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const noviKorisnik = queryRunner.manager.create(Korisnik, {
                ...korisnikPodaci,
                Sifra: hashedPassword,
                DatumKreiranjaNaloga: new Date(),
            });
            const sacuvaniKorisnik = await queryRunner.manager.save(noviKorisnik);

            if (brojTel) {
                const novBroj = queryRunner.manager.create(BrojTelefona, {
                    BrojTelefona: brojTel,
                    Korisnik: sacuvaniKorisnik,
                });
                await queryRunner.manager.save(novBroj);
            }

            await queryRunner.commitTransaction();
            return sacuvaniKorisnik;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async deleteKorisnik(userID: number): Promise<{ message: string }> {
        // Bazaz ce sama da uradi CASCADE DELETEE
        const result = await this.korisnikRepository.delete(userID);

        // Ako nista nisam obrisao nema tog korisnika
        if (result.affected === 0) 
            throw new NotFoundException(`User with ID: ${userID} has not been found.`);

        return { message: `User with ID: ${userID} has been deleted succesfully.` };
    }

    async findByUsername(username: string): Promise<Korisnik | null> {
        const foundUser =  await this.korisnikRepository.findOne({
            where: { Username: username },
        });
        return foundUser;
    }

    async findByID(ID: number): Promise<Korisnik | null>{
        const foundUser =  await this.korisnikRepository.findOne({
            where: { ID: ID},
        });
        return foundUser;
    }
}
