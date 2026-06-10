import { useState } from 'react'
import styles from './ProductCard.module.css'

const STATUS_LABEL = {
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Sold',
}

const TH_STATUS_LABEL = {
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

  // Calculate deterministic condition score
  const getConditionScore = () => {
    const desc = description || ''
    const match = desc.match(/(\d+)%/)
    if (match) return parseInt(match[1])
    const numId = id ? id.toString().charCodeAt(0) : 95
    return 85 + (numId % 14)
  }
  
  const score = getConditionScore()

  // Get description/specs mock details based on item to display in card sub text
  const getSubText = () => {
    if (category === 'clothing') return 'M · Vintage · 90s'
    if (category === 'footwear') return '42 · Good condition'
    if (category === 'electronics') return 'Retro · Tested'
    return '1-of-1 · Collectible'
  }

  const subText = getSubText()

  const handleCardClick = () => {
    setShowModal(true)
  }

  const getBadgeClass = () => {
    if (status === 'available') return styles.badgeAvailable
    if (status === 'reserved') return styles.badgeReserved
    return styles.badgeSold
  }

  return (
    <>
      <div className={styles.card} onClick={handleCardClick}>
        <div className={styles.imageWrap}>
          {firstImage ? (
            <img src={firstImage} alt={displayName} className={styles.image} />
          ) : (
            <div className={styles.noImage}>
              <i className="ti ti-shirt" aria-hidden="true" />
            </div>
          )}
          
          <span className={`${styles.badge} ${getBadgeClass()}`}>
            {STATUS_LABEL[status] || status}
          </span>
        </div>

        <div className={styles.body}>
          <p className={styles.name}>{displayName}</p>
          <p className={styles.sub}>{subText}</p>
          <div className={styles.row}>
            <span className={styles.price}>฿{Number(price).toLocaleString()}</span>
            {status === 'available' ? (
              <button 
                className={styles.chatBtn} 
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(`https://line.me/R/ti/p/~YOUR_LINE_ID?text=สนใจสั่งซื้อสินค้า:%20${encodeURIComponent(displayName)}`, '_blank')
                }}
              >
                Chat
              </button>
            ) : (
              <button className={`${styles.chatBtn} ${styles.chatBtnOff}`} disabled onClick={(e) => e.stopPropagation()}>
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
                  <div className={styles.noImage}>
                    <i className="ti ti-shirt" style={{ fontSize: '48px', color: 'var(--muted)' }} />
                  </div>
                )}
              </div>

              {/* Details & Specs Section */}
              <div className={styles.modalInfo}>
                <div>
                  <h2 className={styles.modalTitle}>{displayName}</h2>
                  <div className={styles.modalPrice}>฿{Number(price).toLocaleString()}</div>
                  
                  <div className={styles.modalDescWrap}>
                    <h4>รายละเอียดสินค้า:</h4>
                    <p className={styles.modalDesc}>{description || 'ไม่มีรายละเอียดเพิ่มเติมสำหรับสินค้านี้'}</p>
                  </div>

                  <div className={styles.specsWrap}>
                    <h4>ข้อมูลการตรวจสอบสภาพ:</h4>
                    <ul className={styles.specsList}>
                      <li>สภาพสินค้าโดยรวม: <strong>{score}%</strong></li>
                      <li>สถานะสินค้า: <strong>{TH_STATUS_LABEL[status]}</strong></li>
                      <li>หมวดหมู่สินค้า: <strong>{category === 'clothing' ? 'เสื้อผ้า' : category === 'footwear' ? 'รองเท้า' : category === 'electronics' ? 'อิเล็กทรอนิกส์' : category === 'accessories' ? 'เครื่องประดับ' : category || 'สินค้า'}</strong></li>
                    </ul>
                  </div>
                </div>
                
                <div>
                  {status === 'available' ? (
                    <a
                      href={`https://line.me/R/ti/p/~YOUR_LINE_ID?text=สนใจสั่งซื้อสินค้า:%20${encodeURIComponent(displayName)}`}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.modalBuyBtn}
                    >
                      แชทสั่งซื้อสินค้าชิ้นนี้
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
