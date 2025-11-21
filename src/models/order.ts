export type OrderStatus = 'pending'|'routing'|'building'|'submitted'|'confirmed'|'failed';

export interface Order {
  orderId: string;
  tokenIn: string;
  tokenOut: string;
  amount: number;
  slippage?: number;
  createdAt?: string;
  status?: OrderStatus;
}
