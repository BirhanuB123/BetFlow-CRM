import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/calls',
})
export class CallsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(CallsGateway.name);

  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to calls websocket: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from calls websocket: ${client.id}`);
  }

  broadcastCallEvent(
    type: 'created' | 'updated' | 'completed' | 'deleted',
    payload: any,
  ) {
    if (this.server) {
      this.server.emit(`call:${type}`, {
        ...payload,
        timestamp: new Date().toISOString(),
      });
      this.logger.log(
        `[WebSocket Broadcast] call:${type} -> Call ID ${payload?.id || 'N/A'}`,
      );
    }
  }
}
