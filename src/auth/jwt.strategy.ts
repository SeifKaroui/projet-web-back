import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
        });
      }
      async validate(payload: any) {
        return {
          id: payload.id,
          firstName: payload.firstName,
          lastName: payload.lastName,
          type: payload.type,
        };
      }
}