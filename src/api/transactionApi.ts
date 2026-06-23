import type { Transaction } from '@/types/Transaction'
import api from './axios'

export async function createTransaction(
  portfolioId: number,
  cryptoId: string,
  amountUsd: number,
  date: Date,
  type: 'BUY' | 'SELL',
): Promise<Transaction> {
  const response = await api.post<Transaction>('/transaction', {
    portfolioId,
    cryptoId,
    amountUsd,
    date: date.toISOString(),
    type,
  })

  return response.data
}
