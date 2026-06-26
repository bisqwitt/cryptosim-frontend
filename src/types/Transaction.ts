export interface Transaction {
  id: number
  portfolioId: number
  cryptoId: number
  amountUsd: number
  amountCrypto: number
  type: 'BUY' | 'SELL'
  date: Date
}
