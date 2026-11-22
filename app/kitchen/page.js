'use client'


import { useEffect, useState, useCallback } from 'react'


const STATUS_LABEL = { new: '新订单', cooking: '制作中', done: '已完成' }


export default function Kitchen() {
  const [orders, setOrders] = useState([])
  const [lastSeen, setLastSeen] = useState(0)
  const [hasNew, setHasNew] = useState(false)
  const [err, setErr] = useState('')


// 后厨也走本站同源代理 /api/orders：直连 Vercel 会被浏览器跨域拦掉
// （顾客页本来就走相对路径；代理在 functions/api/orders.js，Netlify 版走 netlify.toml）
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
