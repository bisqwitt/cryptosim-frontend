import type { HoldingOfPosition } from './HoldingOfPosition'
import type { Transaction } from './Transaction'

export interface PortfolioPosition {
  cryptoId: string
  name: string
  symbol: string
  holding: HoldingOfPosition
  transactions: Transaction[]
}
