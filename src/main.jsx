import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'
import { ConvexProvider, ConvexReactClient } from "convex/react"

const convexUrl = import.meta.env.VITE_CONVEX_URL || ""
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null

function Root() {
  if (!convex) {
    return <App />
  }
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
