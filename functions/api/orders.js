// Cloudflare Pages Function：把本站 /api/orders 同源代理到 Vercel 订单接口
// 顾客页和后厨都只调相对路径 /api/orders，浏览器只连本站，不直连 Vercel
// （老婆手机直连 Vercel 会失败；_redirects 的 200 代理只能指相对路径，
//  指外部 URL 会被 Cloudflare 拒绝，所以必须用 Function 在边缘转发）
const UPSTREAM = 'https://long-can-guan-vercel.vercel.app/api/orders'

export async function onRequest(context) {
  const { request } = context
  const target = new URL(UPSTREAM)
  target.search = new URL(request.url).search
  const headers = new Headers(request.headers)
  headers.delete('host')
  const init = { method: request.method, headers }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.arrayBuffer()
  }
  const res = await fetch(target, init)
  return new Response(res.body, { status: res.status, headers: res.headers })
}
