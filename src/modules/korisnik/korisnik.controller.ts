import { Controller, Get, Param, Post, Body, Delete, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { KorisnikService } from './korisnik.service.js';
import { CreateKorisnikDTO } from './dtos/CreateKorisnikDTO.js';
import { LoginKorisnikDTO } from './dtos/LoginKorisnikDTO.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('korisnik')
export class KorisnikController {
    constructor(private readonly korisnikService: KorisnikService) {}

    //staticke rute moraju iznad dinamickih! 
    @Get()
    getKorisnike(){
        return this.korisnikService.findAllKorisnici();
    }

    @Post()
    addKorisnik(@Body()createKorisnik : CreateKorisnikDTO){
        return this.korisnikService.createKorisnik(createKorisnik);
    }

    @Delete(':id')
    async deleteKorisnik(@Param('id', ParseIntPipe) id: number,): Promise<{ message: string }> {
        return await this.korisnikService.deleteKorisnik(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req: any){ // ovaj @Request cu koristim kad ocu da dobijem username/id
        return req.user;
    }

    @Get(':id')
    getUserByID(@Param('id') id: number){

    }
}
 