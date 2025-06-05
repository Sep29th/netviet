import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type IndicesDocument = HydratedDocument<Indices>;

@Schema({
  collection: 'indices',
  timestamps: true,
})
export class Indices {
  @Prop({ required: true, type: MongooseSchema.Types.String })
  symbol: string;

  @Prop({ required: true, type: MongooseSchema.Types.String })
  name: string;

  @Prop({ required: true, type: MongooseSchema.Types.String })
  currency: string;

  @Prop({ required: true, type: MongooseSchema.Types.Number })
  currentPrice: number;

  @Prop({ required: true, type: MongooseSchema.Types.Number })
  openPrice: number;

  @Prop({ required: true, type: MongooseSchema.Types.Number })
  hightPrice: number;

  @Prop({ required: true, type: MongooseSchema.Types.Number })
  lowPrice: number;

  @Prop({ required: true, type: MongooseSchema.Types.Number })
  changePercent: number;

  @Prop({ required: true, type: MongooseSchema.Types.Date })
  timestamp: Date;
}

export const IndicesSchema = SchemaFactory.createForClass(Indices);
IndicesSchema.index({ symbol: 1, timestamp: -1 }, { unique: true });
IndicesSchema.index({ timestamp: -1 });
