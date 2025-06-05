import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyHelmet from '@fastify/helmet';
import fastifyCompress from '@fastify/compress';
import fastifyStatic from '@fastify/static';
import { ResponseFormatFilter } from './common/filters/response-format.filter';
import { ResponseFormatInterceptor } from './common/interceptors/response-format.interceptor';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useGlobalFilters(new ResponseFormatFilter());
  app.useGlobalInterceptors(new ResponseFormatInterceptor());
  app.enableCors();

  await app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'https://cdnjs.cloudflare.com',
        ],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'ws:', 'wss:'],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
      },
    },
  });
  await app.register(fastifyCompress, { encodings: ['gzip', 'deflate'] });
  await app.register(fastifyStatic, {
    root: join(__dirname, '..', '..', 'src', 'static'),
    prefix: '/static',
  });

  await app.listen(8080, '0.0.0.0');
}
void bootstrap();
