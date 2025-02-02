import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_ACCESS_SECRET } from '../constants/auth.constant';
import { Request } from 'express';

@Injectable()
export class AccessTokenQueryParamStrategy extends PassportStrategy(Strategy, 'jwt-query-param') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          // Extract token from query params (e.g., /files/2/?token=xyz)
          const token = request.query.token as string;
          if (!token) {
            throw new UnauthorizedException('Token is missing');
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get(JWT_ACCESS_SECRET),
    });
  }

  validate(payload) {
    return payload;
  }
}
