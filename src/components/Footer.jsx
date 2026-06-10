import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const { pathname } = useLocation()

  const handleNavClick = (anchorId) => {
    if (pathname === '/') {
      const el = document.getElementById(anchorId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <footer style={{ borderTop: '0.5px solid var(--border)', background: 'var(--bg)' }}>
      <div style={{
        padding: '24px 2rem',
        maxWidth: '1100px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <span style={{ fontSize: '14px', fontWeight: 500, fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
          rpszz<span style={{ color: 'var(--red)' }}>.</span>
        </span>
        <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>
          © {currentYear} Premium Second-Hand by Rapeepong
        </span>
        <nav style={{ display: 'flex', gap: '20px' }} aria-label="footer">
          {pathname === '/' ? (
            <a href="#products" style={{ fontSize: '11px', color: 'var(--muted)' }} onClick={() => handleNavClick('products')}>
              collections
            </a>
          ) : (
            <Link to="/" style={{ fontSize: '11px', color: 'var(--muted)' }}>
              collections
            </Link>
          )}

          {pathname === '/' ? (
            <a href="#brand" style={{ fontSize: '11px', color: 'var(--muted)' }} onClick={() => handleNavClick('brand')}>
              about
            </a>
          ) : (
            <Link to="/" style={{ fontSize: '11px', color: 'var(--muted)' }}>
              about
            </Link>
          )}

          <Link to="/track" style={{ fontSize: '11px', color: 'var(--muted)' }}>
            track order
          </Link>
          
          <a href="#cta" style={{ fontSize: '11px', color: 'var(--muted)' }} onClick={() => handleNavClick('cta')}>
            contact
          </a>
        </nav>
      </div>
    </footer>
  )
}
