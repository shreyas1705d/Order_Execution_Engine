# Railway Deployment Guide

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Account**: Your code should be in a GitHub repository
3. **Railway CLI** (optional): `npm install -g @railway/cli`

## Step 1: Prepare Your Project

Your project is already configured with:
- ✅ `railway.json` - Railway configuration
- ✅ `Procfile` - Process definition
- ✅ `package.json` - Build and start scripts

## Step 2: Push to GitHub

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Prepare for Railway deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

## Step 3: Create Railway Project

### Option A: Using Railway Dashboard (Recommended)

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Railway will automatically detect your Node.js app

### Option B: Using Railway CLI

```bash
# Login to Railway
railway login

# Initialize project
railway init

# Link to your project
railway link
```

## Step 4: Add Services

Railway will create your main service automatically. Now add databases:

### Add PostgreSQL

1. In your Railway project dashboard
2. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically create a `DATABASE_URL` environment variable

### Add Redis

1. Click **"+ New"** → **"Database"** → **"Add Redis"**
2. Railway will automatically create a `REDIS_URL` environment variable

## Step 5: Configure Environment Variables

In your Railway service settings, add these variables:

```env
# Automatically provided by Railway
DATABASE_URL=<automatically set by PostgreSQL service>
REDIS_URL=<automatically set by Redis service>
PORT=3000

# Add these manually
NODE_ENV=production
RPC_URL=<your Solana RPC URL>
WALLET_PRIVATE_KEY=<your wallet private key>
```

### How to Add Variables:

1. Click on your service
2. Go to **"Variables"** tab
3. Click **"+ New Variable"**
4. Add each variable name and value
5. Click **"Add"**

## Step 6: Deploy

Railway will automatically deploy when you push to GitHub!

```bash
git add .
git commit -m "Deploy to Railway"
git push
```

Or trigger manual deployment:
1. Go to your service in Railway dashboard
2. Click **"Deploy"** → **"Trigger Deploy"**

## Step 7: Access Your Application

Once deployed:
1. Go to your service in Railway dashboard
2. Click **"Settings"** → **"Generate Domain"**
3. Railway will provide a public URL like: `https://your-app.up.railway.app`

Your frontend will be accessible at: `https://your-app.up.railway.app`
Your API will be at: `https://your-app.up.railway.app/orders/execute`

## Step 8: Update Frontend API URLs

After deployment, you need to update the frontend to use your Railway URL instead of localhost.

Edit `frontend/app.js`:

```javascript
// Change from:
const API_BASE_URL = 'http://localhost:3000';
const WS_BASE_URL = 'ws://localhost:3000';

// To:
const API_BASE_URL = 'https://your-app.up.railway.app';
const WS_BASE_URL = 'wss://your-app.up.railway.app';
```

Then commit and push:
```bash
git add frontend/app.js
git commit -m "Update API URLs for production"
git push
```

## Monitoring

### View Logs
```bash
railway logs
```

Or in the dashboard:
1. Click on your service
2. Go to **"Deployments"** tab
3. Click on the latest deployment
4. View real-time logs

### Check Metrics
- CPU usage
- Memory usage
- Network traffic

All available in the Railway dashboard under **"Metrics"** tab.

## Troubleshooting

### Build Fails
- Check logs in Railway dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compiles: `npm run build`

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly
- Check PostgreSQL service is running
- Review connection logs

### Redis Connection Issues
- Verify `REDIS_URL` is set correctly
- Check Redis service is running

### WebSocket Not Working
- Ensure you're using `wss://` (not `ws://`) for production
- Check CORS settings in `server.ts`

## Cost Estimate

Railway Pricing (as of 2024):
- **Hobby Plan**: $5/month
  - Includes $5 credit
  - Pay for what you use beyond credit
- **Typical usage for this app**: ~$5-10/month
  - Web service: ~$5/month
  - PostgreSQL: Included
  - Redis: Included

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Create Railway project
3. ✅ Add PostgreSQL and Redis
4. ✅ Configure environment variables
5. ✅ Deploy
6. ✅ Generate domain
7. ✅ Update frontend URLs
8. ✅ Test your live application!

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app

---

**Your app is now live and accessible worldwide! 🚀**
