const mongoose = require('mongoose')

const citySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    country: String,
    timezone: String,
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
    favorited: { type: Boolean, default: false }
  },
  { timestamps: true }
)

module.exports = mongoose.model('City', citySchema)
