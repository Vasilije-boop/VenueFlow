import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Gde traži token: u Authorization zaglavlju (Bearer token)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  // Automatski se poziva nakon što Passport uspešno proveri token
  async validate(payload: any) {
    // Ono što ovde vratiš automatski se lepi na req.user u kontroleru
    return { userID: payload.sub, username: payload.username };
  }
}