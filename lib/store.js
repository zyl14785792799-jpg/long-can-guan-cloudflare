// 订单存储：内存版
// 适合演示和小流量。Vercel 无服务器环境冷启动会清空内存。
// 生产要持久化：按 README 接 Vercel KV（Redis）即可，
// 把下面这份改成 KV 版（README 里有完整代码示例）。

let orders = []
let nextId = 1

export async function createOrder({ items, remark }) {
  const order = {
    id: nextId++,
    items, // [{ id, name, qty }]
    remark: remark || '',
    status: 'new', // new | cooking | done
    createdAt: new Date().toISOString(),
  }
  orders.unshift(order)
  // 只保留最近 200 单
  if (orders.length > 200) orders = orders.slice(0, 200)
  return order
}

export async function listOrders(limit = 50) {
  return orders.slice(0, limit)
}

export async function updateOrderStatus(id, status) {
  const order = orders.find(o => o.id === Number(id))
  if (!order) return null
  order.status = status
  return order
}
