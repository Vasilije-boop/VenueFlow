import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lokal } from './entities/lokal.entity.js';
import { Vlasnistvo } from './entities/vlasnistvo.entity.js';
import { LokalController } from './lokal.controller.js';
import { LokalService } from './lokal.service.js';
import { VlasnikLokala } from '../korisnik/entities/vlasnikLokala.entity.js';
import { Zaposleni } from '../korisnik/entities/zaposleni.entity.js';
import { PassportModule } from '@nestjs/passport';
import { ZahtevZaPosao } from './entities/zahtevZaPosao.entity.js';
import { KorisnikModule } from '../korisnik/korisnik.module.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([
      Lokal, 
      Vlasnistvo,
      VlasnikLokala,
      Zaposleni,
      ZahtevZaPosao
    ]),
    KorisnikModule
  ],
  exports: [TypeOrmModule],
  controllers: [LokalController],
  providers: [LokalService],
})
export class LokalModule {}