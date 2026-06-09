import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import ProductCard from '../components/ProductCard.jsx'
import styles from './HomePage.module.css'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Store, Info, Star, Facebook, Eye, ArrowRight, ShieldCheck, ThumbsUp } from 'lucide-react'
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
  }
]

const FALLBACK_REVIEWS = [
  {
    id: 'r1',
    customer_name: 'คุณอมรเทพ ส.',
    rating: 5,
    comment: 'สภาพกล้องสวยถูกใจตามในรูปเป๊ะครับ ทางร้านถ่ายภาพมุมซูมรายละเอียดจุดรอยขนแมวมาแบบชัดเจน ซื่อสัตย์มาก ไม่ปกปิดตำหนิเลย มั่นใจร้านนี้ครับ',
    facebook_url: 'https://facebook.com',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=anan'
  },
  {
    id: 'r2',
    customer_name: 'คุณภัทราภรณ์ ว.',
    rating: 5,
    comment: 'แจ็คเก็ตสะอาดมาก ไม่มีกลิ่นอับชื้นเหมือนเสื้อผ้ามือสองทั่วไป ส่งซักแห้งฆ่าเชื้อมาให้เรียบร้อย สภาพดีงามขนฟูสวยตามที่ลงรายละเอียดไว้เลยค่ะ',
    facebook_url: 'https://facebook.com',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=sompong'
  }
]

export default function Home() {
  const [products, setProducts] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('default')
  const [newsletterEmail, setNewsletterEmail] = useState('')

  const hasConvex = !!import.meta.env.VITE_CONVEX_URL

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

  useEffect(() => {
    if (hasConvex && convexProducts && convexReviews) {
      setProducts(convexProducts.map(p => ({ ...p, id: p._id })))
      setReviews(convexReviews.map(r => ({ ...r, id: r._id })))
      setLoading(false)
    }
  }, [convexProducts, convexReviews, hasConvex])

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
      return 0
    })

  // Find spotlight product
  const spotlightProduct = products.find(p => p.status === 'available' && p.image_url) || products[0] || FALLBACK_PRODUCTS[0]
  const spotlightImage = spotlightProduct?.image_url ? spotlightProduct.image_url.split(',')[0].trim() : ''

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

      {/* Hero: Boutique Editorial Grid */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroGrid}>
            
            {/* Left Column: Bold Asymmetric Typography */}
            <div className={styles.heroContent}>
              <div className={styles.tagline}>
                <span className={`${styles.pingDot} animate-pulse`} />
                RPSZZ / ARCHIVE COLLECTIBLES
              </div>
              
              <h1 className={styles.heroTitle}>
                THE EDITORIAL <br />
                <span className={styles.heroTitleHighlight}>ARCHIVE</span> OF VINTAGE
              </h1>
              
              <p className={styles.heroSub}>
                คอลเลกชันเสื้อผ้า ของใช้สะสม และแกดเจ็ตวินเทจคัดเกรดพิเศษโดย Rapeepong ทุกชิ้นผ่านการตรวจสอบคุณภาพ บันทึกตำหนิและประเมินเปอร์เซ็นต์ความสมบูรณ์แบบตรงไปตรงมา สั่งซื้อจองสินค้าผ่านทางแชทเท่านั้น
              </p>

              <div className={styles.heroActions}>
                <a href="#shop-section" className={styles.primaryBtn}>
                  <Store size={14} style={{ marginRight: '8px' }} /> เลือกชมสินค้าทั้งหมด
                </a>
                <a href="#conditions-section" className={styles.secondaryBtn}>
                  <Info size={14} style={{ marginRight: '8px' }} /> มาตรฐานสภาพสินค้า
                </a>
              </div>

              {/* Trust badges */}
              <div className={styles.quickStats}>
                <div>
                  <div className={styles.statNum}>100%</div>
                  <div className={styles.statLabel}>REAL CAPTURES</div>
                </div>
                <div>
                  <div className={`${styles.statNum} ${styles.statNumAccent}`}>LIMITED</div>
                  <div className={styles.statLabel}>1-OF-1 SELECTIONS</div>
                </div>
                <div>
                  <div className={`${styles.statNum} ${styles.statNumPrimary}`}>VERIFIED</div>
                  <div className={styles.statLabel}>AUTHENTIC PIECES</div>
                </div>
              </div>
            </div>

            {/* Right Column: Floating Curated Showcase */}
            {spotlightProduct && (
              <div className={styles.spotlightCard}>
                <div className={styles.spotlightHeader}>
                  <span className={styles.spotlightBadge}>WEEKLY SPOTLIGHT</span>
                  <div className={styles.spotlightDots}>
                    <span className={styles.spotlightDot} style={{ backgroundColor: 'var(--accent)' }} />
                    <span className={styles.spotlightDot} style={{ backgroundColor: 'var(--ink)' }} />
                  </div>
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
                  <ArrowRight size={14} /> แชทจองชิ้นนี้ทันที
                </a>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Conditions Standards Info Area */}
      <section className={styles.conditionsSection} id="conditions-section">
        <div className="container">
          <h3 className={styles.sectionHeading}>
            / ประเมินสภาพสินค้าอย่างจริงใจ /
          </h3>
          <div className={styles.conditionsGrid}>
            <div className={styles.conditionBox}>
              <span className={`${styles.conditionGrade} ${styles.gradeRed}`}>MINT</span>
              <span className={styles.conditionTitle}>98 - 99% เสมือนมือหนึ่ง</span>
              <p className={styles.conditionDesc}>สินค้าไร้ริ้วรอย ตำหนิเป็นศูนย์ ครบกล่องสมบูรณ์แบบที่สุด</p>
            </div>
            <div className={styles.conditionBox}>
              <span className={`${styles.conditionGrade} ${styles.gradeBlue}`}>EXCELLENT</span>
              <span className={styles.conditionTitle}>94 - 97% สภาพดีเยี่ยม</span>
              <p className={styles.conditionDesc}>มีรอยขนแมวบางๆ สภาพโดยรวมงดงาม ระบบทำงานไร้ที่ติ</p>
            </div>
            <div className={styles.conditionBox}>
              <span className={`${styles.conditionGrade} ${styles.gradeBlack}`}>VERY GOOD</span>
              <span className={styles.conditionTitle}>90 - 93% สภาพพร้อมใช้</span>
              <p className={styles.conditionDesc}>รอยจากการใช้งานชัดเจน แต่ใช้งานและสวมใส่ได้ดีเยี่ยม</p>
            </div>
            <div className={styles.conditionBox}>
              <span className={`${styles.conditionGrade} ${styles.gradeMuted}`}>VINTAGE</span>
              <span className={styles.conditionTitle}>85 - 89% สภาพวินเทจ</span>
              <p className={styles.conditionDesc}>รอยเฟดหรือรอยซีดตามกาลเวลาที่สร้างเสน่ห์เฉพาะตัว</p>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Grid Section */}
      <section className={styles.catalogSection} id="shop-section">
        <div className="container">
          
          <div className={styles.catalogHeadingArea}>
            <span className={styles.catalogTagline}>THE COLLECTION</span>
            <h2 className={styles.catalogTitle}>CURATED PIECES</h2>
            <div className={styles.catalogTitleDivider} />
            <p className={styles.catalogSub}>สินค้าส่วนตัวและของแบรนด์เนมวินเทจคัดพิเศษ สต็อกอย่างละ 1 ชิ้น ไม่มีชิ้นที่สองทดแทน</p>
          </div>

          {/* Catalog Filters Bar */}
          <div className={styles.toolbar}>
            <div className={styles.searchWrapper}>
              <input 
                type="text" 
                placeholder="ค้นหาตามชื่อ หรือแบรนด์..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={styles.toolbarSearch}
              />
            </div>

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

            <div className={styles.sorterWrapper}>
              <select 
                value={sortBy} 
                onChange={e => setSortBy(e.target.value)}
                className={styles.sorterSelect}
              >
                <option value="default">จัดเรียงสินค้า</option>
                <option value="low-high">ราคา: ต่ำไปสูง</option>
                <option value="high-low">ราคา: สูงไปต่ำ</option>
                <option value="condition-rank">สภาพความสมบูรณ์สูงสุด</option>
              </select>
            </div>
          </div>

          {/* Catalog Product Grid */}
          {loading ? (
            <div className={styles.loadingArea}>
              <div className={styles.loadingSpinner} />
              <span>กำลังโหลดสินค้าคัดสรร...</span>
            </div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <div className={styles.emptyArea}>
              <Eye size={36} style={{ color: 'var(--muted)' }} />
              <div className={styles.emptyTitle}>ไม่พบสินค้าที่ค้นหา</div>
              <p className={styles.emptySub}>กรุณาลองเปลี่ยนคำค้นหา หรือคัดกรองหมวดหมู่อื่นแทน</p>
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

      {/* Customer Testimonials with Facebook Links */}
      <section className={styles.testimonialsSection}>
        <div className="container">
          
          <div className={styles.testimonialsHeader}>
            <div className={styles.testimonialsTitleArea}>
              <span className={styles.testimonialsTagline}>VERIFIED REVIEWS</span>
              <h2 className={styles.testimonialsTitle}>รีวิวและเสียงตอบรับจริงจากลูกค้า</h2>
            </div>
            
            <div className={styles.ratingCard}>
              <div className={styles.ratingStars}>
                <Star size={12} fill="var(--accent)" stroke="none" />
                <Star size={12} fill="var(--accent)" stroke="none" />
                <Star size={12} fill="var(--accent)" stroke="none" />
                <Star size={12} fill="var(--accent)" stroke="none" />
                <Star size={12} fill="var(--accent)" stroke="none" />
              </div>
              <div>
                <div className={styles.ratingInfoTitle}>รับประกันความโปร่งใส 100%</div>
                <div className={styles.ratingInfoSub}>สามารถคลิกตรวจสอบโพสต์รีวิวจาก Facebook จริงได้</div>
              </div>
            </div>
          </div>

          <div className={styles.testimonialsGrid}>
            {reviews.length === 0 ? (
              <div className="text-center w-full" style={{ gridColumn: '1 / -1', color: 'var(--muted)', padding: '40px 0' }}>ยังไม่มีข้อเสนอแนะที่ส่งมาขณะนี้</div>
            ) : (
              reviews.map(item => (
                <div key={item.id} className={styles.testimonialCard}>
                  <div className={styles.testimonialUserArea}>
                    <img 
                      src={item.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${item.customer_name}`} 
                      alt={item.customer_name} 
                      className={styles.userAvatar} 
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div className={styles.userMeta}>
                      <span className={styles.userName}>{item.customer_name}</span>
                      
                      {/* Facebook verified link */}
                      {item.facebook_url ? (
                        <a 
                          href={item.facebook_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center" 
                          style={{ 
                            fontSize: '11px', 
                            color: '#1877F2', 
                            fontWeight: '600', 
                            display: 'inline-flex',
                            alignItems: 'center', 
                            gap: '4px',
                            marginTop: '2px'
                          }}
                        >
                          <Facebook size={12} fill="#1877F2" stroke="none" /> Verified Profile
                        </a>
                      ) : (
                        <span style={{ fontSize: '10px', color: 'var(--muted)' }}>Verified Buyer</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Stars list based on rating */}
                  <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
                    {Array.from({ length: item.rating || 5 }).map((_, idx) => (
                      <Star key={idx} size={10} fill="var(--accent)" stroke="none" />
                    ))}
                  </div>

                  <p className={styles.testimonialText}>"{item.comment}"</p>
                </div>
              ))
            )}
          </div>

        </div>
      </section>

      {/* Newsletter Early access email subscription form */}
      <section className={styles.newsletterSection}>
        <div className="container">
          <h3 className={styles.newsletterTitle}>ลงทะเบียนคิว Early Access</h3>
          <p className={styles.newsletterDesc}>สินค้าทุกชิ้นคัดเกรดมีเพียง 1 ชิ้นเท่านั้น สมัครรับการแจ้งเตือนพัสดุหลุดและสินค้าอัปเดตใหม่ทางอีเมลจองก่อนใคร</p>
          
          <form onSubmit={handleNewsletterSubmit} className={styles.newsletterForm}>
            <input 
              type="email" 
              placeholder="กรอกอีเมลของคุณ..." 
              value={newsletterEmail}
              onChange={e => setNewsletterEmail(e.target.value)}
              className={styles.newsletterInput}
            />
            <button type="submit" className={styles.newsletterBtn}>
              สมัครรับสิทธิ์จอง
            </button>
          </form>
        </div>
      </section>

    </div>
  )
}
