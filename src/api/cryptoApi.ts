import type { CryptoMarketDataDto } from '@/types/CryptoMarketDataDto'
import api from './axios'

export async function getCryptoOverview(): Promise<CryptoMarketDataDto[]> {
  const response = await api.get<CryptoMarketDataDto[]>('/crypto/market')
  return response.data
}
