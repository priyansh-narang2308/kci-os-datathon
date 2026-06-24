/**
 * NLU Pipeline — Catalyst Function
 * 
 * Bilingual intent classification + slot extraction.
 * Handles English, Kannada, and code-mixed queries.
 */

exports.handler = async function(event) {
  try {
    const { text, language_hint } = event.data;
    
    // TODO: Task 3.3 — English NLU
    // TODO: Task 3.4 — Kannada NLU
    // TODO: Task 3.5 — Code-mix handler
    
    return {
      status: 200,
      content: {
        intent: "unknown",
        slots: {},
        language: "en",
        confidence: 0.0,
        raw_text: text
      }
    };
  } catch (err) {
    return { status: 500, content: { error: err.message } };
  }
};
