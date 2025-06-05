import { Module } from '@nestjs/common';
import { IndicesService } from './services/indices.service';
import config from '../config';
import { IndicesController } from './controllers/indices.controller';
import { IndicesGateway } from './gateways/indices.gateway';
import { SupportedSymbolsGuard } from './guards/supported-symbols.guard';

@Module({
  providers: [
    {
      provide: 'LAST_PREVIOUS_CLOSE_PRICES',
      useValue: {
        value: Array(config.numberOfRecordsToAverage).fill(undefined),
        index: 0,
      },
    },
    SupportedSymbolsGuard,
    IndicesService,
    IndicesGateway,
  ],
  controllers: [IndicesController],
  exports: [IndicesService, IndicesGateway],
})
export class IndicesModule {}
