import { Controller, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CleanupService } from './cleanup.service';

@ApiTags('cleanup')
@Controller('api/cleanup')
// Test uchun authentication ni olib tashladik
export class CleanupController {
  constructor(private readonly cleanupService: CleanupService) {}

  @Post('orders')
  @ApiOperation({
    summary: 'Manual cleanup of old orders',
    description:
      'Manually delete orders older than specified days (default: 30 days)',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Number of days (default: 30)',
  })
  @ApiResponse({
    status: 200,
    description: 'Cleanup completed successfully',
    schema: {
      type: 'object',
      properties: {
        deleted: { type: 'number', description: 'Number of orders deleted' },
        affectedRegions: {
          type: 'number',
          description: 'Number of regions updated',
        },
        message: { type: 'string' },
      },
    },
  })
  async manualCleanup(@Query('days') days?: number) {
    const daysOld = days !== undefined && days >= 0 ? days : 30;
    const result = await this.cleanupService.manualCleanup(daysOld);

    return {
      ...result,
      message: `Successfully deleted ${result.deleted} orders older than ${daysOld} days and updated ${result.affectedRegions} regions`,
    };
  }
}
