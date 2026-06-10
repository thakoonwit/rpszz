import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ProductCard from '../components/ProductCard.jsx'
import styles from './HomePage.module.css'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import toast, { Toaster } from 'react-hot-toast'

const FALLBACK_PRODUCTS = [
  {
    id: '1',
    title: 'Vintage Denim Jacket',
    name: 'Vintage Denim Jacket',
    description: 'เสื้อแจ็คเก็ตยีนส์แบรนด์วินเทจ 90s สภาพดีเฟดสวย 92% เนื้อผ้าหนาทรงหล่อ สภาพนี้หายาก',
    price: 1200,
    image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80',
    status: 'available',
    category: 'clothing'
  },
  {
    id: '2',
    title: 'Retro Leather Boots',
    name: 'Retro Leather Boots',
    description: 'รองเท้าบูทหนังแท้สไตล์เรโทร 95% สภาพสมบูรณ์ ขัดเงาพร้อมสวมใส่ ไซส์ 41',
    price: 2500,
    image_url: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=600&q=80',
    status: 'reserved',
    category: 'footwear'
  },
  {
    id: '3',
    title: 'Analog Film Camera',
    name: 'Analog Film Camera',
    description: 'กล้องฟิล์มสไตล์เรนจ์ไฟนเดอร์ระดับตำนาน Yashica GT 90% เลนส์ใสไร้ฝ้าฝุ่น วัดแสงปกติ',
    price: 3400,
    image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
    status: 'sold',
    category: 'electronics'
  }
]

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'available', 'reserved', 'sold'
  const [search, setSearch] = useState('')

  const hasConvex = !!import.meta.env.VITE_CONVEX_URL

  const convexProducts = useQuery(hasConvex ? api.products.list : api.products.list)

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      const { data: dbProducts, error: prodError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

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
    } catch (err) {
      console.error('Error fetching data:', err)
      const localProds = localStorage.getItem('rpszz_local_products')
      setProducts(localProds ? JSON.parse(localProds) : FALLBACK_PRODUCTS)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  useEffect(() => {
    if (hasConvex && convexProducts) {
      setProducts(convexProducts.map(p => ({ ...p, id: p._id })))
      setLoading(false)
    }
  }, [convexProducts, hasConvex])

  useEffect(() => {
    if (!hasConvex) {
      fetchData(true)
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

  // Filter logic
  const filteredProducts = products.filter(p => {
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    const displayName = p.name || p.title || ''
    const matchSearch = !search || displayName.toLowerCase().includes(search.toLowerCase()) || 
      (p.description && p.description.toLowerCase().includes(search.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
    return matchStatus && matchSearch
  })

  return (
    <div className={styles.page}>
      <Toaster />

      {/* Hero section */}
      <section className={`${styles.hero} container`}>
        <div>
          <p className={styles.heroKicker}>Premium second-hand</p>
          <h1 className={styles.heroH}>
            <strong>Curated</strong><br />
            <em>for those</em><br />
            <strong>who know.</strong>
          </h1>
          <p className={styles.heroP}>
            เสื้อผ้า รองเท้า accessories วินเทจ คัดสรรโดย Rapeepong ของแท้ทุกชิ้น สต็อก real-time
          </p>
          <div className={styles.heroActs}>
            <button 
              className="btn btn-primary"
              onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
            >
              Browse
            </button>
            <Link to="/track" className="btn-text" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Track order <i className="ti ti-arrow-right" aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className={styles.heroR}>
          <span className={styles.heroRBg}>RPSZZ</span>
          <span className={styles.newPill}>New drop</span>
          <div className={styles.heroRInner}>
            <i className="ti ti-shirt" aria-hidden="true" />
            <span>hero image</span>
          </div>
        </div>
      </section>

      <div className="container">
        <div style={{ height: '0.5px', background: 'var(--border)' }} />
      </div>

      {/* Products list section */}
      <section className={`${styles.productsSection} container`} id="products">
        <div className={styles.secHd}>
          <span className={styles.secLabel}>Latest stock</span>
          <span className={styles.secCount}>{filteredProducts.length} items</span>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.filters}>
            <button 
              className={`${styles.fBtn} ${statusFilter === 'all' ? styles.on : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All
            </button>
            <button 
              className={`${styles.fBtn} ${statusFilter === 'available' ? styles.on : ''}`}
              onClick={() => setStatusFilter('available')}
            >
              Available
            </button>
            <button 
              className={`${styles.fBtn} ${statusFilter === 'reserved' ? styles.on : ''}`}
              onClick={() => setStatusFilter('reserved')}
            >
              Reserved
            </button>
            <button 
              className={`${styles.fBtn} ${statusFilter === 'sold' ? styles.on : ''}`}
              onClick={() => setStatusFilter('sold')}
            >
              Sold
            </button>
          </div>

          <input 
            type="text" 
            placeholder="Search items..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchField}
          />
        </div>

        {loading ? (
          <div className={styles.loadingArea}>
            <div className={styles.loadingSpinner} />
            <span>กำลังโหลดสินค้า...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className={styles.emptyArea}>
            <i className="ti ti-eye-off" style={{ fontSize: '36px', marginBottom: '8px' }} />
            <span>ไม่พบสินค้าที่ตรงตามเงื่อนไข</span>
          </div>
        ) : (
          <div className={styles.pgrid}>
            {filteredProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* About brand block */}
      <section className={`${styles.brandBlock} container`} id="brand">
        <div>
          <p className={styles.overline}>About</p>
          <h2 className={styles.brandH}>
            Sleek.<br />
            Bold.<br />
            <span>Authentic.</span>
          </h2>
        </div>
        <div>
          <div className={styles.trait}>
            <span className={styles.traitN}>01</span>
            <p className={styles.traitT}><strong>ของแท้ 100%</strong> — ตรวจสอบก่อนลง stock ทุกชิ้น</p>
          </div>
          <div className={styles.trait}>
            <span className={styles.traitN}>02</span>
            <p className={styles.traitT}><strong>Real-time stock</strong> — Available, Reserved, Sold อัปเดตทันที</p>
          </div>
          <div className={styles.trait}>
            <span className={styles.traitN}>03</span>
            <p className={styles.traitT}><strong>Direct purchase</strong> — ซื้อตรงผ่านแชท ไม่มีตัวแทน</p>
          </div>
          <div className={styles.trait}>
            <span className={styles.traitN}>04</span>
            <p className={styles.traitT}><strong>Order tracking</strong> — ติดตามสถานะ 24 ชม. ด้วยเบอร์โทร</p>
          </div>
        </div>
      </section>

      {/* Chat to Buy CTA section */}
      <section className="container">
        <div className={styles.ctaRow} id="cta">
          <h3 className={styles.ctaH}>
            <strong>Chat</strong> to buy.<br />
            Easy & fast.
          </h3>
          <div className={styles.ctaBtns}>
            <a href="https://line.me/ti/p/~YOUR_LINE_ID" target="_blank" rel="noreferrer" className={styles.ctaB1}>
              LINE
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className={styles.ctaB2}>
              Instagram
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
