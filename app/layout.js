import './globals.css'

export const metadata = {
  title: '龙餐馆',
  description: '龙餐馆 - 扫码点餐',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
