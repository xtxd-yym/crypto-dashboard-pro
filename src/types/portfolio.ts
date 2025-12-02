export interface PortfolioItem {
  id: string;        // Unique ID for this specific holding entry
  coinId: string;    // Link to the Market coin (e.g., "bitcoin")
  quantity: number;  // How many coins owned
  purchasePrice: number; // Price at which it was bought (for P/L calc)
}

export interface PortfolioState {
  items: PortfolioItem[];
  addItem: (item: Omit<PortfolioItem, 'id'>) => void;
  removeItem: (id: string) => void;
  getTotalValue: (currentPrices: Record<string, number>) => number;
}