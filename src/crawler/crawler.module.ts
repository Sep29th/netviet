import { DynamicModule } from '@nestjs/common';
import axios from 'axios';
import config from '../config';
import { CrawlerService } from './services/crawler.service';
import { AxiosCircuitBreakerService } from './services/axios-circuit-breaker.service';
import { ScheduleCrawService } from './services/schedule-craw.service';
import { IndicesModule } from 'src/indices/indices.module';
import { ConfigService } from '@nestjs/config';

export class CrawlerModule {
  static forRoot(): DynamicModule {
    return {
      module: CrawlerModule,
      imports: [IndicesModule],
      controllers: [],
      providers: [
        {
          provide: 'ANALYTICS_DATA',
          useValue: [],
        },
        {
          provide: 'AXIOS_ATTACH_INFO',
          useValue: { cookies: '', crumb: '' },
        },
        {
          provide: 'AXIOS_INSTANCE',
          inject: ['AXIOS_ATTACH_INFO', ConfigService],
          useFactory: (
            attachInfo: { cookies: string; crumb: string },
            configService: ConfigService,
          ) => {
            const axiosInstance = axios.create(config.axios);

            axiosInstance.interceptors.request.use(
              (config) => {
                if (attachInfo.cookies)
                  config.headers['Cookie'] = attachInfo.cookies;

                return config;
              },
              (error: Error) => Promise.reject(error),
            );

            axiosInstance.interceptors.response.use(
              (response) => {
                if (
                  response.config.url ==
                  configService.get<string>(
                    'YAHOO_BASE_URL',
                    'https://www.yahoo.com/',
                  )
                ) {
                  const setCookie = response.headers['set-cookie'];
                  if (setCookie) attachInfo.cookies = setCookie.join('; ');
                }

                return response;
              },
              (error: Error) => Promise.reject(error),
            );

            return axiosInstance;
          },
        },
        AxiosCircuitBreakerService,
        CrawlerService,
        ScheduleCrawService,
      ],
      exports: [AxiosCircuitBreakerService, 'ANALYTICS_DATA'],
    };
  }
}
