# Goblin Bank Frontend

Two routes:

- `/tv`: XL public display (36" screen target)
- `/office`: mobile admin portal (`/office/login`, `/office/bank`, `/office/market`, `/office/messages`)

Adverts and media are **frontend-only** assets in `public/`:

- `public/assets/panels/`: panel/advert images — add or remove files here; the TV screen picks them up automatically (no code changes)
- `public/assets/tv-float/`: drifting background sprites — same drop-in behaviour
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

| Name | Secret | Access |
|------|--------|--------|
| `snivell` | `sssh` | Bank, Market, Messages |
| `pawn` | `teehee` | Market, Messages only |

## Theme override button (testing)

Bottom-right pill button cycles:

`Auto` → `Day` → `Night` → `Auto`

`Auto` follows local time: day = 08:00–19:59, night = 20:00–07:59.

