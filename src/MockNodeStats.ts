import {ethers, keccak256} from "ethers";

export interface TransactionData {
  rawTransaction: string
  payload: {
    type: number | null
    to: string | null
    data: string
    nonce: number
    gasLimit: bigint
    gasPrice: bigint | null
    maxPriorityFeePerGas: bigint | null
    maxFeePerGas: bigint | null
    value: bigint
    chainId: bigint
    from: string | null
  }
  hash: string
  contract?: {
    method: string
    parameters: any[]
  }
}

export class MockNodeStats {
  public sentTransactions: TransactionData[]

  constructor() {
    this.sentTransactions = []
  }

  public addTransaction(rawTransaction: string): void {
    const transactionData = ethers.Transaction.from(rawTransaction)
    keccak256(rawTransaction).toString()
    this.sentTransactions.push({
      rawTransaction: rawTransaction,
      hash: keccak256(rawTransaction).toString(),
      payload: {
        chainId: transactionData.chainId,
        from: transactionData.from,
        to: transactionData.to,
        gasLimit: transactionData.gasLimit,
        gasPrice: transactionData.gasPrice,
        data: transactionData.data,
        maxFeePerGas: transactionData.maxFeePerGas,
        nonce: transactionData.nonce,
        value: transactionData.value,
        maxPriorityFeePerGas: transactionData.maxPriorityFeePerGas,
        type: transactionData.type,
      },
    })
  }

  public getDecodedTransactions(contractAddress: string, abi: string[]): TransactionData[] {
    const iface = new ethers.Interface(abi)
    const result: TransactionData[] = []
    const contractTransactions = this.sentTransactions.filter(
      (transaction) => transaction.payload.to?.toLowerCase() === contractAddress.toLowerCase()
    )
    for (const transaction of contractTransactions) {
      const functionSelector = transaction.payload.data.slice(0, 10)
      const functionFragment = iface.getFunction(functionSelector)
      if (!functionFragment) {
        continue
      }

      const decodedData = iface.decodeFunctionData(functionFragment, transaction.payload.data)
      transaction.contract = {
        method: functionFragment.name,
        parameters: decodedData,
      }
      result.push(transaction)
    }

    return result
  }
}
