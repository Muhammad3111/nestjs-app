import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RefreshTokenDto } from 'src/auth/dto/refresh-token.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login and get JWT tokens' })
  login(@Body() dto: LoginUserDto) {
    return this.authService.login(dto);
  }
  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user info (requires access token)' })
  getProfile(@Request() req: { user: any }): any {
    const secretKey =
      this.configService.get<string>('REGISTRATION_SECRET_DEFAULT') ?? null;

    return {
      ...req.user,
      secretKey,
    };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh tokens using refresh_token' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refresh_token);
  }
}
