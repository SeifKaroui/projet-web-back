import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AUTH_HEADER,
  AUTH_TYPE,
  JWT_REFRESH_SECRET,
} from '../constants/auth.constant';
import { JwtUser } from '../interfaces/jwt-user.interface';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh',) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get(JWT_REFRESH_SECRET),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtUser) {
    const refreshToken = req.get(AUTH_HEADER).replace(AUTH_TYPE, '').trim();
    return { ...payload, refreshToken };
  }
}
