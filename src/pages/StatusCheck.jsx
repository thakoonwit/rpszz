import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import styles from './TrackPage.module.css'
import { useConvex } from 'convex/react'
import { api } from '../../convex/_generated/api'

const STATUS_MAP = {
  preparing: { label: 'กำลังเตรียมสินค้า', color: 'oklch(0.50 0.12 85)', icon: '○' },
  shipped:   { label: 'จัดส่งแล้ว',       color: 'oklch(0.50 0.12 85)', icon: '◑' },
  delivered: { label: 'จัดส่งสำเร็จ',     color: 'oklch(0.40 0.15 145)', icon: '●' },
  // Compatibility fallbacks
  reserved:  { label: 'จองสำเร็จแล้ว',    color: 'oklch(0.50 0.12 85)', icon: '◑' },
  sold:      { label: 'ดำเนินการแล้ว',    color: 'var(--accent)', icon: '●' },
}

const MOCK_ORDERS = [
  {
    id: 'o1',
    customer_name: 'Retro Customer',
    customer_phone: '0898765432',
    status: 'preparing',
    tracking_number: null,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    products: {
      title: 'Retro Leather Boots',
      price: 2500,
      image_url: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=600&q=80'
    }
  },
  {
    id: 'o2',
    customer_name: 'Sompong K.',
    customer_phone: '0812345678',
    status: 'delivered',
    tracking_number: 'TH12345678901',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    products: {
      title: 'Analog Film Camera',
      price: 3400,
      image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80'
    }
  }
]

export default function StatusCheck() {
  const [phone, setPhone] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const hasConvex = !!import.meta.env.VITE_CONVEX_URL
  const convex = useConvex()

  async function handleSearch(e) {
    e.preventDefault()
    if (!phone.trim()) return
    setLoading(true)
    setSearched(true)

    const clean = phone.trim()

    try {
      if (hasConvex && convex) {
        const data = await convex.query(api.orders.getByPhone, { phone: clean })
        setResults(data.map(o => ({ ...o, id: o._id })))
      } else {
        const { data, error } = await supabase
          .from('orders')
          .select('*, products(*)')
          .eq('customer_phone', clean)
          .order('created_at', { ascending: false })

        if (error || !data || data.length === 0) {
          // Fallback checks
          const matched = MOCK_ORDERS.filter(o => o.customer_phone === clean)
          setResults(matched)
        } else {
          setResults(data)
        }
      }
    } catch (err) {
      console.error('Error searching order:', err)
      const matched = MOCK_ORDERS.filter(o => o.customer_phone === clean)
      setResults(matched)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>เช็คสถานะ<br /><span>สินค้า</span></h1>
          <p className={styles.sub}>ใส่เบอร์โทรที่ใช้แชทสั่งซื้อ</p>
        </div>

        <form onSubmit={handleSearch} className={styles.form}>
          <div className={styles.inputGroup}>
            <input
              type="tel"
              placeholder="เบอร์โทร เช่น 0812345678"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className={styles.input}
              maxLength={10}
            />
            <button type="submit" className={styles.searchBtn} disabled={loading}>
              {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
            </button>
          </div>
        </form>

        {!searched && (
          <div style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            padding: '20px',
            maxWidth: '480px',
            fontSize: '14px',
            color: 'var(--muted)'
          }}>
            <p style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>ทดลองค้นหาสถานะ (Demo):</p>
            <p>เบอร์ <strong style={{ color: 'var(--ink)' }}>0898765432</strong>: สถานะ "กำลังเตรียมสินค้า"</p>
            <p>เบอร์ <strong style={{ color: 'var(--ink)' }}>0812345678</strong>: สถานะ "จัดส่งสำเร็จ"</p>
          </div>
        )}

        {searched && !loading && results && (
          <div className={styles.results}>
            {results.length === 0 ? (
              <div className={styles.empty}>
                <p>ไม่พบรายการสั่งซื้อจากเบอร์นี้</p>
                <span>หากมีปัญหา กรุณาติดต่อผ่านแชท</span>
              </div>
            ) : (
              <>
                <p className={styles.resultMeta}>
                  พบ {results.length} รายการจากเบอร์ {phone}
                </p>
                <div className={styles.orderList}>
                  {results.map(order => {
                    const s = STATUS_MAP[order.status] || STATUS_MAP.preparing
                    const productInfo = order.products || order.product || {}
                    const displayName = productInfo.title || productInfo.name || 'สินค้า'

                    return (
                      <div key={order.id} className={styles.orderCard}>
                        <div className={styles.orderTop}>
                          {productInfo.image_url && (
                            <img
                              src={productInfo.image_url}
                              alt={displayName}
                              className={styles.thumb}
                            />
                          )}
                          <div className={styles.orderInfo}>
                            <h3 className={styles.productName}>
                              {displayName}
                            </h3>
                            <p className={styles.orderDate}>
                              {new Date(order.created_at || order.updated_at).toLocaleDateString('th-TH', {
                                year: 'numeric', month: 'long', day: 'numeric'
                              })}
                            </p>
                            {order.tracking_number && (
                              <p className={styles.note} style={{ fontStyle: 'normal', color: 'var(--ink)' }}>
                                เลขพัสดุ: <strong>{order.tracking_number}</strong>
                              </p>
                            )}
                            {order.note && (
                              <p className={styles.note}>หมายเหตุ: {order.note}</p>
                            )}
                            {order.delivery_image_url && (
                              <div className={styles.deliveryProofWrap}>
                                <span className={styles.deliveryProofLabel}>รูปถ่ายพัสดุ / หลักฐานจัดส่ง:</span>
                                <img 
                                  src={order.delivery_image_url} 
                                  alt="รูปถ่ายพัสดุ" 
                                  className={styles.deliveryProofImg} 
                                  onClick={() => window.open(order.delivery_image_url, '_blank')}
                                />
                              </div>
                            )}
                          </div>
                          <div className={styles.statusWrap}>
                            <span className={styles.statusIcon} style={{ color: s.color }}>
                              {s.icon}
                            </span>
                            <span className={styles.statusLabel} style={{ color: s.color }}>
                              {s.label}
                            </span>
                          </div>
                        </div>
                        <div className={styles.orderBottom}>
                          <span className={styles.priceTag}>
                            ฿{Number(productInfo.price || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            <div className={styles.chatNote}>
              <p>มีคำถาม? แชทหาเราได้เลย</p>
              <a
                href="https://line.me/ti/p/~YOUR_LINE_ID"
                target="_blank"
                rel="noreferrer"
                className={styles.lineBtn}
              >
                ติดต่อ LINE
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
