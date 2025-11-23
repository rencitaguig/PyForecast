const express = require('express')
const path = require('path')
const { spawnSync } = require('child_process')

const router = express.Router()

// Generate a plot for a city and return the image path
router.get('/city', async (req, res) => {
  try {
    const city = req.query.city
    const units = req.query.units || 'metric'
    if (!city) return res.status(400).json({ error: 'city query param required' })

    // Call the Python script
    const script = path.join(__dirname, '..', 'scripts', 'process_weather.py')
    const args = [script, '--city', city, '--units', units]
    const proc = spawnSync('python', args, { encoding: 'utf8' })

    if (proc.error) {
      console.error('Python process error', proc.error)
      return res.status(500).json({ error: proc.error.message })
    }

    if (proc.status !== 0) {
      // try to parse stderr or stdout for JSON
      const errOut = proc.stderr || proc.stdout || ''
      try {
        const parsed = JSON.parse(errOut)
        return res.status(500).json(parsed)
      } catch (e) {
        return res.status(500).json({ error: 'Python script failed', details: errOut })
      }
    }

    const stdout = (proc.stdout || '').trim()
    let parsed
    try {
      parsed = JSON.parse(stdout)
    } catch (e) {
      return res.status(500).json({ error: 'Failed to parse python output', raw: stdout })
    }

    // Return URL to the static file
    const fileRel = parsed.file
    const url = `/public/${fileRel}`
    res.json({ file: fileRel, url })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
