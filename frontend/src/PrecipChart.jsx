import React from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function PrecipChart({ hours }){
  // hours: array of {dt, temp, pop}
  const labels = hours.map(h => new Date(h.dt * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}))
  const pops = hours.map(h => (h.pop || 0) * 100)

  const data = {
    labels,
    datasets: [
      {
        type: 'bar',
        label: 'Precipitation %',
        data: pops,
        backgroundColor: '#0288D1',
        borderRadius: 4,
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: { legend: { display: true } },
    scales: {
      y: { title: { display: true, text: '%' }, min: 0, max: 100 }
    }
  }

  return (
    <div style={{width:'100%',maxWidth:800}}>
      <Bar data={data} options={options} />
    </div>
  )
}
