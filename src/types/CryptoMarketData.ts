export interface CryptoMarketData {
  id: string
  name: string
  symbol: string

  currentPrice: number | null
  priceChangePercentage24h: number | null
  priceChangePercentage7d: number | null
  marketCap: number | null
  totalVolume: number | null
}
