/**
 * Structured Graph Retrieval
 *
 * Executes Cypher queries against FalkorDB and returns citation-tagged results.
 *
 * Task 4.2
 */

const FalkorClient = require("./client");

class GraphRetriever {
  constructor(client) {
    this.client = client;
  }

  async execute(cypher, params = {}) {
    try {
      const result = await this.client.query(cypher, params);
      return this.tagWithCitations(result);
    } catch (err) {
      console.error("[GraphRetriever] Query failed:", err.message);
      return { error: err.message, results: [] };
    }
  }

  tagWithCitations(results) {
    if (!Array.isArray(results)) return { results: [], citations: [] };

    const citations = [];
    const tagged = results.map((row) => {
      const citation = this.extractCitation(row);
      if (citation) citations.push(citation);
      return { ...row, _citation: citation };
    });

    return { results: tagged, citations };
  }

  extractCitation(row) {
    if (!row) return null;

    // FIR citation
    if (row.fir_no) {
      return {
        type: "FIR",
        id: row.fir_no,
        source: "FIR record",
        confidence: 0.95,
      };
    }

    // Accused citation
    if (row.accused_id && row.name) {
      return {
        type: "Accused",
        id: row.accused_id,
        name: row.name,
        source: "Police records",
        confidence: 0.9,
      };
    }

    // Generic
    return {
      type: "record",
      id: row.id || row.fir_no || row.accused_id || "unknown",
      source: "database",
      confidence: 0.8,
    };
  }

  async getSubgraph(nodeId, nodeLabel, hops = 2) {
    const idField =
      nodeLabel === "Accused"
        ? "accused_id"
        : nodeLabel === "FIR"
          ? "fir_no"
          : nodeLabel === "Victim"
            ? "victim_id"
            : nodeLabel === "Phone"
              ? "phone_id"
              : "location_id";

    const cypher = `
      MATCH path = (start:${nodeLabel} {${idField}: $id})-[*1..${hops}]-(related)
      RETURN DISTINCT
        start.${idField} AS start_id,
        labels(start)[0] AS start_type,
        [n IN nodes(path) | {
          id: CASE 
            WHEN n.fir_no IS NOT NULL THEN n.fir_no
            WHEN n.accused_id IS NOT NULL THEN n.accused_id
            WHEN n.name IS NOT NULL THEN n.name
            ELSE toString(id(n))
          END,
          type: labels(n)[0],
          properties: properties(n)
        }] AS path_nodes,
        [r IN relationships(path) | {
          type: type(r),
          confidence: r.confidence,
          properties: properties(r)
        }] AS path_edges
      LIMIT 50
    `;

    return this.execute(cypher, { id: nodeId });
  }

  async getNodeNeighbors(nodeId, nodeLabel) {
    const idField =
      nodeLabel === "Accused"
        ? "accused_id"
        : nodeLabel === "FIR"
          ? "fir_no"
          : "id";

    const cypher = `
      MATCH (n:${nodeLabel} {${idField}: $id})-[r]-(neighbor)
      RETURN DISTINCT
        CASE
          WHEN neighbor.fir_no IS NOT NULL THEN neighbor.fir_no
          WHEN neighbor.accused_id IS NOT NULL THEN neighbor.accused_id
          WHEN neighbor.name IS NOT NULL THEN neighbor.name
          ELSE toString(id(neighbor))
        END AS id,
        labels(neighbor)[0] AS type,
        type(r) AS relationship,
        r.confidence AS confidence,
        properties(neighbor) AS properties
      LIMIT 30
    `;

    return this.execute(cypher, { id: nodeId });
  }
}

module.exports = GraphRetriever;
