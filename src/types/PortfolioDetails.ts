import type { Portfolio } from './Portfolio'
import type { PortfolioPosition } from './PortfolioPosition'

export interface PortfolioDetails {
  portfolio: Portfolio
  positions: PortfolioPosition[]
}
