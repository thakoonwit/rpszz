import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img src="/logo.png" alt="RPSZZ Logo" className={styles.logoImg} />
          <span className={styles.logoText}>
            <span className={styles.logoR}>R</span>PSZZ
          </span>
        </Link>

        <div className={`${styles.links} ${open ? styles.open : ''}`}>
          <Link to="/" className={pathname === '/' ? styles.active : ''} onClick={() => setOpen(false)}>
            สินค้า
          </Link>
          <Link to="/track" className={pathname === '/track' ? styles.active : ''} onClick={() => setOpen(false)}>
            เช็คสถานะ
          </Link>
          <Link to="/admin" className={pathname === '/admin' ? styles.active : ''} onClick={() => setOpen(false)}>
            ผู้ดูแลระบบ
          </Link>
          <a
            href="https://line.me/ti/p/~YOUR_LINE_ID"
            target="_blank"
            rel="noreferrer"
            className={styles.ctaLink}
            onClick={() => setOpen(false)}
          >
            สั่งซื้อ / แชท
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
