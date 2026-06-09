import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import toast, { Toaster } from 'react-hot-toast'
import styles from './AdminPage.module.css'
import { useConvex, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

const EMPTY_FORM = {
  name: '', description: '', price: '', category: 'clothing',
  image_url: '', status: 'available'
}

const EMPTY_ORDER_FORM = {
  customer_name: '', customer_phone: '', product_id: '', status: 'preparing', tracking_number: '', note: ''
}

const INITIAL_PRODUCTS = [
  { id: '1', title: 'Vintage Denim Jacket', name: 'Vintage Denim Jacket', description: 'Classic oversized 90s vintage denim jacket.', price: 1200, image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80', status: 'available', category: 'clothing' },
  { id: '2', title: 'Retro Leather Boots', name: 'Retro Leather Boots', description: 'Genuine brown leather boots, Unisex Size 41.', price: 2500, image_url: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=600&q=80', status: 'reserved', category: 'footwear' },
  { id: '3', title: 'Analog Film Camera', name: 'Analog Film Camera', description: 'Minolta SLR 35mm film camera. Tested, light meter working.', price: 3400, image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80', status: 'sold', category: 'electronics' }
]

const INITIAL_ORDERS = [
  { id: 'o1', customer_name: 'Retro Customer', customer_phone: '0898765432', product_id: '2', status: 'preparing', tracking_number: null, updated_at: new Date().toISOString(), product: { title: 'Retro Leather Boots', name: 'Retro Leather Boots', price: 2500 } },
  { id: 'o2', customer_name: 'Sompong K.', customer_phone: '0812345678', product_id: '3', status: 'delivered', tracking_number: 'TH12345678901', updated_at: new Date().toISOString(), product: { title: 'Analog Film Camera', name: 'Analog Film Camera', price: 3400 } }
]

export default function AdminDashboard() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(localStorage.getItem('rpszz_admin_session') === 'authenticated')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [orderForm, setOrderForm] = useState(EMPTY_ORDER_FORM)
  const [editing, setEditing] = useState(null)
  const [editingOrder, setEditingOrder] = useState(null)
  const [tab, setTab] = useState('products')
  const [loading, setLoading] = useState(false)
  const [usingFallback, setUsingFallback] = useState(false)
  const [uploading, setUploading] = useState(false)

  const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD || 'rpszz2025'
  const hasConvex = !!import.meta.env.VITE_CONVEX_URL
  const convex = useConvex()
  const generateUploadUrl = useMutation(api.products.generateUploadUrl)

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)
    const uploadedUrls = []

    for (const file of files) {
      try {
        if (usingFallback || !hasConvex) {
          // If in offline fallback mode, generate a local Blob Object URL so previewing still functions
          const localUrl = URL.createObjectURL(file)
          uploadedUrls.push(localUrl)
          continue
        }

        // 1. Generate Convex Upload URL endpoint
        const uploadUrl = await generateUploadUrl()

        // 2. POST file directly to Convex storage
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        })

        if (!result.ok) {
          throw new Error(`Convex storage upload failed with status ${result.status}`)
        }

        const { storageId } = await result.json()

        // 3. Get public download URL from Convex HTTP storage
        const publicUrl = await convex.query(api.products.getImageUrl, { storageId })
        if (publicUrl) {
          uploadedUrls.push(publicUrl)
        } else {
          throw new Error('Could not retrieve public URL for storage ID')
        }
      } catch (err) {
        console.error('Error uploading file:', err)
        toast.error(`อัปเดตปุ่มรูป ${file.name} ล้มเหลว: ${err.message || 'โปรดตรวจสอบสิทธิ์การใช้งาน Storage ใน Convex Console'}`)
      }
    }

    if (uploadedUrls.length > 0) {
      const existing = form.image_url ? form.image_url.split(',').map(u => u.trim()).filter(Boolean) : []
      const combined = [...existing, ...uploadedUrls].join(', ')
      setForm(prev => ({ ...prev, image_url: combined }))
      toast.success(`อัปโหลดรูปภาพสำเร็จ ${uploadedUrls.length} รูป`)
    }
    setUploading(false)
    e.target.value = ''
  }

  function handleLogin(e) {
    e.preventDefault()
    if (password === ADMIN_PASS) {
      localStorage.setItem('rpszz_admin_session', 'authenticated')
      setAuthed(true)
      fetchAll()
      toast.success('เข้าสู่ระบบสำเร็จ')
    } else {
      toast.error('รหัสผ่านไม่ถูกต้อง')
    }
  }

  function handleLogout() {
    localStorage.removeItem('rpszz_admin_session')
    setAuthed(false)
    toast.success('ออกจากระบบแล้ว')
  }

  async function fetchAll() {
    try {
      if (hasConvex && convex) {
        const p = await convex.query(api.products.list)
        const o = await convex.query(api.orders.list)
        setProducts(p.map(x => ({ ...x, id: x._id })))
        setOrders(o.map(x => ({ ...x, id: x._id, product: x.product ? { ...x.product, id: x.product._id } : null })))
        setUsingFallback(false)
        return
      }

      const [{ data: p, error: pError }, { data: o, error: oError }] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*, products(*)').order('created_at', { ascending: false }),
      ])

      if (pError || oError || !p) {
        throw new Error('Supabase database error')
      }

      setProducts(p || [])
      setOrders(o || [])
      setUsingFallback(false)
    } catch (err) {
      console.warn('Using fallback local storage data:', err)
      if (!localStorage.getItem('rpszz_local_products')) {
        localStorage.setItem('rpszz_local_products', JSON.stringify(INITIAL_PRODUCTS))
      }
      if (!localStorage.getItem('rpszz_local_orders')) {
        localStorage.setItem('rpszz_local_orders', JSON.stringify(INITIAL_ORDERS))
      }
      setProducts(JSON.parse(localStorage.getItem('rpszz_local_products')))
      setOrders(JSON.parse(localStorage.getItem('rpszz_local_orders')))
      setUsingFallback(true)
    }
  }

  useEffect(() => {
    if (authed) {
      fetchAll()
    }
  }, [authed])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const payload = {
      name: form.name,
      title: form.name,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      image_url: form.image_url,
      status: form.status,
    }

    if (usingFallback) {
      let localProds = JSON.parse(localStorage.getItem('rpszz_local_products')) || []
      if (editing) {
        localProds = localProds.map(p => p.id === editing ? { ...p, ...payload } : p)
        toast.success('อัปเดตสำเร็จ')
      } else {
        const newProd = { id: Date.now().toString(), ...payload, created_at: new Date().toISOString() }
        localProds.unshift(newProd)
        toast.success('เพิ่มสินค้าสำเร็จ')
      }
      localStorage.setItem('rpszz_local_products', JSON.stringify(localProds))
      setForm(EMPTY_FORM)
      setEditing(null)
      fetchAll()
    } else if (hasConvex && convex) {
      try {
        if (editing) {
          await convex.mutation(api.products.update, { id: editing, ...payload })
          toast.success('อัปเดตสำเร็จ')
          setEditing(null)
          setForm(EMPTY_FORM)
          setTab('products')
        } else {
          await convex.mutation(api.products.add, payload)
          toast.success('เพิ่มสินค้าสำเร็จ')
          setForm(EMPTY_FORM)
          setTab('products')
        }
        fetchAll()
      } catch (err) {
        toast.error('ไม่สำเร็จ: ' + err.message)
      }
    } else {
      if (editing) {
        const { error } = await supabase.from('products').update(payload).eq('id', editing)
        if (error) toast.error('อัปเดตไม่สำเร็จ: ' + error.message)
        else {
          toast.success('อัปเดตสำเร็จ')
          setEditing(null)
          setForm(EMPTY_FORM)
          setTab('products')
        }
      } else {
        const { error } = await supabase.from('products').insert([payload])
        if (error) toast.error('เพิ่มสินค้าไม่สำเร็จ: ' + error.message)
        else {
          toast.success('เพิ่มสินค้าสำเร็จ')
          setForm(EMPTY_FORM)
          setTab('products')
        }
      }
      fetchAll()
    }
    setLoading(false)
  }

  async function handleOrderSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const payload = {
      customer_name: orderForm.customer_name,
      customer_phone: orderForm.customer_phone,
      product_id: orderForm.product_id || undefined,
      status: orderForm.status,
      tracking_number: orderForm.tracking_number || undefined,
      note: orderForm.note || undefined,
    }

    if (usingFallback) {
      let localOrders = JSON.parse(localStorage.getItem('rpszz_local_orders')) || []
      const matched = products.find(p => p.id === orderForm.product_id)

      if (editingOrder) {
        localOrders = localOrders.map(o => o.id === editingOrder ? {
          ...o,
          ...payload,
          product: matched ? { title: matched.title || matched.name, price: matched.price } : null
        } : o)
        toast.success('อัปเดตคำสั่งซื้อสำเร็จ')
      } else {
        const newOrder = {
          id: 'o' + Date.now().toString(),
          ...payload,
          created_at: new Date().toISOString(),
          product: matched ? { title: matched.title || matched.name, price: matched.price } : null
        }
        localOrders.unshift(newOrder)
        toast.success('เพิ่มคำสั่งซื้อสำเร็จ')
      }
      localStorage.setItem('rpszz_local_orders', JSON.stringify(localOrders))
      setOrderForm(EMPTY_ORDER_FORM)
      setEditingOrder(null)
      fetchAll()
    } else if (hasConvex && convex) {
      try {
        if (editingOrder) {
          await convex.mutation(api.orders.update, { id: editingOrder, ...payload })
          toast.success('อัปเดตคำสั่งซื้อสำเร็จ')
          setEditingOrder(null)
          setOrderForm(EMPTY_ORDER_FORM)
          setTab('orders')
        } else {
          await convex.mutation(api.orders.add, payload)
          toast.success('เพิ่มคำสั่งซื้อสำเร็จ')
          setOrderForm(EMPTY_ORDER_FORM)
          setTab('orders')
        }
        fetchAll()
      } catch (err) {
        toast.error('ไม่สำเร็จ: ' + err.message)
      }
    } else {
      if (editingOrder) {
        const { error } = await supabase.from('orders').update(payload).eq('id', editingOrder)
        if (error) toast.error('อัปเดตไม่สำเร็จ: ' + error.message)
        else {
          toast.success('อัปเดตสำเร็จ')
          setEditingOrder(null)
          setOrderForm(EMPTY_ORDER_FORM)
          setTab('orders')
        }
      } else {
        const { error } = await supabase.from('orders').insert([payload])
        if (error) toast.error('เพิ่มคำสั่งซื้อไม่สำเร็จ: ' + error.message)
        else {
          toast.success('เพิ่มคำสั่งซื้อสำเร็จ')
          setOrderForm(EMPTY_ORDER_FORM)
          setTab('orders')
        }
      }
      fetchAll()
    }
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!confirm('ลบสินค้านี้?')) return
    if (usingFallback) {
      const localProds = JSON.parse(localStorage.getItem('rpszz_local_products')) || []
      const filtered = localProds.filter(p => p.id !== id)
      localStorage.setItem('rpszz_local_products', JSON.stringify(filtered))
      toast.success('ลบแล้ว')
      fetchAll()
    } else if (hasConvex && convex) {
      try {
        await convex.mutation(api.products.deleteProduct, { id })
        toast.success('ลบแล้ว')
        fetchAll()
      } catch (err) {
        toast.error('ลบไม่สำเร็จ: ' + err.message)
      }
    } else {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) toast.error('ลบไม่สำเร็จ: ' + error.message)
      else {
        toast.success('ลบแล้ว')
        fetchAll()
      }
    }
  }

  async function handleDeleteOrder(id) {
    if (!confirm('ลบคำสั่งซื้อนี้?')) return
    if (usingFallback) {
      const localOrders = JSON.parse(localStorage.getItem('rpszz_local_orders')) || []
      const filtered = localOrders.filter(o => o.id !== id)
      localStorage.setItem('rpszz_local_orders', JSON.stringify(filtered))
      toast.success('ลบคำสั่งซื้อแล้ว')
      fetchAll()
    } else if (hasConvex && convex) {
      try {
        await convex.mutation(api.orders.deleteOrder, { id })
        toast.success('ลบคำสั่งซื้อแล้ว')
        fetchAll()
      } catch (err) {
        toast.error('ลบไม่สำเร็จ: ' + err.message)
      }
    } else {
      const { error } = await supabase.from('orders').delete().eq('id', id)
      if (error) toast.error('ลบไม่สำเร็จ: ' + error.message)
      else {
        toast.success('ลบคำสั่งซื้อแล้ว')
        fetchAll()
      }
    }
  }

  async function updateStatus(id, status) {
    if (usingFallback) {
      let localProds = JSON.parse(localStorage.getItem('rpszz_local_products')) || []
      localProds = localProds.map(p => p.id === id ? { ...p, status } : p)
      localStorage.setItem('rpszz_local_products', JSON.stringify(localProds))
      toast.success(`เปลี่ยนเป็น: ${status}`)
      fetchAll()
    } else if (hasConvex && convex) {
      try {
        const prod = products.find(p => p.id === id)
        await convex.mutation(api.products.update, {
          id,
          name: prod.name || prod.title,
          title: prod.title || prod.name,
          price: prod.price,
          category: prod.category,
          image_url: prod.image_url,
          description: prod.description,
          status
        })
        toast.success(`เปลี่ยนเป็น: ${status}`)
        fetchAll()
      } catch (err) {
        toast.error('เปลี่ยนไม่สำเร็จ: ' + err.message)
      }
    } else {
      const { error } = await supabase.from('products').update({ status }).eq('id', id)
      if (error) toast.error('เปลี่ยนไม่สำเร็จ: ' + error.message)
      else {
        toast.success(`เปลี่ยนเป็น: ${status}`)
        fetchAll()
      }
    }
  }

  async function updateOrderStatus(id, status) {
    if (usingFallback) {
      let localOrders = JSON.parse(localStorage.getItem('rpszz_local_orders')) || []
      localOrders = localOrders.map(o => o.id === id ? { ...o, status } : o)
      localStorage.setItem('rpszz_local_orders', JSON.stringify(localOrders))
      toast.success('อัปเดตสถานะสำเร็จ')
      fetchAll()
    } else if (hasConvex && convex) {
      try {
        const o = orders.find(x => x.id === id)
        await convex.mutation(api.orders.update, {
          id,
          customer_name: o.customer_name,
          customer_phone: o.customer_phone,
          product_id: o.product_id,
          tracking_number: o.tracking_number,
          note: o.note,
          status
        })
        toast.success('อัปเดตสถานะสำเร็จ')
        fetchAll()
      } catch (err) {
        toast.error('อัปเดตไม่สำเร็จ: ' + err.message)
      }
    } else {
      const { error } = await supabase.from('orders').update({ status }).eq('id', id)
      if (error) toast.error('อัปเดตไม่สำเร็จ: ' + error.message)
      else {
        toast.success('อัปเดตสถานะสำเร็จ')
        fetchAll()
      }
    }
  }

  function startEdit(p) {
    setEditing(p.id)
    setForm({
      name: p.name || p.title || '',
      description: p.description || '',
      price: p.price,
      category: p.category || 'clothing',
      image_url: p.image_url || '',
      status: p.status
    })
    setTab('form')
    window.scrollTo(0, 0)
  }

  function startOrderEdit(o) {
    setEditingOrder(o.id)
    setOrderForm({
      customer_name: o.customer_name,
      customer_phone: o.customer_phone,
      product_id: o.product_id || '',
      status: o.status,
      tracking_number: o.tracking_number || '',
      note: o.note || ''
    })
    setTab('orderForm')
    window.scrollTo(0, 0)
  }

  if (!authed) {
    return (
      <div className={styles.loginPage}>
        <Toaster />
        <form onSubmit={handleLogin} className={styles.loginCard}>
          <h1 className={styles.loginTitle}>ADMIN</h1>
          <p className={styles.loginSub}>Rpszz.shop Backend</p>
          <input
            type="password"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={styles.loginInput}
          />
          <button type="submit" className={styles.loginBtn}>เข้าสู่ระบบ</button>
        </form>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Toaster />
      <div className="container">
        <div className={styles.topBar}>
          <h1 className={styles.pageTitle}>ADMIN PANEL</h1>
          <button onClick={handleLogout} className={styles.logoutBtn}>ออกจากระบบ</button>
        </div>

        {usingFallback && (
          <div style={{
            backgroundColor: 'rgba(229, 23, 43, 0.1)',
            border: '1px solid var(--red)',
            borderRadius: '4px',
            padding: '12px 20px',
            marginBottom: '24px',
            fontSize: '14px',
            color: 'var(--white)'
          }}>
            <strong>โหมดจำลอง (Offline Fallback)</strong>: ไม่สามารถเชื่อมต่อฐานข้อมูลได้ ระบบกำลังบันทึกข้อมูลใน localStorage ของท่านชั่วคราว
          </div>
        )}

        {/* Tabs */}
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'products' ? styles.activeTab : ''}`} onClick={() => setTab('products')}>
            สินค้า ({products.length})
          </button>
          <button className={`${styles.tab} ${tab === 'orders' ? styles.activeTab : ''}`} onClick={() => setTab('orders')}>
            คำสั่งซื้อ ({orders.length})
          </button>
          <button className={`${styles.tab} ${tab === 'form' ? styles.activeTab : ''}`} onClick={() => { setEditing(null); setForm(EMPTY_FORM); setTab('form') }}>
            {editing ? '✎ แก้ไขสินค้า' : '＋ เพิ่มสินค้า'}
          </button>
          <button className={`${styles.tab} ${tab === 'orderForm' ? styles.activeTab : ''}`} onClick={() => { setEditingOrder(null); setOrderForm(EMPTY_ORDER_FORM); setTab('orderForm') }}>
            {editingOrder ? '✎ แก้ไขคำสั่งซื้อ' : '＋ เพิ่มคำสั่งซื้อ'}
          </button>
        </div>

        {/* Product Form */}
        {tab === 'form' && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <h2 className={styles.formTitle}>{editing ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h2>
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>ชื่อสินค้า *</span>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="เช่น Nike Air Max 90 Size 42" className={styles.input} />
              </label>
              <label className={styles.field}>
                <span>ราคา (บาท) *</span>
                <input required type="number" value={form.price}
                  onChange={e => setForm({...form, price: e.target.value})}
                  placeholder="1500" className={styles.input} />
              </label>
              <label className={styles.field}>
                <span>หมวดหมู่</span>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className={styles.input}>
                  <option value="clothing">เสื้อผ้า</option>
                  <option value="footwear">รองเท้า</option>
                  <option value="electronics">อุปกรณ์อิเล็กทรอนิกส์</option>
                  <option value="accessories">เครื่องประดับ</option>
                  <option value="other">อื่นๆ</option>
                </select>
              </label>
              <label className={styles.field}>
                <span>สถานะ</span>
                <select value={form.status}
                  onChange={e => setForm({...form, status: e.target.value})}
                  className={styles.input}>
                  <option value="available">พร้อมขาย</option>
                  <option value="reserved">จองแล้ว</option>
                  <option value="sold">ขายแล้ว</option>
                </select>
              </label>
              <label className={`${styles.field} ${styles.fullWidth}`}>
                <span>URL รูปภาพ (ใส่ได้หลายรูป คั่นด้วยเครื่องหมายจุลภาค ,)</span>
                <input value={form.image_url}
                  onChange={e => setForm({...form, image_url: e.target.value})}
                  placeholder="เช่น https://image1.com, https://image2.com" className={styles.input} />
              </label>
              <label className={`${styles.field} ${styles.fullWidth}`}>
                <span>อัปโหลดรูปภาพใหม่จากคอมพิวเตอร์ (ไฟล์จะถูกเก็บไว้ที่ Supabase Storage)</span>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  disabled={uploading}
                  className={styles.input} 
                />
                {uploading && <span style={{ color: 'var(--red)', fontSize: '12px', marginTop: '4px' }}>กำลังอัปโหลดรูปภาพ...</span>}
              </label>
              <label className={`${styles.field} ${styles.fullWidth}`}>
                <span>รายละเอียด</span>
                <textarea value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="สภาพ, ขนาด, รายละเอียดอื่นๆ"
                  rows={3} className={styles.input} />
              </label>
            </div>
            <div className={styles.formActions}>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'กำลังบันทึก...' : editing ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
              </button>
              {editing && (
                <button type="button" className={styles.cancelBtn}
                  onClick={() => { setEditing(null); setForm(EMPTY_FORM); setTab('products') }}>
                  ยกเลิก
                </button>
              )}
            </div>
          </form>
        )}

        {/* Order Form */}
        {tab === 'orderForm' && (
          <form onSubmit={handleOrderSubmit} className={styles.form}>
            <h2 className={styles.formTitle}>{editingOrder ? 'แก้ไขคำสั่งซื้อ' : 'เพิ่มคำสั่งซื้อใหม่'}</h2>
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>ชื่อลูกค้า *</span>
                <input required value={orderForm.customer_name} onChange={e => setOrderForm({...orderForm, customer_name: e.target.value})}
                  placeholder="สมชาย ใจดี" className={styles.input} />
              </label>
              <label className={styles.field}>
                <span>เบอร์โทรศัพท์ลูกค้า *</span>
                <input required value={orderForm.customer_phone} onChange={e => setOrderForm({...orderForm, customer_phone: e.target.value})}
                  placeholder="0812345678" className={styles.input} />
              </label>
              <label className={styles.field}>
                <span>เลือกสินค้าที่เกี่ยวข้อง *</span>
                <select required value={orderForm.product_id} onChange={e => setOrderForm({...orderForm, product_id: e.target.value})} className={styles.input}>
                  <option value="">-- เลือกสินค้า --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{(p.title || p.name)} (฿{Number(p.price).toLocaleString()})</option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>สถานะคำสั่งซื้อ</span>
                <select value={orderForm.status} onChange={e => setOrderForm({...orderForm, status: e.target.value})} className={styles.input}>
                  <option value="preparing">กำลังเตรียมสินค้า</option>
                  <option value="shipped">จัดส่งแล้ว</option>
                  <option value="delivered">จัดส่งสำเร็จ</option>
                </select>
              </label>
              <label className={`${styles.field} ${styles.fullWidth}`}>
                <span>เลขพัสดุ (ถ้าจัดส่งแล้ว)</span>
                <input value={orderForm.tracking_number} onChange={e => setOrderForm({...orderForm, tracking_number: e.target.value})}
                  placeholder="TH123456789" className={styles.input} />
              </label>
              <label className={`${styles.field} ${styles.fullWidth}`}>
                <span>หมายเหตุ</span>
                <textarea value={orderForm.note} onChange={e => setOrderForm({...orderForm, note: e.target.value})}
                  placeholder="หมายเหตุเพิ่มเติม" rows={2} className={styles.input} />
              </label>
            </div>
            <div className={styles.formActions}>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'กำลังบันทึก...' : editingOrder ? 'บันทึกการแก้ไข' : 'เพิ่มคำสั่งซื้อ'}
              </button>
              {editingOrder && (
                <button type="button" className={styles.cancelBtn}
                  onClick={() => { setEditingOrder(null); setOrderForm(EMPTY_ORDER_FORM); setTab('orders') }}>
                  ยกเลิก
                </button>
              )}
            </div>
          </form>
        )}

        {/* Products Table */}
        {tab === 'products' && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>รูป</th>
                  <th>ชื่อ</th>
                  <th>ราคา</th>
                  <th>หมวด</th>
                  <th>สถานะ</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center' }} className={styles.tdMuted}>
                      ไม่มีรายการสินค้า
                    </td>
                  </tr>
                ) : (
                  products.map(p => (
                    <tr key={p.id}>
                      <td>
                        {p.image_url
                          ? <img src={p.image_url.split(',')[0].trim()} alt={p.title || p.name} className={styles.tableThumb} />
                          : <div className={styles.noThumb} />
                        }
                      </td>
                      <td className={styles.tdName}>{p.title || p.name}</td>
                      <td>฿{Number(p.price).toLocaleString()}</td>
                      <td className={styles.tdMuted}>
                        {p.category === 'clothing' ? 'เสื้อผ้า' : p.category === 'footwear' ? 'รองเท้า' : p.category === 'electronics' ? 'อิเล็กทรอนิกส์' : p.category === 'accessories' ? 'เครื่องประดับ' : p.category || '—'}
                      </td>
                      <td>
                        <select
                          value={p.status}
                          onChange={e => updateStatus(p.id, e.target.value)}
                          className={`${styles.statusSelect} ${styles[`status_${p.status}`]}`}
                        >
                          <option value="available">พร้อมขาย</option>
                          <option value="reserved">จองแล้ว</option>
                          <option value="sold">ขายแล้ว</option>
                        </select>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button onClick={() => startEdit(p)} className={styles.editBtn}>แก้ไข</button>
                          <button onClick={() => handleDelete(p.id)} className={styles.deleteBtn}>ลบ</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Orders Table */}
        {tab === 'orders' && (
          <div className={styles.tableWrap}>
            <p className={styles.orderNote}>
              * รายการ Order ต้องเพิ่มผ่านหลังบ้านหลังแชทกับลูกค้าเพื่อใช้บริการค้นหาสถานะ
            </p>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>สินค้า</th>
                  <th>เบอร์โทร</th>
                  <th>ชื่อ</th>
                  <th>วันที่</th>
                  <th>สถานะ</th>
                  <th>เลขพัสดุ</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center' }} className={styles.tdMuted}>
                      ไม่มีรายการคำสั่งซื้อ
                    </td>
                  </tr>
                ) : (
                  orders.map(o => {
                    const productInfo = o.products || o.product || {}
                    return (
                      <tr key={o.id}>
                        <td className={styles.tdName}>{productInfo.title || productInfo.name || '—'}</td>
                        <td className={styles.tdPhone}>{o.customer_phone}</td>
                        <td>{o.customer_name || '—'}</td>
                        <td className={styles.tdMuted}>
                          {new Date(o.created_at || o.updated_at).toLocaleDateString('th-TH')}
                        </td>
                        <td>
                          <select
                            value={o.status}
                            onChange={e => updateOrderStatus(o.id, e.target.value)}
                            className={`${styles.statusSelect} ${styles[`status_${o.status === 'delivered' ? 'available' : o.status === 'shipped' ? 'reserved' : 'sold'}`]}`}
                          >
                            <option value="preparing">กำลังเตรียมสินค้า</option>
                            <option value="shipped">จัดส่งแล้ว</option>
                            <option value="delivered">จัดส่งสำเร็จ</option>
                          </select>
                        </td>
                        <td className={styles.tdMuted}>{o.tracking_number || '—'}</td>
                        <td>
                          <div className={styles.actions}>
                            <button onClick={() => startOrderEdit(o)} className={styles.editBtn}>แก้ไข</button>
                            <button onClick={() => handleDeleteOrder(o.id)} className={styles.deleteBtn}>ลบ</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
