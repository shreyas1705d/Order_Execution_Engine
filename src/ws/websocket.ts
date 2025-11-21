
import { FastifyInstance } from 'fastify';
import { bindSocket } from './emit';

export function createWebsocket(server: FastifyInstance) {
  server.get('/ws/orders/:orderId', { websocket: true }, (connection, req) => {
    const { orderId } = req.params as any;
    console.log(`🔌 WebSocket connected for orderId: ${orderId}`);
    bindSocket(orderId, connection.socket as any);
    connection.socket.send(JSON.stringify({ message: 'connected', orderId }));
  });
}
