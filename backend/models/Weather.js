const mongoose = require('mongoose')

const weatherSchema = new mongoose.Schema(
  {
    city: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
    current: {
      temp: Number,
      condition: String,
      humidity: Number,
      windSpeed: Number
    },
    forecast: [
      {
        date: String,
        low: Number,
        high: Number,
        condition: String,
        pop: Number
      }
    ],
    unit: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
    fetchedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Weather', weatherSchema)
