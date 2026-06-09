import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import ProductCard from '../components/ProductCard.jsx'
import styles from './HomePage.module.css'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Store, Info, Star, Award, ShieldCheck, Mail, Eye, ShoppingBag } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

const CATEGORY_TABS = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'clothing', label: 'เสื้อผ้า' },
  { id: 'footwear', label: 'รองเท้า' },
  { id: 'electronics', label: 'อิเล็กทรอนิกส์' },
  { id: 'accessories', label: 'เครื่องประดับ' },
  { id: 'other', label: 'อื่นๆ' }
]

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
  },
  {
    id: '4',
    title: 'Graphic Streetwear Tee',
    name: 'Graphic Streetwear Tee',
    description: 'เสื้อยืดสไตล์สตรีทแวร์ฟิล์มลายกราฟิกสวย 88% ผ้าคอนตอนเนื้อหนา ไซส์ L',
    price: 450,
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    status: 'available',
    category: 'clothing'
  }
]

const TESTIMONIALS = [
  {
    id: '1',
    customer_name: 'คุณอมรเทพ ส.',
    rating: 5,
    comment: 'สภาพสินค้าตรงปกมากครับ ทางร้านถ่ายรูปมุมซูมรายละเอียดจุดรอยขนแมวมาแบบชัดเจน ซื่อสัตย์มาก ไม่ปกปิดตำหนิเลย มั่นใจร้านนี้ครับ',
    avatar: 'A',
    purchase: 'กล้อง Analog Film Camera',
    theme: 'avatarBlack'
  },
  {
    id: '2',
    customer_name: 'คุณภัทราภรณ์ ว.',
    rating: 5,
    comment: 'แจ็คเก็ตสะอาดมาก ไม่มีกลิ่นอับชื้นเหมือนเสื้อผ้ามือสองทั่วไป ส่งซักแห้งฆ่าเชื้อมาให้เรียบร้อย สภาพดีงามขนฟูสวยตามที่ลงรายละเอียดไว้เลยค่ะ',
    avatar: 'P',
    purchase: 'Vintage Denim Jacket',
    theme: 'avatarRed'
  },
  {
    id: '3',
    customer_name: 'คุณศตวรรษ ล.',
    rating: 5,
    comment: 'ได้ของแถมครบตามที่ระบุ แพ็คกันกระแทกมาหนาหนาแน่นหลายชั้นมาก ตัวเครื่องใช้งานได้ดีไม่มีปัญหา ส่งผ่านเอกชนวันเดียวถึงเลย ขอบคุณครับ',
    avatar: 'S',
    purchase: 'Retro Leather Boots',
    theme: 'avatarBlue'
  }
]

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('default')
  const [newsletterEmail, setNewsletterEmail] = useState('')

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

  // Get condition percentage helper
  const getConditionScore = (p) => {
    const desc = p.description || ''
    const match = desc.match(/(\d+)%/)
    if (match) return parseInt(match[1])
    // Determinisitc mock score for display
    const numId = p.id ? p.id.toString().charCodeAt(0) : 95
    return 85 + (numId % 14)
  }

  // Filter & Sort logic
  const filteredAndSortedProducts = products
    .filter(p => {
      const matchCategory = activeCategory === 'all' || p.category === activeCategory
      const displayName = p.name || p.title || ''
      const matchSearch = !search || displayName.toLowerCase().includes(search.toLowerCase()) || (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
      return matchCategory && matchSearch
    })
    .sort((a, b) => {
      if (sortBy === 'low-high') {
        return a.price - b.price
      }
      if (sortBy === 'high-low') {
        return b.price - a.price
      }
      if (sortBy === 'condition-rank') {
        return getConditionScore(b) - getConditionScore(a)
      }
      return 0 // default sorting
    })

  // Find spotlight product
  const spotlightProduct = products.find(p => p.status === 'available' && p.image_url) || products[0] || FALLBACK_PRODUCTS[0]
  const spotlightImage = spotlightProduct?.image_url ? spotlightProduct.image_url.split(',')[0].trim() : ''

  const counts = {
    available: products.filter(p => p.status === 'available').length,
    reserved:  products.filter(p => p.status === 'reserved').length,
    sold:      products.filter(p => p.status === 'sold').length,
  }

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.error('กรุณากรอกอีเมลของคุณให้ถูกต้อง เพื่อรับสิทธิ์จองสินค้าด่วน')
      return
    }
    toast.success('สมัครเข้าร่วมรายชื่อจองคิวรับข่าวสารสำเร็จ!')
    setNewsletterEmail('')
  }

  return (
    <div className={styles.page}>
      <Toaster />
      <div className={styles.heroAccentLine} />

      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroGrid}>
            
            {/* Left Info Column */}
            <div className={styles.heroContent}>
              <div className={styles.tagline}>
                <span className={`${styles.pingDot} animate-pulse`} />
                อัปเดตสต็อกสินค้าใหม่: วันนี้เวลา 18:00 น.
              </div>
              
              <h1 className={styles.heroTitle}>
                CURATED <span className={styles.heroTitleHighlight}>SECONDS</span><br />
                คัดเกรดเฉพาะสิ่งที่มีคุณค่า
              </h1>
              
              <p className={styles.heroSub}>
                พบกับแหล่งรวบรวมของมือสองระดับพรีเมียม เสื้อผ้า สินค้าเทคโนโลยี และนาฬิกาสะสมยอดนิยม ทุกชิ้นได้รับการตรวจสอบอย่างพิถีพิถัน วัดสภาพจริงระบุเปอร์เซ็นต์อย่างจริงใจ เพื่อให้คุณมั่นใจในทุกการสั่งซื้อเสมือนไปเลือกซื้อเอง
              </p>

              <div className={styles.heroActions}>
                <a href="#shop-section" className={styles.primaryBtn}>
                  <Store size={14} style={{ marginRight: '6px' }} /> เลือกชมสินค้าเลย
                </a>
                <a href="#conditions-section" className={styles.secondaryBtn}>
                  <Info size={14} style={{ marginRight: '6px' }} /> เกณฑ์วัดสภาพสินค้า
                </a>
              </div>

              {/* Quick Stats */}
              <div className={styles.quickStats}>
                <div>
                  <div className={styles.statNum}>100%</div>
                  <div className={styles.statLabel}>ภาพถ่ายจริง</div>
                </div>
                <div>
                  <div className={`${styles.statNum} ${styles.statNumAccent}`}>1 of 1</div>
                  <div className={styles.statLabel}>ชิ้นเดียวในร้าน</div>
                </div>
                <div>
                  <div className={`${styles.statNum} ${styles.statNumPrimary}`}>Verified</div>
                  <div className={styles.statLabel}>ตรวจสอบของแท้</div>
                </div>
              </div>
            </div>

            {/* Right Spotlight Card */}
            {spotlightProduct && (
              <div className={styles.spotlightCard}>
                <div className={styles.spotlightHeader}>
                  <div className={styles.spotlightDots}>
                    <span className={styles.spotlightDot} style={{ backgroundColor: 'var(--accent)' }} />
                    <span className={styles.spotlightDot} style={{ backgroundColor: 'var(--ink)' }} />
                    <span className={styles.spotlightDot} style={{ backgroundColor: 'var(--primary)' }} />
                  </div>
                  <span className={styles.spotlightBadge}>SPOTLIGHT DEALS</span>
                </div>
                
                <div className={styles.spotlightImageWrap}>
                  {spotlightImage ? (
                    <img src={spotlightImage} alt={spotlightProduct.title || spotlightProduct.name} className={styles.spotlightImage} />
                  ) : (
                    <div className="flex-center" style={{ height: '100%', backgroundColor: 'var(--bg)', color: 'var(--muted)' }}>ไม่มีรูปภาพ</div>
                  )}
                </div>

                <div className={styles.spotlightInfo}>
                  <div>
                    <span className={styles.spotlightCategory}>
                      {spotlightProduct.category === 'clothing' ? 'เสื้อผ้า' : spotlightProduct.category === 'footwear' ? 'รองเท้า' : spotlightProduct.category === 'electronics' ? 'อิเล็กทรอนิกส์' : spotlightProduct.category === 'accessories' ? 'เครื่องประดับ' : spotlightProduct.category || 'สินค้า'}
                    </span>
                    <h3 className={styles.spotlightTitle}>{spotlightProduct.title || spotlightProduct.name}</h3>
                  </div>
                  <div className={styles.spotlightPriceWrap}>
                    {spotlightProduct.price > 1000 && (
                      <span className={styles.spotlightOldPrice}>฿{(spotlightProduct.price * 1.5).toLocaleString()}</span>
                    )}
                    <span className={styles.spotlightPrice}>฿{Number(spotlightProduct.price || 0).toLocaleString()}</span>
                  </div>
                </div>

                <p className={styles.spotlightDesc}>{spotlightProduct.description || 'ไม่มีรายละเอียดเพิ่มเติมสำหรับสินค้านี้'}</p>
                
                <a 
                  href={`https://line.me/R/ti/p/~YOUR_LINE_ID?text=สนใจสั่งซื้อสินค้า Spotlight:%20${encodeURIComponent(spotlightProduct.title || spotlightProduct.name)}`}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.spotlightBuyBtn}
                >
                  <ShoppingBag size={14} /> สั่งซื้อสินค้านี้ทันที
                </a>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Conditions Section */}
      <section className={styles.conditionsSection} id="conditions-section">
        <div className="container">
          <h3 className={styles.sectionHeading}>
            / มาตรฐานการคัดเลือกสภาพสินค้ามือสองของเรา /
          </h3>
          <div className={styles.conditionsGrid}>
            <div className={styles.conditionBox}>
              <span className={`${styles.conditionGrade} ${styles.gradeRed}`}>MINT</span>
              <span className={styles.conditionTitle}>สภาพเหมือนใหม่ 98-99%</span>
              <p className={styles.conditionDesc}>สินค้าแทบไม่มีตำหนิ ครบกล่อง ไม่เคยผ่านการซ่อมแซมหรือเสียหาย ใช้งานได้สมบูรณ์แบบเสมือนถอยห้าง</p>
            </div>
            <div className={styles.conditionBox}>
              <span className={`${styles.conditionGrade} ${styles.gradeBlue}`}>EXCELLENT</span>
              <span className={styles.conditionTitle}>สภาพดีเยี่ยม 94-97%</span>
              <p className={styles.conditionDesc}>มีริ้วรอยขนแมวบางๆ ตามธรรมชาติจากการใช้งานทั่วไป อุปกรณ์และการทำงานหลักทุกอย่างไม่มีปัญหาแม้แต่น้อย</p>
            </div>
            <div className={styles.conditionBox}>
              <span className={`${styles.conditionGrade} ${styles.gradeBlack}`}>VERY GOOD</span>
              <span className={styles.conditionTitle}>สภาพดีมาก 90-93%</span>
              <p className={styles.conditionDesc}>มีรอยจากการใช้งานชัดเจน แต่ไม่มีผลกระทบต่อประสิทธิภาพการใช้งาน ภาพถ่ายจากสตูดิโอจะซูมตำแหน่งจุดรอยชัดเจน</p>
            </div>
            <div className={styles.conditionBox}>
              <span className={`${styles.conditionGrade} ${styles.gradeMuted}`}>VINTAGE GOOD</span>
              <span className={styles.conditionTitle}>สภาพวินเทจ 85-89%</span>
              <p className={styles.conditionDesc}>เหมาะกับสายสะสม มีรอยเฟด รอยซีด รอยยับตามกาลเวลาที่สวยงามเป็นเอกลักษณ์แบบหาที่ไหนไม่ได้อีกแล้ว</p>
            </div>
          </div>
        </div>
      </section>

      {/* Shop Catalog Section */}
      <section className={styles.catalogSection} id="shop-section">
        <div className="container">
          
          <div className={styles.catalogHeadingArea}>
            <span className={styles.catalogTagline}>OUR CATALOGUE</span>
            <h2 className={styles.catalogTitle}>CURATED SECOND-HAND SELECTIONS</h2>
            <div className={styles.catalogTitleDivider} />
            <p className={styles.catalogSub}>ของใช้ส่วนตัว วินเทจไอเทม และแบรนด์เนมมือสองของแท้ ทุกชิ้นมีสต็อกอย่างละ 1 ชิ้นเท่านั้น ขายแล้วขายเลยไม่มีเติมสต็อก</p>
          </div>

          {/* Toolbar */}
          <div className={styles.toolbar}>
            {/* Search */}
            <div className={styles.searchWrapper}>
              <input 
                type="text" 
                placeholder="ค้นหาสินค้ามือสอง..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={styles.toolbarSearch}
              />
            </div>

            {/* Category Tabs */}
            <div className={styles.tabs}>
              {CATEGORY_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`${styles.tabBtn} ${activeCategory === tab.id ? styles.activeTabBtn : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sorter */}
            <div className={styles.sorterWrapper}>
              <select 
                value={sortBy} 
                onChange={e => setSortBy(e.target.value)}
                className={styles.sorterSelect}
              >
                <option value="default">จัดเรียงรายการสินค้า</option>
                <option value="low-high">ราคา: ต่ำไปสูง</option>
                <option value="high-low">ราคา: สูงไปต่ำ</option>
                <option value="condition-rank">สภาพสินค้าดีที่สุด</option>
              </select>
            </div>
          </div>

          {/* Catalog Product Grid */}
          {loading ? (
            <div className={styles.loadingArea}>
              <div className={styles.loadingSpinner} />
              <span>กำลังโหลดสินค้าที่คัดสรรแล้ว...</span>
            </div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <div className={styles.emptyArea}>
              <Eye size={36} style={{ color: 'var(--muted)' }} />
              <div className={styles.emptyTitle}>ไม่พบสินค้าที่คุณต้องการ</div>
              <p className={styles.emptySub}>ลองเปลี่ยนคำค้นหา หรือเลือกดูหมวดหมู่อื่นแทน</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredAndSortedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.testimonialsSection}>
        <div className="container">
          
          <div className={styles.testimonialsHeader}>
            <div className={styles.testimonialsTitleArea}>
              <span className={styles.testimonialsTagline}>REAL FEEDBACKS</span>
              <h2 className={styles.testimonialsTitle}>รีวิวจากผู้สั่งซื้อสินค้ามือสองจริง</h2>
            </div>
            
            <div className={styles.ratingCard}>
              <div className={styles.ratingStars}>
                <Star size={12} fill="var(--accent)" />
                <Star size={12} fill="var(--accent)" />
                <Star size={12} fill="var(--accent)" />
                <Star size={12} fill="var(--accent)" />
                <Star size={12} fill="var(--accent)" />
              </div>
              <div>
                <div className={styles.ratingInfoTitle}>คะแนนความพึงพอใจ 4.9 เต็ม 5.0</div>
                <div className={styles.ratingInfoSub}>(จากรายการรับสินค้าไปแล้ว 250+ ออเดอร์)</div>
              </div>
            </div>
          </div>

          <div className={styles.testimonialsGrid}>
            {TESTIMONIALS.map(item => (
              <div key={item.id} className={styles.testimonialCard}>
                <div className={styles.testimonialUserArea}>
                  <div className={`${styles.userAvatar} ${styles[item.theme]}`}>
                    {item.avatar}
                  </div>
                  <div className={styles.userMeta}>
                    <span className={styles.userName}>{item.customer_name}</span>
                    <span className={item.id === '2' ? styles.userPurchase : styles.userPurchaseAlt}>
                      ซื้อ {item.purchase}
                    </span>
                  </div>
                </div>
                <p className={styles.testimonialText}>"{item.comment}"</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Newsletter early access section */}
      <section className={styles.newsletterSection}>
        <div className="container">
          <h3 className={styles.newsletterTitle}>ลงทะเบียนติดตามของมือสองเกรดดี</h3>
          <p className={styles.newsletterDesc}>เนื่องจากสินค้ามือสองที่คัดคุณภาพเกรดพรีเมียมมีเพียงชิ้นเดียวเท่านั้น สมัครรับการแจ้งเตือนทางอีเมลเพื่อได้รับสิทธิ์จองก่อนใครแบบ Early-Access</p>
          
          <form onSubmit={handleNewsletterSubmit} className={styles.newsletterForm}>
            <input 
              type="email" 
              placeholder="กรอกอีเมลของคุณ..." 
              value={newsletterEmail}
              onChange={e => setNewsletterEmail(e.target.value)}
              className={styles.newsletterInput}
            />
            <button type="submit" className={styles.newsletterBtn}>
              ลงทะเบียนรับสิทธิ์
            </button>
          </form>
        </div>
      </section>

    </div>
  )
}
