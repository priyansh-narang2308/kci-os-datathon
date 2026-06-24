/**
 * Vector Retrieval Layer
 *
 * Embeds FIR narratives and performs similarity search.
 * Task 4.3
 */

class VectorRetriever {
  constructor() {
    this.embeddings = new Map();
    this.firIndex = new Map();
  }

  async buildIndex(firs) {
    for (const fir of firs) {
      const vector = this.simpleEmbed(fir.narrative_text || "");
      this.embeddings.set(fir.fir_no, {
        vector,
        metadata: {
          fir_no: fir.fir_no,
          crime_type: fir.crime_type,
          district: fir.district,
          date_filed: fir.date_filed,
          status: fir.status,
          narrative: (fir.narrative_text || "").substring(0, 200),
        },
      });
      this.firIndex.set(fir.fir_no, fir);
    }
    return this.embeddings.size;
  }

  simpleEmbed(text) {
    const words = text.toLowerCase().split(/\s+/);
    const vector = new Array(100).fill(0);
    for (const word of words) {
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = ((hash << 5) - hash + word.charCodeAt(i)) | 0;
      }
      vector[Math.abs(hash) % 100] += 1;
    }
    const norm = Math.sqrt(vector.reduce((s, v) => s + v * v, 0)) || 1;
    return vector.map((v) => v / norm);
  }

  cosineSimilarity(a, b) {
    let dot = 0,
      normA = 0,
      normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
  }

  async search(queryText, options = {}) {
    const { topK = 5, crimeType, district } = options;
    const queryVector = this.simpleEmbed(queryText);

    const results = [];
    for (const [firNo, entry] of this.embeddings) {
      if (crimeType && entry.metadata.crime_type !== crimeType) continue;
      if (district && entry.metadata.district !== district) continue;

      const score = this.cosineSimilarity(queryVector, entry.vector);
      results.push({ fir_no: firNo, score, ...entry.metadata });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  async searchByFIR(firNo, topK = 5) {
    const entry = this.embeddings.get(firNo);
    if (!entry) return [];

    const fir = this.firIndex.get(firNo);
    const text = (fir?.narrative_text || "") + " " + (fir?.crime_type || "");
    return this.search(text, { topK: topK + 1 });
  }
}

module.exports = VectorRetriever;
