import React from 'react'

function Sun({ size=48 }){
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="4" fill="#FFD54A" />
      <g stroke="#FFD54A" strokeWidth="1.2" strokeLinecap="round">
        <path d="M12 1v2" />
        <path d="M12 21v2" />
        <path d="M4.2 4.2l1.4 1.4" />
        <path d="M18.4 18.4l1.4 1.4" />
        <path d="M1 12h2" />
        <path d="M21 12h2" />
        <path d="M4.2 19.8l1.4-1.4" />
        <path d="M18.4 5.6l1.4-1.4" />
      </g>
    </svg>
  )
}

function Cloud({ size=48 }){
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 17.5A4.5 4.5 0 0 0 15.5 13H7.7A3.7 3.7 0 0 0 4 16.7 3.3 3.3 0 0 0 7.3 20h12.7v-2.5z" fill="#90A4AE" />
    </svg>
  )
}

function Rain({ size=48 }){
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 16.5A4.5 4.5 0 0 0 15.5 12H6.7A3.7 3.7 0 0 0 3 15.7 3.3 3.3 0 0 0 6.3 19h9.2" fill="#90A4AE" />
      <g stroke="#0288D1" strokeWidth="1.6" strokeLinecap="round">
        <path d="M8 21l1.2-2" />
        <path d="M12 21l1.2-2" />
        <path d="M16 21l1.2-2" />
      </g>
    </svg>
  )
}

function Snow({ size=48 }){
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 15A4 4 0 0 0 16 11H7a3 3 0 0 0-3 3 3 3 0 0 0 3 3h9" fill="#CFD8DC" />
      <g stroke="#607D8B" strokeWidth="1.4" strokeLinecap="round">
        <path d="M8 20l0.5-1" />
        <path d="M12 20l0.5-1" />
        <path d="M16 20l0.5-1" />
      </g>
    </svg>
  )
}

function Thunder({ size=48 }){
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 14a4 4 0 0 0-4-4H8a3 3 0 0 0-3 3 3 3 0 0 0 3 3h2l-1 4 5-4h2" fill="#90A4AE" />
      <path d="M13 11l-2 4h3l-1 4" fill="#FDD835" />
    </svg>
  )
}

function Fog({ size=48 }){
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12h18" stroke="#90A4AE" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3 16h18" stroke="#90A4AE" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3 8h18" stroke="#90A4AE" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export default function WeatherIcon({ condition='Clear', size=48 }){
  const c = (condition || '').toLowerCase()
  if (c.includes('clear')) return <Sun size={size} />
  if (c.includes('cloud')) return <Cloud size={size} />
  if (c.includes('rain') || c.includes('drizzle')) return <Rain size={size} />
  if (c.includes('snow')) return <Snow size={size} />
  if (c.includes('thunder')) return <Thunder size={size} />
  if (c.includes('fog') || c.includes('mist') || c.includes('haze') || c.includes('smoke')) return <Fog size={size} />
  // default
  return <Sun size={size} />
}
