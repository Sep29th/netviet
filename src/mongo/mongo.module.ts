import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Indices, IndicesSchema } from './schemas/indices.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'),
        autoCreate: true,
      }),
    }),
    MongooseModule.forFeature([
      {
        name: Indices.name,
        schema: IndicesSchema,
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class MongoModule {}
