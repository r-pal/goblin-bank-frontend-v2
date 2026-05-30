# Goblin Bank Frontend

Two routes:

- `/tv`: XL public display (36" screen target)
- `/office`: mobile admin portal (`/office/login`, `/office/bank`, `/office/market`, `/office/messages`)

Adverts and media are **frontend-only** assets in `public/`:

- `public/adverts/`: advert images (`.png`, `.jpg`, `.webp`, `.svg`), rotated every 10 seconds (random order)
- `public/tv-float/`: images that drift in the TV background (theme-tinted like the main goblin)
- `public/music/`: music files (note: browsers may block autoplay until the first user interaction)

## Backend

In `/Users/robertpallot/Desktop/coding/bank-v2/goblin-bank-backend`:

```bash
npm install
npm run dev
```

Backend defaults to `http://localhost:4000`.

## Frontend (this repo)

```bash
npm install
npm run dev
```

Vite proxies `/api/*` to `http://localhost:4000` (see `vite.config.ts`).

## Office login

- Name: `snivell`
- Secret: `sssh`

## Theme override button (testing)

Bottom-right pill button cycles:

`Auto` → `Day` → `Night` → `Auto`

`Auto` follows local time: day = 08:00–19:59, night = 20:00–07:59.

