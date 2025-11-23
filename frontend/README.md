# Frontend for PythonWeatherApp

This is a minimal React + Vite frontend for your weather app. It uses OpenWeatherMap directly; you can supply your API key in an environment variable or paste it into the input.

Quick start (PowerShell):

```powershell
cd frontend
npm install
npm run dev
```

Set your API key by creating a `.env` file in `frontend/` with:

```
VITE_OPENWEATHER_API_KEY=your_api_key_here
```

Then open the dev URL printed by `vite` (usually `http://localhost:5173`).

Notes:
- The frontend fetches OpenWeatherMap `weather` and `forecast` endpoints directly.
- If you later add a backend HTTP API, change the fetch logic in `src/App.jsx` to call your backend instead.
- The app now includes:
	- Unit toggle (°C / °F) — click buttons before fetching to change units.
	- Hourly interactive chart (Chart.js) for next 24 hours.
	- Expandable day cards to view detailed 3-hour/hourly breakdowns.
	- Day/night background that adapts to local sunrise/sunset when available.

Dependencies added: `chart.js`, `react-chartjs-2`.
