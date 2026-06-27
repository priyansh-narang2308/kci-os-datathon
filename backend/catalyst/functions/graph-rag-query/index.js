const catalyst = require("@zmc/catalyst");
const FalkorClient = require("../../../graph/client");
const { GraphRAGPipeline } = require("../../../graph/pipeline");
const { processQuery } = require("../../../nlu/router");

exports.handler = async function(event) {
  try {
    const catalystApp = catalyst.initialize(event);
    const datastore = catalystApp.datastore();
    const { query, user_role, jurisdiction } = event.data;

    if (!query) {
      return { status: 400, content: { error: "Missing query text" } };
    }

    const nluResult = processQuery(query);

    if (nluResult.status === "needs_clarification") {
      return {
        status: 200,
        content: {
          type: "clarification",
          missing_slots: nluResult.missing_slots,
          prompt: nluResult.clarification_prompt,
          partial_intent: nluResult.intent
        }
      };
    }

    const firTable = datastore.table("FIR");
    const allRows = await firTable.getAllRows();
    const firs = allRows.map(r => r.FIR).filter(Boolean);

    const client = new FalkorClient({
      host: process.env.FALKORDB_HOST || "localhost",
      port: parseInt(process.env.FALKORDB_PORT || "6380"),
      graph_name: "kci"
    });
    await client.connect();

    const pipeline = new GraphRAGPipeline(client);
    await pipeline.initialize(firs);

    const result = await pipeline.processQuery(nluResult.intent, nluResult.slots);

    const startTime = Date.now();
    const auditTable = datastore.table("AuditLog");
    await auditTable.insertRow({
      log_id: `qry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date(),
      officer_id: user_role || "anonymous",
      query_text: query,
      intent: nluResult.intent,
      engine_used: "graphrag",
      results_count: result.citations?.length || 0,
      response_time_ms: Date.now() - startTime,
      jurisdiction: jurisdiction || ""
    });

    await client.disconnect();

    return {
      status: 200,
      content: {
        type: "response",
        response: result.response,
        citations: result.citations,
        confidence: result.confidence,
        reasoning_path: result.reasoningPath,
        intent: nluResult.intent,
        slots: nluResult.slots,
        language: nluResult.language
      }
    };
  } catch (err) {
    return { status: 500, content: { error: err.message } };
  }
};
