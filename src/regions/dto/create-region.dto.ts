import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRegionDto {
  @ApiProperty({ example: 'Toshkent' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
