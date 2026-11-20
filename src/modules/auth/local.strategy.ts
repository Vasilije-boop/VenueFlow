import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginKorisnikDTO } from '../korisnik/dtos/LoginKorisnikDTO.js';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'Username', passwordField: 'Password' });
  }

  async validate(Username: string, Password: string): Promise<any> {
    const user = await this.authService.validateUser({ Username, Password });
    if (!user) {
      throw new UnauthorizedException("Wrong username or password!");
    }
    return user;
  }
}
