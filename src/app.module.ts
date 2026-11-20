import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { KorisnikModule } from './modules/korisnik/korisnik.module.js';
import { LokalModule } from './modules/lokal/lokal.module.js';
import { ProizvodModule } from './modules/proizvod/proizvod.module.js';
import { SmenaModule } from './modules/smena/smena.module.js';
import { AuthModule } from './modules/auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'postgres',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USER || 'venue_user',
      password: process.env.DB_PASSWORD || 'venue_pass',
      database: process.env.DB_NAME || 'venueflow_db',
      
      autoLoadEntities: true, // Automatski učitava sve entitete registrovane u forFeature()
      synchronize: true,
    }),
    KorisnikModule,
    LokalModule,
    ProizvodModule,
    SmenaModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}