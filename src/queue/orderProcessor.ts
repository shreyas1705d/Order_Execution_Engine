import { Job } from "bullmq";
import { Order } from "../models/order";
import { MockDexRouter } from "../services/mockDex";
import { emitWsUpdate } from "../ws/emit";
import { saveOrderStatus } from "../db";

const dex = new MockDexRouter();

export default async function processor(job: Job<Order>) {
  const order = job.data;
  const id = order?.orderId || "unknown-id";

  console.log(`[processor] start orderId=${id}`);

  try {
    console.log(`[processor] emit pending for ${id}`);
    await emitWsUpdate(id, "pending", { stage: "received" });
    console.log(`[processor] save pending for ${id}`);
    await saveOrderStatus(id, "pending", { order });

    console.log(`[processor] fetching quotes for ${id}`);
    await emitWsUpdate(id, "routing", { stage: "fetching-quotes" });
    const quotes = await dex.getQuotes(order);
    console.log(`[processor] quotes for ${id}:`, quotes?.length ?? 0);

    if (!quotes || quotes.length === 0) {
      throw new Error("No quotes returned from DEX router");
    }

    const best = dex.pickBest(quotes);
    console.log(`[processor] picked best for ${id}:`, best?.source);

    console.log(`[processor] emit building for ${id}`);
    await emitWsUpdate(id, "building", { route: best.source, quotes });
    await saveOrderStatus(id, "building", { route: best.source });

    console.log(`[processor] executing swap for ${id}`);
    const execResult = await dex.executeSwap(best.source, order);
    console.log(`[processor] exec result for ${id}:`, execResult);

    console.log(`[processor] emit submitted for ${id}`);
    await emitWsUpdate(id, "submitted", { txHash: execResult.txHash });
    await saveOrderStatus(id, "submitted", { txHash: execResult.txHash });

    console.log(`[processor] emit confirmed for ${id}`);
    await emitWsUpdate(id, "confirmed", {
      txHash: execResult.txHash,
      executedPrice: execResult.executedPrice
    });
    await saveOrderStatus(id, "confirmed", {
      txHash: execResult.txHash,
      executedPrice: execResult.executedPrice
    });

    console.log(`[processor] finish orderId=${id}`);
    return { ok: true, txHash: execResult.txHash };
  } catch (err: any) {
    console.error(`[processor] error for ${id}:`, err);
    const message = err?.message || String(err);

    try {
      console.log(`[processor] emit failed for ${id}`);
      await emitWsUpdate(id, "failed", { error: message });
    } catch (e) {
      console.error(`[processor] emit failed error for ${id}:`, e);
    }

    try {
      console.log(`[processor] save failed for ${id}`);
      await saveOrderStatus(id, "failed", { error: message });
    } catch (e) {
      console.error(`[processor] save failed error for ${id}:`, e);
    }

    throw err;
  }
}
