# Saanvika Solar – Rooftop Area & Savings Calculator

A single self-contained HTML widget (`index.html`) for the Saanvika Solar website.
Visitors enter their monthly electricity bill and rooftop area and instantly see:

- Recommended system size (kW), panel count, panel wattage and roof area used, with a live top-view roof drawing
- Panel type choice: **Mono PERC** (value) or **TOPCon** (newer, higher wattage), with a wattage picker
- Bill today vs. bill with solar, and monthly savings
- System **price range** (depends on panel brand), PM Surya Ghar subsidy (homes), cost after subsidy and payback years
- Elevated structure option (+₹3,000 per kW)
- 25-year savings and CO₂ avoided
- A **WhatsApp this plan** button that sends the visitor's numbers, panels and price range to 85198 33679 as a ready-made enquiry

Design follows the brand posters: Telugu-first headline, solar orange `#EB770D`, deep navy `#122E3E`,
solar blue `#0C7DBE`, sunrise-sky background. No pop-ups.

## Add it to the Wix site

1. Open the site in the Wix Editor and go to the page where the calculator should appear
   (recommended: a dedicated **Solar Calculator** page linked from the menu and the homepage hero).
2. Add an **Embed HTML** element (Add Elements → Embed Code → Embed HTML).
3. Choose **Code**, paste the full contents of `index.html`, and click **Update**.
4. Stretch the element to full width and set its height so nothing is cut off:

   | View | Width of element | Height to set |
   |---|---|---|
   | Desktop | 900 px or wider (two-column layout) | **1,450 px** |
   | Mobile | phone width | **2,650 px** |

   If the element on desktop is narrower than 900 px, the calculator switches to one column. Set the height to about 2,350 px in that case.
5. Publish.

## Update the numbers

All business numbers sit in the `CONFIG` block at the top of the `<script>` in `index.html`.
Prices below are Saanvika's rates as of September 2026. Update them here when they change.

| Setting | Current value | What it controls |
|---|---|---|
| `priceRange` | 3 kW: ₹2,00,000 – ₹2,20,000 · 5 kW: ₹2,80,000 – ₹3,10,000 | Complete system price range. Other sizes follow the same line (for example 4 kW ≈ ₹2.40 – 2.65 lakh). Add more sizes such as `1`, `2` or `10` to fix those prices exactly. |
| (price split) | Lower half of the range = Mono PERC, upper half = TOPCon | Where each panel type sits in the range. Brand moves the price within that half. |
| `elevatedPerKw` | ₹3,000 | Extra per kW for an elevated structure |
| `panels.perc.watts` / `panels.topcon.watts` | 540/545/550 W · 580/590/600 W | Wattages offered in the picker |
| `sqftPerPanel` | 50 sq ft | Shadow-free roof area one panel needs, including spacing |
| `home.ratePerUnit` / `business.ratePerUnit` | ₹7.5 / ₹10 | Average electricity cost per unit (visitors can also change this) |
| `unitsPerKwPerMonth` | 120 | Monthly generation of 1 kW of panels in Andhra Pradesh |
| `subsidy` | ₹30,000/kW for first 2 kW, ₹18,000 for 3rd kW, max ₹78,000 | PM Surya Ghar central subsidy (homes only) |
| `whatsappNumber` / `phoneNumber` | 918519833679 | Where enquiries go |

Business (commercial and industrial) systems use the same price line until separate commercial rates are added.

After editing, paste the updated file into the same Embed HTML element again and publish.
