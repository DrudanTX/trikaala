import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { GUIDE_STEPS } from "../content";

export default defineTool({
  name: "get_sandhyavandhanam_guide",
  title: "Get Sandhyavandhanam guide",
  description:
    "Return Trikaala's step-by-step outline of the Sandhyavandhanam practice, optionally a single step.",
  inputSchema: {
    step: z
      .number()
      .int()
      .optional()
      .describe("1-based step number. Omit to return all steps."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ step }) => {
    const steps =
      step == null
        ? GUIDE_STEPS
        : GUIDE_STEPS.slice(step - 1, step);
    if (steps.length === 0) {
      return {
        content: [{ type: "text", text: `No step ${step}. The guide has ${GUIDE_STEPS.length} steps.` }],
        isError: true,
      };
    }
    const text = steps
      .map((s, i) => `${(step ?? i + 1) + (step == null ? 0 : 0)}. ${s.title} — ${s.body}`)
      .join("\n");
    return {
      content: [{ type: "text", text }],
      structuredContent: { steps, total: GUIDE_STEPS.length },
    };
  },
});
