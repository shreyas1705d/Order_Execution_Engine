# Order Execution Engine

A real-time order execution engine with WebSocket-based tracking, built with TypeScript, Fastify, BullMQ, PostgreSQL, and Redis.

## Features

- 🚀 **Real-time Order Tracking** - WebSocket updates for live order status
- 💱 **Token Swaps** - Execute token swaps with multiple DEX providers
- 📊 **Order History** - Persistent order tracking with localStorage
- 🎨 **Beautiful UI** - Modern dark theme with glassmorphism effects
- ⚡ **Fast & Reliable** - BullMQ for job processing, Redis for caching
- 🔄 **Auto-retry** - Automatic retry logic for failed orders

## Tech Stack

**Backend:**
- TypeScript
- Fastify (HTTP server)
- BullMQ (Job queue)
- PostgreSQL (Database)
- Redis (Cache & Queue)
- WebSocket (Real-time updates)

**Frontend:**
- HTML5
- CSS3 (Glassmorphism, animations)
- Vanilla JavaScript
- WebSocket client

## Prerequisites

- Node.js 18+ or pnpm
- PostgreSQL 14+
- Redis 6+

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/shreyas1705d/Order_Execution_Engine.git
cd Order_Execution_Engine
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/order_exec_db

# Redis
REDIS_URL=redis://localhost:6379

# Solana (optional for testing)
RPC_URL=https://api.mainnet-beta.solana.com
WALLET_PRIVATE_KEY=your_wallet_private_key_here
```

### 4. Start PostgreSQL and Redis

**Using Docker Compose (Recommended):**

```bash
docker-compose up -d
```

**Or manually:**
- Start PostgreSQL on port 5432
- Start Redis on port 6379

### 5. Run the Application

**Development mode:**

```bash
pnpm dev
```

**Production build:**

```bash
pnpm build
pnpm start
```

### 6. Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```

- **Frontend**: `http://localhost:3000`
- **API**: `http://localhost:3000/orders/execute`
- **WebSocket**: `ws://localhost:3000/ws/orders/{orderId}`

## Usage

### Submit an Order

1. Open `http://localhost:3000` in your browser
2. Select tokens (e.g., USDT → ETH)
3. Enter amount (e.g., 100)
4. Click "Execute Order"
5. Watch real-time status updates!

### API Example

```bash
curl -X POST http://localhost:3000/orders/execute \
  -H "Content-Type: application/json" \
  -d '{
    "tokenIn": "USDT",
    "tokenOut": "ETH",
    "amount": 100
  }'
```

Response:
```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### WebSocket Connection

```javascript
const ws = new WebSocket('ws://localhost:3000/ws/orders/550e8400-e29b-41d4-a716-446655440000');

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log('Status:', update.status, 'Data:', update.data);
};
```

## Project Structure

```
order-exec-engine/
├── src/
│   ├── db/              # Database connection
│   ├── models/          # Data models
│   ├── queue/           # BullMQ job processing
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── ws/              # WebSocket handlers
│   └── server.ts        # Main server file
├── frontend/
│   ├── index.html       # Frontend UI
│   ├── styles.css       # Styling
│   └── app.js           # Frontend logic
├── railway.json         # Railway config
├── Procfile            # Process definition
└── docker-compose.yml  # Docker services
```

## Order Status Flow

1. **pending** - Order received
2. **fetching_quotes** - Getting quotes from DEX
3. **building** - Building transaction
4. **submitted** - Transaction submitted to blockchain
5. **confirmed** - Transaction confirmed
6. **completed** - Order successfully executed
7. **failed** - Order failed (with error details)

## Development

### Run Tests

```bash
pnpm test
```

### Build TypeScript

```bash
pnpm build
```

### Inspect Queue

```bash
pnpm ts-node scripts/inspectQueue.ts
```

## Deployment

### Railway (Recommended)

See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy:**

1. Push to GitHub ✅ (Done!)
2. Go to [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select this repository
5. Add PostgreSQL and Redis databases
6. Set environment variables
7. Deploy!

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL=<provided by Railway>
REDIS_URL=<provided by Railway>
RPC_URL=<your Solana RPC>
WALLET_PRIVATE_KEY=<your wallet key>
```

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check connection
psql -h localhost -U postgres -d order_exec_db
```

### Redis Connection Issues

```bash
# Check Redis is running
docker ps | grep redis

# Test connection
redis-cli ping
```

### Build Errors

```bash
# Clean and rebuild
rm -rf dist node_modules
pnpm install
pnpm build
```

## API Documentation

### POST /orders/execute

Execute a new order.

**Request:**
```json
{
  "tokenIn": "USDT",
  "tokenOut": "ETH",
  "amount": 100
}
```

**Response:**
```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### WebSocket /ws/orders/:orderId

Real-time order updates.

**Messages:**
```json
{
  "status": "fetching_quotes",
  "data": {
    "message": "Fetching quotes from DEX providers",
    "provider": "Jupiter"
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - feel free to use this project for learning or production!

## Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/shreyas1705d/Order_Execution_Engine/issues)
- **Documentation**: See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)

## Screenshots

### Frontend Interface
Beautiful dark theme with real-time order tracking and glassmorphism effects.

### Order Tracking
Live WebSocket updates showing order progress through the execution pipeline.

---

**Built with ❤️ using TypeScript, Fastify, and modern web technologies**
