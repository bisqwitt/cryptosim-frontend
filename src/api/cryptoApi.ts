import type { CryptoHistoricalData } from '@/types/CryptoHistoricalData'
import type { CryptoMarketData } from '@/types/CryptoMarketData'
import type { CryptoPrice } from '@/types/CryptoPrice'
import api from './axios'

export async function getCryptoOverview(): Promise<CryptoMarketData[]> {
  const response = await api.get<CryptoMarketData[]>('/crypto/market')
  return response.data
}

export async function getCryptoMarketData(cryptoId: string): Promise<CryptoMarketData> {
  const response = await api.get<CryptoMarketData>(`/crypto/${cryptoId}`)
  return response.data
}

export async function getCryptoPrice(cryptoId: string, date?: Date): Promise<CryptoPrice> {
  const response = await api.get<CryptoPrice>(`/crypto/${cryptoId}/price`, {
    params: date
      ? {
          date: date.toISOString().split('T')[0],
        }
      : undefined,
  })

  return response.data
}

export async function getHistoricalCryptoData(cryptoId: string): Promise<CryptoHistoricalData> {
  const response = await api.get<CryptoHistoricalData>(`/crypto/${cryptoId}/history`)
  return response.data
}
