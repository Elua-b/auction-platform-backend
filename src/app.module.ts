import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RolesModule } from './roles/roles.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './infra/config/prisma/prisma.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { AuctionsModule } from './auctions/auctions.module';
import { EventsModule } from './events/events.module';
import { BidsModule } from './bids/bids.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UploadModule } from './upload/upload.module';
import { OrdersModule } from './orders/orders.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { WatchlistModule } from './watchlist/watchlist.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    UserModule,
    PrismaModule,
    RolesModule,
    CategoriesModule,
    ProductsModule,
    AuctionsModule,
    EventsModule,
    BidsModule,
    NotificationsModule,
    UploadModule,
    OrdersModule,
    AnalyticsModule,
    WatchlistModule,
    ReviewsModule,
    SearchModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
