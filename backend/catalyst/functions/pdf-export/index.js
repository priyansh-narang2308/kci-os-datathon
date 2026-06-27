const catalyst = require("@zmc/catalyst");

function formatConversationToText(conversation, officerId, ts) {
  const lines = [
    "=".repeat(72),
    "  KCI-OS — KARNATAKA CRIME INTELLIGENCE OPERATING SYSTEM",
    "  Conversation Export — Compliance Artifact",
    "=".repeat(72),
    "",
    `Officer ID:       ${officerId}`,
    `Timestamp:        ${ts || new Date().toISOString()}`,
    `Export Date:      ${new Date().toISOString()}`,
    "",
    "-".repeat(72),
    "  CONVERSATION LOG",
    "-".repeat(72),
    ""
  ];

  if (conversation && Array.isArray(conversation)) {
    for (const msg of conversation) {
      const role = (msg.role || "unknown").toUpperCase().padEnd(12);
      const text = msg.content || msg.text || "";
      lines.push(`  [${role}] ${text}`);
      if (msg.citations && msg.citations.length > 0) {
        lines.push(`           Citations: ${msg.citations.map(c => c.id || c.source).join(", ")}`);
      }
      lines.push("");
    }
  } else {
    lines.push("  [No conversation data provided]");
    lines.push("");
  }

  lines.push("-".repeat(72));
  lines.push("  END OF EXPORT");
  lines.push("=".repeat(72));

  return lines.join("\n");
}

exports.handler = async function(event) {
  try {
    const catalystApp = catalyst.initialize(event);
    const datastore = catalystApp.datastore();
    const { conversation, officer_id, timestamp } = event.data;

    if (!conversation || !officer_id) {
      return { status: 400, content: { error: "Missing required fields: conversation, officer_id" } };
    }

    const textContent = formatConversationToText(conversation, officer_id, timestamp);

    const conversationTable = datastore.table("Conversation");
    const convId = `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await conversationTable.insertRow({
      conversation_id: convId,
      officer_id: officer_id,
      messages: JSON.stringify(conversation),
      created_at: new Date(),
      updated_at: new Date()
    });

    return {
      status: 200,
      content: {
        conversation_id: convId,
        officer_id: officer_id,
        text_content: textContent,
        message_count: Array.isArray(conversation) ? conversation.length : 0,
        exported_at: new Date().toISOString()
      }
    };
  } catch (err) {
    return { status: 500, content: { error: err.message } };
  }
};
