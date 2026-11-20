import { Injectable } from '@nestjs/common';
import { LoginKorisnikDTO } from '../korisnik/dtos/LoginKorisnikDTO.js';
import { KorisnikService } from '../korisnik/korisnik.service.js';
import * as bcrypt from 'bcrypt'; 
import {JwtService} from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private korisnikService: KorisnikService,
        private jwtService: JwtService
    ){}

    async validateUser(loginData : LoginKorisnikDTO) : Promise<any>{
        const existingUsername = await this.korisnikService.findByUsername(loginData.Username);
        if(existingUsername && await bcrypt.compare(loginData.Password, existingUsername.Sifra)){
            // cu vratim korisnika bez sifre
            const { Sifra, ...result } = existingUsername;
            return result; 
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user.Username, sub: user.ID };
        console.log("Iz auth.service: ",user);
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
