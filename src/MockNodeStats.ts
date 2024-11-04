
export interface TransactionData {
  rawTransaction: string
  hash: string
}

export class MockNodeStats {
  public sentTransactions: TransactionData[]

  constructor() {
    this.sentTransactions = []
  }
}
