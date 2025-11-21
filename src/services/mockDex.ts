import { sleep } from '../utils/sleep';

export class MockDexRouter{
  async getQuotes(order:any){
    await sleep(200);
    const basePrice = 100;
    return [
      { source: 'raydium', price: basePrice * (0.98 + Math.random()*0.04), fee: 0.003 },
      { source: 'meteora', price: basePrice * (0.97 + Math.random()*0.05), fee: 0.002 }
    ];
  }
  pickBest(quotes:any[]){
    return quotes.reduce((a,b)=> a.price < b.price ? a : b);
  }
  async executeSwap(dex:string, order:any){
    await sleep(2000 + Math.random()*1000);
    const txHash = 'mocktx_'+Math.random().toString(36).slice(2,12);
    const executedPrice = (100 * (0.95 + Math.random()*0.1));
    return { txHash, executedPrice };
  }
}
