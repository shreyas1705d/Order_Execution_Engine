// scripts/inspectQueue.ts
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

async function main(){
  const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  });
  const q = new Queue(process.env.QUEUE_NAME || 'order-execution-queue', { connection });
  const counts = await q.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed');
  console.log('jobCounts', counts);
  const waiting = await q.getJobs(['waiting'], 0, 50);
  console.log('waiting jobs:', waiting.map(j => ({ id: j.id, data: j.data })));
  const active = await q.getJobs(['active'], 0, 50);
  console.log('active jobs:', active.map(j => ({ id: j.id, data: j.data })));
  await connection.quit();
}
main().catch(e => { console.error(e); process.exit(1); });
