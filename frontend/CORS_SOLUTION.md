# CORS Issue and Solutions

## The Problem

The frontend (running on `http://localhost:8080`) cannot communicate with the backend (running on `http://localhost:3000`) due to **CORS (Cross-Origin Resource Sharing)** restrictions. This is a browser security feature that blocks requests between different origins.

## Solutions

### Option 1: Add CORS to Backend (Recommended - Minimal Change)

Add just 2 lines to your backend to enable CORS. This is the standard solution for web applications.

**File: `src/server.ts`**

Add this line after line 29 (after `const server = fastify();`):

```typescript
server.addHook('onRequest', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type');
  if (request.method === 'OPTIONS') {
    reply.code(200).send();
  }
});
```

Then restart your backend server with `pnpm dev`.

### Option 2: Use Browser Extension

Install a CORS browser extension like "CORS Unblock" or "Allow CORS" to temporarily disable CORS in your browser for testing.

### Option 3: Run Frontend and Backend on Same Port

Serve the frontend files directly from the backend server (requires backend modification to serve static files).

### Option 4: Use a Proxy

Create a simple proxy server that forwards requests from the frontend to the backend.

## Current Status

- ✅ Frontend is complete and beautiful
- ✅ Frontend code correctly targets the backend APIs
- ✅ Backend is running on port 3000
- ✅ Frontend is served on port 8080
- ❌ Browser blocks the connection due to CORS

## Quick Test (Option 1 - Recommended)

1. Add the CORS hook code above to `src/server.ts` after line 29
2. Restart backend: `pnpm dev`
3. Open `http://localhost:8080` in your browser
4. Submit an order and watch the real-time updates!

The CORS addition is minimal and doesn't change your backend logic - it just adds the necessary headers to allow browser requests.
