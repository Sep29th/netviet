import { Module } from '@nestjs/common';
import { IndicesService } from './services/indices.service';
import { IndicesController } from './controllers/indices.controller';
import { IndicesGateway } from './gateways/indices.gateway';
import { SupportedSymbolsGuard } from './guards/supported-symbols.guard';
import { CrawlerModule } from 'src/crawler/crawler.module';

@Module({
  imports: [CrawlerModule.forRoot()],
  providers: [SupportedSymbolsGuard, IndicesService, IndicesGateway],
  controllers: [IndicesController],
  exports: [IndicesService, IndicesGateway],
})
export class IndicesModule {}
