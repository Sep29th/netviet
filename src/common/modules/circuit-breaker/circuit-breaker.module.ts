import { Global, Module } from '@nestjs/common';
import * as CircuitBreaker from 'opossum';
import { CircuitBreakerService } from './services/circuit-breaker.service';

@Global()
@Module({
  providers: [
    { provide: 'CIRCUIT_BREAKER', useValue: new Map<string, CircuitBreaker>() },
    CircuitBreakerService,
  ],
  exports: [CircuitBreakerService],
})
export class CircuitBreakerModule {}
