import { Queue, Worker, QueueEvents } from "bullmq";
import IORedis from "ioredis";
import processor from "./orderProcessor";

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

const queueName = process.env.QUEUE_NAME || "order-execution-queue";

export const orderQueue = new Queue(queueName, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 500 }
  }
});

let worker: Worker | null = null;

try {
  worker = new Worker(
    queueName,
    async (job) => {
      console.log(`🔨 Worker starting job ${job.id} orderId=${job.data?.orderId}`);
      const res = await processor(job);
      console.log(`🔨 Worker finished job ${job.id} orderId=${job.data?.orderId}`);
      return res;
    },
    {
      connection,
      concurrency: parseInt(process.env.CONCURRENCY || "10", 10),
      autorun: true
    }
  );

  worker.on('error', (err) => {
    console.error('Worker error:', err);
  });

  worker.on('completed', (job) => {
    console.log(`🎉 Worker completed job: ${job.id}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`💥 Worker failed job ${job?.id}:`, err);
  });

  console.log("🛠 Worker initialized");
} catch (err: any) {
  console.error("❌ Worker creation error:", err?.stack || err);
}

export const queueEvents = new QueueEvents(queueName, { connection });

queueEvents.on("completed", ({ jobId }) => {
  console.log(`🎉 QueueEvent: Job completed: ${jobId}`);
});

queueEvents.on("failed", ({ jobId, failedReason }) => {
  console.error(`💥 QueueEvent: Job failed: ${jobId}`, failedReason);
});
