import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { RefreshTokenGuard } from 'src/common/guards/refreshToken.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { SignInDto } from './dto/sign-in.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signup')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() data: SignInDto) {
    return this.authService.signIn(data);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  @ApiBearerAuth()
  refreshTokens(@Req() req: Request) {
    const userId = this.extractUserId(req);
    return this.authService.refreshTokens(userId);
  }

  private extractUserId(req: any): string {
    return req.user['id'];
  }
}
