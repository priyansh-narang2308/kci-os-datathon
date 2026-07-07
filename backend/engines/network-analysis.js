/**
 * Criminal Network Analysis Engine
 *
 * Community detection, centrality scoring, link prediction, network queries.
 * Surface hidden structures and organized crime groups.
 *
 * Tasks 6.1 + 6.2 + 6.3 + 6.4 + 6.5
 */

class NetworkAnalyzer {
  constructor(client) {
    this.client = client;
  }

  // ============================================================
  // Task 6.1 — Community Detection
  // ============================================================

  async detectCommunities() {
    const result = await this.client.query(`
      MATCH (a:Accused)-[r:arrested_with|called|linked_to]-(b:Accused)
      RETURN a.accused_id AS source, b.accused_id AS target,
             type(r) AS relationship, r.confidence AS confidence
    `);

    const edges = result.filter((r) => r && r.source && r.target);
    const graph = this.buildAdjacencyList(edges);
    const communities = this.louvainCommunityDetection(graph);

    const communityDetails = [];
    for (const [commId, members] of Object.entries(communities)) {
      if (members.length >= 3) {
        communityDetails.push({
          id: parseInt(commId),
          size: members.length,
          members,
          centrality: this.calculateCentrality(graph, members),
        });
      }
    }

    communityDetails.sort((a, b) => b.size - a.size);
    return communityDetails;
  }

  buildAdjacencyList(edges) {
    const graph = {};
    for (const e of edges) {
      if (!graph[e.source]) graph[e.source] = {};
      if (!graph[e.target]) graph[e.target] = {};
      graph[e.source][e.target] = (graph[e.source][e.target] || 0) + 1;
      graph[e.target][e.source] = (graph[e.target][e.source] || 0) + 1;
    }
    return graph;
  }

  louvainCommunityDetection(graph) {
    const nodeToCommunity = {};
    const nodes = Object.keys(graph);

    // Initialize each node as its own community
    for (const node of nodes) {
      nodeToCommunity[node] = node;
    }

    // Iterative community merging
    let changed = true;
    let iteration = 0;
    while (changed && iteration < 10) {
      changed = false;
      iteration++;
      for (const node of nodes) {
        const nodeComm = nodeToCommunity[node];
        const neighborComms = {};
        for (const neighbor of Object.keys(graph[node] || {})) {
          const comm = nodeToCommunity[neighbor];
          neighborComms[comm] = (neighborComms[comm] || 0) + 1;
        }

        let bestComm = nodeComm;
        let bestCount = 0;
        for (const [comm, count] of Object.entries(neighborComms)) {
          if (count > bestCount) {
            bestCount = count;
            bestComm = comm;
          }
        }

        if (bestComm !== nodeComm) {
          nodeToCommunity[node] = bestComm;
          changed = true;
        }
      }
    }

    // Group by community
    const communities = {};
    for (const [node, comm] of Object.entries(nodeToCommunity)) {
      if (!communities[comm]) communities[comm] = [];
      communities[comm].push(node);
    }

    return communities;
  }

  // ============================================================
  // Task 6.2 — Centrality Analysis
  // ============================================================

  calculateCentrality(graph, members) {
    const scores = {};

    for (const member of members) {
      const neighbors = Object.keys(graph[member] || {}).filter((n) =>
        members.includes(n),
      );
      const degree = neighbors.length;

      // Betweenness approximation
      let betweenness = 0;
      for (const a of members) {
        if (a === member) continue;
        for (const b of members) {
          if (b === member || b === a) continue;
          if (graph[a]?.[member] && graph[member]?.[b]) {
            betweenness += 1;
          }
        }
      }

      scores[member] = {
        degree,
        betweenness: parseFloat(
          (
            betweenness /
            Math.max(1, ((members.length - 1) * (members.length - 2)) / 2)
          ).toFixed(4),
        ),
        degree_centrality: parseFloat(
          (degree / Math.max(1, members.length - 1)).toFixed(4),
        ),
      };
    }

    return scores;
  }

  async getKeyPlayers(communityId, topN = 3) {
    const communities = await this.detectCommunities();
    const community = communities.find((c) => c.id === communityId);
    if (!community) return [];

    const ranked = community.members
      .map((m) => ({
        accused_id: m,
        ...community.centrality[m],
      }))
      .sort((a, b) => b.degree + b.betweenness - (a.degree + a.betweenness));

    return ranked.slice(0, topN);
  }

  // ============================================================
  // Task 6.3 — Network Query Handler
  // ============================================================

  async getNetworkAround(accusedId, hops = 2) {
    const result = await this.client.query(
      `
      MATCH path = (start:Accused {accused_id: $id})-[*1..$hops]-(connected)
      WHERE NOT start = connected
      RETURN DISTINCT
        connected.accused_id AS id,
        connected.name AS name,
        labels(connected)[0] AS type,
        length(path) AS distance,
        [r IN relationships(path) | type(r)] AS edge_types
      ORDER BY distance
      LIMIT 50
    `,
      { id: accusedId, hops },
    );

    const formatted = result
      .filter((r) => r && r.id)
      .map((r) => ({
        id: r.id,
        name: r.name || r.id,
        type: r.type || "Accused",
        distance: r.distance || 1,
        edge_types: Array.isArray(r.edge_types)
          ? [...new Set(r.edge_types)]
          : [r.edge_types],
      }));

    const nodes = [{ id: accusedId, type: "center" }, ...formatted];
    const edges = [];
    for (const n of formatted) {
      for (const et of n.edge_types) {
        if (n.distance === 1) {
          edges.push({ source: accusedId, target: n.id, type: et });
        }
      }
    }

    return { nodes, edges, total: formatted.length };
  }

  async findHiddenLinks(nodeA, nodeB) {
    const result = await this.client.query(
      `
      MATCH path = shortestPath((a:Accused {accused_id: $a})-[*..5]-(b:Accused {accused_id: $b}))
      WHERE a <> b
      RETURN [n IN nodes(path) | {
        id: n.accused_id,
        name: n.name,
        type: labels(n)[0]
      }] AS path_nodes,
      [r IN relationships(path) | {
        type: type(r),
        confidence: r.confidence
      }] AS path_edges,
      length(path) AS hops
    `,
      { a: nodeA, b: nodeB },
    );

    if (result.length === 0) return null;
    return result[0];
  }

  async getCommunityDetails(communityIndex) {
    const communities = await this.detectCommunities();
    const community = communities[communityIndex];
    if (!community) return null;

    const firsPerMember = await Promise.all(
      community.members.slice(0, 10).map(async (m) => {
        const firs = await this.client.query(
          `
          MATCH (a:Accused {accused_id: $id})-[r:involved_in]->(f:FIR)
          RETURN count(f) AS fir_count,
                 collect(DISTINCT f.crime_type) AS crime_types
        `,
          { id: m },
        );
        const data = firs[0];
        return { accused_id: m, ...data };
      }),
    );

    const dominantCrime = {};
    for (const f of firsPerMember) {
      if (f.crime_types) {
        for (const ct of f.crime_types) {
          dominantCrime[ct] = (dominantCrime[ct] || 0) + 1;
        }
      }
    }

    return {
      id: communityIndex,
      size: community.size,
      members: community.members,
      key_players: await this.getKeyPlayers(communityIndex),
      member_details: firsPerMember,
      dominant_crime: Object.entries(dominantCrime)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
    };
  }

  // ============================================================
  // Task 6.4 — Network Visualization Formatter
  // ============================================================

  formatForVisualization(networkData, options = {}) {
    const nodes = [];
    const edges = [];
    const nodeSet = new Set();

    for (const n of networkData.nodes) {
      if (!nodeSet.has(n.id)) {
        nodeSet.add(n.id);
        nodes.push({
          id: n.id,
          label: n.name || n.id,
          type: n.type || "Accused",
          color: this.getNodeColor(n.type, n.id === networkData.nodes[0]?.id),
          size: n.type === "center" ? 30 : 15,
          x: Math.random() * 800,
          y: Math.random() * 600,
        });
      }
    }

    for (const e of networkData.edges) {
      edges.push({
        source: e.source,
        target: e.target,
        type: e.type,
        dashes: e.type === "linked_to" || e.confidence < 0.6,
        color: this.getEdgeColor(e.type),
        width: e.confidence ? 1 + e.confidence * 2 : 1,
      });
    }

    return { nodes, edges };
  }

  getNodeColor(type, isCenter) {
    if (isCenter) return "#ff4444";
    switch (type) {
      case "Accused":
        return "#ff6b35";
      case "FIR":
        return "#2b7be4";
      case "Phone":
        return "#888888";
      case "Location":
        return "#ffc107";
      case "center":
        return "#d32f2f";
      default:
        return "#9c27b0";
    }
  }

  getEdgeColor(type) {
    switch (type) {
      case "arrested_with":
        return "#ff4444";
      case "called":
        return "#4caf50";
      case "linked_to":
        return "#ff9800";
      case "visited":
        return "#2196f3";
      case "operates_at":
        return "#9c27b0";
      default:
        return "#cccccc";
    }
  }

  // ============================================================
  // Task 6.5 — Integration with GraphRAG
  // ============================================================

  async processNetworkQuery(query, slots) {
    const target = slots.target_entity || slots.accused_name;

    if (!target) {
      return {
        error: "Please specify which person or entity to investigate",
        type: "clarification",
      };
    }

    // Try to resolve the target entity
    const resolved = await this.resolveEntity(target);

    if (!resolved) {
      return {
        error: `Could not find entity: ${target}`,
        type: "error",
      };
    }

    const network = await this.getNetworkAround(resolved.id, 2);
    const vizData = this.formatForVisualization(network);

    return {
      type: "network",
      target: resolved,
      network,
      visualization: vizData,
      communities:
        network.total > 0
          ? await this.getCommunitiesForNetwork(network.nodes)
          : [],
    };
  }

  async resolveEntity(query) {
    // Try accused_id directly
    if (query.startsWith("ACC_")) {
      return { id: query, type: "Accused" };
    }

    // Search by name
    const result = await this.client.query(
      `
      MATCH (a:Accused)
      WHERE a.name CONTAINS $name
         OR ANY(alias IN a.aliases WHERE alias CONTAINS $name)
      RETURN a.accused_id AS id, a.name AS name, a.district AS district
      LIMIT 1
    `,
      { name: query },
    );

    if (result.length > 0) {
      return { ...result[0], type: "Accused" };
    }

    return null;
  }

  async getCommunitiesForNetwork(nodes) {
    const communities = await this.detectCommunities();
    const nodeIds = new Set(nodes.map((n) => n.id));
    return communities.filter((c) => c.members.some((m) => nodeIds.has(m)));
  }
}

module.exports = NetworkAnalyzer;

if (require.main === module) {
  console.log("=== Network Analysis Module Exported ===");
  console.log(
    "Methods available:",
    Object.getOwnPropertyNames(NetworkAnalyzer.prototype),
  );
}
