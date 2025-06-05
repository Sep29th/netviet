import { Inject, Injectable } from '@nestjs/common';
import CircuitBreaker from 'opossum';
import { Logger } from 'src/common/services/logger.service';

@Injectable()
export class CircuitBreakerService {
  private readonly defaultCircuitBreakerOptions: CircuitBreaker.Options = {
    timeout: 10000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
  };

  constructor(
    @Inject('CIRCUIT_BREAKER')
    private readonly circuitBreaker: Map<string, CircuitBreaker>,
    private readonly logger: Logger,
  ) {}

  createCircuitBreaker(
    name: string,
    fn: (...args: unknown[]) => Promise<unknown>,
    options?: CircuitBreaker.Options,
    fallback?: (...args: unknown[]) => unknown,
  ) {
    const breaker = new CircuitBreaker(fn, {
      ...this.defaultCircuitBreakerOptions,
      ...options,
    });

    if (fallback) {
      breaker.fallback(fallback);
    }

    breaker.on('open', () =>
      this.logger.log(`Circuit breaker ${name} is open`),
    );
    breaker.on('close', () =>
      this.logger.log(`Circuit breaker ${name} is closed`),
    );
    breaker.on('fallback', (result: boolean) =>
      this.logger.log(
        `Circuit breaker ${name} fallback executed with result: ${result}`,
      ),
    );
    breaker.on('failure', (err: Error) => {
      this.logger.error(`Circuit breaker ${name} failure: ${err}`);
    });
    breaker.on('halfOpen', () =>
      this.logger.log(`Circuit breaker ${name} is half-open`),
    );

    this.circuitBreaker.set(name, breaker);
  }

  async exec<T>(name: string, ...args: unknown[]): Promise<T> {
    const breaker = this.circuitBreaker.get(name);

    if (!breaker) {
      this.logger.error(`Circuit breaker ${name} not found`);
      throw new Error(`Circuit breaker ${name} not found`);
    }

    return (await breaker.fire(...args)) as T;
  }
}
