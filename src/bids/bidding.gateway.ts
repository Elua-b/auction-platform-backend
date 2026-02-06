import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class BiddingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger: Logger = new Logger('BiddingGateway');

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinAuction')
    handleJoinAuction(client: Socket, auctionId: string) {
        client.join(`auction:${auctionId}`);
        this.logger.log(`Client ${client.id} joined auction ${auctionId}`);
    }

    @SubscribeMessage('leaveAuction')
    handleLeaveAuction(client: Socket, auctionId: string) {
        client.leave(`auction:${auctionId}`);
        this.logger.log(`Client ${client.id} left auction ${auctionId}`);
    }

    @SubscribeMessage('joinEvent')
    handleJoinEvent(client: Socket, eventId: string) {
        client.join(`event:${eventId}`);
        this.logger.log(`Client ${client.id} joined event ${eventId}`);
    }

    @SubscribeMessage('leaveEvent')
    handleLeaveEvent(client: Socket, eventId: string) {
        client.leave(`event:${eventId}`);
        this.logger.log(`Client ${client.id} left event ${eventId}`);
    }

    broadcastBid(data: { auctionId?: string; eventProductId?: string; bid: any }) {
        if (data.auctionId) {
            this.server.to(`auction:${data.auctionId}`).emit('bidPlaced', data.bid);
        } else if (data.eventProductId) {
            this.server.emit('liveBidPlaced', data.bid);
        }
    }

    broadcastAuctionEnded(auctionId: string, data: { winner: any; status: string }) {
        this.server.to(`auction:${auctionId}`).emit('auctionEnded', data);
    }

    broadcastAuctionStatusChange(auctionId: string, data: { status: string; startTime: Date; endTime: Date }) {
        this.server.to(`auction:${auctionId}`).emit('auctionStatusChanged', data);
    }

    broadcastEventUpdate(eventId: string, update: any) {
        this.server.to(`event:${eventId}`).emit('eventUpdate', update);
    }
}
