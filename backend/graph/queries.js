/**
 * Graph Query Helpers
 * 
 * High-level query functions for common investigative patterns.
 * Each function returns structured, frontend-ready data.
 * 
 * Task 2.3
 */

class GraphQueries {
  constructor(client) {
    this.client = client;
  }

  async getAccusedFIRs(accusedId) {
    return this.client.query(`
      MATCH (a:Accused {accused_id: $id})-[r:involved_in]->(f:FIR)
      RETURN f.fir_no AS fir_no, f.crime_type AS crime_type,
             f.date_filed AS date_filed, f.status AS status,
             f.district AS district, f.lat AS lat, f.long AS long,
             r.role AS role, r.confidence AS confidence
      ORDER BY f.date_filed DESC
    `, { id: accusedId });
  }

  async getFIRAccused(firNo) {
    return this.client.query(`
      MATCH (a:Accused)-[r:involved_in]->(f:FIR {fir_no: $fir_no})
      RETURN a.accused_id AS accused_id, a.name AS name,
             a.age AS age, a.district AS district,
             a.prior_conviction_count AS priors,
             r.role AS role, r.confidence AS confidence
    `, { fir_no: firNo });
  }

  async getFIRVictims(firNo) {
    return this.client.query(`
      MATCH (v:Victim)-[r:involved_in]->(f:FIR {fir_no: $fir_no})
      RETURN v.victim_id AS victim_id, v.name AS name,
             v.age AS age, v.gender AS gender,
             v.vulnerability_flag AS vulnerable,
             r.confidence AS confidence
    `, { fir_no: firNo });
  }

  async getNetworkHop(nodeId, edgeTypes = ["called", "visited", "arrested_with", "linked_to"], hops = 2) {
    const edgeFilter = edgeTypes.map(e => `r:${e}`).join(" | ");
    const query = `
      MATCH path = (start {accused_id: $id})-[*1..${hops}]-(related)
      WHERE ANY(r IN relationships(path) WHERE type(r) IN [${edgeTypes.map(e => `"${e}"`).join(",")}])
      RETURN DISTINCT
        related.accused_id AS id, related.name AS name,
        labels(related)[0] AS type,
        length(path) AS distance,
        [r IN relationships(path) | type(r)] AS edge_types
      ORDER BY distance
    `;
    return this.client.query(query, { id: nodeId });
  }

  async getRepeatOffenders(minFirs = 2, district = null) {
    const districtFilter = district ? `AND a.district = "${district}"` : "";
    return this.client.query(`
      MATCH (a:Accused)-[r:involved_in]->(f:FIR)
      WHERE 1=1 ${districtFilter}
      WITH a, count(f) AS fir_count,
           collect(f.fir_no)[0..5] AS sample_firs,
           min(f.date_filed) AS first_fir,
           max(f.date_filed) AS last_fir,
           collect(DISTINCT f.crime_type) AS crime_types
      WHERE fir_count >= $min_firs
      RETURN a.accused_id AS accused_id, a.name AS name,
             a.district AS district, a.prior_conviction_count AS priors,
             fir_count, sample_firs, first_fir, last_fir, crime_types
      ORDER BY fir_count DESC
    `, { min_firs: minFirs });
  }

  async getMOClusters(district = null, timeRange = null) {
    const districtFilter = district ? `AND f1.district = "${district}"` : "";
    const timeFilter = timeRange ? `AND f1.date_filed >= "${timeRange.start}" AND f1.date_filed <= "${timeRange.end}"` : "";

    return this.client.query(`
      MATCH (f1:FIR)-[r:similar_MO_to]->(f2:FIR)
      WHERE r.similarity_score > 0.7 ${districtFilter} ${timeFilter}
      WITH f1, collect({
        fir_no: f2.fir_no,
        score: r.similarity_score,
        features: r.shared_features
      }) AS similar
      RETURN f1.fir_no AS fir_no, f1.crime_type AS crime_type,
             f1.district AS district, f1.date_filed AS date_filed,
             size(similar) AS cluster_size,
             similar[0..5] AS top_similar
      ORDER BY cluster_size DESC
    `);
  }

  async searchByCrimeType(crimeType, filters = {}) {
    let whereClauses = ["f.crime_type = $crime_type"];
    const params = { crime_type: crimeType };

    if (filters.district) {
      whereClauses.push("f.district = $district");
      params.district = filters.district;
    }
    if (filters.status) {
      whereClauses.push("f.status = $status");
      params.status = filters.status;
    }
    if (filters.dateFrom) {
      whereClauses.push("f.date_filed >= $dateFrom");
      params.dateFrom = filters.dateFrom;
    }
    if (filters.dateTo) {
      whereClauses.push("f.date_filed <= $dateTo");
      params.dateTo = filters.dateTo;
    }

    const where = whereClauses.join(" AND ");
    return this.client.query(`
      MATCH (f:FIR)
      WHERE ${where}
      OPTIONAL MATCH (a:Accused)-[r:involved_in]->(f)
      RETURN f.fir_no AS fir_no, f.date_filed AS date_filed,
             f.status AS status, f.district AS district,
             f.narrative_text AS narrative,
             collect({name: a.name, accused_id: a.accused_id}) AS accused
      ORDER BY f.date_filed DESC
    `, params);
  }

  async getHotspotData(district, timeRange) {
    return this.client.query(`
      MATCH (f:FIR)
      WHERE f.district = $district
        AND f.lat IS NOT NULL AND f.long IS NOT NULL
        AND f.date_filed >= $start AND f.date_filed <= $end
      RETURN f.lat AS lat, f.long AS long,
             f.crime_type AS crime_type, f.date_filed AS date_filed,
             count(*) AS crime_count
      GROUP BY f.lat, f.long, f.crime_type, f.date_filed
    `, {
      district,
      start: timeRange.start,
      end: timeRange.end,
    });
  }

  async getGangNetwork(gangLeaderId) {
    return this.client.query(`
      MATCH (leader:Accused {accused_id: $id})
      MATCH (leader)-[r:arrested_with|called|linked_to|operates_at]-(member)
      RETURN DISTINCT
        member.accused_id AS id, member.name AS name,
        labels(member)[0] AS type,
        type(r) AS relationship,
        r.confidence AS confidence
    `, { id: gangLeaderId });
  }

  async getStats() {
    const nodeStats = await this.client.query(`
      MATCH (n)
      RETURN labels(n)[0] AS label, count(n) AS count
      ORDER BY count DESC
    `);

    const edgeStats = await this.client.query(`
      MATCH ()-[r]->()
      RETURN type(r) AS type, count(r) AS count
      ORDER BY count DESC
    `);

    return { nodes: nodeStats, edges: edgeStats };
  }
}

module.exports = GraphQueries;
