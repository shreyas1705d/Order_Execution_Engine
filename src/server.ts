import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import fastify from "fastify";
import fastifyStatic from "@fastify/static";
import path from "path";
import { initDb } from "./db";
import "./queue"; // starts worker
import { createWebsocket } from "./ws/websocket";
import ordersRoute from "./routes/orders";


// GLOBAL ERROR LOGGING
process.on("unhandledRejection", (reason: any) => {
  console.error("UNHANDLED REJECTION:", reason);

  if (reason instanceof AggregateError) {
    console.error("💥 AggregateError contains:", reason.errors.length, "sub-errors:");
    reason.errors.forEach((err: any, i: number) => {
      console.error(`-- suberror[${i}] --`);
      console.error(err?.stack || err);
    });
  }
});

process.on("uncaughtException", (err: any) => {
  console.error("UNCAUGHT EXCEPTION:", err?.stack || err);
  process.exit(1);
});

const server = fastify();

// Enable CORS for frontend
server.addHook('onRequest', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type');
  if (request.method === 'OPTIONS') {
    reply.code(200).send();
  }
});

const port = Number(process.env.PORT || 3000);

async function start() {
  try {
    console.log("📡 Initializing database connection...");
    await initDb();
    await server.register(import('@fastify/websocket'));
    createWebsocket(server);

    // Serve static frontend files
    await server.register(fastifyStatic, {
      root: path.join(__dirname, '../frontend'),
      prefix: '/',
    });

    await server.register(ordersRoute, { prefix: "/orders" });
    await server.listen({ port, host: "0.0.0.0" });
    console.log(`🚀 Server listening on ${port}`);
  } catch (err: any) {
    console.error("❌ STARTUP ERROR:", err?.stack || err);

    if (err instanceof AggregateError) {
      console.error("💥 AggregateError details:");
      err.errors.forEach((e: any, i: number) => {
        console.error(`suberror[${i}] =>`, e?.stack || e);
      });
    }

    process.exit(1);
  }
}


start();
