# CRED Build — Freemium Funnel Blueprint (Batch 3)

**Owner:** FreemiumFunnelArchitect (Pod 7)
**Platform:** Free photo/video editor + ticketing platform
**Compliance:** POPIA (South Africa) — first-party audience capture
**Path:** 70-Reverse-Engineering/cred-freemium-funnel.md (user-specified path; overrides standing default 50-Reverse-Engineering-REA/PLG-Data-Funnels/)

## 1. Free tier definition

| Entitlement | Free tier | Pro (paid) |
|---|---:|---:|
| Active projects | 3 | Unlimited |
| Assets per project | 5 | 100 |
| Max export quality | 720p | 1080p |
| Watermark on export | Yes | No |
| Priority ticketing queue | No | Yes |
| Price (ZAR/month) | R0 | R149 |

## 2. Upgrade triggers and modals

Three upgrade triggers fire upgrade modals at the moment of intent:

| Trigger | When it fires | Modal component | Upsell |
|---|---|---|---|
| `watermark-export` | Free user clicks Export (watermarked output) | `UpgradeModal` variant `watermark` | Remove watermark — upgrade to Pro |
| `project-limit` | Free user creates a 4th project (3-project cap) | `UpgradeModal` variant `project-limit` | Unlimited projects — upgrade to Pro |
| `quality-lock-1080p` | Free user selects the 1080p export preset | `UpgradeModal` variant `quality-lock` | 1080p export — upgrade to Pro |

Each modal shows a trigger-specific heading and body, the Pro price (R149/mo), what unlocks, an "Upgrade to Pro" CTA linking to checkout, and a "Keep free" dismissal that records the trigger impression for analytics.

## 3. Entitlements middleware (`apps/web/lib/entitlements.ts`, `apps/web/middleware.ts`)

`entitlements.ts` checks the org's plan plus live usage counters on every gated action:

- `canCreateProject(org, activeProjectCount)` — blocked at 3 active projects on Free → `project-limit` trigger
- `canAddAsset(project, assetCount)` — blocked at 5 assets on Free
- `canExport(org, quality)` — 720p allowed on Free; 1080p/4K blocked → `quality-lock-1080p` trigger; watermark applied on Free exports → `watermark-export` trigger at export click
- `canRemoveWatermark(org)` — blocked on Free → `watermark-export` trigger
- `incrementUsage` / `decrementUsage` — counters for projects, assets, exports (integration points to the org usage store)

`middleware.ts` (Next.js) matches `/dashboard/projects`, `/export`, `/tickets/*`: on deny it returns a 403 JSON body `{ error, upgradeTrigger, remaining }` so the frontend can render the matching modal; on allow it sets `X-Remaining-Projects` / `X-Remaining-Assets` response headers.

## 4. POPIA-compliant opt-in (`apps/web/components/consent/PopiaOptIn.tsx`)

First-party audience capture for analytics/events is consent-driven under POPIA:

- Analytics/events checkbox is **unchecked by default** (no pre-ticked boxes).
- Granular: analytics/events consent is separate from marketing consent; either can be given or refused independently.
- Plain-language purpose statement, link to the privacy policy, and the consent version.
- On capture: store `{ analytics, marketing, version, capturedAt, ipAddress }` tied to the user/org.
- Refusal does not block core editor features; consent can be withdrawn anytime from Settings, which stops future event capture.

## 5. Funnel stages

Visitor → Registered (email + POPIA opt-in) → Free user → Activated (first export; hits `watermark-export` trigger) → Upgrade modal impression → Paid (Pro)

Secondary monetization triggers: 4th-project block (`project-limit`) and 1080p selection (`quality-lock-1080p`).

## 6. Success metrics

- Activation rate: % of registered users who complete a first export
- Trigger-to-impression rate per modal (watermark / project-limit / quality-lock)
- Upgrade conversion per trigger
- POPIA opt-in rate and consent withdrawal rate
- Free-to-paid conversion % and MRR from free-tier upgrades

## 7. Files delivered

| Path | Purpose |
|---|---|
| `70-Reverse-Engineering/cred-freemium-funnel.md` | This blueprint |
| `apps/web/lib/plans.ts` | Free tier + Pro plan limits |
| `apps/web/lib/entitlements.ts` | Entitlement checks + usage counters |
| `apps/web/middleware.ts` | Next.js middleware wiring entitlements to routes |
| `apps/web/components/upgrade/UpgradeModal.tsx` | Three trigger-based upgrade modals |
| `apps/web/components/consent/PopiaOptIn.tsx` | POPIA analytics/events opt-in |
