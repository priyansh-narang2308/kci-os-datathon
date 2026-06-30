class FalkorMock {
  constructor() { this.connected = false; }
  async connect() { this.connected = true; }
  async disconnect() { this.connected = false; }
  async query() { return []; }
  async getGraph() { return { nodes: [], edges: [] }; }
}

module.exports = FalkorMock;