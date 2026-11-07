# MatchIQ (flat layout)

All source files live in this one folder. The only subfolder is `api/` (it holds `football.js`, the server proxy). Vercel only runs serverless functions from a folder named exactly `api` at the project root, so it cannot be flattened.

```
npm install
npm run dev
npm run build
```

## Live data
All football data is live from the Highlightly Football API. See SETUP.md for the server-side key and competition ids (required for the Matches, Players and Overview screens to show data).
