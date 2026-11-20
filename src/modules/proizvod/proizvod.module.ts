import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proizvod } from './entities/proizvod.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Proizvod]),
  ],
  exports: [TypeOrmModule],
})
export class ProizvodModule {}