import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtTokens } from './interfaces/jwt-tokens.interface';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpResponseDto } from './dto/sign-up-response.dto';
import {
  JWT_ACCESS_EXPIRES_IN,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_EXPIRES_IN,
  JWT_REFRESH_SECRET,
} from './constants/auth.constant';
import { User } from 'src/users/entities/user.entity';
import { JwtUser } from './interfaces/jwt-user.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }
  async signUp(createUserDto: CreateUserDto): Promise<SignUpResponseDto> {
    const newUser = await this.usersService.create(createUserDto);

    const tokens = await this.getTokens(newUser);

    return {
      user: newUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async signIn(data: SignInDto): Promise<SignUpResponseDto> {
    const user = await this.usersService.findOneByEmail(data.email);
    if (!user) throw new BadRequestException('User does not exist');

    const passwordMatches = await argon2.verify(user.password, data.password);
    if (!passwordMatches)
      throw new BadRequestException('Password is incorrect');
    const tokens = await this.getTokens(user);

    return {
      user: user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async getTokens(user: User): Promise<JwtTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          type: user.type,
        } as JwtUser,
        {
          secret: this.configService.get<string>(JWT_ACCESS_SECRET),
          expiresIn: JWT_ACCESS_EXPIRES_IN,
        },
      ),
      this.jwtService.signAsync(
        {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          type: user.type,
        } as JwtUser,
        {
          secret: this.configService.get<string>(JWT_REFRESH_SECRET),
          expiresIn: JWT_REFRESH_EXPIRES_IN,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(userId: string) {
    if (!userId) {
      throw new ForbiddenException('Access Denied');
    }
    const user = await this.usersService.findOne(userId);
    if (!user) throw new ForbiddenException('Access Denied');
    return await this.getTokens(user);
  }
}
