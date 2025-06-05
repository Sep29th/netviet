import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RecommendationMessage } from '../types/recommendation';

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

  broadcastToIndices(
    symbol: string,
    data: {
      indices: { name: string; currentPrice: number };
      analysis: {
        comparisonPercentage: null | number;
        recommendation: RecommendationMessage;
      };
    },
  ) {
    this.server.to(symbol).emit('indicesUpdate', data);
  }

  @SubscribeMessage('subscribeToIndices')
  async handleSubscribeToIndices(
    @MessageBody() symbol: string,
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(symbol);
  }

  @SubscribeMessage('unsubscribeFromIndices')
  async handleUnsubscribeFromIndices(
    @MessageBody() symbol: string,
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(symbol);
  }
}
