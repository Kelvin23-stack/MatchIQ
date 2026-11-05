# Live football data setup (API-Football)

MatchIQ can run in two modes. **Demo** uses the built-in sample data. **Live** calls API-Football through a small server function, so the secret key never reaches the browser.

## What is where
| Piece | File | Runs on |
|---|---|---|
| Server proxy (holds the key, validates requests, caches) | `api/football.js` | Server only (Vercel Function, or Vite dev middleware) |
| Browser data layer (cache, de-duplication, error handling) | `footballApi.js`, `dataMode.js` | Browser |
| Provider response -> MatchIQ structures | `liveData.js` | Browser |
| Live screens | `LiveMatches.jsx`, `LiveMatchPage.jsx`, `LivePlayers.jsx`, `LiveBits.jsx` | Browser |

No Supabase or other backend existed in the project, so the simplest secure option is a **Vercel Serverless Function** (you already deploy on Vercel). You can move the same logic into a Supabase Edge Function later.

## 1. Get an API key
1. Create an account at https://www.api-football.com (dashboard: https://dashboard.api-football.com).
2. Copy your API key from the dashboard. **Do not paste it into any source file.**
3. Check your plan's limits on https://www.api-football.com/pricing. The free plan is limited (about 100 requests per day and a per-minute cap) and may exclude the current season. Verify the current terms yourself, they change.

## 2. Local development
```
npm install
cp .env.example .env        # then edit .env and set API_FOOTBALL_KEY=your_key
npm run dev
```
`.env` is git-ignored. The key is read by the Vite **server process** only. Do **not** rename it to `VITE_...`: any `VITE_` variable is shipped to the browser.

Open the app, go to **Settings -> Data source**, choose **Live data**, optionally set a season, and press **Test connection**.

## 3. Deploy on Vercel
1. Make sure the repository contains the folder `api/` with the file `football.js` (see "Uploading the api folder" below).
2. Vercel project -> **Settings -> Environment Variables**, add:
   - `API_FOOTBALL_KEY` = your key (Production, Preview). Leave "Sensitive" on if offered.
   - optional `API_FOOTBALL_LEAGUES` = `39` (comma-separated league ids the server will allow)
   - optional `API_FOOTBALL_SEASON` = default season year, e.g. `2025`
   - optional `VITE_DATA_MODE` = `live` (safe, non-secret: the starting mode for visitors)
3. Redeploy. Vercel detects `api/football.js` automatically.

### Uploading the api folder without the command line
On GitHub choose **Add file -> Create new file**, type `api/football.js` as the name (typing the slash creates the folder), paste the file contents, commit.

## 4. Premier League and seasons
Premier League is league id `39`. API-Football's `season` is the year the season starts (2025 = 2025/26). The server defaults to the current season from the date. If your plan does not include a season you will see a "plan" error with the provider's message, and you can pick another season in Settings.

## 5. Endpoints used (all through `/api/football?action=...`)
| action | API-Football endpoint | Notes |
|---|---|---|
| fixtures | `/fixtures` | by `live`, `date`, `from`+`to`, `next`, `last`, `round`; league restricted to the allow-list |
| fixture | `/fixtures?id=` | single match |
| lineups | `/fixtures/lineups` | empty until the provider publishes them (usually shortly before kickoff) |
| fixturePlayers | `/fixtures/players` | per-match player statistics and ratings |
| fixtureStats | `/fixtures/statistics` | team statistics |
| events | `/fixtures/events` | goals, cards, substitutions |
| standings | `/standings` | league table |
| teams, squad, teamStats | `/teams`, `/players/squads`, `/teams/statistics` | |
| players | `/players` | by `id`, by `team` (+`page`) or `search` (4+ letters) |
| topscorers, topassists | `/players/topscorers`, `/players/topassists` | provider top 20 |
| status | `/status` | plan and usage; the server returns only plan and request counts |

Only these actions exist; anything else returns 400. All parameters are validated server-side.

## 6. Caching and rate limits
- **CDN/shared cache:** the server sets `Cache-Control: s-maxage` so Vercel caches identical requests for all visitors. Live fixtures 45 s, today's fixtures 2 min, upcoming 10 min, finished data 1-6 h, lineups 5 min before kickoff then 1-6 h, player season stats 1 h, teams 24 h.
- **Per-instance memory cache** on the server and **browser cache** (memory + sessionStorage) with in-flight de-duplication, so switching tabs does not repeat requests.
- Live match lists refresh every 60 s only while that tab is open and the page is visible.
- Failures are **not** retried automatically. After a rate-limit error the browser pauses requests for a minute (10 minutes after a daily-quota error). If an older cached copy exists it is shown with a clear "cached" warning, otherwise you see an error. Demo numbers are never substituted.
- Data shown from cache is labelled "cached, not real-time" with its fetch time.

## 7. Verify the key is not exposed
1. `npm run build`, then search the output: `grep -r "YOUR_ACTUAL_KEY" dist` must print nothing. Also check `grep -ri "x-apisports-key" dist` prints nothing.
2. Open the deployed site, DevTools -> Network. Requests go to `/api/football?...` only. Look at the request and response headers/bodies: your key must not appear. No request goes to `v3.football.api-sports.io` from the browser.
3. DevTools -> Sources: search for your key. It must not be found.
4. Confirm the key is not in the repository: `git log -p | grep "YOUR_ACTUAL_KEY"` prints nothing, and `.env` is in `.gitignore`.
If a key was ever committed, rotate it in the API-Football dashboard.

## 8. Monitor usage
- Settings -> Data source -> **Test connection** shows plan and requests used today.
- The banner above live lists shows "API requests left today" from the provider's rate-limit headers.
- The API-Football dashboard shows detailed usage. Daily limits reset at 00:00 UTC.

## 9. Known limits and things to verify with a real key
- Lineups, ratings and some statistics only exist once the provider publishes them, and not every statistic exists for every match or player. Missing values show as "-" or "Rating unavailable".
- Pass accuracy is shown exactly as the provider returns it (its meaning differs between endpoints). Check a real response and adjust labels if needed.
- The response shapes in `liveData.js` follow the API-Football v3 documentation as understood when this was written. They have been tested against sample payloads only, not live responses. Confirm against your first real responses.
- Player search needs 4+ letters and a league/team. Browsing a club costs one request per page of 20 players.
