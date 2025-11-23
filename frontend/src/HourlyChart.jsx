import React from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

export default function HourlyChart({ hours, showPrecip = true, unitsLabel = 'C' }){
  // hours: array of {dt, temp, pop}
  const labels = hours.map(h => new Date(h.dt * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}))
  const temps = hours.map(h => h.temp)
  const pops = hours.map(h => (h.pop || 0) * 100)

  const datasets = [
    {
      type: 'line',
      label: `Temperature (°${unitsLabel})`,
      data: temps,
      borderColor: '#0b4f86',
      backgroundColor: '#0b4f86',
      yAxisID: 'y',
      tension: 0.3,
    }
  ]

  if (showPrecip) {
    datasets.push({
      type: 'bar',
      label: 'Precip %',
      data: pops,
      backgroundColor: '#0288D1',
      yAxisID: 'y1',
      opacity: 0.6,
    })
  }

  const data = { labels, datasets }

  const options = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    stacked: false,
    scales: {
      y: { type: 'linear', position: 'left', title:{display:true,text:`°${unitsLabel}`} },
      y1: { type: 'linear', position: 'right', title:{display:true,text:'%'}, grid:{ drawOnChartArea:false }, ticks:{max:100,min:0} }
    }
  }

  return (
    <div style={{width:'100%',maxWidth:800}}>
      <Line data={data} options={options} />
    </div>
  )
}
