// 订单存储：Vercel KV（Redis）持久化版
// 订单存在 Vercel KV 里，实例回收也不会丢，后厨随时能看到。

import { kv } from '@vercel/kv'

export async function createOrder({ items, remark }) {
  const id = await kv.incr('long-can-guan:next-id')
  const order = { id, items, remark: remark || '', status: 'new', createdAt: new Date().toISOString() }
  await kv.lpush('long-can-guan:orders', JSON.stringify(order))
  await kv.ltrim('long-can-guan:orders', 0, 199)
  return order
}

export async function listOrders(limit = 50) {
  const raw = await kv.lrange('long-can-guan:orders', 0, limit - 1)
  return raw.map(s => (typeof s === 'string' ? JSON.parse(s) : s))
}

export async function updateOrderStatus(id, status) {
  const raw = await kv.lrange('long-can-guan:orders', 0, 199)
  const idx = raw.findIndex(s => {
    const o = typeof s === 'string' ? JSON.parse(s) : s
    return o.id === Number(id)
  })
  if (idx < 0) return null
  const o = typeof raw[idx] === 'string' ? JSON.parse(raw[idx]) : raw[idx]
  o.status = status
  await kv.lset('long-can-guan:orders', idx, JSON.stringify(o))
  return o
}
