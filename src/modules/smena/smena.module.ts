import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Smena } from './entities/smena.entity.js';
import { RadnikUSmeni } from './entities/radnikusmeni.entity.js';
import { StanjeUSmeni } from './entities/stanjeusmeni.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Smena, RadnikUSmeni, StanjeUSmeni]),
  ],
  exports: [TypeOrmModule],
})
export class SmenaModule {}