import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { AxiosCircuitBreakerService } from './axios-circuit-breaker.service';
import { Logger } from 'src/common/services/logger.service';

@Injectable()
export class CrawlerService implements OnModuleInit {
  constructor(
    @Inject('AXIOS_ATTACH_INFO')
    private readonly axiosAttachInfo: { cookies: string; crumb: string },
    private readonly axiosCircuitBreakerService: AxiosCircuitBreakerService,
    private readonly logger: Logger,
  ) {}

  async onModuleInit() {
    await this.initializeSession();
  }

  private async initializeSession() {
    try {
      const resGetInitCookies =
        await this.axiosCircuitBreakerService.getInitCookies();
      if (resGetInitCookies === false) {
        this.logger.error(`Failed to get initial cookies`);
        throw new Error(`Failed to get initial cookies`);
      }

      const crumbResponse = await this.axiosCircuitBreakerService.getCrumb();
      if (crumbResponse === false) {
        this.logger.error(`Failed to get crumb`);
        throw new Error(`Failed to get crumb`);
      }

      this.axiosAttachInfo.crumb = encodeURIComponent(crumbResponse.data);
    } catch (error: unknown) {
      if (typeof error === 'string') {
        this.logger.error(`Failed to initialize session: ${error}`);
        throw new Error(`Failed to initialize session: ${error}`);
      } else if (error instanceof Error) {
        this.logger.error(`Failed to initialize session: ${error.message}`);
        throw new Error(`Failed to initialize session: ${error.message}`);
      } else {
        this.logger.error('Unknown error during session initialization');
        throw new Error('Unknown error during session initialization');
      }
    }
  }

  async fetchRawQuoteData() {
    if (!this.axiosAttachInfo.cookies || !this.axiosAttachInfo.crumb) {
      await this.initializeSession();
    }

    try {
      const response = await this.axiosCircuitBreakerService.getQuote();
      if (response === false) {
        this.logger.error(`Failed to fetch quote data`);
        throw new Error(`Failed to fetch quote data`);
      }

      const data = response.data;

      if (
        !data.quoteSummary ||
        !data.quoteSummary.result ||
        data.quoteSummary.result.length === 0
      ) {
        this.logger.error(`No data found in response`);
        throw new Error('No data found in response');
      }

      return data.quoteSummary.result;
    } catch (error: unknown) {
      await this.initializeSession();

      const retryResponse = await this.axiosCircuitBreakerService.getQuote();
      if (retryResponse === false) {
        if (typeof error === 'string') {
          this.logger.error(
            `Failed to fetch quote data after reinitialization: ${error}`,
          );
          throw new Error(
            `Failed to fetch quote data after reinitialization: ${error}`,
          );
        } else if (error instanceof Error) {
          this.logger.error(
            `Failed to fetch quote data after reinitialization: ${error.message}`,
          );
          throw new Error(
            `Failed to fetch quote data after reinitialization: ${error.message}`,
          );
        } else {
          this.logger.error(
            'Failed to fetch quote data after reinitialization',
          );
          throw new Error('Failed to fetch quote data after reinitialization');
        }
      }

      return retryResponse.data.quoteSummary.result;
    }
  }
}
