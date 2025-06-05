import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CrawlerModule } from './crawler/crawler.module';
import { CommonModule } from './common/common.module';
import { MongoModule } from './mongo/mongo.module';
import { IndicesModule } from './indices/indices.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    CrawlerModule.forRoot(),
    ThrottlerModule.forRoot(),
    CommonModule,
    MongoModule,
    IndicesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
