import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import fastifyHelmet from '@fastify/helmet';
import fastifyCompress from '@fastify/compress';
import { ResponseFormatFilter } from './common/filters/response-format.filter';
import { ResponseFormatInterceptor } from './common/interceptors/response-format.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const configService = app.get(ConfigService);

  app.useGlobalFilters(new ResponseFormatFilter());
  app.useGlobalInterceptors(new ResponseFormatInterceptor());
  app.enableCors();
  app.setGlobalPrefix('api');

  await app.register(fastifyHelmet);
  await app.register(fastifyCompress, { encodings: ['gzip', 'deflate'] });

  await app.listen(
    configService.get<string>('PORT', '3000'),
    configService.get<string>('HOST', 'localhost'),
  );
}
void bootstrap();
