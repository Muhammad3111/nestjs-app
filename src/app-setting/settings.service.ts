// src/app-setting/settings.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppSetting } from './app-setting.entity';

const REG_SECRET_KEY = 'registration_secret_hash';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(AppSetting)
    private readonly settingsRepo: Repository<AppSetting>,
  ) {}

  /** Agar DBda secret yo‘q bo‘lsa, ENV orqali defaultni o‘rnatadi */
  async ensureDefaultRegistrationSecret(): Promise<void> {
    const exists = await this.settingsRepo.findOne({
      where: { key: REG_SECRET_KEY },
    });
    if (exists) return;

    const def = process.env.REGISTRATION_SECRET_DEFAULT;
    if (!def) {
      throw new InternalServerErrorException(
        'REGISTRATION_SECRET_DEFAULT env kiritilmagan (birinchi ishga tushirish uchun kerak).',
      );
    }
    const hash = await bcrypt.hash(def, 10);
    const row = this.settingsRepo.create({ key: REG_SECRET_KEY, value: hash });
    await this.settingsRepo.save(row);
  }

  async getRegistrationSecretHash(): Promise<string> {
    await this.ensureDefaultRegistrationSecret();
    const row = await this.settingsRepo.findOne({
      where: { key: REG_SECRET_KEY },
    });
    if (!row?.value) {
      throw new InternalServerErrorException('Registration secret topilmadi.');
    }
    return row.value;
  }

  async updateRegistrationSecret(newSecret: string): Promise<void> {
    const hash = await bcrypt.hash(newSecret, 10);
    let row = await this.settingsRepo.findOne({
      where: { key: REG_SECRET_KEY },
    });
    if (!row) {
      row = this.settingsRepo.create({ key: REG_SECRET_KEY, value: hash });
    } else {
      row.value = hash;
    }
    await this.settingsRepo.save(row);
  }

  async verifyRegistrationSecret(candidate: string): Promise<boolean> {
    const hash = await this.getRegistrationSecretHash();
    return bcrypt.compare(candidate, hash);
  }
}
