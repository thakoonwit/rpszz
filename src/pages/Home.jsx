import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import ProductCard from '../components/ProductCard.jsx'
import styles from './HomePage.module.css'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

const FILTERS = ['ทั้งหมด', 'available', 'reserved', 'sold']
const FILTER_LABELS = {
  'ทั้งหมด': 'ทั้งหมด',
  available: 'พร้อมขาย',
  reserved: 'จองแล้ว',
  sold: 'ขายแล้ว',
}

const FALLBACK_PRODUCTS = [
  {
    id: '1',
    title: 'Vintage Denim Jacket',
    description: 'Classic oversized 90s vintage denim jacket. Minor distressing on cuffs, otherwise perfect condition.',
    price: 1200,
    image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80',
    status: 'available',
    category: 'clothing'
  },
  {
    id: '2',
    title: 'Retro Leather Boots',
    description: 'Genuine brown leather boots, Unisex Size 41. Cleaned and conditioned, ready to wear.',
    price: 2500,
    image_url: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=600&q=80',
    status: 'reserved',
    category: 'footwear'
  },
  {
    id: '3',
    title: 'Analog Film Camera',
    description: 'Minolta SLR 35mm film camera. Tested, light meter working, includes 50mm f/1.7 lens.',
    price: 3400,
    image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
    status: 'sold',
    category: 'electronics'
  },
  {
    id: '4',
    title: 'Graphic Streetwear Tee',
    description: 'Black heavy cotton graphic t-shirt. Oversized boxy fit, Size L. worn twice.',
    price: 450,
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    status: 'available',
    category: 'clothing'
  }
]

const FALLBACK_REVIEWS = [
  { id: '1', customer_name: 'ธนา P.', rating: 5, comment: 'ของดีมากครับ ตรงปก จัดส่งไวมาก' },
  { id: '2', customer_name: 'พิม S.', rating: 5, comment: 'ชอบมากเลยค่ะ คุ้มราคาสุดๆ' },
  { id: '3', customer_name: 'กิตติ W.', rating: 5, comment: 'สภาพดีกว่าที่คิดไว้เยอะเลยครับ' }
]

export default function Home() {
  const [products, setProducts] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ทั้งหมด')
  const [search, setSearch] = useState('')

  const hasConvex = !!import.meta.env.VITE_CONVEX_URL

  // Unconditional hook calls at top level
  // Convex React client will handle cases where client is not connected
  const convexProducts = useQuery(hasConvex ? api.products.list : api.products.list)
  const convexReviews = useQuery(hasConvex ? api.reviews.list : api.reviews.list)

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      const [{ data: dbProducts, error: prodError }, { data: dbReviews, error: revError }] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('reviews').select('*').order('created_at', { ascending: false })
      ])

      if (prodError || !dbProducts || dbProducts.length === 0) {
        const localProds = localStorage.getItem('rpszz_local_products')
        if (localProds) {
          setProducts(JSON.parse(localProds))
        } else {
          setProducts(FALLBACK_PRODUCTS)
        }
      } else {
        setProducts(dbProducts)
      }

      if (revError || !dbReviews || dbReviews.length === 0) {
        const localRevs = localStorage.getItem('rpszz_local_reviews')
        if (localRevs) {
          setReviews(JSON.parse(localRevs))
        } else {
          setReviews(FALLBACK_REVIEWS)
        }
      } else {
        setReviews(dbReviews)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      const localProds = localStorage.getItem('rpszz_local_products')
      setProducts(localProds ? JSON.parse(localProds) : FALLBACK_PRODUCTS)

      const localRevs = localStorage.getItem('rpszz_local_reviews')
      setReviews(localRevs ? JSON.parse(localRevs) : FALLBACK_REVIEWS)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  // Effect to sync Convex data if VITE_CONVEX_URL is set
  useEffect(() => {
    if (hasConvex && convexProducts && convexReviews) {
      // Map Convex internal IDs to string id fields for compatibility
      setProducts(convexProducts.map(p => ({ ...p, id: p._id })))
      setReviews(convexReviews.map(r => ({ ...r, id: r._id })))
      setLoading(false)
    }
  }, [convexProducts, convexReviews, hasConvex])

  // Effect to load Supabase/Fallback data only if VITE_CONVEX_URL is NOT set
  useEffect(() => {
    if (!hasConvex) {
      fetchData(true)

      // Realtime postgres changes subscription
      const channel = supabase
        .channel('public:products')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
          fetchData(false)
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [hasConvex])

  const filtered = products.filter(p => {
    const matchStatus = filter === 'ทั้งหมด' || p.status === filter
    const displayName = p.name || p.title || ''
    const matchSearch = !search || displayName.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const counts = {
    available: products.filter(p => p.status === 'available').length,
    reserved:  products.filter(p => p.status === 'reserved').length,
    sold:      products.filter(p => p.status === 'sold').length,
  }

  return (
    <main>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <p className={styles.tagline}>— มือสองคุณภาพ คัดมาแล้ว</p>
            <h1 className={styles.heroTitle}>
              RPSZZ<br />
              <span className={styles.heroShop}>.SHOP</span>
            </h1>
            <p className={styles.heroSub}>
              ของมือสองของ Rapeepong ทุกชิ้นผ่านการคัดสรร<br />
              สั่งซื้อผ่านแชทเท่านั้น
            </p>
            <div className={styles.heroActions}>
              <a
                href="https://line.me/ti/p/~YOUR_LINE_ID"
                target="_blank"
                rel="noreferrer"
                className={styles.primaryBtn}
              >
                แชทสั่งซื้อ LINE
              </a>
              <a href="#products" className={styles.secondaryBtn}>
                ดูสินค้า ↓
              </a>
            </div>
          </div>
        </div>
        <div className={styles.heroAccent} />
      </section>

      {/* Stats bar */}
      <section className={styles.statsBar}>
        <div className="container">
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>{counts.available}</span>
              <span className={styles.statLabel}>พร้อมขาย</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={`${styles.statNum} ${styles.yellow}`}>{counts.reserved}</span>
              <span className={styles.statLabel}>จองแล้ว</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={`${styles.statNum} ${styles.red}`}>{counts.sold}</span>
              <span className={styles.statLabel}>ขายแล้ว</span>
            </div>
          </div>
        </div>
      </section>

      {/* Products section */}
      <section className={styles.productsSection} id="products">
        <div className="container">
          {/* Controls */}
          <div className={styles.controls}>
            <div className={styles.filterGroup}>
              {FILTERS.map(f => (
                <button
                  key={f}
                  className={`${styles.filterBtn} ${filter === f ? styles.activeFilter : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {FILTER_LABELS[f]}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="ค้นหาสินค้า..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Grid */}
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <span>กำลังโหลด...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>
              <p>ไม่มีสินค้าในขณะนี้</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Reviews section */}
      <section className={styles.reviewSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>รีวิวจากลูกค้า</h2>
          <div className={styles.reviewGrid}>
            {reviews.map((r, i) => (
              <div key={r.id || i} className={styles.reviewCard}>
                <div className={styles.stars}>{'★'.repeat(r.rating || 5)}</div>
                <p className={styles.reviewText}>"{r.comment || r.text}"</p>
                <span className={styles.reviewer}>— {r.customer_name || r.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <p className={styles.footerLogo} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <img src="/logo.png" alt="RPSZZ Logo" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
            <span><span style={{ color: 'var(--red)' }}>R</span>PSZZ.shop</span>
          </p>
          <p className={styles.footerSub}>สินค้าทุกชิ้นสั่งซื้อผ่านแชทเท่านั้น — ไม่มีระบบตะกร้าสินค้า</p>
          <p className={styles.footerCopy}>© 2026 Rapeepong · Rpszz.shop</p>
        </div>
      </footer>
    </main>
  )
}
