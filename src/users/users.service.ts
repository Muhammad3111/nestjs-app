import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const exists = await this.usersRepo.findOne({
      where: [{ phone: dto.phone }, { username: dto.username }],
    });
    if (exists) throw new ConflictException('User already exists');

    const user = this.usersRepo.create(dto);
    return this.usersRepo.save(user);
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { phone } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    // Check duplicates for phone/username (exclude current user)
    if (dto.phone || dto.username) {
      const exists = await this.usersRepo.findOne({
        where: [
          dto.phone ? { phone: dto.phone, id: Not(id) } : {},
          dto.username ? { username: dto.username, id: Not(id) } : {},
        ],
      });
      if (exists)
        throw new ConflictException('Phone or username already taken');
    }

    // Agar parol yangilansa hash qilib qo'yamiz
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    Object.assign(user, dto);
    return this.usersRepo.save(user);
  }
}
