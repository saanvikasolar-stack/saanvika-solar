import { BRAND, brandContextPrompt, type ContentMode } from "./brand";

export type AgentRequest = {
  mode: ContentMode;
  prompt: string;
  language?: "en" | "te";
};

export type AgentResponse = {
  content: string;
  mode: ContentMode;
  source: "openai" | "local";
};

function detectIntent(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("subsidy") || p.includes("surya ghar") || p.includes("muft"))
    return "subsidy";
  if (p.includes("site visit") || p.includes("inspection") || p.includes("survey"))
    return "site_visit";
  if (p.includes("how solar") || p.includes("how it works") || p.includes("net meter"))
    return "how_it_works";
  if (p.includes("festival") || p.includes("sankranti") || p.includes("ugadi") || p.includes("diwali"))
    return "festival";
  if (p.includes("3 kw") || p.includes("3kw") || p.includes("bill"))
    return "savings";
  return "general";
}

function ctaLine(language: "en" | "te"): string {
  if (language === "te") {
    return `కాల్ / WhatsApp: ${BRAND.phoneDisplay} | Instagram: @${BRAND.instagram} | ${BRAND.website}`;
  }
  return `Call / WhatsApp: ${BRAND.phoneDisplay} | Instagram: @${BRAND.instagram} | ${BRAND.website}`;
}

function localGenerate(req: AgentRequest): string {
  const language = req.language ?? "en";
  const intent = detectIntent(req.prompt);
  const topicHint = req.prompt.trim() || "rooftop solar for homes in Kakinada";

  if (req.mode === "whatsapp") {
    if (language === "te") {
      return [
        `నమస్తే 👋`,
        ``,
        `మీ ఇంటి పైన సోలార్ పెట్టాలనుకుంటున్నారా? ${BRAND.shortName} మీకు PM Surya Ghar సబ్సిడీ నుంచి ఇన్‌స్టాలేషన్ వరకు అంతా చూసుకుంటుంది.`,
        ``,
        `✅ MNRE రిజిస్టర్డ్ వెండర్`,
        `✅ ${BRAND.stats.subsidiesRedeemed}+ సబ్సిడీలు విజయవంతంగా`,
        `✅ ${BRAND.stats.rooftopInstalled}+ రూఫ్‌టాప్ సిస్టమ్స్`,
        ``,
        `ఉచిత సైట్ విజిట్ కోసం ఇప్పుడే మెసేజ్ చేయండి.`,
        ctaLine("te"),
      ].join("\n");
    }
    return [
      `Hi 👋 Thinking about rooftop solar for your home?`,
      ``,
      `${BRAND.shortName} is a registered PM Surya Ghar (MNRE) vendor in ${BRAND.location}. We handle subsidy paperwork end-to-end.`,
      ``,
      `✓ ${BRAND.stats.rooftopInstalled}+ systems installed`,
      `✓ ${BRAND.stats.subsidiesRedeemed} subsidies redeemed`,
      `✓ Free site visit for homeowners`,
      ``,
      `Topic focus: ${topicHint}`,
      ``,
      `Reply YES for a free site visit.`,
      ctaLine("en"),
    ].join("\n");
  }

  if (req.mode === "instagram") {
    const hooks: Record<string, string> = {
      subsidy: `Your electricity bill can drop — and the government helps pay for solar.`,
      site_visit: `Not sure if your roof is ready for solar? Start with a free site visit.`,
      how_it_works: `Solar looks complicated. Here’s how it actually works on a Kakinada roof.`,
      festival: `New year energy for your home — switch to solar this season.`,
      savings: `On a clear Kakinada day, a 3 kW system can generate around 12 units.`,
      general: `Have you been thinking about solar for your home, but don’t know where to start?`,
    };
    return [
      hooks[intent],
      ``,
      `${BRAND.shortName} is a registered PM Surya Ghar vendor helping ${BRAND.stats.rooftopInstalled}+ homes across Andhra Pradesh.`,
      ``,
      `What you get:`,
      `• End-to-end subsidy support (upto ₹78,000)`,
      `• Net metering with ${BRAND.grid}`,
      `• Local team in ${BRAND.location}`,
      ``,
      `Save this post. DM us “SOLAR” or call for a free site visit.`,
      ``,
      ctaLine("en"),
      ``,
      `#SaanvikaSolar #Kakinada #PMSuryaGhar #RooftopSolar #AndhraPradesh #SolarSubsidy #GoSolar #saanvika_solar`,
    ].join("\n");
  }

  if (req.mode === "facebook") {
    return [
      `Homeowners in ${BRAND.location} — rooftop solar is simpler than you think.`,
      ``,
      `${BRAND.shortName} is a registered PM Surya Ghar (MNRE) vendor. We’ve helped families redeem ${BRAND.stats.subsidiesRedeemed} subsidies and install ${BRAND.stats.rooftopInstalled}+ rooftop systems.`,
      ``,
      `Under PM Surya Ghar:`,
      `• ₹30,000/kW for the first 2 kW`,
      `• ₹18,000/kW for the next 1 kW`,
      `• Max subsidy ₹78,000 (systems above 3 kW)`,
      `• Scheme active through ${BRAND.subsidy.activeUntil}`,
      ``,
      `We handle the paperwork. You get lower bills.`,
      ``,
      `Comment “VISIT” or message us for a free site inspection.`,
      ctaLine("en"),
      ``,
      `Follow us on Instagram: @${BRAND.instagram}`,
    ].join("\n");
  }

  if (req.mode === "google_ad") {
    return [
      `Google Ads — Rooftop Solar (${BRAND.location})`,
      ``,
      `Headline 1: PM Surya Ghar Vendor | Kakinada`,
      `Headline 2: Get Upto ₹78,000 Solar Subsidy`,
      `Headline 3: Free Site Visit | ${BRAND.shortName}`,
      ``,
      `Description 1: Registered MNRE vendor. ${BRAND.stats.subsidiesRedeemed}+ subsidies redeemed. We handle paperwork end-to-end.`,
      `Description 2: Rooftop solar for homes in Kakinada. Call ${BRAND.phoneDisplay} or visit ${BRAND.website}`,
      ``,
      `Final URL: ${BRAND.website}`,
      `Display path: Solar / Kakinada`,
      `Call extension: ${BRAND.phoneDisplay}`,
    ].join("\n");
  }

  if (req.mode === "flyer") {
    return [
      `FLYER COPY`,
      ``,
      `Headline: ${BRAND.tagline}`,
      `Subhead: Registered PM Surya Ghar Vendor for homes in ${BRAND.location}`,
      ``,
      `Bullets:`,
      `• Upto ₹78,000 government subsidy`,
      `• ${BRAND.stats.rooftopInstalled}+ rooftop systems installed`,
      `• Full subsidy paperwork handled by us`,
      `• Free site visit & inspection support`,
      ``,
      `Proof strip: ${BRAND.stats.applicationsApproved} applications approved · ${BRAND.stats.subsidiesRedeemed} subsidies redeemed`,
      ``,
      `CTA: Call / WhatsApp ${BRAND.phoneDisplay}`,
      `Web: ${BRAND.website}`,
      `Instagram: @${BRAND.instagram}`,
      ``,
      `Footer: Scheme active through ${BRAND.subsidy.activeUntil}`,
    ].join("\n");
  }

  if (req.mode === "faq_reply") {
    if (intent === "subsidy" || intent === "savings") {
      return [
        `Great question.`,
        ``,
        `Under ${BRAND.subsidy.scheme}:`,
        `• First 2 kW: ₹30,000 per kW`,
        `• Next 1 kW: ₹18,000 per kW`,
        `• Maximum subsidy: ₹78,000 for systems above 3 kW`,
        ``,
        `So a typical 3 kW home system can get the full ₹78,000 subsidy (subject to eligibility and approval).`,
        ``,
        `${BRAND.subsidy.note} Scheme is active through ${BRAND.subsidy.activeUntil}.`,
        ``,
        `Want us to check your roof and bill? Call/WhatsApp ${BRAND.phoneDisplay}.`,
        `Instagram: @${BRAND.instagram}`,
      ].join("\n");
    }
    if (intent === "how_it_works") {
      return [
        `Here’s how rooftop solar works for homes in Kakinada:`,
        ``,
        ...BRAND.howItWorks.map((line) => `• ${line}`),
        ``,
        `We’re a registered PM Surya Ghar vendor and help with subsidy + net metering paperwork.`,
        ``,
        `Call/WhatsApp ${BRAND.phoneDisplay} for a free site visit.`,
      ].join("\n");
    }
    return [
      `Thanks for asking about “${topicHint}".`,
      ``,
      `${BRAND.shortName} is a registered PM Surya Ghar (MNRE) vendor in ${BRAND.location}. We’ve installed ${BRAND.stats.rooftopInstalled}+ rooftop systems and redeemed ${BRAND.stats.subsidiesRedeemed} subsidies for homeowners.`,
      ``,
      `We can guide you on subsidy eligibility, system size, and a free site visit.`,
      ``,
      ctaLine("en"),
    ].join("\n");
  }

  // campaign_plan
  return [
    `7-DAY CAMPAIGN — Book free site visits (@${BRAND.instagram})`,
    `Goal: Get homeowners in ${BRAND.location} to call/WhatsApp for a free site visit.`,
    ``,
    `Day 1 — Problem: High electricity bills. Reel + WhatsApp status.`,
    `Day 2 — Proof: “${BRAND.stats.rooftopInstalled}+ homes. ${BRAND.stats.subsidiesRedeemed} subsidies redeemed.” Carousel.`,
    `Day 3 — Subsidy explainer: ₹30k / ₹18k / max ₹78k. Static post + Stories quiz.`,
    `Day 4 — How it works: panels → inverter → ${BRAND.grid} net meter. Short Reel.`,
    `Day 5 — Local trust: Kakinada rooftop story + site inspection process.`,
    `Day 6 — Offer: Free site visit this week. WhatsApp broadcast + FB post.`,
    `Day 7 — CTA day: “DM SOLAR / Call ${BRAND.phoneDisplay}”. Stories + pinned comment.`,
    ``,
    `Hashtags: #SaanvikaSolar #saanvika_solar #Kakinada #PMSuryaGhar #RooftopSolar`,
    `Track: calls, WhatsApp replies, Instagram DMs mentioning SOLAR.`,
  ].join("\n");
}

async function openAIGenerate(req: AgentRequest): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const modeLabel = req.mode.replace("_", " ");
  const language =
    req.language === "te" ? "Write primarily in Telugu (clear, conversational)." : "Write in clear English.";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: brandContextPrompt() },
        {
          role: "user",
          content: `Create ${modeLabel} marketing content for Instagram @${BRAND.instagram} / website ${BRAND.website}.\n${language}\n\nUser brief:\n${req.prompt}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    console.error("OpenAI error", await res.text());
    return null;
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content?.trim() || null;
}

export async function runMarketingAgent(
  req: AgentRequest
): Promise<AgentResponse> {
  const prompt = req.prompt?.trim();
  if (!prompt) {
    throw new Error("Please describe what you want the agent to create.");
  }

  const ai = await openAIGenerate(req);
  if (ai) {
    return { content: ai, mode: req.mode, source: "openai" };
  }

  return {
    content: localGenerate(req),
    mode: req.mode,
    source: "local",
  };
}
