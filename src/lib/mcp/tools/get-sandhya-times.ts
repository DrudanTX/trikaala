import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import SunCalc from "suncalc";
import { SESSION_INFO } from "../content";

export default defineTool({
  name: "get_sandhya_times",
  title: "Get Sandhya times",
  description:
    "Compute the sun-based times for the three daily Sandhyas (Pratah at sunrise, Madhyahnikam at solar noon, Sayam at sunset) for a latitude/longitude and date.",
  inputSchema: {
    latitude: z.number().describe("Latitude in decimal degrees, -90 to 90."),
    longitude: z.number().describe("Longitude in decimal degrees, -180 to 180."),
    date: z
      .string()
      .optional()
      .describe("Date as YYYY-MM-DD. Defaults to today (UTC)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ latitude, longitude, date }) => {
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return { content: [{ type: "text", text: "Latitude or longitude out of range." }], isError: true };
    }
    const when = date ? new Date(`${date}T12:00:00Z`) : new Date();
    if (Number.isNaN(when.getTime())) {
      return { content: [{ type: "text", text: "Invalid date; use YYYY-MM-DD." }], isError: true };
    }
    const t = SunCalc.getTimes(when, latitude, longitude);
    const times = {
      pratah: t.sunrise?.toISOString() ?? null,
      madhyahnikam: t.solarNoon?.toISOString() ?? null,
      sayam: t.sunset?.toISOString() ?? null,
    };
    const text = SESSION_INFO.map(
      (s) => `${s.name} (${s.when}): ${times[s.key] ?? "not available at this latitude/date"}`,
    ).join("\n");
    return {
      content: [{ type: "text", text: `${text}\n(Times are UTC ISO timestamps.)` }],
      structuredContent: { date: when.toISOString().slice(0, 10), latitude, longitude, times },
    };
  },
});
