/**
 * 题库 · 浏览器与网络补充（browser-016 ~ browser-050）
 */

import { makeQuestions } from './helper.js'

export const questions = makeQuestions('browser', [
	['016', 2, 94, '从输入 URL 到页面展示，正确的顺序是？', [
		'DNS 解析 → TCP 握手 → TLS 握手（HTTPS）→ 发送请求 → 接收响应 → 解析构建 DOM/CSSOM → 布局 → 绘制',
		'直接解析 HTML → 请求资源 → 布局',
		'TCP 握手 → DNS 解析 → 渲染',
		'先执行 JS 再请求 HTML'
	], ['A'], '完整链路：URL 解析与缓存检查 → DNS 解析 → TCP 三次握手 → TLS 握手（HTTPS）→ 发送 HTTP 请求 → 服务端处理返回 → 浏览器解析 HTML 构建 DOM、加载 CSS 构建 CSSOM → 合成渲染树 → 布局（layout）→ 绘制（paint）→ 合成（composite）。\n\n期间遇到 script 会阻塞解析（defer/async 例外），遇到 img 等资源则并行下载。'],

	['017', 2, 90, '下列哪个操作只会触发重绘而不会重排？', [
		'修改 `color` 或 `background-color`',
		'修改 `width`',
		'修改 `font-size`',
		'增删 DOM 节点'
	], ['A'], '颜色类属性不影响几何布局，只触发重绘（repaint）；宽高、字体、位置、内外边距等会影响布局，触发重排（reflow），代价更高。\n\ntransform 与 opacity 的改动可以只走合成层，是动画首选。'],

	['018', 2, 88, '强缓存由哪些响应头控制？', [
		'`Cache-Control: max-age` 与 `Expires`，其中 Cache-Control 优先级更高',
		'`ETag` 与 `Last-Modified`',
		'`Content-Encoding`',
		'`Access-Control-Max-Age`'
	], ['A'], '强缓存命中时浏览器完全不发请求，直接用本地副本；Expires 是绝对时间且依赖客户端时钟，max-age 是相对秒数更可靠。\n\nETag/Last-Modified 属于协商缓存，需要向服务器验证（304）。'],

	['019', 2, 86, '协商缓存中 `ETag` 相比 `Last-Modified` 的优势是？', [
		'基于内容指纹，能识别「时间变了但内容没变」或秒级内的多次修改',
		'ETag 体积更小',
		'ETag 不需要请求服务器',
		'ETag 可以替代强缓存'
	], ['A'], 'Last-Modified 精度只到秒，且文件被 touch 后内容未变也会失效；ETag 用内容哈希精确判断。\n\n代价是服务端要计算哈希，且集群部署需保证算法一致，否则各节点 ETag 不同导致反复回源。'],

	['020', 2, 86, 'HTTP/2 相比 HTTP/1.1 的核心改进，不包括？', [
		'多路复用，一个连接并发处理多个请求',
		'头部压缩（HPACK）',
		'服务端推送与二进制分帧',
		'彻底消除了队头阻塞（包括 TCP 层）'
	], ['D'], 'HTTP/2 解决了 HTTP 层的队头阻塞，但底层仍是 TCP，丢包时所有流一起等待。HTTP/3 改用 QUIC（基于 UDP）才真正缓解传输层队头阻塞。\n\n另外 HTTP/2 不再需要域名分片，反而应该合并域名以复用连接。'],

	['021', 3, 78, 'HTTP/3 基于 QUIC 带来的主要好处是？', [
		'0-RTT/1-RTT 建连、基于 UDP 避免 TCP 层队头阻塞、连接迁移',
		'完全不需要 TLS',
		'不使用头部压缩',
		'只能用于内网'
	], ['A'], 'QUIC 把传输与加密合并，握手更快（支持 0-RTT 恢复），每个流独立重传避免互相拖累，还用连接 ID 支持网络切换（Wi-Fi 转 4G）时保持连接。\n\n它依赖 UDP，部分企业网络会拦截，需要回退机制。'],

	['022', 3, 82, 'HTTPS 握手中非对称加密的作用是？', [
		'安全地协商出对称密钥并验证服务端身份，后续数据用对称加密传输',
		'加密全部业务数据',
		'压缩传输内容',
		'防止 DNS 劫持'
	], ['A'], '非对称加密（RSA/ECDHE）开销大，只用于握手阶段完成密钥交换与证书验证；真正传输用对称加密（AES-GCM/ChaCha20），兼顾安全与性能。\n\n证书链校验依赖 CA 体系，防止中间人伪造。'],

	['023', 1, 92, '浏览器同源策略中的「同源」指？', [
		'协议、域名、端口三者完全相同',
		'域名相同即可',
		'IP 相同即可',
		'只要都是 http 就同源'
	], ['A'], 'https://a.com 与 http://a.com 不同源（协议不同），a.com 与 a.com:8080 不同源（端口不同），www.a.com 与 a.com 不同源（子域不同）。\n\n同源策略限制的是读取响应与操作 DOM，不是「不能发请求」——请求可以发出，只是响应被拦截。'],

	['024', 2, 76, 'JSONP 能绕过跨域限制的原理是？', [
		'利用 script 标签不受同源策略限制，服务端返回可执行的函数调用',
		'利用 fetch 的 no-cors 模式',
		'通过 iframe 通信',
		'利用 Cookie 自动携带'
	], ['A'], 'JSONP 动态插入 script，src 指向接口并带上 callback 参数，服务端返回 `callback({...})` 由浏览器执行。\n\n它只支持 GET、无法感知 HTTP 状态码、有 XSS 风险，现代一律用 CORS。'],

	['025', 2, 86, '什么样的请求会触发 CORS 预检（OPTIONS）？', [
		'非简单方法（PUT/DELETE 等）或带有自定义请求头、非简单 Content-Type',
		'所有跨域请求都会预检',
		'只有 GET 会预检',
		'只有携带 Cookie 才预检'
	], ['A'], '简单请求限于 GET/HEAD/POST + 安全头 + Content-Type 为 text/plain、multipart/form-data、application/x-www-form-urlencoded。\n\n一旦用到 application/json 或自定义头（如 Authorization），就需要预检，服务端要正确响应 Allow-Methods/Allow-Headers。'],

	['026', 3, 78, '跨域请求需要携带 Cookie 时，必须满足？', [
		'前端设置 credentials: "include"，服务端返回具体 Origin 且 Allow-Credentials: true',
		'服务端设置 Allow-Origin: * 即可',
		'只需要设置 SameSite=None',
		'不需要任何额外配置'
	], ['A'], '带凭证时 `Access-Control-Allow-Origin: *` 是无效的，必须回显请求的具体来源；同时 Cookie 自身要满足 SameSite=None + Secure（跨站场景）。\n\nfetch 用 credentials: "include"，axios 用 withCredentials: true。'],

	['027', 2, 90, '防御 XSS 最根本的手段是？', [
		'对用户输入做转义/过滤，输出到 HTML 时按上下文编码，配合 CSP',
		'禁用 Cookie',
		'使用 HTTPS',
		'给接口加签名'
	], ['A'], 'XSS 的本质是用户内容被当成代码执行。防护分三层：输入校验与白名单、按输出上下文编码（HTML/属性/JS/URL 各不相同）、CSP 限制脚本来源。\n\nCookie 设置 HttpOnly 只能降低 token 被窃取的损失，不能阻止 XSS 本身。'],

	['028', 2, 84, '防御 CSRF 的常用手段，不包括？', [
		'使用 SameSite Cookie',
		'校验 Origin/Referer',
		'使用一次性 CSRF Token',
		'对响应内容做 HTML 转义'
	], ['D'], 'CSRF 是「借用用户身份发请求」，防护要确认请求来自自家页面：SameSite 限制跨站携带 Cookie、校验 Origin、使用随机 token（或双提交 Cookie）。\n\nHTML 转义是防 XSS 的手段，和 CSRF 无关。'],

	['029', 3, 74, 'CSP（内容安全策略）的主要作用是？', [
		'通过响应头限制脚本、样式、图片等资源的可加载来源，缓解 XSS',
		'加密传输内容',
		'压缩响应体',
		'设置缓存策略'
	], ['A'], 'CSP 用白名单限制 script-src、img-src 等，还能禁用内联脚本与 eval，是 XSS 的最后一道防线。\n\n上线建议先用 Content-Security-Policy-Report-Only 收集违规报告，再切换为强制执行。'],

	['030', 2, 72, 'localStorage 的隔离范围是？', [
		'按「源」隔离（协议 + 域名 + 端口），同源页面共享',
		'按标签页隔离',
		'按浏览器会话隔离',
		'全局共享，无隔离'
	], ['A'], '同源的所有标签页共享同一份 localStorage，不同源完全隔离；它没有过期时间，需要手动清理。\n\nsessionStorage 则是按标签页隔离，关闭标签页即清空。'],

	['031', 3, 76, 'Service Worker 的特点是？', [
		'独立于页面的后台线程，可拦截网络请求实现离线缓存与推送',
		'直接操作 DOM',
		'随页面关闭而销毁',
		'只能缓存图片'
	], ['A'], 'Service Worker 运行在独立线程，通过事件（install/activate/fetch）工作，必须先注册再接管页面，且只在 HTTPS（或 localhost）下可用。\n\n它不能访问 DOM，与页面通过 postMessage 通信。'],

	['032', 2, 78, 'Web Worker 的作用是？', [
		'在后台线程执行脚本，避免大量计算阻塞主线程',
		'直接操作 DOM',
		'替代 Service Worker',
		'实现跨域请求'
	], ['A'], 'Worker 有独立的事件循环，通过 postMessage 传递数据（结构化克隆），不能访问 DOM 与 window。\n\n可用 SharedArrayBuffer 或 Transferable 减少大数据的复制开销。'],

	['033', 2, 80, '`requestAnimationFrame` 相比 `setTimeout` 的优势是？', [
		'与浏览器刷新节奏对齐（通常 60Hz），页面不可见时自动暂停',
		'定时更精确到毫秒',
		'可以在后台线程执行',
		'会自动清理定时器'
	], ['A'], 'rAF 回调在每帧绘制前执行，避免因定时器与刷新不同步造成的抖动与丢帧；标签页切到后台时会暂停，节省资源。\n\n做动画应该用它而非 setTimeout/setInterval。'],

	['034', 2, 86, 'DOM 事件流的三个阶段依次是？', [
		'捕获阶段 → 目标阶段 → 冒泡阶段',
		'冒泡 → 捕获 → 目标',
		'目标 → 捕获 → 冒泡',
		'只有冒泡阶段'
	], ['A'], '事件从 window 向下捕获到目标（capture），再向上冒泡（bubble）；addEventListener 第三个参数为 true 时在捕获阶段触发。\n\n`stopPropagation` 阻止继续传播，`stopImmediatePropagation` 还会阻止同元素的其他监听器。'],

	['035', 2, 82, '事件委托的核心原理是？', [
		'利用冒泡，把监听器挂在父元素上，通过 event.target 判断来源',
		'给每个子元素都绑定监听器',
		'使用捕获阶段阻止冒泡',
		'用 CSS 的 pointer-events 实现'
	], ['A'], '父级统一监听，减少监听器数量，且动态新增的子元素自动生效，适合长列表与频繁增删的场景。\n\n注意 target 可能是子节点内部的元素，需要 closest 向上查找。'],

	['036', 2, 74, 'HTTP/1.1 下浏览器对同一域名通常限制几个并发连接？', [
		'6 个左右',
		'1 个',
		'32 个',
		'没有限制'
	], ['A'], '主流浏览器对同一源的并发连接数约为 6 个，超出会排队，因此旧方案用域名分片绕开；HTTP/2 多路复用后不再需要。\n\n这也解释了为什么首屏资源不宜过多。'],

	['037', 2, 72, 'DNS 解析的过程大致是？', [
		'浏览器缓存 → 系统缓存/hosts → 本地 DNS 服务器 → 根/顶级/权威域名服务器逐级查询',
		'直接连接目标 IP',
		'只查一次本地 hosts 文件',
		'通过 HTTP 请求查询'
	], ['A'], '解析按缓存优先级逐层向上，最终由权威服务器返回 A/AAAA 记录并逐级缓存（TTL 控制）。\n\n优化手段包括 dns-prefetch、减少域名数量、使用 HTTPDNS 防劫持。'],

	['038', 3, 78, 'TCP 三次握手的目的是？', [
		'确认双方的收发能力都正常，并同步初始序列号',
		'加密传输内容',
		'压缩数据',
		'分配域名'
	], ['A'], 'SYN → SYN+ACK → ACK 三步让双方都确认「我能发、你能收、你能发、我能收」，并交换 ISN 以便可靠传输。\n\n两次握手无法确认客户端接收能力，还可能因历史连接请求导致错误建连。'],

	['039', 2, 70, 'HTTP 的 `Connection: keep-alive` 作用是？', [
		'复用 TCP 连接处理后续请求，减少握手开销',
		'保持登录状态',
		'启用长轮询',
		'开启压缩传输'
	], ['A'], 'HTTP/1.1 默认持久连接，一个 TCP 连接可串行处理多个请求，省掉重复握手；但仍有队头阻塞。\n\nHTTP/2 的复用粒度更细，多路并发。'],

	['040', 2, 76, 'Cookie 与 Session 的关系是？', [
		'Session 数据存在服务端，Cookie 只保存 Session ID 用于关联',
		'Session 数据存在客户端',
		'两者完全等价',
		'Cookie 必须存完整用户信息'
	], ['A'], 'Session 是把状态放服务端的方案，客户端仅持有不透明 ID，安全性更好但需要服务端存储（集群需共享）。\n\n无状态方案是签名 token（JWT），把信息放客户端并用签名防篡改，代价是难以主动失效。'],

	['041', 3, 72, 'WebSocket 建立连接的握手方式是？', [
		'通过 HTTP Upgrade 请求切换协议（101 Switching Protocols）',
		'直接建立 UDP 连接',
		'用长轮询模拟',
		'通过 DNS 特殊记录'
	], ['A'], '客户端发送带 Upgrade: websocket 与 Sec-WebSocket-Key 的 HTTP 请求，服务端返回 101 后切换为全双工帧协议，此后不再是 HTTP。\n\n它适合聊天、协同编辑、实时行情等双向高频场景。'],

	['042', 2, 68, 'SSE（Server-Sent Events）的特点是？', [
		'基于 HTTP 的单向服务端推送，自动重连，文本协议',
		'支持双向通信',
		'基于 UDP',
		'需要额外握手协议'
	], ['A'], 'SSE 用 `text/event-stream` 持续推送，浏览器 EventSource 会自动重连并支持 Last-Event-ID 续传，实现比 WebSocket 简单。\n\n只支持服务端到客户端的单向流，适合通知、进度、AI 流式输出。'],

	['043', 2, 78, 'LCP（Largest Contentful Paint）衡量的是？', [
		'视口内最大内容元素完成渲染的时间，反映加载性能',
		'首次输入延迟',
		'布局偏移量',
		'页面总加载时间'
	], ['A'], '核心指标：LCP 看加载（应 < 2.5s）、INP 看交互响应（< 200ms）、CLS 看视觉稳定性（< 0.1）。\n\n优化 LCP 的关键是首屏主图/标题的加载速度：预加载、压缩图片、减少阻塞资源。'],

	['044', 2, 76, '下列哪项对首屏速度帮助最小？', [
		'把首屏用不到的组件也提前同步加载',
		'路由懒加载与代码分割',
		'关键 CSS 内联、非关键 CSS 异步加载',
		'图片压缩并使用合适尺寸'
	], ['A'], '首屏优化思路是「减少关键路径上的字节数与请求数」：拆分代码只加载首屏所需、内联关键 CSS、压缩图片、预连接关键域名。\n\n提前同步加载非首屏资源只会拖慢首屏。'],

	['045', 2, 70, '图片懒加载常用的 API 是？', [
		'IntersectionObserver 监听元素是否进入视口',
		'setTimeout 轮询位置',
		'getBoundingClientRect 在 scroll 里高频调用',
		'MutationObserver'
	], ['A'], 'IntersectionObserver 由浏览器异步计算交叉状态，避免 scroll 事件里的高频布局计算，性能远好于手动 getBoundingClientRect。\n\n现代也可直接用 `<img loading="lazy">`。'],

	['046', 2, 74, 'hash 路由与 history 路由的区别是？', [
		'hash 改变 # 后内容不请求服务器；history 用 pushState 修改路径，刷新需要服务端回退到 index.html',
		'history 兼容性更好',
		'hash 会触发整页刷新',
		'两者完全一样'
	], ['A'], 'hash 的变化不进入网络请求，天然不会 404；history 路径更美观、利于 SEO，但部署必须配置 fallback（如 Nginx try_files）。\n\nhistory 的 pushState 不刷新页面，前进后退触发 popstate。'],

	['047', 2, 72, '多个标签页之间同步登录状态，可以用？', [
		'监听 `window` 的 `storage` 事件（同源其他标签页写入 localStorage 时触发）',
		'监听 click 事件',
		'用 setInterval 轮询 Cookie',
		'用 CSS 变量传递'
	], ['A'], 'storage 事件只在本标签页「之外」的同源页面触发，正好用于跨标签同步；也可用 BroadcastChannel 做更灵活的消息通信。\n\n注意 storage 事件不携带具体写入来源标签信息。'],

	['048', 2, 70, '页面从可见切到后台，可靠的事件是？', [
		'`document.visibilityState` 配合 `visibilitychange`',
		'window.onblur 一定可靠',
		'beforeunload',
		'resize'
	], ['A'], 'visibilitychange 在标签页切换、最小化、锁屏时都会触发，比 blur/focus 更准确，常用于暂停动画、定时器与视频。\n\n页面卸载前的数据上报可用 navigator.sendBeacon 保证送达。'],

	['049', 2, 66, '`navigator.sendBeacon` 的适用场景是？', [
		'页面卸载时异步上报统计数据，不阻塞跳转',
		'上传大文件',
		'下载文件',
		'建立 WebSocket'
	], ['A'], 'sendBeacon 把请求交给浏览器在后台发送，即使页面关闭也能完成，避免了同步 XHR 阻塞卸载。\n\n它有体积限制（约 64KB），只适合小数据埋点。'],

	['050', 2, 74, '浏览器中 JS 主线程与渲染的关系是？', [
		'JS 执行与样式计算、布局、绘制共用主线程，长任务会阻塞渲染',
		'JS 在独立线程，永远不阻塞渲染',
		'渲染在 GPU 完成，与 JS 无关',
		'每个标签页有独立的渲染线程，互不影响'
	], ['A'], '主线程要串行处理 JS、样式、布局与绘制，一个长任务就会让页面卡住、输入无响应。\n\n所以要把重计算放进 Worker、把长任务切片，并避免频繁的强制同步布局。']
])
