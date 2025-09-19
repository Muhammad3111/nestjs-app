import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty()
  @IsUUID()
  fromRegionId: string;

  @ApiProperty()
  @IsUUID()
  toRegionId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  incomeUzs: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  expenseUzs: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  incomeUsd: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  expenseUsd: number;
}
