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

// Allow the same city name to exist for different users, but prevent the same user
// from saving the same city multiple times. This creates a compound unique
// index on (user, name).
citySchema.index({ user: 1, name: 1 }, { unique: true })

module.exports = mongoose.model('City', citySchema)
