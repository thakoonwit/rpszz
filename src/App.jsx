import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import StatusCheck from './pages/StatusCheck'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div style={{ 
          backgroundColor: 'var(--ink)', 
          color: '#ffffff', 
          padding: '8px 16px', 
          textAlign: 'center', 
          fontSize: '0.75rem', 
          fontWeight: 500, 
          letterSpacing: '0.05em', 
          position: 'relative', 
          zIndex: 1200,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <span className="animate-pulse" style={{ 
            backgroundColor: 'var(--accent)', 
            color: '#ffffff', 
            fontSize: '9px', 
            fontWeight: 800, 
            padding: '2px 8px', 
            borderRadius: '4px',
            textTransform: 'uppercase'
          }}>HOT PROMOTION</span>
          <span>สินค้าคัดเกรดวินเทจ & มือสองของแท้ 100% มีเพียงชิ้นเดียวต่อหนึ่งรายการ รีบตัดสินใจก่อนหมด!</span>
        </div>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/track" element={<StatusCheck />} />
            <Route path="/status" element={<StatusCheck />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}
