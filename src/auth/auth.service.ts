import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { User } from '../users/user.entity';

export interface JwtPayload {
  sub: string; // user id
  role: string; // user role
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(phone: string, password: string): Promise<User> {
    const user = await this.usersService.findByPhone(phone);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async login(dto: LoginUserDto) {
    const user = await this.validateUser(dto.phone, dto.password);
    return this.buildAuthResponse(user);
  }

  buildAuthResponse(user: User) {
    const payload: JwtPayload = { sub: user.id, role: user.role };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  async refresh(refresh_token: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refresh_token, {
        secret: process.env.JWT_SECRET || 'secretKey',
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user) throw new UnauthorizedException('User not found');

      const newPayload: JwtPayload = { sub: user.id, role: user.role };

      return {
        access_token: this.jwtService.sign(newPayload, { expiresIn: '15m' }),
        refresh_token: this.jwtService.sign(newPayload, { expiresIn: '7d' }),
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
