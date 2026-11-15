'use client'

import { useMemo, useState } from 'react'
import { DISHES, CATEGORIES } from '@/lib/dishes'

// 开场图：把夫妻合照放到 public/couple.jpg 即可显示；没有也行，用粉色渐变兜底
const COVER = '/couple.jpg'

export default function Home() {
  const [entered, setEntered] = useState(false)
  const [cart, setCart] = useState({}) // { dishId: qty }
  const [remark, setRemark] = useState('')
  const [cat, setCat] = useState('热菜')
  const [showCart, setShowCart] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [done, setDone] = useState(null) // { order, items }
  const [err, setErr] = useState('')

  const cartItems = useMemo(
    () => DISHES.filter(d => cart[d.id] > 0).map(d => ({ ...d, qty: cart[d.id] })),
    [cart]
  )
  const totalCount = cartItems.reduce((s, i) => s + i.qty, 0)

  const add = id => setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }))
  const sub = id => setCart(c => {
    const n = (c[id] || 0) - 1
    const next = { ...c }
    if (n <= 0) delete next[id]
    else next[id] = n
    return next
  })

  async function placeOrder() {
    if (cartItems.length === 0 || placing) return
    setPlacing(true)
    setErr('')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(i => ({ id: i.id, qty: i.qty })),
          remark,
        }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || '下单失败')
      setDone({ order: data.order, items: cartItems })
      setCart({})
      setRemark('')
      setShowCart(false)
    } catch (e) {
      setErr('下单失败，请再试一次')
    } finally {
      setPlacing(false)
    }
  }

  // —— 开场 ——
  if (!entered) {
    return (
      <div onClick={() => setEntered(true)} style={s.splash}>
        <img src={COVER} alt="龙餐馆" style={s.cover} onError={e => { e.currentTarget.style.display = 'none' }} />
        <div style={s.splashText}>
          <div style={s.splashTitle}>欢迎来到龙餐馆</div>
          <div style={s.splashSub}>大厨和兔兔老板娘等你回家吃饭</div>
          <div style={s.splashHint}>点一下进入菜单</div>
        </div>
      </div>
    )
  }

  // —— 下单成功：颠勺动画 + 小票 ——
  if (done) {
    return (
      <div style={s.page}>
        <div style={s.header}>
          <div style={s.shopName}>龙餐馆 <span style={s.halal}>清真</span></div>
        </div>
        <div style={s.cooking}>
          {/* 把颠勺视频放到 public/chef-toss.mp4 即可播放；没有则显示文字动画 */}
          <video src="/chef-toss.mp4" autoPlay loop muted playsInline poster="/couple.jpg"
            style={s.video} onError={e => { e.currentTarget.style.display = 'none' }} />
          <div style={s.cookingText}>大厨正在火速烹饪</div>
        </div>
        <div style={s.receipt}>
          <div style={s.receiptTitle}>龙餐馆 · 小票</div>
          <div style={s.receiptNo}>订单号 #{done.order.id}</div>
          {done.items.map(i => (
            <div key={i.id} style={s.receiptRow}>
              <span>{i.name}</span><span>× {i.qty}</span>
            </div>
          ))}
          {done.order.remark && <div style={s.receiptRemark}>备注：{done.order.remark}</div>}
          <div style={s.receiptFoot}>请稍等，大厨马上开火</div>
          <button style={s.againBtn} onClick={() => setDone(null)}>再点一份</button>
        </div>
      </div>
    )
  }

  // —— 菜单 ——
  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.shopName}>龙餐馆 <span style={s.halal}>清真</span></div>
        <div style={s.shopSub}>扫码点餐 · 大厨现做</div>
      </div>

      <div style={s.cats}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)}
            style={{ ...s.catBtn, ...(cat === c ? s.catBtnOn : {}) }}>{c}</button>
        ))}
      </div>

      <div style={s.list}>
        {DISHES.filter(d => d.category === cat).map(d => (
          <div key={d.id} style={s.card}>
            <div style={s.dishImg}>{d.name.slice(0, 1)}</div>
            <div style={s.dishInfo}>
              <div style={s.dishName}>{d.name}</div>
              <div style={s.dishDesc}>{d.desc}</div>
            </div>
            <div style={s.stepper}>
              {cart[d.id] > 0 && (
                <>
                  <button style={s.stepBtn} onClick={() => sub(d.id)}>−</button>
                  <span style={s.qty}>{cart[d.id]}</span>
                </>
              )}
              <button style={{ ...s.stepBtn, ...s.addBtn }} onClick={() => add(d.id)}>＋</button>
            </div>
          </div>
        ))}
      </div>

      {totalCount > 0 && (
        <button style={s.cartBar} onClick={() => setShowCart(true)}>
          已选 {totalCount} 道菜 · 查看购物车
        </button>
      )}

      {showCart && (
        <div style={s.overlay} onClick={() => setShowCart(false)}>
          <div style={s.sheet} onClick={e => e.stopPropagation()}>
            <div style={s.sheetTitle}>购物车</div>
            {cartItems.map(i => (
              <div key={i.id} style={s.cartRow}>
                <span>{i.name}</span>
                <div style={s.stepper}>
                  <button style={s.stepBtn} onClick={() => sub(i.id)}>−</button>
                  <span style={s.qty}>{i.qty}</span>
                  <button style={{ ...s.stepBtn, ...s.addBtn }} onClick={() => add(i.id)}>＋</button>
                </div>
              </div>
            ))}
            <textarea value={remark} onChange={e => setRemark(e.target.value)}
              placeholder="备注：比如少辣、不要香菜……" style={s.remark} rows={2} />
            {err && <div style={s.err}>{err}</div>}
            <button style={s.orderBtn} onClick={placeOrder} disabled={placing}>
              {placing ? '下单中…' : `下单（共 ${totalCount} 道）`}
            </button>
            <button style={s.closeBtn} onClick={() => setShowCart(false)}>继续点菜</button>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', paddingBottom: 90 },
  header: { background: 'linear-gradient(135deg,#ff8fab,#ffb3c6)', color: '#fff', padding: '22px 18px 18px', borderRadius: '0 0 22px 22px' },
  shopName: { fontSize: 26, fontWeight: 800 },
  halal: { fontSize: 11, background: '#1b7a3d', color: '#fff', borderRadius: 999, padding: '2px 8px', verticalAlign: 'middle', marginLeft: 6 },
  shopSub: { fontSize: 13, opacity: .9, marginTop: 4 },
  cats: { display: 'flex', gap: 8, padding: '14px 14px 4px', flexWrap: 'wrap' },
  catBtn: { border: '1px solid #ffc2d1', background: '#fff', color: '#d6336c', borderRadius: 999, padding: '7px 16px', fontSize: 14 },
  catBtnOn: { background: '#ff5c8a', color: '#fff', borderColor: '#ff5c8a' },
  list: { padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 10 },
  card: { background: '#fff', borderRadius: 14, padding: 12, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 10px rgba(255,92,138,.08)' },
  dishImg: { width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg,#ffe0e9,#ffc2d1)', color: '#d6336c', fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  dishInfo: { flex: 1, minWidth: 0 },
  dishName: { fontSize: 16, fontWeight: 700 },
  dishDesc: { fontSize: 12, color: '#999', marginTop: 3 },
  stepper: { display: 'flex', alignItems: 'center', gap: 8 },
  stepBtn: { width: 30, height: 30, borderRadius: '50%', border: '1px solid #ffc2d1', background: '#fff', color: '#d6336c', fontSize: 17, lineHeight: 1 },
  addBtn: { background: '#ff5c8a', color: '#fff', borderColor: '#ff5c8a' },
  qty: { minWidth: 18, textAlign: 'center', fontWeight: 700 },
  cartBar: { position: 'fixed', left: 14, right: 14, bottom: 16, background: '#ff5c8a', color: '#fff', border: 'none', borderRadius: 999, padding: '14px 0', fontSize: 16, fontWeight: 700, boxShadow: '0 6px 20px rgba(255,92,138,.4)' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'flex-end', zIndex: 10 },
  sheet: { background: '#fff', width: '100%', borderRadius: '20px 20px 0 0', padding: '18px 18px 26px', maxHeight: '80vh', overflow: 'auto' },
  sheetTitle: { fontSize: 18, fontWeight: 800, marginBottom: 12 },
  cartRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f5f5f5' },
  remark: { width: '100%', border: '1px solid #ffc2d1', borderRadius: 10, padding: 10, marginTop: 12, fontSize: 14, resize: 'none' },
  orderBtn: { width: '100%', background: '#ff5c8a', color: '#fff', border: 'none', borderRadius: 999, padding: '13px 0', fontSize: 16, fontWeight: 700, marginTop: 14 },
  closeBtn: { width: '100%', background: 'none', border: 'none', color: '#999', padding: '10px 0', fontSize: 14 },
  err: { color: '#e03131', fontSize: 13, marginTop: 8 },
  splash: { minHeight: '100vh', background: 'linear-gradient(180deg,#ffd6e0,#fff5f7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 24 },
  cover: { width: 'min(78vw,340px)', aspectRatio: '1', objectFit: 'cover', borderRadius: 24, boxShadow: '0 12px 40px rgba(255,92,138,.3)' },
  splashText: { textAlign: 'center', marginTop: 28 },
  splashTitle: { fontSize: 30, fontWeight: 900, color: '#d6336c' },
  splashSub: { fontSize: 14, color: '#b76e79', marginTop: 8 },
  splashHint: { fontSize: 13, color: '#d6336c', marginTop: 22, opacity: .7 },
  cooking: { padding: 20, textAlign: 'center' },
  video: { width: '100%', maxWidth: 420, borderRadius: 16, background: '#ffe0e9' },
  cookingText: { fontSize: 18, fontWeight: 800, color: '#d6336c', marginTop: 14 },
  receipt: { background: '#fff', margin: '0 16px 20px', borderRadius: 16, padding: 18, boxShadow: '0 2px 14px rgba(0,0,0,.06)' },
  receiptTitle: { fontSize: 18, fontWeight: 800, textAlign: 'center' },
  receiptNo: { textAlign: 'center', color: '#999', fontSize: 13, margin: '6px 0 12px' },
  receiptRow: { display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px dashed #f0f0f0' },
  receiptRemark: { marginTop: 10, fontSize: 14, color: '#666' },
  receiptFoot: { textAlign: 'center', color: '#999', fontSize: 13, marginTop: 14 },
  againBtn: { width: '100%', background: '#ff5c8a', color: '#fff', border: 'none', borderRadius: 999, padding: '12px 0', fontSize: 15, fontWeight: 700, marginTop: 14 },
}
