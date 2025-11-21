import { describe, it, expect } from 'vitest';
import { MockDexRouter } from '../services/mockDex';

describe('mock dex', () => {
  it('returns quotes and picks best', async () => {
    const dex = new MockDexRouter();
    const quotes = await dex.getQuotes({ tokenIn: 'USDC', tokenOut: 'RAY', amount: 100 });
    expect(quotes.length).toBeGreaterThan(0);
    const best = dex.pickBest(quotes);
    expect(best).toHaveProperty('price');
  });
});
