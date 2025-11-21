import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function initDb(){
  const client = await pool.connect();
  try{
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        order_id TEXT PRIMARY KEY,
        token_in TEXT,
        token_out TEXT,
        amount NUMERIC,
        slippage NUMERIC,
        status TEXT,
        meta JSONB,
        created_at TIMESTAMP WITH TIME ZONE
      );
    `);
  } finally {
    client.release();
  }
}

export async function saveOrderStatus(orderId: string, status: string, meta?: any){
  const client = await pool.connect();
  try{
    // upsert
    await client.query(
      `INSERT INTO orders(order_id, status, meta, created_at)
       VALUES($1, $2, $3, now())
       ON CONFLICT (order_id) DO
         UPDATE SET status = $2, meta = $3;`,
       [orderId, status, meta ? JSON.stringify(meta) : null]
    );
  } finally {
    client.release();
  }
}

export { pool as dbPool };
