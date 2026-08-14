export interface GuideStep {
  title: string;
  body: string;
}

export const GUIDE_STEPS: GuideStep[] = [
  { title: "Achamanam", body: "Sip water thrice with the names of Keshava, Narayana, Madhava — purifying body and intent." },
  { title: "Pranayama", body: "Steady the breath. Inhale through the left, retain, exhale through the right — calming the channels of awareness." },
  { title: "Sankalpa", body: "Set the intention: place, time, and the quiet purpose of this Sandhya." },
  { title: "Marjanam", body: "Sprinkle water with mantras — the symbolic cleansing of the inner field." },
  { title: "Arghyam", body: "Offer water to the Sun at the meeting of two times — the Sandhi." },
  { title: "Gayatri Japa", body: "Repeat the Gayatri mantra with awareness. 11, 32, 64, 108 — or whatever the moment allows." },
  { title: "Upasthanam", body: "Stand in salutation. Offer the practice back to the Light." },
];

export const SESSION_INFO = [
  {
    key: "pratah",
    name: "Pratah",
    sanskrit: "प्रातः",
    when: "Morning, around sunrise",
    description: "The dawn Sandhya, offered at the meeting of night and day.",
  },
  {
    key: "madhyahnikam",
    name: "Madhyahnikam",
    sanskrit: "माध्याह्निकम्",
    when: "Noon, around solar midday",
    description: "The midday Sandhya, offered when the sun is at its zenith.",
  },
  {
    key: "sayam",
    name: "Sayam",
    sanskrit: "सायम्",
    when: "Evening, around sunset",
    description: "The dusk Sandhya, offered at the meeting of day and night.",
  },
] as const;

export const GAYATRI_PRESETS = [11, 32, 64, 108];
