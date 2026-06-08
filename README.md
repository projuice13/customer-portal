# Customer Resource Portal

A Next.js + Tailwind CSS self-service portal for product assets, sales tools, and operational information. Built for Vercel deployment.

---

## What's inside

| Section | Status | Notes |
|---|---|---|
| Home | ✅ Live | Dashboard with section cards |
| Product Info | ✅ Live | Password protected (`grapes`), split-panel browser |
| Ask Me Anything | ✅ Live | Framework ready — wire up LLM when needed |
| Profit Calculator | ✅ Live | Smoothie / Shake / Custom presets |
| Delivery Info | 🔜 Coming soon | Placeholder in nav |
| Posters & Downloads | 🔜 Coming soon | Placeholder in nav |
| Spec Sheets | 🔜 Coming soon | Placeholder in nav |
| FAQs | 🔜 Coming soon | Placeholder in nav |

---

## Quick start

### Prerequisites
- Node.js 18+ ([nodejs.org](https://nodejs.org))
- npm 9+

### Local setup

```bash
# 1. Clone or download the project
cd customer-resource-portal

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local if you want to change the Product Info password

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PRODUCT_INFO_PASSWORD` | No | `grapes` | Password for the Product Info section |
| `WEBSITE_API_URL` | No | — | Your website's REST API base URL (for Ask Me Anything) |
| `WEBSITE_API_KEY` | No | — | API key for website REST API |
| `ANTHROPIC_API_KEY` | No | — | Claude API key (for future AI answers) |

---

## Project structure

```
src/
├── app/                    # Next.js App Router pages + API routes
│   ├── page.tsx            # Home dashboard
│   ├── product-info/       # Product browser (password protected)
│   ├── ask/                # Ask Me Anything
│   ├── profit-calculator/  # Profit Calculator
│   └── api/                # API routes (ask, unlock)
├── components/
│   ├── layout/             # AppShell, TopNav, PageHeader
│   ├── home/               # LinkCard
│   ├── products/           # ProductCard, ProductGrid, ProductDetailPanel, etc.
│   ├── ask/                # AskForm, AnswerPanel
│   ├── calculator/         # CalculatorRow, CalculatorSummary
│   └── ui/                 # EmptyState, SkeletonLoader, SearchBar, FilterDropdown
├── data/
│   ├── products.ts         # Mock product catalogue (~8 products)
│   ├── calculator-presets.ts # Smoothie / Shake / Custom presets
│   └── nav.ts              # Navigation config
├── lib/
│   ├── types.ts            # All TypeScript interfaces
│   ├── utils.ts            # cn(), formatPence(), calculateResult(), etc.
│   └── ask/
│       ├── adapter-local.ts    # Searches local product data
│       ├── adapter-website.ts  # Fetches from WEBSITE_API_URL
│       └── composer.ts         # Combines adapters → structured answer
└── middleware.ts           # Intercepts /product-info/*, checks auth cookie
```

---

## Mock data

Product data lives in [`src/data/products.ts`](src/data/products.ts). Each product has:
- Title, category, product type
- Short + long description
- Ingredients and allergens
- A `resources[]` array of downloadable assets

To replace with real data, swap `products` from a CMS, database, or API call in the server components or data-fetch layer. The types in `src/lib/types.ts` define the expected shape.

Product images are referenced as `/products/<name>.jpg` — place real images in `public/products/`.

---

## Adding API/CMS integration

### Website REST API (Ask Me Anything)
Edit [`src/lib/ask/adapter-website.ts`](src/lib/ask/adapter-website.ts) to match your website's API response shape. Set `WEBSITE_API_URL` in `.env.local`.

### LLM / AI answers
In [`src/lib/ask/composer.ts`](src/lib/ask/composer.ts), replace the placeholder response block with an Anthropic or OpenAI API call. Pass `localResults` and `websiteResults` as context. Install the SDK:

```bash
npm install @anthropic-ai/sdk
```

### CMS
Replace the static import in `src/data/products.ts` with a `fetch()` to your CMS API. Add the CMS domain to `next.config.ts` `remotePatterns` for images.

---

## Vercel deployment

1. Push to a GitHub repository
2. Import the repo in [vercel.com](https://vercel.com)
3. Add environment variables in the Vercel dashboard:
   - `PRODUCT_INFO_PASSWORD`
   - `WEBSITE_API_URL` (optional)
   - `WEBSITE_API_KEY` (optional)
4. Deploy — no special build config needed

---

## Figma / design handoff

The project is structured to support a Figma MCP workflow:
- Components are small and isolated — easy to map 1:1 to Figma frames
- Tailwind config (`tailwind.config.ts`) is where brand colours and fonts are set
- Replace `brand.*` colours in the config with your brand palette
- Replace `Inter` in `src/app/layout.tsx` with your chosen typeface via `next/font`

---

## Scripts

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Serve production build locally
npm run lint     # Run ESLint
```
