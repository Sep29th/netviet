import { Global, Module } from '@nestjs/common';
import { CircuitBreakerModule } from './modules/circuit-breaker/circuit-breaker.module';
import { Logger } from './services/logger.service';

@Global()
@Module({
  imports: [CircuitBreakerModule],
  providers: [Logger],
  exports: [Logger],
})
export class CommonModule {}
