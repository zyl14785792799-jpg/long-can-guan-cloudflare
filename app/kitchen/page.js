'use client'

import { useEffect, useState, useCallback } from 'react'

const STATUS_LABEL = { new: '新订单', cooking: '制作中', done: '已完成' }

export default function Kitchen() {
  const [orders, setOrders] = useState([])
  const [lastSeen, setLastSeen] = useState(0)
  const [hasNew, setHasNew] = useState(false)
  const [err, setErr] = useState('')

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' })
      const data = await res.json()
      if (!data.ok) throw new Error('load failed')
      const list = data.orders || []
      if (list.length > 0) {
        const maxId = Math.max(...list.map(o => o.id))
        if (lastSeen > 0 && maxId > lastSeen) setHasNew(true)
        setLastSeen(prev => Math.max(prev, maxId))
      }
      setOrders(list)
      setErr('')
    } catch (e) {
      setErr('加载失败，正在重试…')
    }
  }, [lastSeen])

  useEffect(() => { fetchOrders() }, [])
  useEffect(() => {
    const t = setInterval(fetchOrders, 4000)
    return () => clearInterval(t)
  }, [fetchOrders])

  async function setStatus(id, status) {
    await fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    fetchOrders()
  }

  const time = iso => {
    try { return new Date(iso).toLocaleString('zh-CN', { hour12: false }) } catch { return iso }
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.title}>后厨订单</div>
        <div style={s.sub}>龙餐馆 · 新订单 4 秒自动刷新</div>
      </div>

      {hasNew && (
        <button style={s.newBanner} onClick={() => { setHasNew(false); fetchOrders() }}>
          来新单了，点我刷新 ↓
        </button>
      )}
      {err && <div style={s.err}>{err}</div>}

      {orders.length === 0 && (
        <div style={s.empty}>暂无订单，等老婆下单吧</div>
      )}

      {orders.map(o => (
        <div key={o.id} style={{ ...s.card, ...(o.status === 'new' ? s.cardNew : {}) }}>
          <div style={s.cardHead}>
            <span style={s.orderNo}>#{o.id}</span>
            <span style={{ ...s.badge, ...(o.status === 'new' ? s.badgeNew : o.status === 'cooking' ? s.badgeCooking : s.badgeDone) }}>
              {STATUS_LABEL[o.status] || o.status}
            </span>
            <span style={s.time}>{time(o.createdAt)}</span>
          </div>
          {o.items.map((it, i) => (
            <div key={i} style={s.row}>
              <span>{it.name}</span><span>× {it.qty}</span>
            </div>
          ))}
          {o.remark && <div style={s.remark}>备注：{o.remark}</div>}
          <div style={s.actions}>
            {o.status === 'new' && (
              <button style={s.btn} onClick={() => setStatus(o.id, 'cooking')}>开始做菜</button>
            )}
            {o.status === 'cooking' && (
              <button style={{ ...s.btn, ...s.btnDone }} onClick={() => setStatus(o.id, 'done')}>做好了</button>
            )}
            {o.status === 'done' && <span style={s.doneText}>已完成 ✓</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#fff5f7', padding: '18px 14px 40px' },
  header: { marginBottom: 14 },
  title: { fontSize: 24, fontWeight: 900, color: '#d6336c' },
  sub: { fontSize: 13, color: '#999', marginTop: 4 },
  newBanner: { width: '100%', background: '#e03131', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 0', fontSize: 15, fontWeight: 700, marginBottom: 12 },
  err: { color: '#e03131', fontSize: 13, marginBottom: 10 },
  empty: { textAlign: 'center', color: '#aaa', padding: '60px 0', fontSize: 15 },
  card: { background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 2px 10px rgba(0,0,0,.05)' },
  cardNew: { border: '2px solid #e03131' },
  cardHead: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 },
  orderNo: { fontWeight: 800, fontSize: 16 },
  badge: { fontSize: 12, borderRadius: 999, padding: '3px 9px', color: '#fff' },
  badgeNew: { background: '#e03131' },
  badgeCooking: { background: '#f08c00' },
  badgeDone: { background: '#2f9e44' },
  time: { marginLeft: 'auto', fontSize: 12, color: '#aaa' },
  row: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #f0f0f0' },
  remark: { marginTop: 10, fontSize: 14, color: '#666', background: '#fff9db', borderRadius: 8, padding: '8px 10px' },
  actions: { marginTop: 12, display: 'flex', gap: 10 },
  btn: { flex: 1, background: '#ff5c8a', color: '#fff', border: 'none', borderRadius: 999, padding: '11px 0', fontSize: 15, fontWeight: 700 },
  btnDone: { background: '#2f9e44' },
  doneText: { color: '#2f9e44', fontWeight: 700 },
}
