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
  namespace: '/inventory',
})
export class InventoryGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(InventoryGateway.name);

  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to inventory websocket: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(
      `Client disconnected from inventory websocket: ${client.id}`,
    );
  }

  broadcastUnitStatusChange(unitId: string, status: string, details?: any) {
    if (this.server) {
      this.server.emit('inventory:status_changed', {
        unitId,
        status,
        timestamp: new Date().toISOString(),
        details,
      });
      this.logger.log(
        `[WebSocket Broadcast] inventory:status_changed -> Unit ${unitId} is now ${status}`,
      );
    }
  }

  broadcastReservationEvent(type: string, payload: any) {
    if (this.server) {
      this.server.emit(`reservation:${type}`, {
        ...payload,
        timestamp: new Date().toISOString(),
      });
      this.logger.log(`[WebSocket Broadcast] reservation:${type}`);
    }
  }
}
