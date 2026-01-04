import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.MONEYCHANGE_JWT_SECRET || 'secretKey',
    });
  }

  async validate(payload: { sub: string }): Promise<Partial<User>> {
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // qaytariladigan user Request ichiga yoziladi (req.user)
    return {
      id: user.id,
      username: user.username,
      phone: user.phone,
      role: user.role,
    };
  }
}
