const { processQuery } = require("../../../nlu/router");

exports.handler = async function(event) {
  try {
    const { text, language_hint } = event.data;

    if (!text) {
      return { status: 400, content: { error: "Missing text to process" } };
    }

    const result = processQuery(text);

    return {
      status: 200,
      content: {
        intent: result.intent,
        intent_confidence: result.intent_confidence,
        slots: result.slots,
        language: result.language,
        engine: result.engine,
        status: result.status,
        missing_slots: result.missing_slots || [],
        clarification_prompt: result.clarification_prompt || null,
        raw_text: text
      }
    };
  } catch (err) {
    return { status: 500, content: { error: err.message } };
  }
};
