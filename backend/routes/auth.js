const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, username, password, passwordConfirm } = req.body
    
    if (!email || !username || !password || !passwordConfirm) {
      return res.status(400).json({ error: 'All fields are required' })
    }
    
    if (password !== passwordConfirm) {
      return res.status(400).json({ error: 'Passwords do not match' })
    }
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
      return res.status(409).json({ error: 'Email or username already exists' })
    }
    
    const user = new User({ email, username, password })
    await user.save()
    
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
    
    res.status(201).json({ 
      token, 
      user: user.toJSON(),
      message: 'User registered successfully' 
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }
    
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
    
    res.json({ 
      token, 
      user: user.toJSON(),
      message: 'Logged in successfully' 
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get current user (protected)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Update preferences (protected)
router.put('/preferences', authMiddleware, async (req, res) => {
  try {
    const { units, theme } = req.body
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 'preferences.units': units, 'preferences.theme': theme },
      { new: true }
    )
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
