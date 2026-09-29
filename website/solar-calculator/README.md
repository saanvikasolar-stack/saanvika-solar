# Saanvika Solar – Rooftop Area & Savings Calculator

A single self-contained HTML widget (`index.html`) for the Saanvika Solar website.
Visitors enter their monthly electricity bill and rooftop area and instantly see:

- Recommended system size (kW), panel count and roof area used, with a live top-view roof drawing
- Bill today vs. bill with solar, and monthly savings
- Approximate system cost, PM Surya Ghar subsidy (homes), net cost and payback years
- 25-year savings and CO₂ avoided
- A **WhatsApp this plan** button that sends the visitor's numbers to 85198 33679 as a ready-made enquiry

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
   | Desktop | 900 px or wider (two-column layout) | **1,230 px** |
   | Mobile | phone width | **2,360 px** |

   If the element on desktop is narrower than 900 px, the calculator switches to one column. Set the height to about 2,100 px in that case.
5. Publish.

## Update the numbers (before going live)

All business numbers sit in the `CONFIG` block at the top of the `<script>` in `index.html`.
**Replace the placeholder prices with Saanvika's real price list.**

| Setting | Current value | What it controls |
|---|---|---|
| `home.pricePerKw` | ₹65,000 (≤2 kW), ₹62,000 (3 kW), ₹58,000 (≤5 kW), ₹55,000 (above) | Home system price per kW |
| `business.pricePerKw` | ₹52,000 (≤10 kW), ₹45,000 (≤50 kW), ₹40,000 (above) | Business system price per kW |
| `elevatedExtraPerKw` | ₹8,000 | Extra cost per kW for an elevated structure |
| `home.ratePerUnit` / `business.ratePerUnit` | ₹7.5 / ₹10 | Average electricity cost per unit (visitors can also change this) |
| `unitsPerKwPerMonth` | 120 | Monthly generation of 1 kW in Andhra Pradesh |
| `sqftPerKw` | 90 | Shadow-free roof area needed per kW |
| `subsidy` | ₹30,000/kW for first 2 kW, ₹18,000 for 3rd kW, max ₹78,000 | PM Surya Ghar central subsidy (homes only) |
| `whatsappNumber` / `phoneNumber` | 918519833679 | Where enquiries go |

After editing, paste the updated file into the same Embed HTML element again and publish.
