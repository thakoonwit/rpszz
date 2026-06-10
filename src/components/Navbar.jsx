import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  const handleNavClick = (anchorId) => {
    setOpen(false)
    if (pathname === '/') {
      const el = document.getElementById(anchorId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          rpszz<span className={styles.logoDot}>.</span>
        </Link>

        <div className={`${styles.links} ${open ? styles.open : ''}`}>
          {pathname === '/' ? (
            <a href="#products" className={styles.link} onClick={() => handleNavClick('products')}>
              collections
            </a>
          ) : (
            <Link to="/" className={styles.link} onClick={() => setOpen(false)}>
              collections
            </Link>
          )}

          {pathname === '/' ? (
            <a href="#brand" className={styles.link} onClick={() => handleNavClick('brand')}>
              about
            </a>
          ) : (
            <Link to="/" className={styles.link} onClick={() => setOpen(false)}>
              about
            </Link>
          )}

          <Link to="/track" className={`${styles.link} ${pathname === '/track' ? styles.active : ''}`} onClick={() => setOpen(false)}>
            track order
          </Link>

          <a
            href="https://line.me/ti/p/~YOUR_LINE_ID"
            target="_blank"
            rel="noreferrer"
            className={styles.ctaLink}
            onClick={() => setOpen(false)}
          >
            chat to buy
          </a>
        </div>

        <button
          className={styles.burger}
          onClick={() => setOpen(!open)}
          aria-label="toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  )
}
