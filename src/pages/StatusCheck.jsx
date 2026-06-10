import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import styles from './TrackPage.module.css'
import { useConvex } from 'convex/react'
import { api } from '../../convex/_generated/api'

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
  const [statusMsg, setStatusMsg] = useState('')

  const hasConvex = !!import.meta.env.VITE_CONVEX_URL
  const convex = useConvex()

  async function handleSearch(e) {
    e.preventDefault()
    if (!phone.trim()) {
      setStatusMsg('กรุณากรอกเบอร์โทรศัพท์')
      return
    }
    setLoading(true)
    setSearched(true)
    setStatusMsg('กำลังค้นหา...')

    const clean = phone.trim()

    try {
      if (hasConvex && convex) {
        const data = await convex.query(api.orders.getByPhone, { phone: clean })
        setResults(data.map(o => ({ ...o, id: o._id })))
        if (data.length === 0) {
          setStatusMsg(`ไม่พบ order สำหรับ ${clean}`)
        } else {
          setStatusMsg('')
        }
      } else {
        const { data, error } = await supabase
          .from('orders')
          .select('*, products(*)')
          .eq('customer_phone', clean)
          .order('created_at', { ascending: false })

        if (error || !data || data.length === 0) {
          const matched = MOCK_ORDERS.filter(o => o.customer_phone === clean)
          setResults(matched)
          if (matched.length === 0) {
            setStatusMsg(`ไม่พบ order สำหรับ ${clean}`)
          } else {
            setStatusMsg('')
          }
        } else {
          setResults(data)
          setStatusMsg('')
        }
      }
    } catch (err) {
      console.error('Error searching order:', err)
      const matched = MOCK_ORDERS.filter(o => o.customer_phone === clean)
      setResults(matched)
      if (matched.length === 0) {
        setStatusMsg(`ไม่พบ order สำหรับ ${clean}`)
      } else {
        setStatusMsg('')
      }
    } finally {
      setLoading(false)
    }
  }

  // Determine timeline step design state
  // Steps: Confirmed, Packaging, In Transit, Delivered
  const getStepClass = (stepName, orderStatus) => {
    // orderStatus: 'preparing' | 'shipped' | 'delivered'
    if (orderStatus === 'delivered') {
      return styles.sdotDone
    }
    if (orderStatus === 'shipped') {
      if (stepName === 'confirmed' || stepName === 'packaging') return styles.sdotDone
      if (stepName === 'transit') return styles.sdotNow
      return styles.sdotWait
    }
    // preparing / default
    if (stepName === 'confirmed') return styles.sdotDone
    if (stepName === 'packaging') return styles.sdotNow
    return styles.sdotWait
  }

  const getStepIcon = (stepName, orderStatus) => {
    if (orderStatus === 'delivered') {
      return <i className="ti ti-check" aria-hidden="true" />
    }
    if (orderStatus === 'shipped') {
      if (stepName === 'confirmed' || stepName === 'packaging') return <i className="ti ti-check" aria-hidden="true" />
      if (stepName === 'transit') return <i className="ti ti-truck" aria-hidden="true" />
      return '○'
    }
    // preparing
    if (stepName === 'confirmed') return <i className="ti ti-check" aria-hidden="true" />
    if (stepName === 'packaging') return <i className="ti ti-package" aria-hidden="true" />
    return '○'
  }

  // We can preview with the most recent order status or fallback to standard steps
  const activeStatus = results && results.length > 0 ? results[0].status : 'preparing'

  return (
    <main className={styles.page}>
      <div className="container">
        <div className={styles.trackBlock} id="track">
          
          {/* Left Column: Form */}
          <div className={styles.trackL}>
            <p className={styles.overline}>Order tracking</p>
            <h2 className={styles.trackH}>
              <strong>Track</strong><br />
              your order.
            </h2>
            <p className={styles.trackP}>ใส่เบอร์โทรศัพท์ที่ใช้สั่งซื้อเพื่อดูสถานะการจัดส่ง</p>
            
            <form onSubmit={handleSearch} className={styles.tfield}>
              <input 
                type="tel" 
                placeholder="เบอร์โทรศัพท์ เช่น 0812345678"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                maxLength={10}
              />
              <button type="submit" disabled={loading}>
                {loading ? 'ค้นหา...' : 'ค้นหา'}
              </button>
            </form>
            <p className={styles.tmsg}>{statusMsg}</p>
          </div>

          {/* Right Column: Timeline */}
          <div className={styles.trackR}>
            <div className={styles.step}>
              <div className={`${styles.sdot} ${getStepClass('confirmed', activeStatus)}`}>
                {getStepIcon('confirmed', activeStatus)}
              </div>
              <div>
                <p className={styles.sname}>Confirmed</p>
                <p className={styles.ssub}>ยืนยัน order แล้ว</p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={`${styles.sdot} ${getStepClass('packaging', activeStatus)}`}>
                {getStepIcon('packaging', activeStatus)}
              </div>
              <div>
                <p className={styles.sname}>Packaging</p>
                <p className={styles.ssub}>กำลังแพ็คสินค้า</p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={`${styles.sdot} ${getStepClass('transit', activeStatus)}`}>
                {getStepIcon('transit', activeStatus)}
              </div>
              <div>
                <p className={styles.sname}>In Transit</p>
                <p className={styles.ssub}>อยู่ระหว่างจัดส่ง</p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={`${styles.sdot} ${getStepClass('delivered', activeStatus)}`}>
                {getStepIcon('delivered', activeStatus)}
              </div>
              <div>
                <p className={styles.sname}>Delivered</p>
                <p className={styles.ssub}>รอรับสินค้า / จัดส่งสำเร็จ</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results detail list */}
        {searched && results && results.length > 0 && (
          <div className={styles.resultsArea}>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>
              พบ {results.length} รายการสำหรับเบอร์ {phone}
            </p>
            <div>
              {results.map(order => {
                const productInfo = order.products || order.product || {}
                const displayName = productInfo.title || productInfo.name || 'สินค้า'

                return (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.productInfo}>
                      {productInfo.image_url && (
                        <img 
                          src={productInfo.image_url.split(',')[0]} 
                          alt={displayName} 
                          className={styles.productThumb} 
                        />
                      )}
                      <div>
                        <div className={styles.productName}>{displayName}</div>
                        <div className={styles.productPrice}>฿{Number(productInfo.price || 0).toLocaleString()}</div>
                      </div>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {order.tracking_number && (
                        <div>เลขพัสดุ: <strong style={{ color: 'var(--ink)' }}>{order.tracking_number}</strong></div>
                      )}
                      <div>สถานะ: <strong style={{ color: 'var(--ink)' }}>{order.status === 'delivered' ? 'จัดส่งสำเร็จ' : order.status === 'shipped' ? 'อยู่ระหว่างจัดส่ง' : 'กำลังเตรียมจัดส่ง'}</strong></div>
                      {order.note && (
                        <div>หมายเหตุ: {order.note}</div>
                      )}
                    </div>

                    {order.delivery_image_url && (
                      <div className={styles.deliveryProofWrap}>
                        <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '6px' }}>รูปถ่ายพัสดุ / หลักฐานจัดส่ง:</p>
                        <img 
                          src={order.delivery_image_url} 
                          alt="หลักฐานจัดส่ง" 
                          className={styles.deliveryProofImg} 
                          onClick={() => window.open(order.delivery_image_url, '_blank')}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
