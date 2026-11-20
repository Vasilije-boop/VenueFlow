import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { KorisnikModule } from '../korisnik/korisnik.module.js';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy.js';
import { AuthController } from './auth.controller.js';
import { LocalAuthGuard } from './guards/local-auth.guard.js';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants.js';
import { JwtStrategy } from './jwt.strategy.js';

@Module({
  imports: [
    KorisnikModule,
    PassportModule.register({ defaultStrategy: 'local' }),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),],
  providers: [AuthService, LocalStrategy, LocalAuthGuard, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
