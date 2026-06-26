import type { HoldingOfPosition } from '@/types/HoldingOfPosition'
import type { Portfolio } from '@/types/Portfolio'
import type { PortfolioDetails } from '@/types/PortfolioDetails'
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

export async function updatePortfolio(id: number, newName: string): Promise<Portfolio> {
  const response = await api.patch<Portfolio>(`/portfolio/${id}`, {
    newName,
  })
  return response.data
}

export async function deletePortfolio(id: number): Promise<void> {
  const response = await api.delete(`/portfolio/${id}`)
  return response.data
}

export async function getPortfolioDetails(id: number) {
  const response = await api.get<PortfolioDetails>(`/portfolio/${id}`)
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
