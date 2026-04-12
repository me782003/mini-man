@AGENTS.md

# Shoes Store — AI Coding Assistant Reference

## Project Overview

E-commerce shoe store UI prototype. Next.js 16 + React 19 + TypeScript + Tailwind CSS + next-intl (EN/AR).
Currently a static UI — no real API, no auth, no persistent state.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.3 (App Router) |
| UI | React 19.2.4 |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 3.3.5 |
| i18n | next-intl 4.9.0 |
| Carousel | Swiper 12.1.3 |
| Icons | lucide-react 1.8.0 + custom SVGs in `src/components/icons.tsx` |
| Package manager | npm |

---

## Folder Structure

```
src/
  app/
    layout.tsx                  # Root layout: sets <html lang dir>
    page.tsx                    # Returns null — middleware redirects to /en
    globals.css                 # @font-face + Tailwind directives + global reset
    [locale]/
      layout.tsx                # NextIntlClientProvider + Header + Footer
      page.tsx                  # Home
      cart/page.tsx
      checkout/page.tsx
      contact/page.tsx
      payment/page.tsx
      shipping/page.tsx
      products/
        page.tsx
        [id]/page.tsx
  components/
    Header.tsx                  # "use client" — sticky on scroll, locale-aware links
    Footer.tsx                  # Static footer with social icons
    LanguageSwitch.tsx          # "use client" — toggles en/ar
    ProductCard.tsx             # Reusable card UI
    SectionHeader.tsx           # Reusable section heading
    SwiperSection.tsx           # "use client" — carousel wrapping ProductCard
    icons.tsx                   # All SVG icon exports
    Home/                       # HeroSection.jsx, HomeProductsSection.tsx, ProductReviews.tsx
    Products/                   # FiltersSidebar.tsx, ProductsGrid.tsx, ProductDetail.tsx
    Cart/CartClient.tsx
    Checkout/CheckoutClient.tsx
    Contact/ContactClient.tsx
    Payment/PaymentClient.tsx
    Shipping/ShippingClient.tsx
  i18n/
    routing.ts                  # defineRouting({ locales: ['en','ar'], defaultLocale: 'en' })
    navigation.ts               # createNavigation(routing) — exports Link, useRouter, usePathname
    request.ts                  # getRequestConfig — loads messages/{locale}.json
  messages/
    en.json                     # { "Header": { home, orderNow, branches, contact, langShort } }
    ar.json                     # Arabic equivalents
  middleware.ts                 # createMiddleware(routing) — locale prefix enforcement
```

---

## Routing Rules

- **ALL user routes live under `[locale]/`**. Never create a page outside this segment.
- Middleware `src/middleware.ts` auto-prefixes locale. Matcher: `['/', '/(en|ar)/:path*', '/((?!_next|.*\\..*).*)']`
- For navigation inside components, always import `Link`, `useRouter`, `usePathname` from `@/i18n/navigation` — NOT from `next/navigation`. This ensures locale is preserved.

---

## Component Pattern

1. **Page files** (`page.tsx`) = server components. Thin shells that import one client component.
2. **Interactive components** = `"use client"` at top. Live in `src/components/<Feature>/<FeatureName>Client.tsx`.
3. **Reusable primitives** = `ProductCard`, `SectionHeader`, `SwiperSection` in `src/components/`.

```tsx
// page.tsx — server component
import CartClient from '@/components/Cart/CartClient';
export default function CartPage() {
  return <main className="my-28"><CartClient /></main>;
}
```

---

## Styling Rules

- Use Tailwind utility classes exclusively. No CSS modules (except the unused `page.module.css`).
- Container: `<div className="container mx-auto px-4">` — max-width 1280px, centered.
- Font classes:
  - `font-beatrice` — English display/heading text
  - `font-headline` — Beatrice Headline, for large section titles
  - `font-cairo` — body text, Arabic text (default body font globally)
- Conditional classes: use template literals `` `border ${condition ? 'class-a' : 'class-b'}` ``. No clsx/cn installed.
- No shared color tokens beyond `--background`/`--foreground` in globals.css. Use Tailwind defaults.
- `.bg-1` class = hero background image with white overlay (defined in globals.css, do not duplicate).
- RTL is handled globally via `dir` attribute on `<html>` — Tailwind's `rtl:` variants are available.

---

## Internationalization

- Locales: `en` (default), `ar`
- Only one namespace currently exists: `"Header"` with 5 keys.
- **Adding translations**: add key to BOTH `src/messages/en.json` and `src/messages/ar.json`.
- **Using translations in client components**:
  ```tsx
  'use client';
  import { useTranslations } from 'next-intl';
  const t = useTranslations('Header');
  return <span>{t('home')}</span>;
  ```
- **Server components**: use `getTranslations` from `next-intl/server`.
- Arabic text: `font-cairo` class + automatic RTL from `dir="rtl"` on html.

---

## Data Layer (Current State)

**No real API exists.** All data is hardcoded:
- Products: inline `const PRODUCTS = [...]` inside component/page files
- Cart: hardcoded in `CartClient.tsx`
- Reviews: hardcoded in `ProductReviews.tsx`

When adding real data:
- Use server components or Server Actions (Next.js 16 pattern — check `node_modules/next/dist/docs/`)
- Add shared types to a new `src/types/` directory
- Product images live in `public/images/` — reference as `/images/filename.png`

---

## Images

- Use `next/image` — NEVER plain `<img>`.
- Static assets in `public/images/`. Reference path: `/images/filename.png`.
- For product cards with unknown sizes, use `fill` prop with a positioned parent.

---

## TypeScript

- Strict mode on. Never use `any` — define interfaces.
- Path alias: `@/*` → `src/*`. Use it consistently (some files incorrectly use relative paths).
- All new files must be `.tsx` (not `.jsx` — `HeroSection.jsx` is an existing inconsistency, do not replicate).

---

## Known Issues / Things to Avoid

1. **`HeroSection.jsx`** — only `.jsx` file, TypeScript not enforced there. Keep it in mind.
2. **`SwiperSection` uses `items: any[]`** — needs a proper generic type when you add real data.
3. **`page.module.css`** — scaffold leftover, effectively unused.
4. **Mixed import styles**: some files use relative paths instead of `@/`. Always use `@/`.
5. **No global cart/state**: implementing cart persistence requires adding a context or state manager (Zustand recommended).
6. **`products/[id]/page.tsx`**: `await params` result is unused — page always renders static mock data.
7. **No form validation**: shipping/payment/contact forms have no validation. Add when wiring up real submission.

---

## Scripts

```bash
npm run dev      # Development server at http://localhost:3000
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # ESLint (flat config, eslint-config-next)
```

No test runner is configured.

---

## Key Dependency Notes

- **next-intl v4** has a different API from v3. Use `createNavigation` (not `createLocalizedPathnamesNavigation`).
- **Swiper v12** — import from `swiper/react`, modules from `swiper/modules`. CSS: `swiper/css`, `swiper/css/navigation`, `swiper/css/free-mode`.
- **React 19** — use `use()` hook for promises if needed. `params` in dynamic page components is a `Promise<{...}>` and must be `await`ed.
- **Next.js 16** — may have API changes vs. 14/15. Check `node_modules/next/dist/docs/` before using any Next.js-specific API.
