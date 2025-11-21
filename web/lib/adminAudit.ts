export type AdminAuditEvent = {
  action: string;
  actor?: string;
  details?: Record<string, unknown>;
};

const ADMIN_AUDIT_WEBHOOK_URL = process.env.ADMIN_AUDIT_WEBHOOK_URL;
const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

export async function sendAdminAudit(event: AdminAuditEvent) {
  if (!ADMIN_AUDIT_WEBHOOK_URL) return;

  const body = {
    content: `Admin event: ${event.action}${event.actor ? ` by ${event.actor}` : ""}`,
    embeds: [
      {
        title: "Admin Audit",
        description: `**Action:** ${event.action}\n**Actor:** ${event.actor ?? "unknown"}`,
        color: 0x14a5ff,
        fields: event.details
          ? Object.entries(event.details).map(([name, value]) => ({
              name,
              value: toDisplayValue(value),
              inline: false,
            }))
          : undefined,
        timestamp: new Date().toISOString(),
      },
    ],
    metadata: {
      action: event.action,
      actor: event.actor,
      details: event.details,
    },
  };

  try {
    const response = await fetch(ADMIN_AUDIT_WEBHOOK_URL, {
      method: "POST",
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error("Failed to send admin audit", response.status, await response.text());
    }
  } catch (error) {
    console.error("Unable to send admin audit", error);
  }
}

function toDisplayValue(value: unknown) {
  if (value === null || value === undefined) return "(empty)";
  if (typeof value === "object") return "```json\n" + JSON.stringify(value, null, 2) + "\n```";
  return String(value);
}
