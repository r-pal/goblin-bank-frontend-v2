# Goblin Bank Frontend

Two routes:

- `/tv`: XL public display (36" screen target)
- `/office`: mobile admin portal (`/office/login`, `/office/bank`, `/office/market`, `/office/messages`)

Adverts and media are **frontend-only** assets in `public/`:

- `public/assets/panels/`: panel/advert images — add or remove files here; the TV screen picks them up automatically (no code changes)
- `public/assets/tv-float/`: drifting background sprites — same drop-in behaviour
- `public/music/`: music files (note: browsers may block autoplay until the first user interaction)

## Backend

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

### Friendly name on your network (`.local`)

You can open the site as **`http://goblin-bank.local:1234`** instead of remembering an IP.

**One-time setup on the Mac:**

1. **System Settings → General → Sharing**
2. Set **Local Hostname** to `goblin-bank` (or another name; override with `LOCAL_DEV_NAME=my-name npm run dev`)
3. Restart `npm run dev` — the terminal prints a **Friendly** line

iPhone/iPad on the same Wi‑Fi can use that URL in Safari (`http://`, not `https://`). macOS advertises the name via Bonjour (mDNS).

### Other devices on your Wi‑Fi

After `npm run dev`, Vite prints **Network** and **Friendly** URLs. Prefer the Friendly name if you set it up; otherwise use the Network IP that matches your Wi‑Fi subnet (usually `en0`):

- **Use** `http://172.16.14.24:1234` (example — copy the line that is *not* `10.x`, `100.x`, or `localhost`)
- **Ignore** `10.5.0.2` — that is almost always a VPN (Tailscale, etc.) and will not work from a phone on normal Wi‑Fi
- Type **`http://`** explicitly in Safari (not `https://`)

The backend must still be running on this Mac (`localhost:4000`); phones reach it through the Vite proxy.

**If the phone cannot connect:**

1. Confirm the phone is on the **same Wi‑Fi** (not mobile data) and its IP is in the same range (e.g. `172.16.14.x` for `172.16.14.24`).
2. Many campus/guest networks block device-to-device traffic (**AP isolation**). Try a home router, or **Personal Hotspot** from the Mac to the phone.
3. **macOS Firewall:** System Settings → Network → Firewall → Options → allow incoming connections for **node** (or turn the firewall off briefly to test).
4. Restart dev after IP changes: `npm run dev` and use the new Network URL.

## Office login

| Name | Secret | Access |
|------|--------|--------|
| `snivell` | `sssh` | Bank, Market, Messages |
| `pawn` | `teehee` | Market, Messages only |

## Theme override button (testing)

Bottom-right pill button cycles:

`Auto` → `Day` → `Night` → `Auto`

`Auto` follows local time: day = 08:00–19:59, night = 20:00–07:59.

