# Saanvika Solar – Calculator App

The rooftop solar calculator as a stand-alone, installable web app for sending to customers on WhatsApp.
Customers open a link; nothing to download from an app store. On Android, Chrome offers **Install app**;
on iPhone, a tip explains **Share → Add to Home Screen**. Once added, it opens full screen from its own
home-screen icon, and works offline after the first visit.

## Links

| What | Link |
|---|---|
| Link to send customers | **https://www.saanvikasolar.in/calculator** (Wix redirect to the app) |
| App (hosted on AppDeploy) | https://saanvika-solar-calculator-ygvfs9.v2.appdeploy.ai/ |
| AppDeploy app id | `saanvika-solar-calculator-ygvfs9` |

The `/calculator` redirect lives in the Wix site's SEO redirects. When the domain moves to the new Wix site,
create the same redirect there (from `/calculator` to the app link above).

## What customers see

- Brand bar with the Saanvika Solar logo, a share button and a call button
- "PM Surya Ghar registered vendor · MNRE" badge, Telugu headline, and track record (296 rooftops, 290+ subsidies, 1 MW+)
- The full calculator: bill, roof area (sq ft or sq yd), Home or Business, Mono PERC or TOPCon, wattage, elevated structure
- Homes see price range, PM Surya Ghar subsidy, cost after subsidy and payback. Business shows "Custom quote"
- **WhatsApp this plan** sends their numbers to 85198 33679
- Reasons to choose Saanvika, and a contact card (both numbers, WhatsApp, email, office address with Google Maps, website)

## WhatsApp link preview

`index.html` carries Open Graph tags, so WhatsApp shows a large branded card (logo, Telugu headline,
"Solar Savings Calculator", subsidy and phone numbers) instead of a bare link. The card image is
`assets/og-image.jpg` (1200 × 630). WhatsApp caches previews per link, so a changed card shows only on
links it hasn't seen before.

## Files

| Path | Purpose |
|---|---|
| `index.html` | Page, link-preview tags, install tags |
| `src/main.ts` | Calculator logic and app features (install, share, offline). **Prices live in `CONFIG` at the top** |
| `src/styles.css` | Brand styles |
| `public/manifest.webmanifest` | App name, colours and home-screen icons |
| `public/sw.js` | Offline support |
| `assets/` | Logo, icons and preview card, served from this public repo through jsDelivr (pinned to commit `637a273`) |
| `tests/tests.json` | Checks AppDeploy runs after each deploy |

The images load from `cdn.jsdelivr.net/gh/saanvikasolar-stack/saanvika-solar@637a273…`, which only works
while this repository is **public**.

## Updating prices

Edit `CONFIG` in `src/main.ts` (same numbers as `website/solar-calculator/index.html`), then redeploy the
app on AppDeploy (app id above). Customers get the new prices the next time they open it.

## Own domain (optional)

To show the app at an address like `calculator.saanvikasolar.in` instead of redirecting, AppDeploy's Plus plan
is required. Then add a DNS **CNAME** record for `calculator` pointing to `proxy-v2.appdeploy.ai`.
