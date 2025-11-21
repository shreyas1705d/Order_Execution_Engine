# Order Execution Engine (Production-ready TypeScript scaffold)

This is a production-ready scaffold for the Order Execution Engine (mock DEX).
It includes:
- Fastify HTTP + WebSocket endpoint
- BullMQ queue worker with concurrency
- Mock DEX router that simulates Raydium/Meteora quotes and swaps
- PostgreSQL (orders persistence) and Redis (queue)
- Scripts to develop, build, run, and test

Quick start:
1. Copy `.env.example` to `.env` and adjust values
2. Start dependencies: `docker compose up -d`
3. Install: `pnpm install` or `npm install`
4. Dev: `pnpm dev`  (requires pnpm globally or use npm scripts)
5. Build: `pnpm build` then `pnpm start`

API:
- POST /api/orders/execute  -> { orderId }
- WebSocket: ws://localhost:3000/ws/orders/{orderId}

