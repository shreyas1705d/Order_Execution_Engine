# Railway Deployment with Aiven Databases

## Configuration Updated ✅

Your project is now configured for Railway deployment with:
- ✅ **pnpm** package manager
- ✅ Backend-only deployment
- ✅ External Aiven databases (PostgreSQL + Redis)

## Environment Variables for Railway

Since you're using Aiven for databases, you need to set these environment variables in Railway:

### Required Variables

```env
# Node Environment
NODE_ENV=production
PORT=3000

# Aiven PostgreSQL Connection
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# Aiven Redis Connection  
REDIS_URL=rediss://username:password@host:port

# Solana Configuration (if needed)
RPC_URL=https://api.mainnet-beta.solana.com
WALLET_PRIVATE_KEY=your_wallet_private_key_here
```

### Getting Aiven Connection Strings

1. **PostgreSQL**:
   - Go to your Aiven PostgreSQL service
   - Copy the **Service URI** (starts with `postgresql://`)
   - Make sure it includes `?sslmode=require` at the end

2. **Redis**:
   - Go to your Aiven Redis service
   - Copy the **Service URI** (starts with `rediss://` for SSL)

## Deployment Steps

### 1. Push Updated Files to GitHub

```bash
git add railway.json Procfile .npmrc
git commit -m "Configure for Railway deployment with pnpm and Aiven"
git push
```

### 2. Deploy on Railway

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose `Order_Execution_Engine` repository
6. Railway will detect the configuration and start building

### 3. Set Environment Variables

In Railway dashboard:

1. Click on your service
2. Go to **"Variables"** tab
3. Click **"+ New Variable"**
4. Add each variable:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = `<your Aiven PostgreSQL URI>`
   - `REDIS_URL` = `<your Aiven Redis URI>`
   - `RPC_URL` = `<your Solana RPC URL>`
   - `WALLET_PRIVATE_KEY` = `<your wallet key>`

### 4. Generate Public Domain

1. Go to **"Settings"** tab
2. Click **"Generate Domain"**
3. You'll get a URL like: `https://your-app.up.railway.app`

### 5. Test Your Deployment

Once deployed, test:

**Frontend:**
```
https://your-app.up.railway.app
```

**API:**
```bash
curl -X POST https://your-app.up.railway.app/orders/execute \
  -H "Content-Type: application/json" \
  -d '{"tokenIn":"USDT","tokenOut":"ETH","amount":100}'
```

## Troubleshooting

### Build Fails

Check Railway logs:
- Ensure `pnpm-lock.yaml` is committed
- Verify `package.json` has all dependencies

### Database Connection Issues

- Verify `DATABASE_URL` includes `?sslmode=require`
- Check Aiven firewall allows Railway IPs
- Test connection string locally first

### Redis Connection Issues

- Ensure using `rediss://` (with double 's' for SSL)
- Verify Aiven Redis is running
- Check connection string format

## Local Testing with Aiven

To test locally with Aiven databases:

1. Update your local `.env`:
```env
DATABASE_URL=<your Aiven PostgreSQL URI>
REDIS_URL=<your Aiven Redis URI>
```

2. Run:
```bash
pnpm dev
```

## Cost Estimate

- **Railway**: ~$5-10/month (Hobby plan)
- **Aiven PostgreSQL**: Varies by plan
- **Aiven Redis**: Varies by plan

## Next Steps

1. ✅ Update configuration files (Done!)
2. Push to GitHub
3. Deploy on Railway
4. Set environment variables
5. Test your live application!

---

**Your backend will be live and accessible worldwide! 🚀**
