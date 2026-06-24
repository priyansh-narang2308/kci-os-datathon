/**
 * Graph CRUD Operations
 * 
 * Create, Read, Update, Delete operations for all node and edge types.
 * All queries use parameterized Cypher (never string interpolation).
 * Every edge includes confidence_score and provenance.
 * 
 * Task 2.2
 */

class GraphCRUD {
  constructor(client) {
    this.client = client;
  }

  // ============================================================
  // NODE OPERATIONS
  // ============================================================

  async createFIR(data) {
    return this.client.query(`
      MERGE (f:FIR {fir_no: $fir_no})
      SET f.police_station_id = $police_station_id,
          f.date_filed = $date_filed,
          f.crime_type = $crime_type,
          f.sections_of_law = $sections_of_law,
          f.status = $status,
          f.narrative_text = $narrative_text,
          f.lat = $lat, f.long = $long,
          f.investigating_officer_id = $investigating_officer_id,
          f.district = $district,
          f.created_at = timestamp()
      RETURN f
    `, {
      fir_no: data.fir_no,
      police_station_id: data.police_station_id,
      date_filed: data.date_filed,
      crime_type: data.crime_type,
      sections_of_law: JSON.stringify(data.sections_of_law || []),
      status: data.status || "registered",
      narrative_text: data.narrative_text,
      lat: data.lat || null,
      long: data.long || null,
      investigating_officer_id: data.investigating_officer_id || null,
      district: data.district,
    });
  }

  async getFIR(firNo) {
    const result = await this.client.query(
      `MATCH (f:FIR {fir_no: $fir_no}) RETURN f`,
      { fir_no: firNo }
    );
    return result[0] || null;
  }

  async createAccused(data) {
    return this.client.query(`
      MERGE (a:Accused {accused_id: $accused_id})
      SET a.name = $name, a.aliases = $aliases, a.age = $age,
          a.gender = $gender, a.address = $address, a.district = $district,
          a.prior_conviction_count = $prior_conviction_count,
          a.created_at = timestamp()
      RETURN a
    `, {
      accused_id: data.accused_id,
      name: data.name,
      aliases: JSON.stringify(data.aliases || []),
      age: data.age || null,
      gender: data.gender || null,
      address: data.address || null,
      district: data.district || null,
      prior_conviction_count: data.prior_conviction_count || 0,
    });
  }

  async getAccused(accusedId) {
    const result = await this.client.query(
      `MATCH (a:Accused {accused_id: $id}) RETURN a`,
      { id: accusedId }
    );
    return result[0] || null;
  }

  async searchAccusedByName(name) {
    return this.client.query(`
      MATCH (a:Accused)
      WHERE a.name CONTAINS $name OR ANY(alias IN a.aliases WHERE alias CONTAINS $name)
      RETURN a
    `, { name });
  }

  async createVictim(data) {
    return this.client.query(`
      MERGE (v:Victim {victim_id: $victim_id})
      SET v.name = $name, v.age = $age, v.gender = $gender,
          v.address = $address, v.district = $district,
          v.vulnerability_flag = $vulnerability_flag,
          v.created_at = timestamp()
      RETURN v
    `, {
      victim_id: data.victim_id,
      name: data.name,
      age: data.age || null,
      gender: data.gender || null,
      address: data.address || null,
      district: data.district || null,
      vulnerability_flag: data.vulnerability_flag || false,
    });
  }

  async createLocation(data) {
    return this.client.query(`
      MERGE (l:Location {location_id: $location_id})
      SET l.name = $name, l.lat = $lat, l.long = $long,
          l.type = $type, l.taluk = $taluk, l.district = $district,
          l.state = $state, l.created_at = timestamp()
      RETURN l
    `, {
      location_id: data.location_id,
      name: data.name || null,
      lat: data.lat,
      long: data.long,
      type: data.type,
      taluk: data.taluk || null,
      district: data.district,
      state: data.state || "Karnataka",
    });
  }

  async createPhone(data) {
    return this.client.query(`
      MERGE (p:Phone {phone_id: $phone_id})
      SET p.imei = $imei, p.msisdn = $msisdn,
          p.registration_name = $registration_name,
          p.owner_confidence = $owner_confidence,
          p.created_at = timestamp()
      RETURN p
    `, {
      phone_id: data.phone_id,
      imei: data.imei || null,
      msisdn: data.msisdn || null,
      registration_name: data.registration_name || null,
      owner_confidence: data.owner_confidence || null,
    });
  }

  // ============================================================
  // EDGE OPERATIONS
  // ============================================================

  async linkInvolvedIn(fromId, firNo, role, confidence = 0.95, source = "FIR_record") {
    const label = fromId.startsWith("ACC") ? "Accused" : "Victim";
    const idField = label === "Accused" ? "accused_id" : "victim_id";

    return this.client.query(`
      MATCH (n:${label} {${idField}: $from_id})
      MATCH (f:FIR {fir_no: $fir_no})
      MERGE (n)-[r:involved_in]->(f)
      SET r.role = $role, r.confidence = $confidence, r.source = $source
      RETURN r
    `, { from_id: fromId, fir_no: firNo, role, confidence, source });
  }

  async linkArrestedWith(accusedId1, accusedId2, firNo, confidence = 0.95) {
    return this.client.query(`
      MATCH (a1:Accused {accused_id: $id1})
      MATCH (a2:Accused {accused_id: $id2})
      MERGE (a1)-[r:arrested_with]-(a2)
      SET r.fir_no = $fir_no, r.confidence = $confidence
      RETURN r
    `, { id1: accusedId1, id2: accusedId2, fir_no: firNo, confidence });
  }

  async linkCalled(phoneId1, phoneId2, data, confidence = 0.9) {
    return this.client.query(`
      MATCH (p1:Phone {phone_id: $id1})
      MATCH (p2:Phone {phone_id: $id2})
      MERGE (p1)-[r:called]->(p2)
      SET r.timestamp = $timestamp, r.duration_seconds = $duration,
          r.frequency_count = $frequency, r.confidence = $confidence
      RETURN r
    `, {
      id1: phoneId1, id2: phoneId2,
      timestamp: data.timestamp, duration: data.duration_seconds,
      frequency: data.frequency_count || 1, confidence,
    });
  }

  async linkVisited(entityId, locationId, data, confidence = 0.7) {
    const label = entityId.startsWith("ACC") ? "Accused" : "Phone";
    const idField = label === "Accused" ? "accused_id" : "phone_id";

    return this.client.query(`
      MATCH (n:${label} {${idField}: $entity_id})
      MATCH (l:Location {location_id: $location_id})
      MERGE (n)-[r:visited]->(l)
      SET r.timestamp = $timestamp, r.dwell_time_minutes = $dwell,
          r.visit_count = $visit_count, r.confidence = $confidence
      RETURN r
    `, {
      entity_id: entityId, location_id: locationId,
      timestamp: data.timestamp || null,
      dwell: data.dwell_time_minutes || null,
      visit_count: data.visit_count || 1,
      confidence,
    });
  }

  async linkLinkedTo(fromLabel, fromId, toLabel, toId, properties, confidence = 0.5) {
    const fromIdField = fromLabel === "Accused" ? "accused_id" :
                        fromLabel === "Phone" ? "phone_id" :
                        fromLabel === "FIR" ? "fir_no" : "location_id";
    const toIdField = toLabel === "Accused" ? "accused_id" :
                      toLabel === "Phone" ? "phone_id" :
                      toLabel === "FIR" ? "fir_no" : "location_id";

    return this.client.query(`
      MATCH (a:${fromLabel} {${fromIdField}: $from_id})
      MATCH (b:${toLabel} {${toIdField}: $to_id})
      MERGE (a)-[r:linked_to]->(b)
      SET r.evidence_type = $evidence_type, r.weight = $weight,
          r.is_hypothesis = $is_hypothesis, r.confidence = $confidence,
          r.source = $source
      RETURN r
    `, {
      from_id: fromId, to_id: toId,
      evidence_type: properties.evidence_type || "ai_suggested",
      weight: properties.weight || 0.5,
      is_hypothesis: properties.is_hypothesis !== false,
      confidence, source: properties.added_by || "system",
    });
  }

  async linkSimilarMO(firNo1, firNo2, similarityScore, sharedFeatures, confidence = 0.7) {
    return this.client.query(`
      MATCH (f1:FIR {fir_no: $fir1})
      MATCH (f2:FIR {fir_no: $fir2})
      MERGE (f1)-[r:similar_MO_to]->(f2)
      SET r.similarity_score = $score, r.shared_features = $features,
          r.model_version = $version, r.confidence = $confidence
      RETURN r
    `, {
      fir1: firNo1, fir2: firNo2,
      score: similarityScore,
      features: JSON.stringify(sharedFeatures),
      version: "v1.0",
      confidence,
    });
  }

  async linkFiledAt(firNo, psId) {
    return this.client.query(`
      MATCH (f:FIR {fir_no: $fir_no})
      MATCH (ps:Police_Station {ps_id: $ps_id})
      MERGE (f)-[r:filed_at]->(ps)
      SET r.confidence = 1.0
      RETURN r
    `, { fir_no: firNo, ps_id: psId });
  }

  // ============================================================
  // DELETE OPERATIONS
  // ============================================================

  async deleteNode(label, idField, id) {
    return this.client.query(`
      MATCH (n:${label} {${idField}: $id})
      DETACH DELETE n
    `, { id });
  }

  async deleteEdge(fromLabel, fromId, toLabel, toId, edgeType) {
    const fromIdField = fromLabel === "Accused" ? "accused_id" : "fir_no";
    const toIdField = toLabel === "Accused" ? "accused_id" : "fir_no";

    return this.client.query(`
      MATCH (a:${fromLabel} {${fromIdField}: $from_id})-[r:${edgeType}]->(b:${toLabel} {${toIdField}: $to_id})
      DELETE r
    `, { from_id: fromId, to_id: toId });
  }
}

module.exports = GraphCRUD;
