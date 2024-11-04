import { describe, it, afterEach, beforeEach, expect } from 'vitest';
import MockEthereumNode from '../../src/MockEthereumNode.js';

describe('Test mock node', () => {
  beforeEach(() => {
  });

  afterEach(() => {
  });

  // Assert if setTimeout was called properly
  it('Node initialized', async () => {
    const node = await MockEthereumNode.createNode()
    expect(node.stats.sentTransactions.length, 'No transactions').to.equal(0)
  });
});
