import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosInstance, AxiosResponse } from 'axios';
import { CircuitBreakerService } from 'src/common/modules/circuit-breaker/services/circuit-breaker.service';
import config from '../../config';
import { QuoteSummaryResponse } from '../types/quote-summary-response.type';

@Injectable()
export class AxiosCircuitBreakerService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    @Inject('AXIOS_INSTANCE') private readonly axiosInstance: AxiosInstance,
    @Inject('AXIOS_ATTACH_INFO')
    private readonly axiosAttachInfo: { cookies: string; crumb: string },
    private readonly circuitBreakerService: CircuitBreakerService,
  ) {}

  onModuleInit() {
    this.circuitBreakerService.createCircuitBreaker(
      'axios.getInitCookies',
      () => this.getInitCookiesBase(),
      undefined,
      () => false,
    );
    this.circuitBreakerService.createCircuitBreaker(
      'axios.getCrumb',
      () => this.getCrumbBase(),
      undefined,
      () => false,
    );
    this.circuitBreakerService.createCircuitBreaker(
      'axios.getQuote',
      () => this.getQuoteBase(),
      undefined,
      () => false,
    );
  }

  private async getInitCookiesBase() {
    await this.axiosInstance.get(
      this.configService.get<string>(
        'YAHOO_BASE_URL',
        'https://www.yahoo.com/',
      ),
      {
        headers: config.axios.baseHeaders,
      },
    );
  }

  private async getCrumbBase() {
    return await this.axiosInstance.get(
      this.configService.get<string>(
        'YAHOO_CRUMB_URL',
        'https://query2.finance.yahoo.com/v1/test/getcrumb',
      ),
    );
  }

  private async getQuoteBase() {
    return await this.axiosInstance.get(
      `${this.configService.get<string>(
        'YAHOO_QUOTE_SUMMARY_URL',
        'https://query2.finance.yahoo.com/v11/finance/quoteSummary/?',
      )}modules=price,summaryDetail,defaultKeyStatistics&crumb=${this.axiosAttachInfo.crumb}&symbols=${config.symbols.join(',')}`,
    );
  }

  async getInitCookies() {
    return await this.circuitBreakerService.exec<AxiosResponse<void> | false>(
      'axios.getInitCookies',
    );
  }

  async getCrumb() {
    return await this.circuitBreakerService.exec<AxiosResponse<string> | false>(
      'axios.getCrumb',
    );
  }

  async getQuote() {
    return await this.circuitBreakerService.exec<
      AxiosResponse<QuoteSummaryResponse> | false
    >('axios.getQuote');
  }
}
