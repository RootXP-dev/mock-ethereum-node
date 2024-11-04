export interface SingleResponse {
  jsonrpc: string
  id: number
  result?: any
  error?: {
    code: number
    message: string
    data: string
  }
}

