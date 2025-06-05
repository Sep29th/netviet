import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RecommendationMessage } from '../types/recommendation';
import { IndicesService } from '../services/indices.service';
import { UseGuards } from '@nestjs/common';
import { SupportedSymbolsGuard } from '../guards/supported-symbols.guard';

@WebSocketGateway({
  namespace: 'indices',
  cors: {
    origin: '*',
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 30000,
  pingInterval: 10000,
})
export class IndicesGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly indicesService: IndicesService) {}

  broadcastToIndices(
    symbol: string,
    data: {
      indices: { name: string; currentPrice: number };
      analysis: {
        comparisonPercentage: string | number;
        recommendation: RecommendationMessage;
      };
    },
  ) {
    this.server.to(symbol).emit('indicesUpdate', data);
  }

  @UseGuards(SupportedSymbolsGuard)
  @SubscribeMessage('subscribeToIndices')
  async handleSubscribeToIndices(
    @MessageBody() symbol: string,
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(symbol);

    const currentData = this.indicesService.getAnalyticsDataWithIndice(symbol);

    client.emit('indicesUpdate', {
      indices: {
        name: currentData.name,
        currentPrice: currentData.currentPrice,
      },
      analysis: {
        comparisonPercentage: currentData.comparisonPercentage,
        recommendation: currentData.recommendation,
      },
    });
  }

  @SubscribeMessage('unsubscribeFromIndices')
  async handleUnsubscribeFromIndices(
    @MessageBody() symbol: string,
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(symbol);
  }
}
