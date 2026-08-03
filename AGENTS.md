# Saanvika Solar Systems

A Wix headless site built with the `wix-headless` skill. Kakinada, Andhra Pradesh rooftop solar installer — registered PM Surya Ghar (MNRE) vendor with APEPDCL net metering and end-to-end subsidy paperwork.

## Live site
- **Site:** https://saanvika-s-c74db25d-bodduvinod789.wix-site-host.com
- **Dashboard:** https://manage.wix.com/dashboard/0426c9e8-6060-4352-b0a6-e11c0dc207ff

## Frontend
astro (Wix-hosted). Run: `wix dev`. Build + publish: `wix build` then `wix release`.

## Features
- CMS → About and FAQ content collections (Kakinada-local voice)
- Forms → contact / lead form into Wix CRM
- Bookings → services catalog with free site survey booking
- Operations dashboard → staff ops at `/ops` with individual logins (owner can add more staff)

## Pages
`/` · `/about` · `/faq` · `/contact` · `/services` · `/services/[slug]` · `/booking-confirmation` · `/manage-booking` · `/ops` · `/ops/login`

## Seeded content
About + FAQ collections (6 FAQ items) · 1 contact form · 3 bookable services · 2 staff members in Bookings

## Extending
Built with the `wix-headless` skill; re-run it to add features or restyle.
