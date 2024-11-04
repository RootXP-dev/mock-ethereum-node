export interface SingleRequest {
  jsonrpc: string
  id: number
  method: string
  params: any[]
}
