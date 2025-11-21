// src/ws/emit.ts (use globalThis singleton)
const g: any = globalThis as any;
if (!g.__ORDER_SOCKET_MAP__) g.__ORDER_SOCKET_MAP__ = new Map<string, Set<WebSocket>>();
if (!g.__ORDER_EVENT_HISTORY__) g.__ORDER_EVENT_HISTORY__ = new Map<string, any[]>();
const sockets: Map<string, Set<WebSocket>> = g.__ORDER_SOCKET_MAP__;
const eventHistory: Map<string, any[]> = g.__ORDER_EVENT_HISTORY__;

export function bindSocket(orderId: string, socket: WebSocket) {
  let set = sockets.get(orderId);
  if (!set) {
    set = new Set<WebSocket>();
    sockets.set(orderId, set);
  }
  set.add(socket);
  console.log(`🔗 WebSocket bound to orderId: ${orderId} (total subscribers: ${set.size})`);

  // Replay event history to newly connected client
  const history = eventHistory.get(orderId) || [];
  console.log(`📜 Replaying ${history.length} events for orderId: ${orderId}`);
  
  for (const event of history) {
    try {
      const msg = JSON.stringify(event);
      console.log(`📤 Replaying event: ${msg.substring(0, 80)}...`);
      socket.send(msg);
    } catch (err) {
      console.error(`❌ Failed to replay event to ${orderId}:`, err);
    }
  }
  
  console.log(`✅ Finished replaying events for orderId: ${orderId}`);

  // Remove socket on disconnect
  socket.addEventListener('close', () => {
    set?.delete(socket);
    console.log(`🔌 WebSocket disconnected for orderId: ${orderId} (remaining: ${set?.size || 0})`);
  });
}

export function emitWsUpdate(orderId: string, status: string, meta: any = {}) {
  const payload = { orderId, status, meta, timestamp: new Date().toISOString() };
  
  // Store in history
  let history = eventHistory.get(orderId);
  if (!history) {
    history = [];
    eventHistory.set(orderId, history);
  }
  history.push(payload);
  console.log(`💾 Stored in history: ${status}`);

  const set = sockets.get(orderId);
  if (!set || set.size === 0) {
    console.log(`⚠ No active WebSocket for orderId: ${orderId} (cached for replay)`);
    return;
  }

  const msg = JSON.stringify(payload);
  console.log(`📣 Emitting to orderId=${orderId}: ${msg.substring(0, 80)}...`);

  for (const socket of set) {
    try {
      socket.send(msg);
    } catch (err) {
      console.error(`❌ Failed to send WebSocket message to ${orderId}:`, err);
    }
  }
}

export function clearEventHistory(orderId: string) {
  eventHistory.delete(orderId);
  console.log(`🧹 Cleared event history for orderId: ${orderId}`);
}
