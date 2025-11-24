require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('✓ Connected to MongoDB')
    // Ensure City indexes are correct. If an old unique index on `name` exists
    // (from previous schema), drop it so different users can save the same city.
    try {
      const City = require('./models/City')
      // Attempt to drop legacy single-field unique index 'name_1' if present
      try {
        await City.collection.dropIndex('name_1')
        console.log('Dropped legacy index: name_1')
      } catch (dropErr) {
        // Ignore if index does not exist
        if (dropErr && (dropErr.codeName === 'IndexNotFound' || /index not found/i.test(dropErr.message))) {
          // no-op
        } else if (dropErr) {
          console.warn('Could not drop legacy index name_1:', dropErr.message || dropErr)
        }
      }

      // Ensure the compound index (user + name) is created as defined by the schema
      try {
        await City.createIndexes()
        console.log('Ensured City indexes')
      } catch (idxErr) {
        console.warn('Error ensuring City indexes:', idxErr.message || idxErr)
      }
    } catch (e) {
      console.warn('City index setup skipped:', e.message || e)
    }
  } catch (err) {
    console.error('✗ MongoDB connection error:', err.message)
    process.exit(1)
  }
}

connectDB()

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running', time: new Date().toISOString() })
})

// Import and use cities routes
const citiesRouter = require('./routes/cities')
app.use('/api/cities', citiesRouter)

// Import and use auth routes
const authRouter = require('./routes/auth')
app.use('/api/auth', authRouter)

// Serve public assets (plots, etc.)
const path = require('path')
app.use('/public', express.static(path.join(__dirname, 'public')))

// Plots route (calls Python script)
const plotsRouter = require('./routes/plots')
app.use('/api/plots', plotsRouter)

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
