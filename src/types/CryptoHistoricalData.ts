import type { CryptoHistoricalDataPoint } from './CryptoHistoricalDataPoint'

export interface CryptoHistoricalData {
  prices: CryptoHistoricalDataPoint[]
  market_caps: CryptoHistoricalDataPoint[]
  total_volumes: CryptoHistoricalDataPoint[]
}
