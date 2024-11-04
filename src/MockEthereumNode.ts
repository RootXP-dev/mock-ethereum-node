import nock from 'nock'
import { keccak256 } from 'ethers';
import { SingleRequest } from './Requests.js'
import { SingleResponse } from './Response.js'
import { MockNodeStats } from './MockNodeStats.js';

export default class MockEthereumNode {
  private nockScope: nock.Scope

  public debug: boolean = true
  public chainId: number = 0
  public blockNumber: number = 0
  public stats: MockNodeStats

  constructor(private _url: string) {
    this.nockScope = nock(this._url)
    this.resetStats()
  }

  public static createNode(): MockEthereumNode {
    return new MockEthereumNode('http://chain.com')
  }

  get url(): string {
    return this._url
  }

  public start(): void {
    this.resetStats()
    this.nockScope
      .post('/')
      .reply(async (_, body) => {
        const response = await this.handleIncomingRequest(body)
        return [
          200,
          response,
          {
            'Content-Type': 'application/json',
          },
        ]
      })
      .persist()
  }

  public resetStats(): void {
    this.stats = new MockNodeStats()
  }

  private async handleIncomingRequest(payload: any): Promise<SingleResponse | SingleResponse[]> {
    if (payload.length) {
      const result: SingleResponse[] = []
      for (const request of payload) {
        result.push(await this.handleSingleRequest(request as SingleRequest))
      }
      return result
    }

    return await this.handleSingleRequest(payload as SingleRequest)
  }

  private async handleSingleRequest(body: SingleRequest): Promise<SingleResponse> {
    const response: SingleResponse = {
      result: null,
      jsonrpc: '2.0',
      id: body.id,
    }
    switch (body.method) {
      case 'eth_chainId': {
        response.result = `0x${this.chainId.toString(16)}`
        break
      }
      case 'eth_getTransactionCount': {
        response.result = `0x${this.chainId.toString(16)}`
        break
      }
      case 'eth_estimateGas': {
        response.result = `0x${this.chainId.toString(16)}`
        break
      }
      case 'eth_blockNumber': {
        response.result = `0x${this.blockNumber.toString(16)}`
        break
      }
      case 'eth_getBlockByNumber': {
        response.result = {
          baseFeePerGas: '0x1',
          difficulty: '0x1',
          extraData: '0xd883010a12846765746888676f312e31382e32856c696e7578',
          gasLimit: '0x1',
          gasUsed: '0x0',
          hash: '0x1111111111111111111111111111111111111111111111111111111111111111',
          logsBloom: '0x',
          miner: '0x1111111111111111111111111111111111111111',
          mixHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
          nonce: '0x7898278367281387',
          number: '0x1',
          parentHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
          receiptsRoot: '0x1111111111111111111111111111111111111111111111111111111111111111',
          sha3Uncles: '0x1111111111111111111111111111111111111111111111111111111111111111',
          size: '0x1',
          stateRoot: '0x1111111111111111111111111111111111111111111111111111111111111111',
          timestamp: '0x1',
          totalDifficulty: '0x1',
          transactions: [],
          transactionsRoot: '0x1111111111111111111111111111111111111111111111111111111111111111',
          uncles: [],
        }
        break
      }
      case 'eth_sendRawTransaction': {
        response.result = keccak256(body.params[0]).toString()
        this.stats.sentTransactions.push({
          rawTransaction: body.params[0],
          hash: response.result,
        })
        break
      }
    }
    return response
  }
}
