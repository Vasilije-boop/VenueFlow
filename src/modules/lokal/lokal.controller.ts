import { Controller, Get, Param, Post, Body, Delete, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { LokalService } from './lokal.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Lokal } from './entities/lokal.entity.js';
import { CreateLokalDTO } from './dtos/CreateLokalDTO.js';
import { Proizvod } from '../proizvod/entities/proizvod.entity.js';
import { ApplicationResponseDTO } from './dtos/ApplicationResponseDTO.js';

@Controller('lokal')
export class LokalController {
    constructor(private readonly lokalService: LokalService) {}

    @UseGuards(JwtAuthGuard)
    @Get('myLocals') // Poziva se kao GET /lokal/moji
    async getMojiLokali(@Request() req: any):Promise<Lokal[]> {
        console.log('CEO REQ.USER:', req.user);
        const ulogovaniId = req.user.userID;
        return await this.lokalService.getKorisnickiLokali(ulogovaniId);
    }
    
    @UseGuards(JwtAuthGuard)
    @Get('Locals/:id') // Poziva se kao GET /lokal/5 (za tuđe lokale)
    async getLokaliZaKorisnika(@Param('id') id: number, @Request() req: any):Promise<Lokal[]> {
        // Ovde možeš staviti proveru da li je ulogovani korisnik admin pre nego što mu dozvoliš da gleda tuđi ID
        return await this.lokalService.getKorisnickiLokali(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('addLokal')
    async addLokal(@Body() createLokal: CreateLokalDTO,@Request() req: any): Promise<Lokal> {
        const trenutniKorisnikId = req.user.userID; 
        return await this.lokalService.AddLokal(createLokal, trenutniKorisnikId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('deleteLokal/:id')
    async deleteLokal(@Param('id') id:number, @Request() req: any){
        const ulogovaniID = req.user.userID;
        return await this.lokalService.deleteLokal(id,ulogovaniID);
    }

    @UseGuards(JwtAuthGuard)
    @Post('applyForJob/:id')
    async applyForJob(@Param('id') lokalID:number, @Body('Opis') opis: string, @Request() req: any):Promise<{ message: string }>{
        const ulogovaniID = req.user.userID;
        return await this.lokalService.applyForJob(ulogovaniID, lokalID, opis);
    }

    @UseGuards(JwtAuthGuard)
    @Get('getApplications/:id')
    async addZaposleni(@Param('id') id:number, @Request() req: any):Promise<ApplicationResponseDTO[]>{
        const ulogovaniID = req.user.userID;
        return await this.lokalService.getApplications(id, ulogovaniID);
    }
}
