import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { GAYATRI_PRESETS, SESSION_INFO } from "../content";

export default defineTool({
  name: "get_session_info",
  title: "Get Sandhya session info",
  description:
    "Describe Trikaala's three daily sessions (Pratah, Madhyahnikam, Sayam) and the Gayatri japa count presets the app offers.",
  inputSchema: {
    session: z
      .enum(["pratah", "madhyahnikam", "sayam"])
      .optional()
      .describe("Limit the result to one session. Omit for all three."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ session }) => {
    const sessions = session ? SESSION_INFO.filter((s) => s.key === session) : SESSION_INFO;
    const text = sessions
      .map((s) => `${s.name} ${s.sanskrit} — ${s.when}. ${s.description}`)
      .join("\n");
    return {
      content: [
        {
          type: "text",
          text: `${text}\n\nGayatri japa presets: ${GAYATRI_PRESETS.join(", ")} (or any custom count).`,
        },
      ],
      structuredContent: { sessions, gayatriPresets: GAYATRI_PRESETS },
    };
  },
});
