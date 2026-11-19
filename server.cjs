const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// API Proxy for Supabase
app.get('/api/products', async (req, res) => {
  try {
    const supabaseUrl = 'https://fjnzwywxjeffsojbtusc.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqbnp3eXd4amVmZnNvamJ0dXNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNTU5MDcsImV4cCI6MjA4NzkzMTkwN30.8LZ5Et38jVhwXUQZpRWvG7cLhvvOd-PiFzzEc-JrUyw'
    
    const apiUrl = supabaseUrl + '/rest/v1/products?is_active=eq.true&select=*'
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': 'Bearer ' + supabaseKey,
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error('Supabase API error: ' + response.status)
    }
    
    const products = await response.json()
    res.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ error: 'Erro ao buscar produtos' })
  }
})

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// Serve React build files
app.use(express.static(path.join(__dirname, 'dist')))

// SPA fallback - serve index.html for all non-API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/health')) return next()
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log('Morumbi Solutions Server running on port ' + PORT)
  console.log('Environment: ' + (process.env.NODE_ENV || 'development'))
})

module.exports = app