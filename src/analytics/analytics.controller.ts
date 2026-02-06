import { Controller, Get, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('seller/:sellerId')
    getSellerAnalytics(@Param('sellerId') sellerId: string) {
        return this.analyticsService.getSellerAnalytics(sellerId);
    }

    @Get('platform')
    getPlatformAnalytics() {
        return this.analyticsService.getPlatformAnalytics();
    }
}
