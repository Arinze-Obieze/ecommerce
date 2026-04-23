# ZOVA Brand Alignment Implementation Plan

Date: 2026-04-23

## Purpose

This plan replaces the earlier design-token-only approach with a full brand-alignment plan grounded in the official ZOVA brand deck:

- Source of truth: `/home/arinze/Downloads/ZOVA Brand Package/ZOVA Brand Identity Presentation.pdf`
- Brand values: Trust, Fashion, Structure, Accessibility, Modernity
- Approved palette: Zova Forest `#2E6417`, Gold Harvest `#EC9C00`, Soft Linen `#F5F1EA`, Onyx Black `#191B19`
- Approved typeface: Panton
- Messaging direction: `Where trust meets the market` and `Verified Fashion, Made Easy`

The goal is not only to remove hardcoded colors and fonts, but to ensure the product feels visually and verbally consistent with the brand package across storefront, auth, account, store console, admin, and content surfaces.

## Current-State Findings

The codebase already contains partial ZOVA branding, but it is inconsistent:

- `app/globals.css` already defines core ZOVA color tokens and a Panton-first fallback stack.
- Panton is not yet bundled as a web font, so the app currently relies on fallbacks such as Outfit, Nunito, and Poppins.
- Logo assets already exist in `public/brand/` and in the checked-in `ZOVA Brand Package/` directory.
- Many components still hardcode `#2E6417`, `#EC9C00`, `#F5F1EA`, and `#191B19` inline.
- Several routes and components still define local `THEME` or `T` objects instead of consuming shared tokens.
- Some auth and content pages explicitly force non-brand fonts such as Outfit or load Google Fonts for Poppins.
- The plan that existed before this one aligned with typography and color cleanup, but did not cover logo treatment, tone of voice, or broader visual-system consistency.

## Brand Rules To Implement

### 1. Typography

- Treat `Panton` as the primary brand font across all app surfaces.
- Keep a fallback stack until licensed Panton web font files are added to the repo.
- Remove component-level font overrides unless a deliberate display style is documented.
- Do not import Google-hosted Poppins or other competing families on page-level routes.

### 2. Color System

- Use the four approved brand colors as the foundation of the design system.
- Centralize all reusable color values in `app/globals.css`.
- Replace component-local brand hex values and duplicate theme objects with shared tokens.
- Keep status colors separate from brand colors so semantic UI states remain clear.

### 3. Logo and Identity

- Standardize logo consumption from `public/brand/`.
- Verify the correct use of the main logo, white logo, and favicon based on surface/background contrast.
- Prevent ad hoc recreation of the wordmark or icon in CSS or text styling.

### 4. Voice and Messaging

- Align major marketing and trust-facing copy with the brand direction: confident, clear, professional, accessible.
- Use the approved tagline and alternative product promise only in places where brand messaging is appropriate.
- Avoid copy that sounds overly luxurious, generic-tech, or casual in a way that weakens credibility.

### 5. Visual Style

- Translate brand values into product UI decisions, not just tokens.
- Favor layouts that feel clean, structured, modern, and trustworthy.
- Use the gold accent sparingly for emphasis, not as a dominant surface color.
- Preserve accessibility and readability across mobile storefront pages and dense dashboard views.

## Implementation Strategy

### Phase 1: Establish The Canonical Brand System

### Files

- `app/globals.css`
- `app/layout.js`
- any existing font-loading or metadata helpers discovered during implementation

### Work

- Confirm `app/globals.css` as the single source of truth for:
  - brand colors
  - typography stacks
  - border/surface/text tokens
  - hover and soft-fill variants derived from the approved palette
- Rename or normalize duplicate `--zova-*` and `--color-*` tokens only if it reduces ambiguity without causing churn.
- Ensure `body` and default text styles inherit the shared ZOVA font stack.
- If licensed Panton files are available later, wire them into the same token contract rather than reworking component styles.

### Acceptance Criteria

- A single documented token system exists for colors and typography.
- No new component should need its own `THEME` object for base brand styling.
- Global body typography and default text colors are brand-aligned by default.

### Phase 2: Remove Local Theme Duplication

### Priority Targets

- `app/(auth)/**`
- `components/layout/**`
- `components/account/**`
- `components/storefront/home/**`
- `components/store-console/**`
- `app/(content)/**`

### Work

- Replace local `THEME` and `T` objects that merely duplicate brand tokens.
- Replace direct brand hex codes with shared CSS variables or approved Tailwind token usage.
- Remove page-specific font declarations that override the global ZOVA stack.
- Keep local component constants only when they represent true component-specific behavior, not brand primitives.

### Acceptance Criteria

- Brand colors and fonts are not repeatedly hardcoded in feature components.
- Auth, layout, account, and dashboard UI inherit the same base brand system.
- Searches for `const THEME`, `const T`, `#2E6417`, `#EC9C00`, `#F5F1EA`, and `font-family: 'Outfit'` show only approved exceptions.

### Phase 3: Logo, Favicon, and Brand Asset Audit

### Candidate Assets

- `public/brand/logo.svg`
- `public/brand/logo-white.svg`
- `app/icon.svg`
- `ZOVA Brand Package/Logo/**`

### Work

- Verify that header, footer, auth, and metadata surfaces use approved logo assets.
- Confirm favicon/app icon matches the packaged brand icon.
- Ensure dark/light surface usage selects the correct logo variant.
- Remove any improvised text-based logo rendering if found.

### Acceptance Criteria

- Every production logo reference maps to a checked-in brand asset.
- Favicon and app icon are consistent with the brand package.
- No surface uses an incorrect logo color treatment for its background.

### Phase 4: Messaging and Trust-Layer Alignment

### Priority Targets

- homepage hero and supporting sections
- auth screens
- trust bars, newsletter, promotions, and footer copy
- key empty states and transactional success states

### Work

- Review high-visibility copy against the brand tone described in the deck.
- Introduce approved messaging where it strengthens trust and clarity.
- Rewrite copy that feels generic, overly technical, or inconsistent with the marketplace’s verified-fashion positioning.
- Preserve product clarity over marketing flourish.

### Acceptance Criteria

- Hero and trust-oriented copy sound aligned with the brand deck.
- Core marketplace promises emphasize trust, verification, professionalism, and ease of use.
- The tagline is used intentionally rather than repeated everywhere.

### Phase 5: Visual Consistency Audit By Surface

### Storefront

- Review hero, category cards, promotional banners, product cards, and trust sections.
- Ensure the visual language feels premium yet approachable, not crowded or template-like.

### Auth and Account

- Ensure forms, cards, and empty states feel consistent with the main storefront.
- Remove decorative styles that conflict with the structured brand direction.

### Store Console and Admin

- Keep operational screens clearer and denser, but still on-brand through typography, colors, spacing, and interaction states.
- Avoid overusing accent colors in data-heavy contexts.

### Content and Legal

- Stop loading conflicting web fonts.
- Keep long-form reading surfaces calm, readable, and recognizably part of the same product family.

### Acceptance Criteria

- Each route group feels like the same company and product family.
- Dashboard surfaces remain utilitarian without drifting off-brand.
- Marketing/content pages do not look visually disconnected from the application shell.

## Recommended Execution Order

1. Lock the token contract in `app/globals.css`.
2. Remove font conflicts and duplicate local theme objects in auth, layout, and content routes.
3. Standardize logo and favicon usage.
4. Sweep storefront and account surfaces for remaining hardcoded brand styles.
5. Sweep store console and admin surfaces for token adoption and visual consistency.
6. Audit high-visibility copy and trust messaging.
7. Run final verification and produce a short brand-compliance report.

## Verification Plan

### Automated Checks

- Run repo searches for:
  - `const THEME`
  - `const T`
  - `#2E6417`
  - `#EC9C00`
  - `#F5F1EA`
  - `#191B19`
  - `font-family: 'Outfit'`
  - `fonts.googleapis.com`
  - `Poppins`
- Inspect logo references and favicon paths across `app/`, `components/`, and metadata definitions.

### Manual Review

- Compare homepage, auth, account, dashboard, and content pages side by side.
- Check mobile and desktop for typography consistency and color balance.
- Confirm gold is used as an accent, not a dominant UI fill.
- Confirm trust and verification messaging is present where users need reassurance most.

### Done Definition

- The app uses one shared ZOVA design system rather than repeating brand primitives locally.
- Major user-facing surfaces align with the brand deck in typography, color, logo usage, and tone.
- Remaining exceptions are documented explicitly as intentional.

## Risks and Constraints

- Panton appears to be the intended font, but web font files are not currently integrated; full fidelity depends on asset availability and licensing.
- Some legacy pages may require manual cleanup rather than regex-based replacement because they mix brand styling with component-specific state styling.
- Store console and admin screens may need lighter-touch branding to preserve operational clarity.
- Messaging updates should avoid introducing legal or product claims not already supported by platform behavior.

## Non-Goals

- This plan does not authorize a full product redesign from scratch.
- This plan does not replace accessibility, performance, or product-logic priorities.
- This plan does not require every semantic color in the product to map to a brand color.

## Deliverables

- updated global token contract
- cleaned component surfaces with reduced local brand duplication
- standardized logo and favicon usage
- aligned messaging on high-visibility surfaces
- final verification notes summarizing remaining exceptions
