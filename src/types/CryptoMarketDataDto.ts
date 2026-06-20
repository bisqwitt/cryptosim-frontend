export interface CryptoMarketDataDto {
  id: string
  name: string
  symbol: string
  currentPrice: number
  priceChangePercentage24h: number
  priceChangePercentage7d: number
  marketCap: number
  totalVolume: number
}
