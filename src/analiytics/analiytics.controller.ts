import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analiytics.service';

@ApiTags('Analytics')
@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('global')
  @ApiOperation({ summary: 'Get global analytics (income, expense, balances)' })
  getGlobalStats() {
    return this.analyticsService.getGlobalStats();
  }
}
