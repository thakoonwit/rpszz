import { useState } from 'react'
import styles from './ProductCard.module.css'
import { Star, Eye, ShoppingBag, CheckSquare } from 'lucide-react'

const STATUS_LABEL = {
  available: 'พร้อมขาย',
  reserved: 'จองแล้ว',
  sold: 'ขายแล้ว',
}

export default function ProductCard({ product }) {
  const { id, name, title, price, description, image_url, status, category } = product
  const displayName = name || title || 'สินค้ามือสอง'

  const [showModal, setShowModal] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Parse comma-separated image URLs
  const images = image_url ? image_url.split(',').map(img => img.trim()).filter(Boolean) : []
  const hasImages = images.length > 0
  const firstImage = hasImages ? images[0] : null

  // Dynamic values parsed/mocked for premium UI layout consistency
  const originalPrice = price > 1000 ? Math.floor(price * 1.5 / 100) * 100 : null
  
  // Calculate deterministic condition score
  const getConditionScore = () => {
    const desc = description || ''
    const match = desc.match(/(\d+)%/)
    if (match) return parseInt(match[1])
    const numId = id ? id.toString().charCodeAt(0) : 95
    return 85 + (numId % 14)
  }
  
  const score = getConditionScore()
  
  // Get condition grade and badge color
  const getConditionInfo = (scoreVal) => {
    if (scoreVal >= 98) return { label: 'MINT', badgeClass: styles.badgeBlack }
    if (scoreVal >= 94) return { label: 'LIKE NEW', badgeClass: styles.badgeBlue }
    if (scoreVal >= 90) return { label: 'EXCELLENT', badgeClass: styles.badgeBlack }
    return { label: 'VINTAGE', badgeClass: styles.badgeRed }
  }

  const { label: badgeLabel, badgeClass } = getConditionInfo(score)

  // Mock specs list based on category
  const getSpecs = () => {
    if (category === 'clothing' || category === 'footwear') {
      return [
        'สภาพ: ซักรีดทำความสะอาดฆ่าเชื้อเรียบร้อยแล้ว',
        'เนื้อผ้า / วัสดุ: คุณภาพพรีเมียม ถักทอละเอียด',
        'ตำหนิ: ไม่พบตำหนิขาดหรือชำรุดเสียหาย',
        'การจัดส่ง: แพ็คกล่องกันกระแทกอย่างดี ส่งด่วนใน 1 วัน'
      ]
    }
    return [
      'สภาพบอดี้: ทำงานปกติ 100% ผ่านการทดสอบแล้ว',
      'อุปกรณ์ที่ได้รับ: ตัวเครื่องพร้อมใช้งานทันที',
      'ตำหนิ: รอยขนแมวบางๆ เล็กน้อยตามอายุการใช้งาน',
      'การรับประกัน: ประกันใจจากทางร้านให้ 15 วัน'
    ]
  }

  const specsList = getSpecs()

  return (
    <>
      <div className={`${styles.card} ${styles[status]}`}>
        <div className={styles.imageWrap} onClick={() => setShowModal(true)} style={{ cursor: 'pointer' }}>
          {firstImage ? (
            <img src={firstImage} alt={displayName} className={styles.image} />
          ) : (
            <div className={styles.noImage}>
              <span>ไม่มีรูป</span>
            </div>
          )}
          
          {/* Badge overlays */}
          <span className={`${styles.badge} ${badgeClass}`}>
            {badgeLabel}
          </span>
          <span className={styles.conditionTag}>
            สภาพ {score}%
          </span>

          {/* Quick Action Overlay on hover */}
          <div className={styles.overlay}>
            <button className={styles.overlayBtn} onClick={() => setShowModal(true)}>
              <Eye size={12} /> ตรวจสภาพเครื่องอย่างละเอียด
            </button>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.categoryRow}>
            <span className={styles.category}>
              {category === 'clothing' ? 'เสื้อผ้า' : category === 'footwear' ? 'รองเท้า' : category === 'electronics' ? 'อิเล็กทรอนิกส์' : category === 'accessories' ? 'เครื่องประดับ' : category || 'สินค้า'}
            </span>
            <span className={styles.statusText}>
              {status === 'available' ? 'In Stock' : STATUS_LABEL[status]}
            </span>
          </div>

          <h3 className={styles.name} onClick={() => setShowModal(true)} style={{ cursor: 'pointer' }}>
            {displayName}
          </h3>
          
          {description && (
            <p className={styles.desc}>{description}</p>
          )}

          {/* Price information */}
          <div className={styles.priceSection}>
            <div>
              <span className={styles.priceLabel}>ราคาพิเศษ</span>
              <div className={styles.priceRow}>
                <span className={styles.price}>
                  ฿{Number(price).toLocaleString()}
                </span>
                {originalPrice && (
                  <span className={styles.originalPrice}>
                    ฿{originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            
            <div className={styles.ratingSection}>
              <span className={styles.starRating}>
                <Star size={10} fill="var(--accent)" stroke="none" /> 4.9
              </span>
              <span className={styles.collectibleText}>ของคัดสะสม</span>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.cardActions}>
            <button 
              onClick={() => setShowModal(true)} 
              className={styles.detailsBtn}
            >
              ดูข้อมูลตำหนิ
            </button>
            {status === 'available' ? (
              <a
                href={`https://line.me/R/ti/p/~YOUR_LINE_ID?text=สนใจสั่งซื้อสินค้า:%20${encodeURIComponent(displayName)}`}
                target="_blank"
                rel="noreferrer"
                className={styles.buyBtn}
              >
                <ShoppingBag size={12} /> ซื้อชิ้นนี้
              </a>
            ) : (
              <button className={styles.disabledBuyBtn} disabled>
                {STATUS_LABEL[status]}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>
            
            <div className={styles.modalGrid}>
              
              {/* Image Gallery Section */}
              <div className={styles.gallery}>
                {hasImages ? (
                  <>
                    <div className={styles.modalImageWrap}>
                      <img src={images[currentImageIndex]} alt={displayName} className={styles.modalImage} />
                    </div>
                    {images.length > 1 && (
                      <div className={styles.galleryControls}>
                        <button
                          type="button"
                          onClick={() => setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length)}
                          className={styles.galleryBtn}
                        >
                          ‹
                        </button>
                        <span className={styles.galleryIndex}>
                          {currentImageIndex + 1} / {images.length}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentImageIndex(prev => (prev + 1) % images.length)}
                          className={styles.galleryBtn}
                        >
                          ›
                        </button>
                      </div>
                    )}
                    {images.length > 1 && (
                      <div className={styles.thumbnails}>
                        {images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt=""
                            className={`${styles.thumbnail} ${idx === currentImageIndex ? styles.activeThumbnail : ''}`}
                            onClick={() => setCurrentImageIndex(idx)}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.noImage}>ไม่มีรูปภาพ</div>
                )}
              </div>

              {/* Details & Specs Section */}
              <div className={styles.modalInfo}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <span className={`${styles.badge} ${badgeClass}`} style={{ position: 'static' }}>
                    {badgeLabel}
                  </span>
                  <span className={styles.categoryTag}>
                    ระดับสภาพ {score}%
                  </span>
                </div>
                
                <h2 className={styles.modalTitle}>{displayName}</h2>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '24px' }}>
                  <span className={styles.modalPrice}>฿{Number(price).toLocaleString()}</span>
                  {originalPrice && (
                    <span style={{ fontSize: '0.9rem', textDecoration: 'line-through', color: 'var(--muted)' }}>
                      ฿{originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                
                <div className={styles.modalDescWrap}>
                  <h4>รายละเอียดสินค้า:</h4>
                  <p className={styles.modalDesc}>{description || 'ไม่มีรายละเอียดเพิ่มเติมสำหรับสินค้านี้'}</p>
                </div>

                <div className={styles.specsWrap}>
                  <h4>ข้อมูลการตรวจสอบสภาพ:</h4>
                  <ul className={styles.specsList}>
                    {specsList.map((spec, index) => (
                      <li key={index}>
                        <CheckSquare size={12} style={{ color: 'var(--primary)', marginRight: '8px', flexShrink: 0 }} />
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className={styles.modalActions}>
                  {status === 'available' ? (
                    <a
                      href={`https://line.me/R/ti/p/~YOUR_LINE_ID?text=สนใจสั่งซื้อสินค้า:%20${encodeURIComponent(displayName)}`}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.modalBuyBtn}
                    >
                      แชทสั่งซื้อสินค้าชิ้นนี้ (สิทธิ์ตามคิวแชท)
                    </a>
                  ) : (
                    <button className={styles.modalSoldBtn} disabled>
                      {status === 'sold' ? 'ขายสินค้าชิ้นนี้แล้ว' : 'สินค้าชิ้นนี้ถูกจองแล้ว'}
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  )
}
