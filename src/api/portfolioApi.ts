import type { HoldingOfPosition } from '@/types/HoldingOfPosition'
import type { Portfolio } from '@/types/Portfolio'
import api from './axios'

export async function getAllPortfolios(): Promise<Portfolio[]> {
  const response = await api.get<Portfolio[]>('/portfolio/all')
  return response.data
}

export async function createPortfolio(name: string, credit: number): Promise<Portfolio> {
  const response = await api.post<Portfolio>('/portfolio', {
    name,
    credit,
  })
  return response.data
}

export async function getHoldingOfPosition(
  id: number,
  cryptoId: string,
  date?: Date,
): Promise<HoldingOfPosition> {
  const response = await api.get<HoldingOfPosition>(`/portfolio/${id}/${cryptoId}/holding`, {
    params: date
      ? {
          date: date.toISOString().split('T')[0],
        }
      : undefined,
  })

  return response.data
}
