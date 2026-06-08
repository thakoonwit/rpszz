import { useState } from 'react'
import styles from './ProductCard.module.css'

const STATUS_LABEL = {
  available: 'พร้อมขาย',
  reserved: 'จองแล้ว',
  sold: 'ขายแล้ว',
}

export default function ProductCard({ product }) {
  const { name, title, price, description, image_url, status, category } = product
  const displayName = name || title || 'สินค้ามือสอง'

  const [showModal, setShowModal] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Parse comma-separated image URLs
  const images = image_url ? image_url.split(',').map(img => img.trim()).filter(Boolean) : []
  const hasImages = images.length > 0
  const firstImage = hasImages ? images[0] : null

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
          <span className={`badge badge-${status} ${styles.statusBadge}`}>
            {STATUS_LABEL[status]}
          </span>
          {category && (
            <span className={styles.category}>
              {category === 'clothing' ? 'เสื้อผ้า' : category === 'footwear' ? 'รองเท้า' : category === 'electronics' ? 'อิเล็กทรอนิกส์' : category === 'accessories' ? 'เครื่องประดับ' : category}
            </span>
          )}
        </div>

        <div className={styles.body}>
          <h3 className={styles.name} onClick={() => setShowModal(true)} style={{ cursor: 'pointer' }}>{displayName}</h3>
          {description && (
            <p className={styles.desc}>{description}</p>
          )}
          <div className={styles.footer}>
            <span className={styles.price}>
              ฿{Number(price).toLocaleString()}
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setShowModal(true)}
                className={styles.detailsBtn}
              >
                รายละเอียด
              </button>
              {status === 'available' && (
                <a
                  href={`https://line.me/R/ti/p/~YOUR_LINE_ID?text=สนใจสั่งซื้อสินค้า:%20${encodeURIComponent(displayName)}`}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.buyBtn}
                >
                  แชทซื้อ
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>
            <div className={styles.modalGrid}>
              
              {/* Image Section */}
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

              {/* Details Section */}
              <div className={styles.modalInfo}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <span className={`badge badge-${status}`}>{STATUS_LABEL[status]}</span>
                  {category && (
                    <span className={styles.categoryTag}>
                      {category === 'clothing' ? 'เสื้อผ้า' : category === 'footwear' ? 'รองเท้า' : category === 'electronics' ? 'อิเล็กทรอนิกส์' : category === 'accessories' ? 'เครื่องประดับ' : category}
                    </span>
                  )}
                </div>
                
                <h2 className={styles.modalTitle}>{displayName}</h2>
                <div className={styles.modalPrice}>฿{Number(price).toLocaleString()}</div>
                
                <div className={styles.modalDescWrap}>
                  <h4>รายละเอียดสินค้า:</h4>
                  <p className={styles.modalDesc}>{description || 'ไม่มีรายละเอียดเพิ่มเติมสำหรับสินค้านี้'}</p>
                </div>
                
                <div className={styles.modalActions}>
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
                      {status === 'sold' ? 'ขายแล้ว' : 'จองแล้ว'}
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
