import { defineMcp } from "@lovable.dev/mcp-js";
import getGuide from "./tools/get-guide";
import getSandhyaTimes from "./tools/get-sandhya-times";
import getSessionInfo from "./tools/get-session-info";

export default defineMcp({
  name: "trikaala",
  title: "Trikaala",
  version: "0.1.0",
  instructions:
    "Reference tools for Trikaala, a calm Sandhyavandhanam practice companion. Use `get_sandhya_times` to compute sunrise/solar-noon/sunset Sandhya timings for a location, `get_sandhyavandhanam_guide` for the step-by-step practice outline, and `get_session_info` to describe the three daily sessions and Gayatri japa presets. Practice logs live only in the user's browser and are not available here.",
  tools: [getSandhyaTimes, getGuide, getSessionInfo],
});
