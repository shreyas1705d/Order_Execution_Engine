import { FastifyPluginAsync } from 'fastify';
import { Job } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import { orderQueue } from '../queue';
import { Order } from '../models/order';
import { emitWsUpdate, clearEventHistory } from '../ws/emit';
import { MockDexRouter } from '../services/mockDex';

const ordersRoute: FastifyPluginAsync = async (server) => {
  server.post('/execute', async (req, reply) => {
    const body = req.body as any;
    if (!body || !body.tokenIn || !body.tokenOut || !body.amount) {
      return reply.code(400).send({ error: 'tokenIn, tokenOut, amount required' });
    }
    const order: Order = {
      orderId: uuidv4(),
      tokenIn: body.tokenIn,
      tokenOut: body.tokenOut,
      amount: Number(body.amount),
      slippage: body.slippage ?? 0.01,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    console.log('➡ Creating job for orderId:', order.orderId);
    const job = await orderQueue.add('execute-order', order, { attempts: 3, backoff: { type: 'exponential', delay: 500 } });
    console.log('✅ Job added:', { id: job.id, name: job.name, orderId: order.orderId });

    return reply.code(200).send({ orderId: order.orderId });
  });
};

export const processor = async (job: Job) => {
  const { orderId } = job.data;
  const dex = new MockDexRouter();

  try {
    console.log(`[processor] start orderId=${orderId}`);
    emitWsUpdate(orderId, 'pending', { message: 'Order received' });

    // Fetch quotes
    console.log(`[processor] fetching quotes for ${orderId}`);
    emitWsUpdate(orderId, 'fetching_quotes', { message: 'Fetching quotes...' });
    const quotes = await dex.getQuotes(job.data);
    console.log(`[processor] quotes for ${orderId}:`, quotes.length);

    // Pick best quote
    const best = dex.pickBest(quotes);
    console.log(`[processor] picked best for ${orderId}:`, best.source);
    emitWsUpdate(orderId, 'building', { provider: best.source, message: 'Building transaction...' });

    // Execute swap
    console.log(`[processor] executing swap for ${orderId}`);
    const result = await dex.executeSwap(best.source, job.data);
    emitWsUpdate(orderId, 'submitted', { txHash: result.txHash, message: 'Transaction submitted' });

    // Confirm
    emitWsUpdate(orderId, 'confirmed', { executedPrice: result.executedPrice, message: 'Order confirmed' });
    
    console.log(`[processor] finish orderId=${orderId}`);
    emitWsUpdate(orderId, 'completed', { message: 'Order completed successfully' });

    // Optional: cleanup after some time
    setTimeout(() => clearEventHistory(orderId), 60000);

    return { success: true };
  } catch (error) {
    emitWsUpdate(orderId, 'failed', { error: (error as Error).message });
    throw error;
  }
};

export default ordersRoute;
