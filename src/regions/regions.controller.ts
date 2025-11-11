import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RegionsService } from './regions.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { PaginationQueryDto } from '../orders/dto/pagination-query.dto';

@ApiTags('Regions')
@ApiBearerAuth()
@Controller('api/regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new region (default balances = 0)' })
  create(@Body() dto: CreateRegionDto) {
    return this.regionsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated list of regions (with orders)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.regionsService.findAllPaginated(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get region by id (with orders)' })
  findOne(@Param('id') id: string) {
    return this.regionsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update region (name only)' })
  update(@Param('id') id: string, @Body() dto: UpdateRegionDto) {
    return this.regionsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete region by id' })
  remove(@Param('id') id: string) {
    return this.regionsService.remove(id);
  }
}
