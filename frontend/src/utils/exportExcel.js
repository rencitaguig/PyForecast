import * as XLSX from 'xlsx'

// Convert epoch seconds to readable time
function fmtTime(epochSec) {
  if (!epochSec) return ''
  const d = new Date(epochSec * 1000)
  return d.toLocaleString()
}

export function exportDailyExcel(hours = [], filename = 'daily_weather.xlsx', unitsLabel = 'C') {
  // hours: [{dt, temp, pop, wind, humidity, feels_like}]
  const rows = hours.map(h => ({
    Time: fmtTime(h.dt),
    Temp: h.temp != null ? h.temp : '',
    Unit: unitsLabel,
    POP: h.pop != null ? Math.round(h.pop * 100) + '%' : '',
    Wind_m_s: h.wind != null ? h.wind : (h.wind_speed != null ? h.wind_speed : ''),
    Humidity_pct: h.humidity != null ? h.humidity : '',
    Feels_like: h.feels_like != null ? h.feels_like : ''
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Daily')
  XLSX.writeFile(wb, filename)
}

export function exportWeeklyExcel(forecast = [], filename = 'weekly_weather.xlsx', unitsLabel = 'C') {
  // forecast: [{date, low, high, condition, pop, items: [...] }]
  // Create a summary sheet and a details sheet
  const summary = forecast.map(f => ({
    Date: f.date,
    Low: f.low,
    High: f.high,
    Condition: f.condition,
    POP_percent: f.pop != null ? Math.round(f.pop * 100) + '%' : ''
  }))

  // Flatten details: include date for each hourly item
  const details = []
  forecast.forEach(f => {
    const day = f.date
    const items = f.items || []
    if (items.length === 0) {
      details.push({ Date: day, Time: '', Temp: '', Unit: unitsLabel, POP: '', Wind_m_s: '', Humidity_pct: '', Feels_like: '' })
    } else {
      items.forEach(it => {
        const dt = it.dt ? it.dt : (it.dt_txt ? Math.floor(new Date(it.dt_txt).getTime()/1000) : undefined)
        details.push({
          Date: day,
          Time: dt ? fmtTime(dt) : (it.dt_txt || ''),
          Temp: it.temp != null ? it.temp : (it.main && it.main.temp != null ? it.main.temp : ''),
          Unit: unitsLabel,
          POP: it.pop != null ? Math.round(it.pop * 100) + '%' : '',
          Wind_m_s: it.wind_speed != null ? it.wind_speed : (it.wind && it.wind.speed) || '',
          Humidity_pct: it.humidity != null ? it.humidity : (it.main && it.main.humidity) || '',
          Feels_like: it.feels_like != null ? it.feels_like : (it.main && it.main.feels_like) || ''
        })
      })
    }
  })

  const wb = XLSX.utils.book_new()
  const wsSummary = XLSX.utils.json_to_sheet(summary)
  const wsDetails = XLSX.utils.json_to_sheet(details)
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')
  XLSX.utils.book_append_sheet(wb, wsDetails, 'Details')
  XLSX.writeFile(wb, filename)
}
