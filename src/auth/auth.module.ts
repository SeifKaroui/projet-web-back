import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenStrategy } from './strategies/accessToken.strategy';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { AccessTokenQueryParamStrategy } from './strategies/accessTokenQueryParam.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AccessTokenStrategy,
    AccessTokenQueryParamStrategy,
    RefreshTokenStrategy,
  ],
  exports: [PassportModule, JwtModule],
})
export class AuthModule {}
