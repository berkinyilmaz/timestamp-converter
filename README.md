# Timestamp Converter
Convert UNIX timestamps to human-readable dates — and back again — instantly.
No signup. No install. Just paste and convert.

---

## Live Demo
https://timestamp-converter-xi.vercel.app/

---

## Features
- **UNIX → Date** — paste any UNIX timestamp (seconds or milliseconds) and see it in every format
- **Date → UNIX** — pick a date & time and get the exact UNIX timestamp back
- **Swap direction** — flip between modes with one click
- **Live clock** — real-time UNIX timestamp counter in the header
- **12 timezone options** — preview the same moment across major world timezones
- **6 output formats** — ISO 8601, UTC, locale long, locale short, milliseconds, timezone name
- **Relative time** — "3 hours ago", "2 days from now"
- **Copy buttons** — copy any output value to clipboard instantly
- **Now button** — load the current timestamp in one click
- Fully responsive (mobile-friendly)
- Full keyboard accessibility
- No authentication
- No ads
- No watermarks

---

## Output Formats
| Format | Example |
|---|---|
| ISO 8601 | `2025-04-26T14:32:10.000Z` |
| UTC | `Sat, 26 Apr 2025 14:32:10 GMT` |
| Locale Long | `Cumartesi, 26 Nisan 2025 17:32:10` |
| Locale Short | `26.04.2025, 17:32:10` |
| Milliseconds | `1745677930000` |
| Timezone Name | `Eastern European Summer Time` |

---

## Supported Timezones
| Label | Zone |
|---|---|
| Local | System default |
| UTC | UTC |
| US/New York | America/New_York |
| US/Los Angeles | America/Los_Angeles |
| US/Chicago | America/Chicago |
| Europe/London | Europe/London |
| Europe/Paris | Europe/Paris |
| Europe/Istanbul | Europe/Istanbul |
| Asia/Tokyo | Asia/Tokyo |
| Asia/Shanghai | Asia/Shanghai |
| Asia/Dubai | Asia/Dubai |
| Australia/Sydney | Australia/Sydney |

---

## Tech Stack
- React 19 (Vite)
- CSS custom properties (Apple-inspired dark UI, no framework)
- Native `Intl.DateTimeFormat` API (no external date library)
- Vercel (static deploy)

---

## How It Works
1. Paste a UNIX timestamp into the top field (seconds or milliseconds — auto-detected)
2. Instantly see all output formats below
3. Select a timezone to localize the result
4. Use the **Now** button to load the current timestamp
5. Hit the **swap** button to switch to Date → UNIX mode
6. Copy any value to clipboard with one click

> All processing happens entirely in your browser via native JavaScript APIs. No external requests are made.

---

## Installation
```bash
# Clone the repo
git clone https://github.com/berkinyilmaz/timestamp-converter.git

# Install dependencies
cd timestamp-converter
npm install

# Run locally
npm run dev
```

---

## Privacy
Everything runs **locally in your browser**.
No data is stored, logged, or sent anywhere.
