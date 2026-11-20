'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { DISHES } from '@/lib/dishes'

// 龙餐馆 Vercel 版 — 按原版 Muse 龙餐馆（~/workspace/ts-spaces/long-can-guan/index.html）
// 像素级重写：开场 / 菜单 / 购物车 / 颠勺动画 / 小票 的结构、文案、样式全部照原版抄。
// 只换了下单通道：原版下单后是复制订单文字发微信；这里 POST /api/orders 存进 Vercel KV。
// lib/dishes.js 没动；展示层用下面的 ORIG 覆盖原版菜品文案（描述 / 标签 / 爱心标）。

const COVER = '/couple.jpg'
const VIDEO = '/chef-toss.mp4'
const POSTER = '/chef-toss-poster.webp'

// ---- 原版菜品文案（按原版 index.html 一字不差；key 是 dishes.js 的数字 id）----
const ORIG = {
  1: { desc: '嫩牛肉大火快炒，青椒脆生生的，最下饭的一道。', tags: ['下饭担当', '微辣'], heart: true, alt: '青椒牛肉：一盘青椒炒牛肉' },
  2: { desc: '香菜爱好者的快乐，牛肉嫩滑，香气扑鼻。', tags: ['香菜控', '下饭担当'], alt: '香菜牛肉：一盘铺满香菜的炒牛肉' },
  3: { desc: '青红双椒配嫩鸡胸，鲜辣过瘾，好吃还低脂。', tags: ['鲜辣', '健身友好'], alt: '双椒鸡胸肉：青红椒炒鸡胸肉' },
  4: { desc: '酸酸甜甜的国民菜，鸡蛋裹满番茄汁。', tags: ['酸甜口', '人气王'], heart: true, alt: '番茄炒蛋：一盘红黄相间的番茄炒鸡蛋' },
  5: { desc: '嫩豆腐裹上蛋液煎得金黄，滑溜溜的超下饭。', tags: ['嫩滑', '下饭担当'], alt: '豆腐抱蛋：裹着蛋液的煎豆腐' },
  6: { desc: '青椒的清香配鸡蛋的嫩，快手家常味。', tags: ['清香', '快手菜'], alt: '青椒炒鸡蛋：一盘青椒炒鸡蛋' },
  7: { desc: '青椒里酿满弹牙的虾滑，煎得微微焦，鲜上加鲜。', tags: ['鲜嫩弹牙', '煎得微焦'], alt: '青椒酿虾滑：青椒里酿着虾滑，煎得微焦' },
  8: { desc: '麻辣鲜香烫，豆腐嫩得直晃悠，拌饭能吃两碗。', tags: ['麻辣过瘾', '下饭担当'], heart: true, alt: '麻婆豆腐：一钵红亮麻辣的麻婆豆腐' },
  9: { desc: '烧椒的焦香配上嫩豆花和牛肉，辣得过瘾又滑嫩。', tags: ['烧椒焦香', '滑嫩入味'], alt: '烧椒牛肉豆花：一碗牛肉配豆花的烧椒菜' },
  10: { desc: '大厨的秘制配方，烤得外焦里嫩，咬一口直爆汁。', tags: ['外焦里嫩', '秘制配方'], alt: '秘制烤肠：几根烤得油亮的烤肠' },
  11: { desc: '鸡块裹满浓浓的咖喱汁，微辣带甜，拌饭一绝。', tags: ['咖喱浓香', '下饭担当'], alt: '咖喱鸡：一碗裹满咖喱汁的鸡块' },
  12: { desc: '鸡块和土豆一起炖得入味，香辣浓郁，一大盘才过瘾。', tags: ['香辣浓郁', '大盘过瘾'], heart: true, alt: '大盘鸡：一大盘红亮的鸡块炖土豆' },
  13: { desc: '鱼片嫩滑，藤椒的麻香在舌尖跳，鲜和麻一起上头。', tags: ['鲜麻过瘾', '嫩滑入味'], alt: '藤椒鱼片：一盘铺着藤椒和辣椒圈的嫩鱼片' },
  14: { desc: '清汤慢炖，牛肋条炖得软烂，原汁原味的鲜。', tags: ['清汤原味', '软烂入味'], alt: '清炖牛肋条：清汤里炖得软烂的牛肋条' },
  15: { desc: '大个罗氏虾裹上芥末黄油，奶香里带一点冲，鲜香过瘾。', tags: ['奶香浓郁', '个大肉满'], alt: '芥末黄油罗氏虾：一盘油亮的大个罗氏虾' },
  16: { desc: '牛肋排配辣皮子爆炒，香辣入骨，越啃越香。', tags: ['香辣入骨', '下饭担当'], alt: '辣皮子牛肋排：一盘配着红辣椒的香辣牛肋排' },
  17: { desc: '煎到起虎皮，软糯入味，一口一口停不下来。', tags: ['微辣', '软糯入味'], alt: '虎皮青椒：一盘煎出虎皮的青椒' },
  18: { desc: '贵州风味的水煮做法，配上蘸水，清爽开胃又解腻。', tags: ['贵州风味', '清爽解腻'], alt: '贵州水煮菜：一锅贵州风味水煮菜' },
  19: { desc: '当季时蔬清清爽爽地炒，脆嫩鲜甜，解腻刚刚好。', tags: ['清爽脆嫩', '时令鲜蔬'], alt: '清炒时蔬：一盘翠绿的清炒时蔬' },
  20: { desc: '豆腐煎香了再用大葱烧，葱香浓浓，酱汁裹得满满的。', tags: ['葱香浓郁', '酱香入味'], alt: '葱烧豆腐：一盘大葱烧豆腐' },
  21: { desc: '西兰花大火小炒，翠绿脆嫩，带着蒜香和锅气。', tags: ['翠绿脆嫩', '蒜香锅气'], alt: '小炒西兰花：一盘翠绿的小炒西兰花' },
  22: { desc: '上海青配蒜泥快炒，碧绿油亮，清清爽爽。', tags: ['蒜香扑鼻', '碧绿油亮'], alt: '蒜泥上海青：一盘蒜泥炒上海青' },
  23: { desc: '粒粒分明，金黄喷香，简单却最见功夫。', tags: ['粒粒分明', '经典主食'], alt: '蛋炒饭：一碗金黄的蛋炒饭' },
  24: { desc: '牛肉配葱花，锅气十足，管饱又满足。', tags: ['锅气十足', '管饱'], alt: '牛肉炒饭：一盘牛肉炒饭' },
  25: { desc: '火鸡面大火爆炒，辣得冒汗，越吃越上头。', tags: ['爆辣上头', '主食新宠'], alt: '爆炒火鸡面：一碗红亮的爆炒火鸡面' },
  26: { desc: '层层酥脆，煎得金黄，卷上煎蛋生菜，一口满足。', tags: ['层层酥脆', '金黄喷香'], alt: '手抓饼：卷着煎蛋和生菜的金黄手抓饼' },
  27: { desc: '老母鸡慢火炖出一锅金黄鸡汤，鲜得暖心又暖胃。', tags: ['慢火细炖', '鲜香暖胃'], heart: true, alt: '老母鸡鸡汤：一大碗金黄的老母鸡汤' },
}

const CAT_MAP = { '热菜': 'hot', '素菜': 'veg', '主食': 'rice', '汤': 'soup' }
const CATS = [
  { id: 'all', name: '全部', icon: 'i-heart-solid' },
  { id: 'hot', name: '热菜', icon: 'i-flame' },
  { id: 'veg', name: '素菜', icon: 'i-star' },
  { id: 'rice', name: '主食', icon: 'i-bunny' },
  { id: 'soup', name: '汤', icon: 'i-heart-solid' },
]
const CAT_TITLES = { hot: '热菜 · 热气腾腾', veg: '素菜 · 清清爽爽', rice: '主食 · 吃饱饱', soup: '汤 · 暖呼呼' }

// 展示用菜品：dishes.js 的 id / name / image + 原版文案
const MENU = DISHES.map(d => ({ ...d, cat: CAT_MAP[d.category], ...(ORIG[d.id] || {}) }))

// ---- 原版 CSS（照 index.html <style> 逐字抄，只加了第一行的字体 @import）----
const CSS = `@import url('https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&family=Noto+Sans+SC:wght@400;500;700;900&display=swap');
:root {
  color-scheme: light;
  --bg: #fff1f6;
  --bg-dot: #ffd7e7;
  --card: #ffffff;
  --card-soft: #fff7fa;
  --ink: #66263c;
  --ink-soft: #a4526f;
  --ink-faint: #c0849c;
  --pink: #ff6b9d;
  --pink-deep: #ef3e7c;
  --pink-soft: #ffe1ee;
  --pink-line: #ffc9dd;
  --gold: #ffb84d;
  --mint: #7fd6b5;
  --shadow: 0 10px 30px rgba(239, 62, 124, 0.14);
  --shadow-sm: 0 4px 14px rgba(239, 62, 124, 0.12);
  --radius: 22px;
}
@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
    --bg: #301521;
    --bg-dot: #462233;
    --card: #472233;
    --card-soft: #4f2739;
    --ink: #ffe6f0;
    --ink-soft: #eda9c3;
    --ink-faint: #c98ba6;
    --pink: #ff7fab;
    --pink-deep: #ff5c93;
    --pink-soft: #5c2a40;
    --pink-line: #6d3650;
    --shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    --shadow-sm: 0 4px 14px rgba(0, 0, 0, 0.3);
  }
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: "Noto Sans SC", system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
  color: var(--ink);
  background-color: var(--bg);
  background-image: radial-gradient(var(--bg-dot) 2.2px, transparent 2.3px);
  background-size: 26px 26px;
  -webkit-font-smoothing: antialiased;
}
button { font: inherit; color: inherit; background: none; border: none; cursor: pointer; }
button, [role="button"], input, textarea { min-height: 2.25rem; }
img { display: block; }
.display { font-family: "ZCOOL KuaiLe", "Noto Sans SC", sans-serif; font-weight: 400; }
.wrap { max-width: 1080px; margin: 0 auto; padding: 0 18px 130px; position: relative; }

/* ---------- floating decorations ---------- */
.deco-layer { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
.deco { position: absolute; opacity: 0.55; animation: floaty 7s ease-in-out infinite; }
.deco svg { display: block; }
@keyframes floaty {
  0%, 100% { transform: translateY(0) rotate(-6deg); }
  50% { transform: translateY(-16px) rotate(8deg); }
}

/* ---------- hero ---------- */
.hero { position: relative; z-index: 1; padding: 20px 0 6px; text-align: center; }
.hero-text { padding: 4px 6px 0; }
.hero-badge {
  display: inline-flex; align-items: center; gap: 7px;
  background: var(--card); color: var(--pink-deep);
  border: 2px solid var(--pink-line); border-radius: 999px;
  padding: 7px 14px; font-size: 13.5px; font-weight: 700;
  box-shadow: var(--shadow-sm);
}
.hero-badge svg { width: 15px; height: 15px; }
/* ---------- halal badge ---------- */
.halal-badge {
  display: inline-flex; align-items: center; gap: 4px; flex: none;
  background: #14743f; color: #fff;
  font-family: "Noto Sans SC", system-ui, sans-serif;
  font-size: 13px; font-weight: 800; letter-spacing: 2px; line-height: 1;
  padding: 5px 9px 5px 10px; border-radius: 999px;
  border: 2px solid #fff;
  box-shadow: 0 3px 10px rgba(20, 116, 63, 0.28);
  white-space: nowrap;
}
.halal-badge svg { width: 11px; height: 11px; flex: none; }
.shop-title-row { display: flex; align-items: flex-start; justify-content: center; gap: 8px; }
.shop-title-row .halal-badge { margin-top: 30px; }
.splash-title-row { display: flex; align-items: flex-start; justify-content: center; gap: 8px; padding: 0 6px; flex-wrap: wrap; }
.splash-title-row .halal-badge { margin-top: 16px; box-shadow: 0 3px 12px rgba(0, 0, 0, 0.35); }
h1.shop-name {
  margin: 16px 0 6px; font-size: clamp(56px, 11vw, 92px); line-height: 1.02;
  color: var(--ink); letter-spacing: 2px;
}
h1.shop-name .accent { color: var(--pink-deep); }
.hero-sub { font-size: clamp(17px, 3.4vw, 21px); color: var(--ink-soft); margin: 0 0 6px; font-weight: 500; }
.hero-note { font-size: 14.5px; color: var(--ink-faint); margin: 0 0 20px; line-height: 1.7; }
.hero-chips { display: flex; flex-wrap: wrap; gap: 9px; justify-content: center; }
.chip {
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--pink-soft); color: var(--ink);
  border-radius: 999px; padding: 8px 13px; font-size: 13.5px; font-weight: 700;
}
.chip svg { width: 14px; height: 14px; flex: none; }
.chip.white { background: var(--card); border: 2px solid var(--pink-line); }

.cover {
  position: relative; margin: 0 0 20px; border-radius: 26px; overflow: hidden;
  box-shadow: var(--shadow); border: 3px solid var(--card);
}
.cover img.main { width: 100%; aspect-ratio: 16 / 10; object-fit: cover; object-position: center 30%; }
.cover .cover-tag {
  position: absolute; left: 14px; bottom: 14px;
  background: rgba(255, 255, 255, 0.92); color: #a4526f;
  border-radius: 999px; padding: 7px 14px; font-size: 14.5px; letter-spacing: 1px;
  box-shadow: var(--shadow-sm);
}
.cover .corner-heart { position: absolute; right: 14px; top: 14px; width: 38px; height: 38px; animation: floaty 5s ease-in-out infinite; filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.25)); }

/* ---------- splash ---------- */
.splash {
  position: fixed; inset: 0; z-index: 100; overflow: hidden; background: #38182a;
  display: flex; align-items: flex-end; justify-content: center; cursor: pointer;
  transition: opacity 0.6s ease, visibility 0.6s ease;
}
.splash.leave { opacity: 0; visibility: hidden; pointer-events: none; }
.splash img.bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 28%; animation: splashZoom 3.4s ease-out forwards; }
@keyframes splashZoom { from { transform: scale(1.14); } to { transform: scale(1.03); } }
.splash .shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(56, 16, 34, 0.22) 0%, rgba(56, 16, 34, 0) 38%, rgba(56, 16, 34, 0.62) 100%); }
.splash-text { position: relative; text-align: center; padding: 0 22px calc(9dvh + env(safe-area-inset-bottom)); color: #fff; }
.splash-title { font-size: clamp(42px, 11vw, 68px); letter-spacing: 4px; line-height: 1.15; text-shadow: 0 4px 22px rgba(56, 10, 28, 0.55); }
.splash-title span { display: inline-block; opacity: 0; animation: splashChar 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
@keyframes splashChar { from { opacity: 0; transform: translateY(26px) scale(0.6) rotate(-6deg); } to { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); } }
.splash-sub { margin-top: 12px; font-size: 15.5px; font-weight: 700; letter-spacing: 2px; opacity: 0; animation: fadeUp 0.7s ease 0.95s forwards; text-shadow: 0 2px 10px rgba(56, 10, 28, 0.6); display: flex; align-items: center; justify-content: center; gap: 8px; }
.splash-sub svg { width: 16px; height: 16px; color: #ffb3cd; flex: none; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
.splash-hint { margin-top: 20px; font-size: 12.5px; letter-spacing: 3px; opacity: 0; animation: fadeUp 0.7s ease 1.5s forwards; color: rgba(255, 255, 255, 0.85); }
.splash .float-heart { position: absolute; animation: floaty 5s ease-in-out infinite; filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3)); }
body.no-scroll { overflow: hidden; }
.fly-heart { position: fixed; z-index: 120; width: 30px; height: 30px; margin: -15px 0 0 -15px; color: var(--pink-deep); pointer-events: none; filter: drop-shadow(0 4px 9px rgba(239, 62, 124, 0.45)); }
.fly-heart svg { width: 100%; height: 100%; display: block; }

/* ---------- category nav ---------- */
.catbar {
  position: sticky; top: 0; z-index: 20;
  display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none;
  padding: 16px 2px 12px; margin: 18px auto 0; max-width: 780px;
  background: linear-gradient(var(--bg) 78%, transparent);
}
.catbar::-webkit-scrollbar { display: none; }
.cat-btn {
  flex: none; display: inline-flex; align-items: center; gap: 6px;
  background: var(--card); border: 2px solid var(--pink-line); color: var(--ink-soft);
  border-radius: 999px; padding: 9px 13px; font-size: 14.5px; font-weight: 700;
  transition: all 0.18s ease;
}
.cat-btn svg { width: 15px; height: 15px; }
.cat-btn.active { background: var(--pink-deep); border-color: var(--pink-deep); color: #fff; box-shadow: var(--shadow-sm); }

/* ---------- menu ---------- */
.section-head { display: flex; align-items: center; gap: 10px; margin: 26px auto 14px; max-width: 780px; padding: 0 2px; position: relative; z-index: 1; }
.section-head h2 { margin: 0; font-size: 25px; letter-spacing: 1px; }
.section-head svg { width: 22px; height: 22px; }
.section-head .line { flex: 1; border-top: 3px dotted var(--pink-line); }
.grid { display: flex; flex-direction: column; gap: 12px; position: relative; z-index: 1; max-width: 780px; margin: 0 auto; }
.dish {
  background: var(--card); border-radius: var(--radius); overflow: hidden;
  box-shadow: var(--shadow-sm); border: 2px solid transparent;
  display: flex; flex-direction: row; align-items: stretch;
  transition: border-color 0.18s ease;
}
.dish.picked { border-color: var(--pink); }
/* 菜图是整盘入镜的横版/方形图：contain 完整显示整盘不裁切，
   空余处用同一张图的虚化版垫底，和深灰大理石台面自然衔接。 */
.dish .photo { position: relative; flex: none; width: 168px; height: 168px; overflow: hidden; background: #4a4a4e; }
.dish .photo .photo-blur { position: absolute; inset: -18px; width: calc(100% + 36px); height: calc(100% + 36px); object-fit: cover; object-position: center; filter: blur(16px) brightness(0.88); }
.dish .photo img { position: relative; z-index: 1; width: 100%; height: 100%; object-fit: contain; }
.dish .photo .heart-pop { position: absolute; z-index: 2; right: 10px; top: 10px; width: 30px; height: 30px; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.25)); }
.dish .body { padding: 13px 8px 14px 15px; display: flex; flex-direction: column; gap: 7px; flex: 1; min-width: 0; }
.dish-action { flex: none; display: flex; align-items: center; padding: 10px 14px 10px 2px; }
.dish h3 { margin: 0; font-size: 19px; font-weight: 900; letter-spacing: 0.5px; }
.dish p.desc { margin: 0; font-size: 13.5px; line-height: 1.65; color: var(--ink-soft); flex: 1; }
.tags { display: flex; flex-wrap: wrap; gap: 6px; }
.tag { font-size: 11.5px; font-weight: 700; color: var(--pink-deep); background: var(--pink-soft); border-radius: 999px; padding: 3.5px 9px; }
.tag.gold { color: #b06f14; background: #ffedcb; }
@media (prefers-color-scheme: dark) { .tag.gold { color: #ffd48a; background: #5a4220; } }
.dish .foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 4px; }
.price-note { font-size: 13px; color: var(--ink-faint); font-weight: 700; display: inline-flex; align-items: center; gap: 4px; }
.price-note svg { width: 13px; height: 13px; }

.add-btn {
  width: 48px; height: 48px; min-height: 48px; border-radius: 50%; flex: none;
  display: grid; place-items: center;
  background: var(--pink-deep); color: #fff;
  box-shadow: var(--shadow-sm); transition: transform 0.12s ease;
}
.add-btn:active { transform: scale(0.9); }
.add-btn svg { width: 22px; height: 22px; }
.stepper { display: inline-flex; align-items: center; gap: 3px; background: var(--pink-soft); border-radius: 999px; padding: 3px; }
.stepper button {
  width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center;
  background: var(--card); color: var(--pink-deep); box-shadow: var(--shadow-sm);
}
.stepper button svg { width: 16px; height: 16px; }
.stepper .qty { min-width: 30px; text-align: center; font-weight: 900; font-size: 16px; }
.stepper.v { flex-direction: column; gap: 2px; padding: 4px; }
.stepper.v button { width: 38px; height: 38px; }
.stepper.v .qty { min-width: 0; }
.hidden { display: none !important; }

/* ---------- footer ---------- */
footer { position: relative; z-index: 1; text-align: center; margin-top: 54px; color: var(--ink-faint); font-size: 13.5px; line-height: 2; }
footer .bunny { width: 44px; height: 44px; margin: 0 auto 4px; opacity: 0.9; }
footer .big { font-size: 16px; color: var(--ink-soft); }

/* ---------- cart bar ---------- */
.cartbar {
  position: fixed; left: 50%; transform: translateX(-50%);
  bottom: calc(14px + env(safe-area-inset-bottom)); z-index: 40;
  width: min(680px, calc(100vw - 28px));
  background: var(--ink); color: #fff;
  border-radius: 999px; padding: 9px 9px 9px 20px;
  display: flex; align-items: center; gap: 12px;
  box-shadow: 0 16px 38px rgba(80, 15, 40, 0.35);
}
@media (prefers-color-scheme: dark) { .cartbar { background: #ff5c93; } }
.cartbar .basket { position: relative; display: grid; place-items: center; width: 42px; height: 42px; }
.cartbar .basket svg { width: 27px; height: 27px; }
.cartbar .count-badge {
  position: absolute; top: -3px; right: -5px; min-width: 22px; height: 22px; padding: 0 5px;
  background: var(--gold); color: #6b3d05; border-radius: 999px;
  font-size: 12.5px; font-weight: 900; display: grid; place-items: center;
  border: 2px solid #fff;
}
.cartbar .cart-info { flex: 1; line-height: 1.35; min-width: 0; }
.cartbar .cart-info .t1 { font-weight: 900; font-size: 15.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cartbar .cart-info .t2 { font-size: 12.5px; opacity: 0.82; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cartbar .go-btn {
  background: var(--pink-deep); color: #fff; font-weight: 900; font-size: 15.5px;
  border-radius: 999px; padding: 12px 22px; min-height: 46px; flex: none;
  display: inline-flex; align-items: center; gap: 6px;
}
@media (prefers-color-scheme: dark) { .cartbar .go-btn { background: #fff; color: #ef3e7c; } }
.cartbar.empty .go-btn { opacity: 0.45; }
.cartbar.bump { animation: bump 0.35s ease; }
@keyframes bump { 0% { transform: translateX(-50%) scale(1); } 40% { transform: translateX(-50%) scale(1.045); } 100% { transform: translateX(-50%) scale(1); } }

/* ---------- sheet / modal shared ---------- */
.overlay {
  position: fixed; inset: 0; z-index: 60; display: none;
  background: rgba(74, 18, 38, 0.5); backdrop-filter: blur(3px);
  align-items: flex-end; justify-content: center;
}
.overlay.open { display: flex; }
.sheet {
  background: var(--card); width: min(680px, 100vw); max-height: 88dvh; overflow-y: auto;
  border-radius: 28px 28px 0 0; padding: 22px 22px calc(20px + env(safe-area-inset-bottom));
  animation: rise 0.28s ease;
}
@keyframes rise { from { transform: translateY(46px); opacity: 0.4; } to { transform: translateY(0); opacity: 1; } }
.sheet h2 { margin: 0; font-size: 23px; }
.sheet-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.icon-btn { width: 42px; height: 42px; border-radius: 50%; background: var(--pink-soft); color: var(--pink-deep); display: grid; place-items: center; flex: none; }
.icon-btn svg { width: 18px; height: 18px; }
.cart-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 2px dotted var(--pink-line); }
.cart-row img { width: 56px; height: 56px; border-radius: 14px; object-fit: cover; flex: none; }
.cart-row .nm { flex: 1; min-width: 0; }
.cart-row .nm .n { font-weight: 900; font-size: 16px; }
.cart-row .nm .d { font-size: 12.5px; color: var(--ink-faint); }
.cart-row .stepper button { width: 38px; height: 38px; }
.empty-cart { text-align: center; padding: 28px 10px 12px; color: var(--ink-soft); }
.empty-cart .bunny { width: 74px; height: 74px; margin: 0 auto 8px; }
.remark-label { display: block; font-weight: 800; font-size: 14.5px; margin: 18px 0 8px; }
textarea.remark {
  width: 100%; border: 2px solid var(--pink-line); border-radius: 16px; background: var(--card-soft);
  padding: 12px 14px; font: inherit; font-size: 14.5px; color: var(--ink); resize: vertical; min-height: 64px;
}
textarea.remark:focus { outline: 3px solid var(--pink-soft); border-color: var(--pink); }
.order-btn {
  width: 100%; margin-top: 18px; background: var(--pink-deep); color: #fff;
  font-size: 18px; font-weight: 900; border-radius: 999px; padding: 15px; min-height: 56px;
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  box-shadow: var(--shadow);
}
.order-btn svg { width: 19px; height: 19px; }
.order-btn:disabled { opacity: 0.45; box-shadow: none; }
.total-line { display: flex; justify-content: space-between; align-items: baseline; margin-top: 16px; font-weight: 800; }
.total-line .amt { color: var(--pink-deep); font-size: 17px; }

/* ---------- cooking overlay ---------- */
.cook-overlay {
  position: fixed; inset: 0; z-index: 80; display: none;
  background: var(--bg); background-image: radial-gradient(var(--bg-dot) 2.2px, transparent 2.3px); background-size: 26px 26px;
  overflow-y: auto;
}
.cook-overlay.open { display: block; }
.cook-inner { max-width: 520px; margin: 0 auto; padding: 34px 20px 40px; text-align: center; }
.cook-inner h2 { font-size: 30px; margin: 0 0 4px; letter-spacing: 1px; }
.cook-status { color: var(--ink-soft); font-weight: 700; font-size: 16.5px; min-height: 26px; margin: 0 0 8px; }
.cook-frame {
  position: relative; width: min(320px, 84vw); margin: 24px auto 0;
  background: #fff; padding: 10px; border-radius: 24px;
  box-shadow: var(--shadow);
}
.cook-photo-clip { position: relative; border-radius: 16px; overflow: hidden; }
.cook-video { display: block; width: 100%; aspect-ratio: 52 / 69; object-fit: cover; background: #f6e3da; }
.cook-poster { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: opacity 0.25s ease; }
.cook-photo-clip.playing .cook-poster { opacity: 0; }
.cook-deco { position: absolute; pointer-events: none; animation: floaty 4.5s ease-in-out infinite; filter: drop-shadow(0 3px 5px rgba(120, 30, 60, 0.2)); }
.cook-deco.d1 { width: 30px; height: 30px; left: -15px; top: 24px; }
.cook-deco.d2 { width: 22px; height: 22px; right: -11px; top: 62px; animation-delay: 1.1s; }
.cook-deco.d3 { width: 26px; height: 26px; right: -13px; bottom: 28px; animation-delay: 2s; }
.cook-caption { display: flex; align-items: center; justify-content: center; gap: 9px; font-size: 27px; color: var(--pink-deep); letter-spacing: 2px; margin: 22px 0 2px; }
.cook-caption > svg { width: 21px; height: 21px; flex: none; }
.cook-dots { display: inline-flex; gap: 4px; }
.cook-dots i { width: 6px; height: 6px; border-radius: 50%; background: var(--pink-deep); animation: dotBlink 1.2s ease-in-out infinite; }
.cook-dots i:nth-child(2) { animation-delay: 0.2s; }
.cook-dots i:nth-child(3) { animation-delay: 0.4s; }
@keyframes dotBlink { 0%, 100% { opacity: 0.25; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-3px); } }
.cook-tip { color: var(--ink-faint); font-size: 13.5px; margin-top: 14px; }
.cook-skip { margin-top: 18px; background: var(--card); border: 2px solid var(--pink-line); color: var(--pink-deep); border-radius: 999px; padding: 12px 22px; font-weight: 900; font-size: 15px; min-height: 48px; }

/* ---------- done view ---------- */
.done-view { display: none; }
.cook-overlay.done .cook-view { display: none; }
.cook-overlay.done .done-view { display: block; }
.done-badge {
  width: 92px; height: 92px; margin: 8px auto 14px; border-radius: 50%;
  background: var(--pink-deep); display: grid; place-items: center; box-shadow: var(--shadow);
  animation: popIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.done-badge svg { width: 46px; height: 46px; color: #fff; }
@keyframes popIn { from { transform: scale(0.4); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.ticket {
  background: var(--card); border: 2px dashed var(--pink); border-radius: 20px;
  padding: 18px 20px; text-align: left; margin-top: 18px; box-shadow: var(--shadow-sm);
}
.ticket .row { display: flex; justify-content: space-between; gap: 12px; padding: 7px 0; border-bottom: 2px dotted var(--pink-line); font-size: 15px; }
.ticket .row:last-of-type { border-bottom: none; }
.ticket .row .q { font-weight: 900; color: var(--pink-deep); white-space: nowrap; }
.ticket .meta { display: flex; justify-content: space-between; color: var(--ink-faint); font-size: 13px; padding-bottom: 10px; border-bottom: 2px dotted var(--pink-line); margin-bottom: 6px; }
.ticket .remark-show { font-size: 13.5px; color: var(--ink-soft); background: var(--card-soft); border-radius: 10px; padding: 9px 12px; margin-top: 10px; }
.done-btns { display: flex; gap: 12px; margin-top: 22px; }
.done-btns button { flex: 1; border-radius: 999px; padding: 14px; font-weight: 900; font-size: 16px; min-height: 52px; }
.btn-primary { background: var(--pink-deep); color: #fff; box-shadow: var(--shadow); }
.btn-ghost { background: var(--card); border: 2px solid var(--pink-line); color: var(--pink-deep); }

/* ---------- send order to chef ---------- */
.send-order { margin-top: 18px; }
.send-btn {
  width: 100%; background: var(--pink-deep); color: #fff;
  font-size: 18px; font-weight: 900; border-radius: 999px; padding: 16px; min-height: 58px;
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  box-shadow: var(--shadow);
}
.send-btn svg { width: 19px; height: 19px; flex: none; }
.send-btn.copied { background: var(--mint); color: #0d4d33; }
.send-hint {
  margin: 12px 4px 0; font-size: 14.5px; font-weight: 700; color: var(--ink-soft);
  line-height: 1.7; white-space: pre-line; word-break: break-all;
}
.share-btn {
  margin: 12px auto 0; display: block; background: none; border: none;
  color: var(--pink-deep); font-size: 14px; font-weight: 800;
  text-decoration: underline; text-underline-offset: 4px; padding: 6px 10px;
}

@media (max-width: 720px) {
  h1.shop-name { font-size: 54px; margin: 12px 0 4px; }
  .shop-title-row .halal-badge { margin-top: 24px; font-size: 12px; padding: 4px 8px 4px 9px; }
  .splash-title-row .halal-badge { margin-top: 10px; font-size: 12px; }
  .hero-note { margin-bottom: 14px; line-height: 1.6; }
  .hero-badge { font-size: 12.5px; padding: 6px 12px; }
  .cover { border-radius: 20px; margin-bottom: 14px; }
  .cover img.main { aspect-ratio: 4 / 3.4; object-position: center 28%; }
  .dish .photo { width: 122px; height: 122px; }
  .dish h3 { font-size: 16.5px; }
  .dish p.desc { font-size: 12.5px; }
  .dish .body { padding: 11px 6px 12px 12px; }
  .dish-action { padding-right: 10px; }
  .add-btn { width: 44px; height: 44px; min-height: 44px; }
}
@media (prefers-reduced-motion: reduce) {
  .deco, .cook-deco, .cook-dots i, .cover .corner-heart, .splash img.bg, .splash .float-heart { animation: none !important; }
  .splash-title span, .splash-sub, .splash-hint { animation: none !important; opacity: 1 !important; }
  html { scroll-behavior: auto; }
}
`

// ---- SVG 图标库（照原版 <defs> 逐字抄）----
function Symbols() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <symbol id="i-heart" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21s-7.5-4.9-10-9.3C.4 8.6 2.2 5 5.6 5c2 0 3.4 1.1 4.4 2.4h4C15 6.1 16.4 5 18.4 5c3.4 0 5.2 3.6 3.6 6.7C19.5 16.1 12 21 12 21z" transform="scale(0.92) translate(1,0)" /></symbol>
        <symbol id="i-heart-solid" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></symbol>
        <symbol id="i-star" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2.5l2.95 6.36 6.95.72-5.18 4.73 1.42 6.83L12 17.77l-6.14 3.37 1.42-6.83L2.1 9.58l6.95-.72L12 2.5z" /></symbol>
        <symbol id="i-bunny" viewBox="0 0 64 64">
          <g fill="currentColor">
            <ellipse cx="22" cy="14" rx="6.5" ry="13" />
            <ellipse cx="42" cy="14" rx="6.5" ry="13" />
            <circle cx="32" cy="42" r="19" />
          </g>
          <g fill="#ffd7e7">
            <ellipse cx="22" cy="15" rx="3" ry="8.5" />
            <ellipse cx="42" cy="15" rx="3" ry="8.5" />
          </g>
          <circle cx="25.5" cy="40" r="2.2" fill="#66263c" />
          <circle cx="38.5" cy="40" r="2.2" fill="#66263c" />
          <ellipse cx="32" cy="46" rx="2.6" ry="1.9" fill="#ef3e7c" />
          <circle cx="19" cy="46" r="3.4" fill="#ffb3cd" opacity="0.85" />
          <circle cx="45" cy="46" r="3.4" fill="#ffb3cd" opacity="0.85" />
        </symbol>
        <symbol id="i-basket" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" d="M5 9l3.2-5.2M19 9l-3.2-5.2M3.5 9h17l-1.6 9.3a2.4 2.4 0 0 1-2.37 2H7.47a2.4 2.4 0 0 1-2.37-2L3.5 9zM8.5 13v3.4M12 13v3.4M15.5 13v3.4" /></symbol>
        <symbol id="i-plus" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" d="M12 5v14M5 12h14" /></symbol>
        <symbol id="i-minus" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" d="M5 12h14" /></symbol>
        <symbol id="i-close" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" d="M6 6l12 12M18 6L6 18" /></symbol>
        <symbol id="i-check" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.5l5 5L19.5 7" /></symbol>
        <symbol id="i-flame" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2c1 3.5-2.4 5.4-3.9 7.2C6.7 10.9 6 12.5 6 14.2A6 6 0 0 0 12 20a6 6 0 0 0 6-5.8c0-1.5-.6-2.9-1.4-4.1-.5 1-1.2 1.7-2.1 2.1.3-3.4-.6-7.4-2.5-10.2z" /></symbol>
        <symbol id="i-clock" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zM12 7v5l3.2 2" /></symbol>
      </defs>
    </svg>
  )
}

function Ic({ n, style, className }) {
  return (<svg className={className} style={style} aria-hidden="true"><use href={'#' + n} /></svg>)
}

function HalalBadge() {
  return (
    <span className="halal-badge" aria-label="清真标识">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.2 14.2A8.7 8.7 0 1 1 9.8 3.8a7.2 7.2 0 0 0 10.4 10.4z" /></svg>
      清真
    </span>
  )
}

const DECO_SPOTS = [
  { t: 'i-heart-solid', c: '#ff9ebb', s: 22, x: '4%', y: '12%', d: '0s' },
  { t: 'i-star', c: '#ffb84d', s: 18, x: '93%', y: '9%', d: '1.2s' },
  { t: 'i-bunny', c: '#ff6b9d', s: 34, x: '90%', y: '46%', d: '0.6s' },
  { t: 'i-heart-solid', c: '#ffc2d6', s: 16, x: '2%', y: '58%', d: '1.8s' },
  { t: 'i-star', c: '#ffc95e', s: 15, x: '6%', y: '84%', d: '0.9s' },
  { t: 'i-heart-solid', c: '#ff8fab', s: 19, x: '95%', y: '80%', d: '2.1s' },
]

const SPLASH_CHARS = ['欢', '迎', '来', '到', '龙', '餐', '馆']
const SPLASH_DELAYS = [0.15, 0.27, 0.39, 0.51, 0.63, 0.75, 0.87]

export default function Home() {
  const [splash, setSplash] = useState('show') // show | leaving | gone
  const [cart, setCart] = useState({}) // { dishId: qty }
  const [activeCat, setActiveCat] = useState('all')
  const [cartOpen, setCartOpen] = useState(false)
  const [remark, setRemark] = useState('')
  const [placing, setPlacing] = useState(false)
  const [err, setErr] = useState('')
  // cook: null | { phase: 'cooking' | 'done', orderNo, time, items, remarkText, orderText }
  const [cook, setCook] = useState(null)
  const [posterHidden, setPosterHidden] = useState(false)

  const videoRef = useRef(null)
  const basketRef = useRef(null)
  const cartbarRef = useRef(null)
  const timersRef = useRef([])
  const blobUrlRef = useRef('')
  const blobAppliedRef = useRef(false)
  const blobPromiseRef = useRef(null)
  const fetchStartedRef = useRef(false)
  const cookActiveRef = useRef(false)
  const receiptStartedRef = useRef(false)
  const reducedRef = useRef(false)

  const cartItems = useMemo(
    () => MENU.filter(d => cart[d.id] > 0).map(d => ({ ...d, qty: cart[d.id] })),
    [cart]
  )
  const totalCount = cartItems.reduce((s, i) => s + i.qty, 0)
  const kindCount = cartItems.length

  useEffect(() => {
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    warmCookVideo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 开场期间锁滚动（照原版 body.no-scroll）
  useEffect(() => {
    document.body.classList.toggle('no-scroll', splash !== 'gone')
  }, [splash])

  // 购物车弹层打开时锁滚动
  useEffect(() => {
    if (cartOpen || cook) document.body.style.overflow = 'hidden'
    else if (splash === 'gone') document.body.style.overflow = ''
  }, [cartOpen, cook, splash])

  // 购物车数量变化时弹一下（照原版 .bump）
  const firstCount = useRef(true)
  useEffect(() => {
    if (firstCount.current) { firstCount.current = false; return }
    const bar = cartbarRef.current
    if (!bar || reducedRef.current) return
    bar.classList.remove('bump'); void bar.offsetWidth; bar.classList.add('bump')
  }, [totalCount])

  // 卸载时清掉所有计时器
  useEffect(() => () => { timersRef.current.forEach(clearTimeout) }, [])

  function pushTimer(fn, ms) {
    const t = setTimeout(fn, ms)
    timersRef.current.push(t)
    return t
  }

  function setQty(id, q) {
    setCart(c => {
      const next = { ...c }
      if (q <= 0) delete next[id]
      else next[id] = Math.min(q, 20)
      return next
    })
  }

  // 爱心从 + 按钮飞进购物车（照原版 flyHeart）
  function flyHeart(fromEl, toCart) {
    if (reducedRef.current || !fromEl || typeof fromEl.animate !== 'function') return
    const r = fromEl.getBoundingClientRect()
    const sx = r.left + r.width / 2, sy = r.top + r.height / 2
    const basket = basketRef.current
    const br = basket ? basket.getBoundingClientRect() : null
    for (let i = 0; i < 2; i++) {
      const h = document.createElement('span')
      h.className = 'fly-heart'
      h.setAttribute('aria-hidden', 'true')
      h.innerHTML = '<svg><use href="#i-heart-solid"/></svg>'
      h.style.left = sx + 'px'
      h.style.top = sy + 'px'
      if (i === 1) {
        h.style.width = '20px'; h.style.height = '20px'
        h.style.margin = '-10px 0 0 -10px'; h.style.color = 'var(--pink)'
      }
      document.body.appendChild(h)
      const slideX = i === 0 ? -26 : 30
      const rot = i === 0 ? -14 : 12
      let frames
      if (toCart && br) {
        const tx = br.left + br.width / 2 - sx, ty = br.top + br.height / 2 - sy
        frames = [
          { transform: 'translate(0,0) scale(0.3) rotate(0deg)', opacity: 0 },
          { transform: `translate(${slideX}px,-52px) scale(1.15) rotate(${rot}deg)`, opacity: 1, offset: 0.3 },
          { transform: `translate(${tx}px,${ty}px) scale(0.35) rotate(0deg)`, opacity: 0.9 },
        ]
      } else {
        frames = [
          { transform: 'translate(0,0) scale(0.3) rotate(0deg)', opacity: 0 },
          { transform: `translate(${slideX}px,-46px) scale(1.15) rotate(${rot}deg)`, opacity: 1, offset: 0.45 },
          { transform: `translate(${slideX * 1.4}px,-84px) scale(0.8) rotate(0deg)`, opacity: 0 },
        ]
      }
      const anim = h.animate(frames, { duration: toCart ? 780 : 650, delay: i * 80, easing: 'cubic-bezier(.25,.7,.3,1)', fill: 'forwards' })
      anim.onfinish = () => { if (h.parentNode) h.parentNode.removeChild(h) }
      setTimeout(() => { if (h.parentNode) h.parentNode.removeChild(h) }, 1800)
    }
  }

  // ---- 颠勺视频预热：页面一打开就把视频下到本地 blob，下单瞬间就能播（照原版 warmCookVideo）----
  function warmCookVideo() {
    if (fetchStartedRef.current || !window.fetch || !window.URL || !URL.createObjectURL) return
    fetchStartedRef.current = true
    blobPromiseRef.current = fetch(VIDEO).then(r => {
      if (!r.ok) throw new Error('bad response')
      return r.blob()
    }).then(b => {
      if (b && b.size > 100000) blobUrlRef.current = URL.createObjectURL(b)
      return blobUrlRef.current
    }).catch(() => '')
  }

  function primeCookVideo() {
    warmCookVideo()
    const v = videoRef.current
    if (!v) return
    try { v.load() } catch (e) {}
    if (reducedRef.current) return
    const p = v.play()
    if (p && p.catch) p.catch(() => {})
  }

  function applyCookBlob() {
    const v = videoRef.current
    if (blobAppliedRef.current || !blobUrlRef.current || !v) return
    blobAppliedRef.current = true
    try { v.src = blobUrlRef.current } catch (e) {}
    try { v.load() } catch (e) {}
  }

  function tryPlayCook() {
    const v = videoRef.current
    if (!v) return
    const p = v.play()
    if (p && p.catch) p.catch(() => {})
  }

  function playCookVideo() {
    const v = videoRef.current
    if (!v) return
    if (blobUrlRef.current) {
      applyCookBlob()
      try { v.currentTime = 0 } catch (e) {}
      tryPlayCook()
    } else if (blobPromiseRef.current) {
      tryPlayCook()
      blobPromiseRef.current.then(() => {
        if (!blobUrlRef.current) return
        if (!cookActiveRef.current) return
        applyCookBlob()
        try { v.currentTime = 0 } catch (e) {}
        tryPlayCook()
      })
    } else {
      try { v.currentTime = 0 } catch (e) {}
      tryPlayCook()
    }
    if (!v.paused && v.readyState >= 2) startReceiptTimer()
    pushTimer(() => {
      if (!cookActiveRef.current) return
      const vv = videoRef.current
      if (!vv) return
      if (vv.paused) tryPlayCook()
      else startReceiptTimer()
    }, 700)
  }

  // 出小票的时机跟着视频走：视频真正开播后数 8.65 秒（7 秒视频播满一遍再稍等一拍）；
  // 视频一直没播起来时 4 秒兜底也开始计时（照原版 startReceiptTimer）。
  function startReceiptTimer() {
    if (!cookActiveRef.current || receiptStartedRef.current) return
    receiptStartedRef.current = true
    pushTimer(showReceipt, 8650)
  }

  function onVideoPlaying() {
    setPosterHidden(true)
    startReceiptTimer()
  }

  function showReceipt() {
    if (!cookActiveRef.current) return
    cookActiveRef.current = false
    const v = videoRef.current
    if (v) v.pause()
    setCook(prev => (prev ? { ...prev, phase: 'done' } : prev))
    setCart({})
    setRemark('')
  }

  function closeCook() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    cookActiveRef.current = false
    receiptStartedRef.current = false
    const v = videoRef.current
    if (v) v.pause()
    setPosterHidden(false)
    setCook(null)
  }

  async function placeOrder() {
    if (cartItems.length === 0 || placing) return
    setPlacing(true)
    setErr('')
    try {
      const res = await fetch('https://long-can-guan-vercel.vercel.app/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(i => ({ id: i.id, qty: i.qty })),
          remark,
        }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || '下单失败')

      const now = new Date()
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      const orderNo = '龙' + String(data.order.id).padStart(4, '0')
      const dateStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0')
      const lines = ['龙餐馆新订单', '订单号：' + orderNo, '下单时间：' + dateStr + ' ' + hh + ':' + mm]
      cartItems.forEach(i => lines.push(i.name + ' × ' + i.qty))
      lines.push('给厨师的留言：' + (remark.trim() ? remark.trim() : '无'))

      setCook({
        phase: 'cooking',
        orderNo,
        time: hh + ':' + mm,
        items: cartItems,
        remarkText: remark.trim(),
        orderText: lines.join('\n'),
      })
      setCartOpen(false)
      cookActiveRef.current = true
      receiptStartedRef.current = false
      setPosterHidden(false)
      // 下一帧再播（等 overlay 挂上、video 节点就位）
      pushTimer(() => playCookVideo(), 60)
      // 4 秒兜底：视频一直没播起来也开始计时
      pushTimer(() => startReceiptTimer(), 4000)
      // 8 秒硬上限：不管视频播没播完，下单 8 秒后一定出小票，不再卡住
      pushTimer(() => showReceipt(), 8000)
    } catch (e) {
      setErr('下单失败，请再试一次')
    } finally {
      setPlacing(false)
    }
  }

  function leaveSplash() {
    if (splash !== 'show') return
    primeCookVideo()
    setSplash('leaving')
    pushTimer(() => setSplash('gone'), 700)
  }

  function openCart() {
    primeCookVideo()
    setCartOpen(true)
  }

  return (
    <>
      <style>{CSS}</style>
      <Symbols />

      <div className="deco-layer" aria-hidden="true">
        {DECO_SPOTS.map((sp, i) => (
          <span key={i} className="deco" style={{ left: sp.x, top: sp.y, animationDelay: sp.d }}>
            <svg width={sp.s} height={sp.s} style={{ color: sp.c }}><use href={'#' + sp.t} /></svg>
          </span>
        ))}
      </div>

      {/* ================= SPLASH ================= */}
      {splash !== 'gone' && (
        <div className={`splash${splash === 'leaving' ? ' leave' : ''}`} onClick={leaveSplash} aria-hidden="true">
          <img className="bg" src={COVER} alt="" />
          <div className="shade" />
          <svg className="float-heart" style={{ color: '#ff8fab', width: 26, height: 26, left: '10%', top: '16%' }}><use href="#i-heart-solid" /></svg>
          <svg className="float-heart" style={{ color: '#ffb3cd', width: 19, height: 19, right: '12%', top: '24%', animationDelay: '1.2s' }}><use href="#i-heart-solid" /></svg>
          <svg className="float-heart" style={{ color: '#ffd7e7', width: 16, height: 16, right: '20%', top: '9%', animationDelay: '2s' }}><use href="#i-heart-solid" /></svg>
          <div className="splash-text">
            <div className="splash-title-row">
              <div className="splash-title display">
                {SPLASH_CHARS.map((ch, i) => (
                  <span key={i} style={{ animationDelay: SPLASH_DELAYS[i] + 's' }}>{ch}</span>
                ))}
              </div>
              <HalalBadge />
            </div>
            <div className="splash-sub"><Ic n="i-heart-solid" />大厨和兔兔老板娘等你回家吃饭<Ic n="i-heart-solid" /></div>
            <div className="splash-hint">点一下就进去啦</div>
          </div>
        </div>
      )}

      <div className="wrap">
        {/* ================= HERO ================= */}
        <header className="hero">
          <figure className="cover">
            <img className="main" src={COVER} alt="大厨正对镜头微笑，老板娘兔兔在旁边抱着他、闭着眼睛亲他的脸" />
            <svg className="corner-heart" style={{ color: 'var(--pink-deep)' }} aria-hidden="true"><use href="#i-heart-solid" /></svg>
            <span className="cover-tag display">龙餐馆</span>
          </figure>
          <div className="hero-text">
            <span className="hero-badge"><Ic n="i-heart-solid" />两个人的专属小餐馆 · 今日营业中</span>
            <div className="shop-title-row">
              <h1 className="shop-name display">龙<span className="accent">餐</span>馆</h1>
              <HalalBadge />
            </div>
            <p className="hero-sub">欢迎回家吃饭呀，今天想吃点什么？</p>
            <p className="hero-note">菜单上的每一道，都是想做给一个人吃的菜。<br />慢慢挑，挑好了喊大厨开火。</p>
            <div className="hero-chips">
              <span className="chip"><Ic n="i-heart-solid" style={{ color: 'var(--pink-deep)' }} />价格不定 · 用爱支付</span>
              <span className="chip white"><Ic n="i-star" style={{ color: 'var(--gold)' }} />全场 28 道 · 道道用心</span>
              <span className="chip white"><Ic n="i-bunny" style={{ color: 'var(--pink)' }} />兔兔老板娘监制</span>
            </div>
          </div>
        </header>

        {/* ================= CATEGORY NAV ================= */}
        <nav className="catbar" aria-label="菜品分类">
          {CATS.map(c => (
            <button
              key={c.id}
              className={`cat-btn${activeCat === c.id ? ' active' : ''}`}
              onClick={() => { setActiveCat(c.id); window.scrollTo({ top: 0, behavior: reducedRef.current ? 'auto' : 'smooth' }) }}
            >
              <Ic n={c.icon} />{c.name}
            </button>
          ))}
        </nav>

        {/* ================= MENU ================= */}
        <main>
          {CATS.slice(1).map(cat => {
            if (activeCat !== 'all' && activeCat !== cat.id) return null
            const list = MENU.filter(d => d.cat === cat.id)
            return (
              <section key={cat.id}>
                <div className="section-head">
                  <span style={{ color: 'var(--pink-deep)' }}><Ic n={cat.icon} /></span>
                  <h2 className="display">{CAT_TITLES[cat.id]}</h2>
                  <span className="line" />
                </div>
                <div className="grid">
                  {list.map(d => {
                    const q = cart[d.id] || 0
                    return (
                      <article key={d.id} className={`dish${q > 0 ? ' picked' : ''}`}>
                        <div className="photo">
                          <img className="photo-blur" src={d.image} alt="" aria-hidden="true" />
                          <img src={d.image} alt={d.alt || d.name} loading="lazy" />
                          {d.heart && <svg className="heart-pop" style={{ color: 'var(--pink-deep)' }} aria-hidden="true"><use href="#i-heart-solid" /></svg>}
                        </div>
                        <div className="body">
                          <h3>{d.name}</h3>
                          <p className="desc">{d.desc}</p>
                          <div className="tags">
                            {(d.tags || []).map((t, i) => (
                              <span key={t} className={`tag${i === 0 ? ' gold' : ''}`}>{t}</span>
                            ))}
                          </div>
                          <span className="price-note"><Ic n="i-heart-solid" />爱心价 · 不定</span>
                        </div>
                        <div className="dish-action">
                          {q === 0 ? (
                            <button className="add-btn" aria-label="加一份到购物车" onClick={e => { flyHeart(e.currentTarget, true); setQty(d.id, 1) }}>
                              <Ic n="i-plus" />
                            </button>
                          ) : (
                            <span className="stepper v">
                              <button aria-label="再加一份" onClick={e => { flyHeart(e.currentTarget, false); setQty(d.id, q + 1) }}><Ic n="i-plus" /></button>
                              <span className="qty">{q}</span>
                              <button aria-label="减少一份" onClick={() => setQty(d.id, q - 1)}><Ic n="i-minus" /></button>
                            </span>
                          )}
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </main>

        <footer>
          <svg className="bunny" style={{ color: 'var(--pink)' }} aria-hidden="true"><use href="#i-bunny" /></svg>
          <div className="big display">龙餐馆 · 只为一个人营业</div>
          <div>今天也要吃饱饱，心情好好的。</div>
        </footer>
      </div>

      {/* ================= CART BAR ================= */}
      <div className={`cartbar${totalCount === 0 ? ' empty' : ''}`} ref={cartbarRef}>
        <button className="basket" ref={basketRef} onClick={openCart} aria-label="查看已点菜品">
          <Ic n="i-basket" />
          <span className={`count-badge${totalCount === 0 ? ' hidden' : ''}`}>{totalCount}</span>
        </button>
        <div className="cart-info">
          <div className="t1">{totalCount === 0 ? '还没点菜哦' : `已点 ${kindCount} 样 · 共 ${totalCount} 份`}</div>
          <div className="t2">{totalCount === 0 ? '挑几道喜欢的，大厨随时开火' : '合计：满满的爱（无价）'}</div>
        </div>
        <button className="go-btn" onClick={openCart}>去下单<Ic n="i-heart-solid" style={{ width: 15, height: 15 }} /></button>
      </div>

      {/* ================= CART SHEET ================= */}
      <div className={`overlay${cartOpen ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label="已点菜品" onClick={e => { if (e.target === e.currentTarget) setCartOpen(false) }}>
        <div className="sheet">
          <div className="sheet-head">
            <h2 className="display">我的菜单</h2>
            <button className="icon-btn" onClick={() => setCartOpen(false)} aria-label="关闭"><Ic n="i-close" /></button>
          </div>
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <svg className="bunny" style={{ color: 'var(--pink)' }}><use href="#i-bunny" /></svg>
              <div style={{ fontWeight: 800, fontSize: 16.5 }}>菜单还是空的</div>
              <div style={{ fontSize: 13.5, marginTop: 4 }}>去挑几道喜欢的菜吧，大厨等着开火呢</div>
            </div>
          ) : (
            <>
              {cartItems.map(i => (
                <div key={i.id} className="cart-row">
                  <img src={i.image} alt="" />
                  <div className="nm">
                    <div className="n">{i.name}</div>
                    <div className="d">爱心价 · 不定</div>
                  </div>
                  <span className="stepper">
                    <button aria-label="减少一份" onClick={() => setQty(i.id, i.qty - 1)}><Ic n="i-minus" /></button>
                    <span className="qty">{i.qty}</span>
                    <button aria-label="再加一份" onClick={e => { flyHeart(e.currentTarget, false); setQty(i.id, i.qty + 1) }}><Ic n="i-plus" /></button>
                  </span>
                </div>
              ))}
              <div className="total-line"><span>共 {totalCount} 份</span><span className="amt">合计：满满的爱（无价）</span></div>
              <label className="remark-label" htmlFor="remark">给大厨留句话</label>
              <textarea className="remark" id="remark" value={remark} onChange={e => setRemark(e.target.value)} placeholder="比如：少放辣、多加香菜、饭多盛一点……" />
              {err && <div style={{ color: '#e03131', fontSize: 13, marginTop: 8 }}>{err}</div>}
              <button className="order-btn" onClick={placeOrder} disabled={cartItems.length === 0 || placing}>
                <Ic n="i-flame" />{placing ? '下单中…' : '下单啦，让大厨开火'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ================= COOKING / DONE ================= */}
      <div className={`cook-overlay${cook ? ' open' : ''}${cook && cook.phase === 'done' ? ' done' : ''}`} role="dialog" aria-modal="true" aria-label="下单结果">
        <div className="cook-inner">
          <div className="cook-view">
            <h2 className="display">大厨上灶啦</h2>
            <div className="cook-frame">
              <div className={`cook-photo-clip${posterHidden ? ' playing' : ''}`}>
                <video
                  ref={videoRef}
                  className="cook-video"
                  src={VIDEO}
                  poster={POSTER}
                  muted
                  loop
                  playsInline
                  preload="auto"
                  onPlaying={onVideoPlaying}
                  aria-label="大厨戴着厨师帽在灶台前颠勺炒菜的视频"
                />
                <img className="cook-poster" src={POSTER} alt="" aria-hidden="true" />
              </div>
              <svg className="cook-deco d1" style={{ color: 'var(--pink-deep)' }} aria-hidden="true"><use href="#i-heart-solid" /></svg>
              <svg className="cook-deco d2" style={{ color: 'var(--gold)' }} aria-hidden="true"><use href="#i-star" /></svg>
              <svg className="cook-deco d3" style={{ color: 'var(--pink)' }} aria-hidden="true"><use href="#i-heart-solid" /></svg>
            </div>
            <p className="cook-caption display"><Ic n="i-flame" style={{ color: 'var(--gold)' }} />大厨正在火速烹饪<span className="cook-dots" aria-hidden="true"><i /><i /><i /></span></p>
            <p className="cook-tip">大厨做菜中，请稍等片刻，香味马上就来</p>
            <button className="cook-skip" onClick={showReceipt}>跳过动画，直接看小票</button>
          </div>

          <div className="done-view">
            <div className="done-badge"><Ic n="i-check" /></div>
            <h2 className="display">下单成功啦</h2>
            <p className="cook-status">订单已经送到大厨手里，开火做菜中</p>
            <div className="ticket">
              <div className="meta"><span>单号 · {cook ? cook.orderNo : ''}</span><span>下单时间 {cook ? cook.time : ''}</span></div>
              {cook && cook.items.map(i => (
                <div key={i.id} className="row"><span>{i.name}</span><span className="q">× {i.qty}</span></div>
              ))}
              <div className="row"><span>合计</span><span className="q">满满的爱（无价）</span></div>
              {cook && cook.remarkText && <div className="remark-show">给大厨的话：{cook.remarkText}</div>}
            </div>
            <div className="done-btns">
              <button className="btn-ghost" onClick={closeCook}>再点几个菜</button>
              <button className="btn-primary" onClick={closeCook}>好，等着吃</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
