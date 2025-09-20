import {
  Body,
  Controller,
  Post,
  Param,
  BadRequestException,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SettingsService } from '../app-setting/settings.service';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly settingsService: SettingsService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterUserDto) {
    const secretKey: string = dto.secretKey;
    const { username, phone, password, role } = dto;
    const createDto: CreateUserDto = { username, phone, password, role };

    const ok = await this.settingsService.verifyRegistrationSecret(secretKey);
    if (!ok) throw new BadRequestException('Invalid registration secret key');

    return this.usersService.create(createDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }
}
