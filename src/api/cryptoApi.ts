import type { CryptoHistoricalData } from '@/types/CryptoHistoricalData'
import type { CryptoMarketData } from '@/types/CryptoMarketData'
import api from './axios'

export async function getCryptoOverview(): Promise<CryptoMarketData[]> {
  const response = await api.get<CryptoMarketData[]>('/crypto/market')
  return response.data
}

export async function getCrypto(cryptoId: string): Promise<CryptoMarketData> {
  const response = await api.get<CryptoMarketData>(`/crypto/${cryptoId}`)
  return response.data
}

export async function getHistoricalCryptoData(cryptoId: string): Promise<CryptoHistoricalData> {
  const response = await api.get<CryptoHistoricalData>(`/crypto/${cryptoId}/history`)
  return response.data
}
