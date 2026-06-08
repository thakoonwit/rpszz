import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'
import { ConvexProvider, ConvexReactClient } from "convex/react"

// Always initialize ConvexReactClient with a fallback URL to prevent context crash
const convexUrl = import.meta.env.VITE_CONVEX_URL || "https://placeholder.convex.cloud"
const convex = new ConvexReactClient(convexUrl)

function Root() {
  return (
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
