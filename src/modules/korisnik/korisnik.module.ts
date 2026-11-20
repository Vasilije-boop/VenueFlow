import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KorisnikController } from './korisnik.controller.js';
import { KorisnikService } from './korisnik.service.js';

import { Korisnik } from './entities/korisnik.entity.js';
import { VlasnikLokala } from './entities/vlasnikLokala.entity.js';
import { Zaposleni } from './entities/zaposleni.entity.js';
import { Administrator } from './entities/administrator.entity.js';
import { BrojTelefona } from './entities/brojTelefona.entity.js';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule.register({defaultStrategy: 'jwt'}),
    TypeOrmModule.forFeature([
      Korisnik,
      VlasnikLokala,
      Zaposleni,
      Administrator,
      BrojTelefona,
    ]),
  ],
  controllers: [KorisnikController],
  providers: [KorisnikService],
  exports: [TypeOrmModule, KorisnikService],
})
export class KorisnikModule {}