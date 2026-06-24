/**
 * FalkorDB Client Library
 *
 * Reusable client for KCI-OS Knowledge Graph operations.
 * Uses Redis-compatible protocol (FalkorDB is Redis-compatible).
 *
 * Task 2.1 — Build FalkorDB Client Library
 */

const redis = require("redis");
const config = require("./config.json");

class FalkorClient {
  constructor(options = {}) {
    this.host = options.host || config.host;
    this.port = options.port || config.port;
    this.graphName = options.graph_name || config.graph_name;
    this.client = null;
    this.connected = false;
  }

  async connect() {
    if (this.connected) return;

    this.client = redis.createClient({
      socket: {
        host: this.host,
        port: this.port,
      },
    });

    this.client.on("error", (err) => {
      console.error("[FalkorDB] Connection error:", err.message);
      this.connected = false;
    });

    this.client.on("connect", () => {
      this.connected = true;
    });

    await this.client.connect();
    console.log(`[FalkorDB] Connected to ${this.host}:${this.port}`);
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.connected = false;
      console.log("[FalkorDB] Disconnected");
    }
  }

  /**
   * Execute a Cypher query against the graph.
   * @param {string} cypher - The Cypher query
   * @param {object} params - Query parameters (optional)
   * @returns {object} Query result
   */
  async query(cypher, params = {}) {
    if (!this.connected) {
      throw new Error("[FalkorDB] Not connected. Call connect() first.");
    }

    try {
      const result = await this.client.sendCommand([
        "GRAPH.QUERY",
        this.graphName,
        cypher,
        "--compact",
      ]);

      return this._parseResult(result);
    } catch (err) {
      console.error("[FalkorDB] Query error:", err.message);
      console.error("[FalkorDB] Query:", cypher);
      throw err;
    }
  }

  /**
   * Execute multiple graph operations in a transaction.
   * @param {string[]} operations - Array of Cypher queries
   * @returns {object[]} Array of results
   */
  async executeTransaction(operations) {
    const results = [];
    for (const op of operations) {
      const result = await this.query(op);
      results.push(result);
    }
    return results;
  }

  /**
   * Check if the graph exists and is accessible.
   * @returns {boolean} True if graph is accessible
   */
  async healthCheck() {
    try {
      await this.query("RETURN 1");
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get graph statistics (node count, edge count).
   * @returns {object} Graph stats
   */
  async getStats() {
    const nodeCount = await this.query("MATCH (n) RETURN count(n) AS count");
    const edgeCount = await this.query(
      "MATCH ()-[r]->() RETURN count(r) AS count",
    );
    const labelCount = await this.query(
      "CALL db.labels() YIELD label RETURN count(label) AS count",
    );

    return {
      nodes: nodeCount[0]?.count || 0,
      edges: edgeCount[0]?.count || 0,
      labels: labelCount[0]?.count || 0,
    };
  }

  /**
   * Parse FalkorDB result array into structured format.
   * @param {Array} result - Raw result from GRAPH.QUERY
   * @returns {Array} Parsed result rows
   */
  _parseResult(result) {
    if (!result || !Array.isArray(result)) {
      return [];
    }

    return result.map((row) => {
      if (typeof row === "object" && row !== null) {
        return row;
      }
      return { value: row };
    });
  }
}

module.exports = FalkorClient;
