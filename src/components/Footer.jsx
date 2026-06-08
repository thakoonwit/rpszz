import React from 'react'
import { MessageSquare, Instagram, Facebook } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer style={{ 
      borderTop: '1px solid var(--border)', 
      padding: 'var(--space-2xl) 0', 
      backgroundColor: 'var(--bg)',
      marginTop: 'var(--space-3xl)' 
    }}>
      <div className="container" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 'var(--space-md)',
        textAlign: 'center'
      }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Rpszz.shop</h3>
        <p style={{ fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto' }}>
          สินค้ามือสองคัดสรรพิเศษโดย Rapeepong สั่งซื้อผ่านช่องทางแชทเท่านั้นเพื่อให้คุณได้รับบริการที่รวดเร็วและตรวจสอบสต็อกได้แม่นยำ
        </p>
        
        <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-sm)' }}>
          <a href="https://line.me/ti/p/~YOUR_LINE_ID" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
            <MessageSquare size={16} /> แชทผ่าน Line
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
            <Instagram size={16} /> อินสตาแกรม
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
            <Facebook size={16} /> เฟซบุ๊ก
          </a>
        </div>
        
        <div style={{ 
          fontSize: '0.8rem', 
          color: 'var(--muted)', 
          marginTop: 'var(--space-lg)',
          borderTop: '1px solid var(--border)',
          width: '100%',
          paddingTop: 'var(--space-md)'
        }}>
          &copy; {currentYear} Rpszz.shop. สงวนลิขสิทธิ์ บริหารงานโดย Rapeepong.
        </div>
      </div>
    </footer>
  )
}
