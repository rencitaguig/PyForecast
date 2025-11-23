import React, { useState, useEffect } from 'react'
import axios from 'axios'
import WeatherIcon from './icons'
import HourlyChart from './HourlyChart'
import PrecipChart from './PrecipChart'
import { exportDailyExcel, exportWeeklyExcel } from './utils/exportExcel'
import Login from './Login'
import Register from './Register'
import { useAuth } from './AuthContext'

const API_BASE = 'https://api.openweathermap.org/data/2.5'

function convertTemp(value, fromUnit, toUnit) {
  if (value == null) return value
  if (!fromUnit || fromUnit === toUnit) return value
  if (fromUnit === 'metric' && toUnit === 'imperial') {
    return Math.round((value * 9/5) + 32)
  }
  if (fromUnit === 'imperial' && toUnit === 'metric') {
    return Math.round((value - 32) * 5/9)
  }
  return value
}

function WeatherCard({ date, name, low, high, condition, pop, items = [], units = 'metric', origUnits = 'metric', onOpen }) {
  return (
    <div className="card" onClick={() => onOpen && onOpen({ date, name, items, units })} style={{cursor:'pointer'}}>
      <div className="card-header"><div className="card-title-left"><WeatherIcon condition={condition} size={28} /></div>{name} — {date}</div>
      <div className="card-body">
        <div className="condition">{condition}</div>
        <div className="temps">{convertTemp(low, origUnits, units)}º{units==='metric'?'C':'F'} — {convertTemp(high, origUnits, units)}º{units==='metric'?'C':'F'}</div>
        {pop !== undefined && <div className="pop">Precip: {Math.round(pop * 100)}%</div>}
      </div>
    </div>
  )
}

export default function AppContent() {
  const { isAuthenticated, loading: authLoading, logout, user, login, register } = useAuth()
  const [authView, setAuthView] = useState('login') // 'login' or 'register'
  const [city, setCity] = useState('')
  const [units, setUnits] = useState('metric')
  const DEFAULT_API_KEY = '30d4741c779ba94c470ca1f63045390a'
  const [current, setCurrent] = useState(null)
  const [currentPrecip, setCurrentPrecip] = useState(null)
  const [hourly, setHourly] = useState([])
  const [isDay, setIsDay] = useState(true)
  const [forecast, setForecast] = useState([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTitle, setDrawerTitle] = useState('')
  const [drawerItems, setDrawerItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [savedCities, setSavedCities] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const BACKEND_BASE = 'http://localhost:5000'

  // Load saved cities on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      loadSavedCities()
    }
  }, [isAuthenticated, user])

  const loadSavedCities = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await axios.get(`${BACKEND_BASE}/api/cities`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSavedCities(response.data || [])
    } catch (err) {
      console.error('Error loading saved cities:', err)
    }
  }

  const saveCity = async () => {
    if (!city || !current) return
    try {
      const token = localStorage.getItem('authToken')
      const response = await axios.post(`${BACKEND_BASE}/api/cities`, {
        name: current.name,
        country: current.sys?.country || '',
        lat: current.coord?.lat,
        lon: current.coord?.lon,
        timezone: current.timezone
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSavedCities([...savedCities, response.data])
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save city')
    }
  }

  const deleteCity = async (cityId) => {
    try {
      const token = localStorage.getItem('authToken')
      await axios.delete(`${BACKEND_BASE}/api/cities/${cityId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSavedCities(savedCities.filter(c => c._id !== cityId))
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete city')
    }
  }

  const loadCityWeather = (cityName) => {
    setCity(cityName)
    setTimeout(() => {
      // Trigger weather fetch for this city
      setCity(cityName)
    }, 0)
  }

  // If not authenticated, show login/register
  if (authLoading) {
    return (
      <div className="app day">
        <header className="header">
          <h1>☁️ PyForecast</h1>
        </header>
        <div className="container">
          <div className="error">Loading...</div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return authView === 'login' ? (
      <Login
        onLoginSuccess={(token, user) => {
          login(token, user)
        }}
        onSwitchToRegister={() => setAuthView('register')}
      />
    ) : (
      <Register
        onRegisterSuccess={(token, user) => {
          register(token, user)
        }}
        onSwitchToLogin={() => setAuthView('login')}
      />
    )
  }

  const fetchWeather = async (newUnits) => {
    setError('')
    if (!city) return setError('Please enter a city')

    setLoading(true)
    try {
      const useUnits = newUnits || units
      const cur = await axios.get(`${API_BASE}/weather`, { params: { q: city, units: useUnits, appid: DEFAULT_API_KEY } })
      setCurrent(cur.data)

      const { coord } = cur.data || {}
      const lat = coord && coord.lat
      const lon = coord && coord.lon

      let weekly = []

      if (lat != null && lon != null) {
        try {
          const one = await axios.get(`${API_BASE}/onecall`, { params: { lat, lon, exclude: 'minutely,alerts', units: useUnits, appid: DEFAULT_API_KEY } })
          const daily = one.data.daily || []
          const currentPop = one.data.hourly && one.data.hourly[0] ? (one.data.hourly[0].pop || 0) : undefined
          const currentAmt = one.data.current && (one.data.current.rain && (one.data.current.rain['1h'] || one.data.current.rain['3h']) || one.data.current.snow && (one.data.current.snow['1h'] || one.data.current.snow['3h']))
          setCurrentPrecip({ pop: currentPop, amount_mm: currentAmt || 0 })
          const hours = (one.data.hourly || []).slice(0,24).map(h=>({ dt:h.dt, temp: Math.round(h.temp), pop: h.pop, wind: h.wind_speed, humidity: h.humidity, feels_like: h.feels_like, units: useUnits }))
          setHourly(hours)
          if (one.data.current && one.data.current.sunrise && one.data.current.sunset) {
            const now = Math.floor(Date.now()/1000)
            setIsDay(now >= one.data.current.sunrise && now < one.data.current.sunset)
          }
          weekly = daily.slice(0, 7).map(d => {
            const date = new Date(d.dt * 1000).toISOString().split('T')[0]
            const low = Math.round(d.temp.min)
            const high = Math.round(d.temp.max)
            const condition = (d.weather && d.weather[0] && d.weather[0].main) || ''
            const pop = d.pop != null ? d.pop : 0
            return { date, low, high, condition, pop, items: [], units: useUnits }
          })
          if (hours && hours.length > 0) {
            weekly = weekly.map(w => ({ ...w, items: hours.filter(h => new Date(h.dt * 1000).toISOString().split('T')[0] === w.date) }))
          }
        } catch (oneErr) {
          weekly = []
        }
      }

      if (!weekly || weekly.length === 0) {
        const f = await axios.get(`${API_BASE}/forecast`, { params: { q: city, units: useUnits, appid: DEFAULT_API_KEY } })
        const days = {}
        ;(f.data.list || []).forEach(entry => {
          const date = entry.dt_txt.split(' ')[0]
          if (!days[date]) days[date] = []
          days[date].push(entry)
        })
        const dates = Object.keys(days).sort()
        const picked = dates.slice(0, 7)
        const summary = picked.map(d => {
          const items = days[d]
          const temps = items.map(it => Math.round(it.main.temp))
          const conditions = items.map(it => it.weather[0].main)
          const mostCommon = [...new Set(conditions)].sort((a,b)=>conditions.filter(x=>x===b).length - conditions.filter(x=>x===a).length)[0]
          const low = Math.min(...temps)
          const high = Math.max(...temps)
          const pop = items.reduce((acc,it)=>acc + (it.pop || 0),0) / items.length
          const normItems = items.map(it => ({ dt: it.dt, dt_txt: it.dt_txt, temp: Math.round(it.main.temp), pop: it.pop, wind: it.wind && it.wind.speed, humidity: it.main && it.main.humidity, feels_like: it.main && it.main.feels_like, units: useUnits }))
          return { date: d, low, high, condition: mostCommon, pop, items: normItems, units: useUnits }
        })

        if (f.data.list && f.data.list.length > 0) {
          const first = f.data.list[0]
          const popNow = first.pop != null ? first.pop : undefined
          const amt = (first.rain && (first.rain['3h'] || first.rain['1h'])) || (first.snow && (first.snow['3h'] || first.snow['1h'])) || 0
          setCurrentPrecip({ pop: popNow, amount_mm: amt })
        } else {
          const curAmt = cur.data && ((cur.data.rain && (cur.data.rain['1h'] || cur.data.rain['3h'])) || (cur.data.snow && (cur.data.snow['1h'] || cur.data.snow['3h']))) || 0
          setCurrentPrecip({ pop: undefined, amount_mm: curAmt })
        }

        while (summary.length < 7 && summary.length > 0) {
          const last = summary[summary.length - 1]
          const nextDate = new Date(last.date + 'T00:00:00')
          nextDate.setDate(nextDate.getDate() + 1)
          const iso = nextDate.toISOString().split('T')[0]
          summary.push({ ...last, date: iso })
        }

        weekly = summary
      }

      setForecast(weekly)
    } catch (err) {
      setError('Error fetching weather — check city and API key')
    } finally {
      setLoading(false)
    }
  }

  const openDrawer = ({date, name, items, units}) => {
    setDrawerTitle(`${name} — ${date}`)
    setDrawerItems(items || [])
    setDrawerOpen(true)
  }

  const closeDrawer = () => { setDrawerOpen(false); setDrawerItems([]); setDrawerTitle('') }

  return (
    <div className={`app ${isDay ? 'day' : 'night'}`}>
      <header className="header">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%'}}>
           <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
             <button onClick={() => setSidebarOpen(!sidebarOpen)} className="sidebar-toggle">☰</button>
             <div>
            <h1>☁️ PyForecast</h1>
            <p className="subtitle">Welcome, {user?.username}</p>
             </div>
          </div>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="container">
        <div className="controls">
          <input placeholder="City (e.g. London)" value={city} onChange={e => setCity(e.target.value)} />
          <div style={{display:'flex',gap:8}}>
            <button className={units==='metric'? 'unit active':'unit'} onClick={() => { setUnits('metric'); fetchWeather('metric') }}>°C</button>
            <button className={units==='imperial'? 'unit active':'unit'} onClick={() => { setUnits('imperial'); fetchWeather('imperial') }}>°F</button>
          </div>
          <button onClick={() => fetchWeather()} disabled={loading}>{loading ? 'Loading…' : 'Get Weather'}</button>
           {current && <button onClick={saveCity} className="save-btn">★ Save City</button>}
          {error && <div className="error">{error}</div>}
        </div>

        {current && (
          <section className="current">
            <h2>Current - {current.name}</h2>
            <div className="current-row">
              <div className="current-temp"><WeatherIcon condition={current.weather[0].main} size={48} />{Math.round(current.main.temp)}º{units==='metric'?'C':'F'}</div>
              <div className="current-desc">{current.weather[0].main} — {current.weather[0].description}
                {currentPrecip && (
                  <div className="current-precip">
                    {currentPrecip.pop !== undefined
                      ? ` • Precip: ${Math.round(currentPrecip.pop * 100)}%`
                      : ''}
                    {currentPrecip.amount_mm ? ` • ${Number(currentPrecip.amount_mm).toFixed(2)} mm (${(Number(currentPrecip.amount_mm)/25.4).toFixed(2)} in)` : (currentPrecip && currentPrecip.pop === undefined ? ' • No precipitation' : '')}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {hourly && hourly.length > 0 && (
          <section className="hourly-chart">
            <h3>Next 24 hours</h3>
            <HourlyChart hours={hourly} />
          </section>
        )}

        {forecast.length > 0 && (
          <section className="forecast">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <h2 style={{margin:0}}>Weekly forecast</h2>
              <button className="export-btn" onClick={() => exportWeeklyExcel(forecast, `${(city||'forecast').replace(/\s+/g,'_')}_weekly.xlsx`, units==='metric' ? 'C' : 'F')}>Save Weekly Excel</button>
            </div>
            <div className="cards">
              {forecast.map(item => (
                <WeatherCard key={item.date} date={item.date} name={new Date(item.date).toLocaleDateString(undefined,{weekday:'short'})} low={item.low} high={item.high} condition={item.condition} pop={item.pop} items={item.items} units={units} origUnits={item.units || 'metric'} onOpen={openDrawer} />
              ))}
            </div>
          </section>
        )}

        <div className={`drawer-overlay ${drawerOpen ? 'open' : ''}`} onClick={closeDrawer}></div>
        <aside className={`drawer ${drawerOpen ? 'open' : ''}`}>
          <div className="drawer-header">
            <h3>{drawerTitle}</h3>
            <button className="close" onClick={closeDrawer}>Close</button>
          </div>
          <div className="drawer-body">
                {drawerItems && drawerItems.length > 0 ? (
              <div>
                {/* Chart for the selected day */}
                {drawerItems.length > 0 && (() => {
                  const chartHours = drawerItems.map(it => {
                    const dt = it.dt ? it.dt : (it.dt_txt ? Math.floor(new Date(it.dt_txt).getTime()/1000) : undefined)
                    const tempRaw = it.temp != null ? it.temp : (it.main && it.main.temp)
                    const popv = it.pop != null ? it.pop : (it.pop === 0 ? 0 : 0)
                    return { dt, temp: tempRaw, pop: popv }
                  }).filter(h => h.dt != null)

                  return (
                    <div style={{marginBottom:12}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <h4 style={{margin:'6px 0'}}>Hourly Temperature</h4>
                        <button className="export-btn" onClick={() => {
                          const safeTitle = drawerTitle ? drawerTitle.replace(/\s+/g,'_') : 'daily'
                          exportDailyExcel(chartHours, `${safeTitle}_daily.xlsx`, units==='metric' ? 'C' : 'F')
                        }}>Save Day as Excel</button>
                      </div>
                      <HourlyChart hours={chartHours} showPrecip={false} unitsLabel={units==='metric' ? 'C' : 'F'} />
                      <h4 style={{margin:'10px 0 6px'}}>Precipitation</h4>
                      <PrecipChart hours={chartHours} />
                    </div>
                  )
                })()}

                {drawerItems.map((it, idx) => {
                  const time = it.dt ? new Date(it.dt * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : (it.dt_txt ? it.dt_txt.split(' ')[1].slice(0,5) : '')
                  const origUnit = it.units || (it.temp && typeof it.temp === 'number' ? units : 'metric')
                  const tempRaw = it.temp != null ? it.temp : (it.main && it.main.temp)
                  const temp = convertTemp(tempRaw, origUnit, units)
                  const popv = (it.pop != null) ? Math.round(it.pop * 100) : (it.pop === 0 ? 0 : '')
                  const wind = it.wind_speed || (it.wind && it.wind.speed)
                  const hum = it.humidity || (it.main && it.main.humidity)
                  const feelsRaw = it.feels_like || (it.main && it.main.feels_like)
                  const feels = feelsRaw != null ? convertTemp(feelsRaw, origUnit, units) : undefined
                  return (
                    <div key={idx} className="drawer-row">
                      <div className="drawer-time">{time}</div>
                      <div className="drawer-temp">{temp}º{units==='metric'?'C':'F'}</div>
                      <div className="drawer-pop">{popv !== '' ? `${popv}%` : ''}</div>
                      <div className="drawer-extra">{wind ? `Wind ${wind} m/s` : ''}{hum ? ` • Hum ${hum}%` : ''}{feels ? ` • Feels ${Math.round(feels)}º` : ''}</div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="muted">No detailed items available for this day.</div>
            )}
          </div>
        </aside>
      </main>
       {/* Sidebar for saved cities */}
       <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)}></div>
       <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
         <div className="sidebar-header">
           <h3>Saved Cities</h3>
           <button className="close" onClick={() => setSidebarOpen(false)}>✕</button>
         </div>
         <div className="sidebar-body">
           {savedCities && savedCities.length > 0 ? (
             savedCities.map((saved) => (
               <div key={saved._id} className="saved-city">
                 <button 
                   className="city-name-btn"
                   onClick={() => {
                     setCity(saved.name)
                     loadCityWeather(saved.name)
                     setSidebarOpen(false)
                   }}
                 >
                   {saved.name}, {saved.country}
                 </button>
                 <button 
                   className="delete-btn"
                   onClick={() => deleteCity(saved._id)}
                   title="Remove from saved"
                 >
                   🗑️
                 </button>
               </div>
             ))
           ) : (
             <div className="muted">No saved cities yet. Search for a city and click "Save City"!</div>
           )}
         </div>
       </aside>

      <footer className="footer"></footer>
    </div>
  )
}

