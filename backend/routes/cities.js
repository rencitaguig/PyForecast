const express = require('express')
const router = express.Router()
const City = require('../models/City')
const authMiddleware = require('../middleware/auth')


// Get all saved cities
router.get('/', authMiddleware, async (req, res) => {
  try {
    const cities = await City.find({ user: req.user.id })
    res.json(cities)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Add a new city
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, lat, lon, country, timezone } = req.body
    const city = new City({ name, lat, lon, country, timezone, user: req.user.id })
    await city.save()
    res.status(201).json(city)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get a city by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const city = await City.findById(req.params.id)
      if (!city) return res.status(404).json({ error: 'City not found' })
      if (city.user.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized' })
    if (!city) return res.status(404).json({ error: 'City not found' })
    res.json(city)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Update a city (e.g., toggle favorite)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { favorited } = req.body
    const city = await City.findByIdAndUpdate(req.params.id, { favorited }, { new: true })
      if (!city) return res.status(404).json({ error: 'City not found' })
      if (city.user.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized' })
    res.json(city)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete a city
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await City.findByIdAndDelete(req.params.id)
    res.json({ message: 'City deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
