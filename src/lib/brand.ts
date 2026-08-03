export const BRAND = {
  name: "Saanvika Solar Systems",
  shortName: "Saanvika Solar",
  website: "https://saanvikasolar.in",
  instagram: "saanvika_solar",
  instagramUrl: "https://www.instagram.com/saanvika_solar/",
  location: "Kakinada, Andhra Pradesh",
  area: "Ramanayyapeta, Kakinada",
  phone: "8519833679",
  phoneDisplay: "+91 85198 33679",
  whatsapp: "918519833679",
  grid: "APEPDCL",
  tagline: "Lets Talk Solar Solutions",
  heroQuestion:
    "Have you been thinking about solar for your home, but don’t know where to start?",
  credentials: [
    "Registered PM Surya Ghar Vendor (MNRE)",
    "Trusted by 290+ homes across Andhra Pradesh",
  ],
  stats: {
    rooftopInstalled: 296,
    applicationsApproved: 373,
    subsidiesRedeemed: 290,
    siteInspectionsApproved: 292,
  },
  subsidy: {
    scheme: "PM Surya Ghar: Muft Bijli Yojana",
    first2kW: "₹30,000 per kW for the first 2 kW",
    next1kW: "₹18,000 per kW for the next 1 kW",
    max: "₹78,000 total for systems above 3 kW",
    activeUntil: "31 March 2027",
    note: "We handle the entire application and subsidy paperwork on your behalf.",
  },
  howItWorks: [
    "Sunlight hits the panels on your roof and generates DC power.",
    "An inverter converts it to AC for your home.",
    "Unused power flows back to the APEPDCL grid through a net meter, and you are credited for those units.",
    "On a clear Kakinada day, a 3 kW system generates around 12 units — enough for most homes.",
  ],
  voice: {
    tone: "warm, clear, local, trustworthy",
    avoid: [
      "hype jargon",
      "fake urgency without facts",
      "technical overload",
      "generic pan-India claims without local proof",
    ],
    prefer: [
      "plain language for homeowners",
      "Kakinada / Andhra Pradesh local context",
      "PM Surya Ghar subsidy clarity",
      "proof via real installation and subsidy numbers",
      "invite to call or WhatsApp for a free site visit",
    ],
  },
} as const;

export type ContentMode =
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "google_ad"
  | "flyer"
  | "faq_reply"
  | "campaign_plan";

export const CONTENT_MODES: {
  id: ContentMode;
  label: string;
  description: string;
  promptHint: string;
}[] = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    description: "Short message for leads & broadcasts",
    promptHint: "Write a WhatsApp broadcast for festival season",
  },
  {
    id: "instagram",
    label: "Instagram",
    description: "Caption + hashtags for Reels or posts",
    promptHint: "Create an Instagram post about PM Surya Ghar subsidy",
  },
  {
    id: "facebook",
    label: "Facebook",
    description: "Local community post for Kakinada",
    promptHint: "Write a Facebook post for homeowners in Kakinada",
  },
  {
    id: "google_ad",
    label: "Google Ad",
    description: "Headline + description for search ads",
    promptHint: "Write Google ads for rooftop solar subsidy",
  },
  {
    id: "flyer",
    label: "Flyer Copy",
    description: "Headline, bullets, CTA for print",
    promptHint: "Write flyer copy for a colony awareness camp",
  },
  {
    id: "faq_reply",
    label: "FAQ Reply",
    description: "Customer question answered in brand voice",
    promptHint: "How much subsidy do I get for a 3 kW system?",
  },
  {
    id: "campaign_plan",
    label: "Campaign Plan",
    description: "7-day content plan for marketing",
    promptHint: "Plan a 7-day campaign to book free site visits",
  },
];

export function brandContextPrompt(): string {
  return `
You are the marketing agent for ${BRAND.name} (${BRAND.website}).

Company facts (use only these; do not invent prices, warranties, or offers):
- Location: ${BRAND.location} (${BRAND.area})
- Phone / WhatsApp: ${BRAND.phoneDisplay}
- Instagram: @${BRAND.instagram} (${BRAND.instagramUrl})
- Credential: Registered PM Surya Ghar Vendor (MNRE)
- Proof: ${BRAND.stats.rooftopInstalled} rooftop systems installed; ${BRAND.stats.applicationsApproved} PM Surya Ghar applications approved; ${BRAND.stats.subsidiesRedeemed} subsidies redeemed; ${BRAND.stats.siteInspectionsApproved} site inspections approved
- Subsidy: ${BRAND.subsidy.scheme} — ${BRAND.subsidy.first2kW}; ${BRAND.subsidy.next1kW}; capped at ${BRAND.subsidy.max}. Active through ${BRAND.subsidy.activeUntil}. ${BRAND.subsidy.note}
- Grid: ${BRAND.grid}
- Local generation: On a clear Kakinada day, a 3 kW system generates ~12 units
- Tagline: ${BRAND.tagline}

Brand voice: ${BRAND.voice.tone}. Prefer: ${BRAND.voice.prefer.join("; ")}. Avoid: ${BRAND.voice.avoid.join("; ")}.

Always include a clear CTA to call/WhatsApp ${BRAND.phoneDisplay}, follow @${BRAND.instagram}, or visit ${BRAND.website} when relevant.
For Instagram content, write captions that fit @${BRAND.instagram} — local Kakinada rooftop solar, subsidy clarity, and invite DMs/calls.
Write in the language the user asks for (English or Telugu). Default to clear English with local flavour.
`.trim();
}
