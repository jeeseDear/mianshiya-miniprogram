/**
 * 题库 · 基础层：浏览器与网络 / 工程化
 * 约定：纯数据，不引入任何运行时依赖
 */

export const categories = [
	{
		id: 'browser',
		name: '浏览器与网络',
		short: '网络',
		icon: '🌐',
		bg: '#e9f3fd',
		desc: '渲染流程、HTTP 缓存、跨域、事件机制、TCP 与 HTTPS'
	},
	{
		id: 'build',
		name: '工程化',
		short: '构建',
		icon: '🧱',
		bg: '#f2eefc',
		desc: 'Webpack 与 Vite、Tree Shaking、HMR、包管理与 CI/CD'
	}
]

export const questions = [
	/* ------------------------------- 浏览器与网络 ------------------------------- */
	{
		id: 'browser-001',
		cat: 'browser',
		type: 'single',
		level: 1,
		hot: 96,
		source: '面试鸭精选',
		title: '浏览器输入 URL 到页面呈现，关键步骤的正确顺序是？',
		code: '',
		options: [
			{ key: 'A', text: 'DNS 解析 → TCP 握手 → 发请求收响应 → 解析 HTML 构建 DOM → 布局 → 绘制' },
			{ key: 'B', text: '解析 HTML → DNS 解析 → 绘制 → 布局' },
			{ key: 'C', text: 'TCP 握手 → DNS 解析 → 绘制 → 请求资源' },
			{ key: 'D', text: 'DNS 解析 → 布局 → 请求 → 构建 DOM' }
		],
		answer: ['A'],
		analysis:
			'完整链路：URL 解析 → 检查缓存 → DNS 解析域名 → 建立 TCP 连接（HTTPS 还要 TLS 握手）→ 发送 HTTP 请求 → 服务端响应 → 浏览器解析 HTML 构建 DOM，遇到 CSS/JS/图片再发起请求 → DOM 与 CSSOM 合成渲染树 → 布局计算位置尺寸 → 分层绘制 → 合成上屏。\n\n面试时能讲清「解析 HTML 时遇到 script 会阻塞、CSS 会阻塞渲染」这些细节，比背步骤更有说服力。'
	},
	{
		id: 'browser-002',
		cat: 'browser',
		type: 'single',
		level: 2,
		hot: 90,
		source: '面试鸭精选',
		title: '强缓存生效时，浏览器会？',
		code: '',
		options: [
			{ key: 'A', text: '不发送请求，直接用本地副本，状态码表现为 200 (from cache)' },
			{ key: 'B', text: '向服务端发请求并带上 If-Modified-Since' },
			{ key: 'C', text: '返回 304' },
			{ key: 'D', text: '强制刷新页面' }
		],
		answer: ['A'],
		analysis:
			'强缓存由 `Cache-Control`（max-age、public/private）和 `Expires` 控制，命中时浏览器直接读本地副本，网络面板显示 `200 (from disk cache)` 或 `from memory cache`。\n\n注意这是「不产生网络请求」的，所以状态码不是 304。304 属于协商缓存：浏览器带上 If-None-Match / If-Modified-Since 去问服务端，服务端确认没变才返回 304。Cache-Control 优先级高于 Expires。'
	},
	{
		id: 'browser-003',
		cat: 'browser',
		type: 'single',
		level: 2,
		hot: 86,
		source: '面试鸭精选',
		title: '协商缓存中，`ETag` 和 `Last-Modified` 的关系是？',
		code: '',
		options: [
			{ key: 'A', text: 'ETag 精度更高，优先级高于 Last-Modified' },
			{ key: 'B', text: 'Last-Modified 优先级更高' },
			{ key: 'C', text: '两者必须同时使用' },
			{ key: 'D', text: 'ETag 只能用于图片' }
		],
		answer: ['A'],
		analysis:
			'Last-Modified 以秒为单位，一秒内的多次修改无法区分，文件内容没变但修改时间变了也会失效。ETag 是内容指纹（哈希），精度更高。\n\n浏览器会同时带上 `If-None-Match` 和 `If-Modified-Since`，服务端优先校验 ETag。ETag 也分强校验和弱校验（W/ 前缀），分布式服务要注意多台机器生成的一致性。'
	},
	{
		id: 'browser-004',
		cat: 'browser',
		type: 'single',
		level: 2,
		hot: 84,
		source: '面试鸭精选',
		title: 'HTTP/2 相比 HTTP/1.1 的核心改进不包括？',
		code: '',
		options: [
			{ key: 'A', text: '多路复用，一个连接并发处理多个请求' },
			{ key: 'B', text: '头部压缩（HPACK）' },
			{ key: 'C', text: '二进制分帧' },
			{ key: 'D', text: '彻底解决了 TCP 层的队头阻塞' }
		],
		answer: ['D'],
		analysis:
			'HTTP/2 解决了 HTTP 层的队头阻塞（多个请求复用一个 TCP 连接并行传输），但底层 TCP 丢包时，后面的帧仍要等待重传，TCP 层队头阻塞依然存在。\n\n这正是 HTTP/3 改用 QUIC（基于 UDP）的动机。另外 HTTP/2 还支持服务端推送（实践中已被废弃）和流优先级。'
	},
	{
		id: 'browser-005',
		cat: 'browser',
		type: 'single',
		level: 3,
		hot: 72,
		source: '面试鸭精选',
		title: 'HTTP/3 选择基于 UDP 的 QUIC，主要原因是？',
		code: '',
		options: [
			{ key: 'A', text: 'UDP 更快所以不需要可靠性' },
			{ key: 'B', text: '在用户态实现可靠传输，避免 TCP 层队头阻塞，并支持连接迁移' },
			{ key: 'C', text: 'UDP 更省流量' },
			{ key: 'D', text: '为了解决跨域问题' }
		],
		answer: ['B'],
		analysis:
			'QUIC 在 UDP 之上自己实现了可靠传输、拥塞控制和加密（TLS 1.3 内建），单个流丢包只影响该流，不会阻塞其他流。\n\n另一个优势是连接迁移：用 Connection ID 标识连接，手机从 WiFi 切到 4G 时 IP 变了也不用重新握手。QUIC 在用户态实现，也更容易迭代升级。'
	},
	{
		id: 'browser-006',
		cat: 'browser',
		type: 'single',
		level: 2,
		hot: 88,
		source: '面试鸭精选',
		title: '关于 CORS 预检请求（OPTIONS），说法正确的是？',
		code: '',
		options: [
			{ key: 'A', text: '所有跨域请求都会先发预检' },
			{ key: 'B', text: '只有非简单请求（如自定义头、PUT/DELETE、application/json）才触发预检' },
			{ key: 'C', text: '预检请求由前端手动发起' },
			{ key: 'D', text: '预检失败不影响正式请求' }
		],
		answer: ['B'],
		analysis:
			'简单请求需同时满足：方法是 GET/POST/HEAD，头部只含安全列表内的字段，Content-Type 仅为 text/plain、multipart/form-data、application/x-www-form-urlencoded。只要有一条不满足，浏览器就会先发 OPTIONS 预检，服务端返回允许的方法、头部、来源后才发正式请求。\n\n可以用 `Access-Control-Max-Age` 缓存预检结果减少请求次数。预检失败则正式请求根本不会发出。'
	},
	{
		id: 'browser-007',
		cat: 'browser',
		type: 'single',
		level: 3,
		hot: 78,
		source: '面试鸭精选',
		title: 'Cookie 的 `SameSite=Lax` 意味着？',
		code: '',
		options: [
			{ key: 'A', text: '所有跨站请求都不带 Cookie' },
			{ key: 'B', text: '跨站的顶级导航 GET 请求会带 Cookie，其他跨站请求不带' },
			{ key: 'C', text: '只允许同站 POST 请求' },
			{ key: 'D', text: '等同 SameSite=None' }
		],
		answer: ['B'],
		analysis:
			'Lax 是大多数浏览器的默认值：从别的站点点击链接跳转过来（顶级导航、GET）会带上 Cookie，而跨站的 POST 表单、iframe、fetch/XHR、图片请求都不带。\n\nStrict 最严格，任何跨站请求都不带；None 必须同时设置 Secure（仅 HTTPS）。SameSite 是防御 CSRF 的重要手段，配合 HttpOnly 可进一步降低 XSS 窃取风险。'
	},
	{
		id: 'browser-008',
		cat: 'browser',
		type: 'single',
		level: 2,
		hot: 82,
		source: '面试鸭精选',
		title: 'DOM 事件流的三个阶段依次是？',
		code: '',
		options: [
			{ key: 'A', text: '捕获 → 目标 → 冒泡' },
			{ key: 'B', text: '冒泡 → 目标 → 捕获' },
			{ key: 'C', text: '目标 → 捕获 → 冒泡' },
			{ key: 'D', text: '只有冒泡阶段' }
		],
		answer: ['A'],
		analysis:
			'事件从 window 向下传递到目标元素是捕获阶段，到达目标元素是目标阶段，再从目标向上回传是冒泡阶段。\n\naddEventListener 第三个参数为 true（或 `{capture: true}`）时在捕获阶段触发，默认 false 即冒泡阶段。`stopPropagation` 阻止继续传播，`stopImmediatePropagation` 还会阻止同元素上的其他监听器。'
	},
	{
		id: 'browser-009',
		cat: 'browser',
		type: 'single',
		level: 2,
		hot: 80,
		source: '面试鸭精选',
		title: '事件委托的核心优势是？',
		code: '',
		options: [
			{ key: 'A', text: '利用冒泡把监听器挂在父元素上，减少监听器数量并支持动态元素' },
			{ key: 'B', text: '让事件不冒泡' },
			{ key: 'C', text: '提高单个事件的执行速度' },
			{ key: 'D', text: '可以替代所有 addEventListener' }
		],
		answer: ['A'],
		analysis:
			'在父容器上挂一个监听器，通过 `e.target` 判断实际点击的是哪个子元素。列表有 1000 项时只需 1 个监听器，新增项也不需要重新绑定。\n\n注意：不冒泡的事件（focus、blur 的早期行为、mouseenter、load）无法委托；`e.target` 可能是深层子节点，需要 closest 或逐层查找。'
	},
	{
		id: 'browser-010',
		cat: 'browser',
		type: 'single',
		level: 2,
		hot: 74,
		source: '面试鸭精选',
		title: '浏览器垃圾回收中，以下哪种引用会导致对象无法被回收？',
		code: '',
		options: [
			{ key: 'A', text: '被已移除 DOM 节点的事件监听器持有着' },
			{ key: 'B', text: '被 const 声明的局部变量持有，函数已执行完毕' },
			{ key: 'C', text: '在函数作用域内创建的临时对象' },
			{ key: 'D', text: '通过 let 声明且已离开作用域' }
		],
		answer: ['A'],
		analysis:
			'现代浏览器用标记清除算法，从根对象出发不可达的才会被回收。被移除的 DOM 节点如果仍被 JS 变量或监听器引用，就处在「游离树」中，无法回收。\n\n常见泄漏：全局变量缓存 DOM、未清理的定时器和事件监听、闭包长时间持有大对象、Map/Set 只增不减、WebSocket 未关闭。SPA 里组件卸载时务必解绑。'
	},
	{
		id: 'browser-011',
		cat: 'browser',
		type: 'single',
		level: 2,
		hot: 76,
		source: '面试鸭精选',
		title: 'WebSocket 和 SSE（Server-Sent Events）的关键区别是？',
		code: '',
		options: [
			{ key: 'A', text: 'WebSocket 是全双工，SSE 是服务端单向推送且基于 HTTP' },
			{ key: 'B', text: '两者都是全双工' },
			{ key: 'C', text: 'SSE 需要额外协议，WebSocket 不需要' },
			{ key: 'D', text: 'WebSocket 只能传文本' }
		],
		answer: ['A'],
		analysis:
			'WebSocket 通过一次 HTTP 升级握手建立独立的全双工长连接，双方都能随时发消息，适合聊天、协同编辑、游戏。\n\nSSE 就是普通 HTTP 长连接，服务端持续写 `text/event-stream`，只能服务端推、客户端收，实现简单、自动重连，适合消息通知、进度推送。SSE 在 HTTP/1.1 下有连接数限制（同域 6 个），HTTP/2 下没有这个问题。'
	},
	{
		id: 'browser-012',
		cat: 'browser',
		type: 'single',
		level: 3,
		hot: 70,
		source: '面试鸭精选',
		title: 'HTTPS 握手中，非对称加密和对称加密分别用来做什么？',
		code: '',
		options: [
			{ key: 'A', text: '非对称加密用于协商出对称密钥（并验证身份），对称加密用于后续数据传输' },
			{ key: 'B', text: '全程只用非对称加密' },
			{ key: 'C', text: '非对称加密用于传输数据，对称加密用于签名' },
			{ key: 'D', text: '两者可以互相替代' }
		],
		answer: ['A'],
		analysis:
			'非对称加密（RSA/ECDHE）计算昂贵，只用来安全地协商会话密钥、验证证书链身份；握手完成后用协商出的对称密钥（AES）加密业务数据，兼顾安全与性能。\n\nTLS 1.3 把握手压缩到 1-RTT（会话复用时甚至 0-RTT），并要求使用前向安全的 ECDHE。证书校验依赖 CA 的信任链，自签名证书不被信任就是这个原因。'
	},
	{
		id: 'browser-013',
		cat: 'browser',
		type: 'single',
		level: 1,
		hot: 68,
		source: '面试鸭精选',
		title: 'HTTP 状态码 301 和 302 的区别是？',
		code: '',
		options: [
			{ key: 'A', text: '301 是永久重定向（可被缓存），302 是临时重定向' },
			{ key: 'B', text: '301 是临时重定向' },
			{ key: 'C', text: '两者完全一样' },
			{ key: 'D', text: '302 表示资源不存在' }
		],
		answer: ['A'],
		analysis:
			'301 表示资源永久迁移，浏览器和搜索引擎会缓存并更新索引（比如 http 跳 https、域名更换）。302 表示临时跳转，每次都要重新请求原地址。\n\n还有 303（强制用 GET 访问新地址）、307（临时重定向且保持原方法）、308（永久重定向且保持原方法）。做表单提交后的跳转要注意 301/302 可能把 POST 变成 GET。'
	},
	{
		id: 'browser-014',
		cat: 'browser',
		type: 'single',
		level: 2,
		hot: 64,
		source: '面试鸭精选',
		title: '防止 XSS 最有效的手段是？',
		code: '',
		options: [
			{ key: 'A', text: '对用户输入做转义/净化，配合 CSP 限制脚本来源' },
			{ key: 'B', text: '前端校验输入长度' },
			{ key: 'C', text: '使用 HTTPS' },
			{ key: 'D', text: '把 Cookie 存在 localStorage' }
		],
		answer: ['A'],
		analysis:
			'XSS 的本质是把用户输入当成代码执行。防御要点：输出时按上下文转义（HTML、属性、JS、URL 各有规则），富文本用白名单净化；设置 CSP 禁止内联脚本和未知源；敏感 Cookie 加 HttpOnly。\n\nHTTPS 防的是传输窃听，对 XSS 无效。React/Vue 默认会转义插值，但 v-html、dangerouslySetInnerHTML 会绕过，要格外小心。'
	},
	{
		id: 'browser-015',
		cat: 'browser',
		type: 'multiple',
		level: 2,
		hot: 66,
		source: '面试鸭精选',
		title: '哪些措施可以有效防御 CSRF？',
		code: '',
		options: [
			{ key: 'A', text: '校验请求头中的 Origin / Referer' },
			{ key: 'B', text: '使用 CSRF Token 并服务端校验' },
			{ key: 'C', text: 'Cookie 设置 SameSite' },
			{ key: 'D', text: '对用户输入做 HTML 转义' }
		],
		answer: ['A', 'B', 'C'],
		analysis:
			'CSRF 利用的是「浏览器会自动带上 Cookie」，攻击者不需要读取响应，所以防御思路是确认请求确实来自本站：校验 Origin/Referer、使用一次性 Token、用 SameSite 限制跨站携带 Cookie。\n\nHTML 转义是防 XSS 的，对 CSRF 没有作用。另外把敏感操作改成 POST 并校验自定义头也能提高门槛（自定义头会触发预检）。'
	},

	/* -------------------------------- 工程化 -------------------------------- */
	{
		id: 'build-001',
		cat: 'build',
		type: 'single',
		level: 2,
		hot: 88,
		source: '面试鸭精选',
		title: 'Webpack 的构建流程大致是？',
		code: '',
		options: [
			{ key: 'A', text: '初始化参数 → 启动编译 → 从入口递归解析依赖 → 生成 chunk → 输出文件' },
			{ key: 'B', text: '先输出文件再解析依赖' },
			{ key: 'C', text: '只做语法检查，不处理依赖' },
			{ key: 'D', text: '直接运行源码' }
		],
		answer: ['A'],
		analysis:
			'完整流程：读取配置初始化 Compiler → 执行插件（apply）→ 从 entry 开始，用 loader 转换模块，解析 import/require 递归构建依赖图 → 按规则生成 chunk → 用模板渲染成最终产物写入 output。\n\n核心概念：Compiler 代表整个构建实例，Compilation 代表一次编译；loader 处理单个文件转换，plugin 通过钩子介入整个生命周期。'
	},
	{
		id: 'build-002',
		cat: 'build',
		type: 'single',
		level: 2,
		hot: 86,
		source: '面试鸭精选',
		title: 'loader 和 plugin 的区别是？',
		code: '',
		options: [
			{ key: 'A', text: 'loader 转换单个模块文件，plugin 通过钩子介入构建全流程' },
			{ key: 'B', text: '两者完全等价' },
			{ key: 'C', text: 'plugin 只能处理 CSS' },
			{ key: 'D', text: 'loader 可以修改输出目录' }
		],
		answer: ['A'],
		analysis:
			'loader 是「文件级转换器」，输入源码字符串（或 Buffer），输出转换后的内容，职责单一、可链式组合（从右到左执行）：babel-loader、css-loader、file-loader。\n\nplugin 是「流程扩展器」，通过 tapable 钩子挂到编译生命周期的任意节点：HtmlWebpackPlugin 生成 HTML、MiniCssExtractPlugin 抽离 CSS、DefinePlugin 注入变量。'
	},
	{
		id: 'build-003',
		cat: 'build',
		type: 'single',
		level: 2,
		hot: 82,
		source: '面试鸭精选',
		title: 'Tree Shaking 生效的前提条件不包括？',
		code: '',
		options: [
			{ key: 'A', text: '使用 ES Module 的静态导入导出' },
			{ key: 'B', text: '生产模式下开启压缩（标记未使用代码）' },
			{ key: 'C', text: '代码没有副作用，或在 sideEffects 中正确声明' },
			{ key: 'D', text: '必须使用 CommonJS 的 require' }
		],
		answer: ['D'],
		analysis:
			'Tree Shaking 依赖 ESM 的静态结构：编译期就能确定哪些导出被使用，再结合 terser 的 dead code elimination 删掉未引用代码。\n\nCommonJS 是动态的，依赖运行时才能确定，无法可靠摇树。另外如果模块有副作用（如立即执行的 polyfill、注册全局），需要在 package.json 的 sideEffects 里声明，否则可能被误删或无法删除。'
	},
	{
		id: 'build-004',
		cat: 'build',
		type: 'single',
		level: 2,
		hot: 80,
		source: '面试鸭精选',
		title: '路由级代码分割（code splitting）的主要收益是？',
		code: '',
		options: [
			{ key: 'A', text: '减小首屏包体积，按需加载后续页面' },
			{ key: 'B', text: '减少 HTTP 请求总数' },
			{ key: 'C', text: '让代码更难维护' },
			{ key: 'D', text: '提升服务端渲染速度' }
		],
		answer: ['A'],
		analysis:
			'用动态 import() 把每个路由拆成独立 chunk，首屏只加载当前路由所需代码，其余在跳转时按需拉取。\n\n这会增加请求数，但在 HTTP/2 下影响很小。配合预加载（prefetch/preload）、合理的 chunk 拆分粒度（vendor 抽公共依赖）效果更好。拆得太碎反而会增加请求和缓存失效概率。'
	},
	{
		id: 'build-005',
		cat: 'build',
		type: 'single',
		level: 2,
		hot: 90,
		source: '面试鸭精选',
		title: 'Vite 开发环境启动快，核心原因是？',
		code: '',
		options: [
			{ key: 'A', text: '开发时不打包，利用浏览器原生 ESM 按需编译，并借助 esbuild 预构建依赖' },
			{ key: 'B', text: '使用了更快的硬盘' },
			{ key: 'C', text: '跳过了语法检查' },
			{ key: 'D', text: '把所有代码内联成一个文件' }
		],
		answer: ['A'],
		analysis:
			'传统打包器启动时要先遍历整个依赖图并打包，项目越大越慢。Vite 开发服务器直接以原生 ESM 提供源码，浏览器请求到哪个模块才编译哪个，做到「按需编译」。\n\n第三方依赖用 esbuild 预构建成单个 ESM 文件，顺带处理 CJS 转换，避免大量小请求。生产构建仍用 Rollup（新版可选 Rolldown）以保证产物质量。'
	},
	{
		id: 'build-006',
		cat: 'build',
		type: 'single',
		level: 2,
		hot: 74,
		source: '面试鸭精选',
		title: 'HMR（热更新）相比 Live Reload 的关键优势是？',
		code: '',
		options: [
			{ key: 'A', text: '只替换变更的模块，保留页面状态' },
			{ key: 'B', text: '刷新速度更快' },
			{ key: 'C', text: '不需要浏览器' },
			{ key: 'D', text: '自动修复代码错误' }
		],
		answer: ['A'],
		analysis:
			'Live Reload 是整页刷新，表单内容、滚动位置、组件状态全部丢失。HMR 通过 websocket 通知浏览器，只替换发生变化的模块并重新执行，页面状态得以保留。\n\n实现依赖模块的 accept 逻辑：Vue/React 的 loader 会生成热替换代码，模块无法热替换时向上冒泡，最终才降级为整页刷新。'
	},
	{
		id: 'build-007',
		cat: 'build',
		type: 'single',
		level: 3,
		hot: 70,
		source: '面试鸭精选',
		title: 'Babel 的工作流程是？',
		code: '',
		options: [
			{ key: 'A', text: '解析成 AST → 遍历转换 AST → 生成新代码' },
			{ key: 'B', text: '直接做字符串替换' },
			{ key: 'C', text: '先压缩再解析' },
			{ key: 'D', text: '只做类型检查' }
		],
		answer: ['A'],
		analysis:
			'parse（词法+语法分析生成 AST）→ transform（用插件遍历 visitor 修改节点）→ generate（把 AST 还原成代码并生成 sourcemap）。\n\npreset 是插件的集合，@babel/preset-env 会根据 targets 和 browserslist 决定需要哪些转换，配合 core-js 按需注入 polyfill。Babel 只做语法转换，不做类型检查（那是 tsc 的职责）。'
	},
	{
		id: 'build-008',
		cat: 'build',
		type: 'single',
		level: 2,
		hot: 66,
		source: '面试鸭精选',
		title: '生产环境通常不生成 sourcemap 的原因是？',
		code: '',
		options: [
			{ key: 'A', text: '避免源码泄露，同时减小产物体积' },
			{ key: 'B', text: 'sourcemap 会导致代码无法运行' },
			{ key: 'C', text: '浏览器不支持 sourcemap' },
			{ key: 'D', text: 'sourcemap 会拖慢请求速度到不可用' }
		],
		answer: ['A'],
		analysis:
			'完整的 sourcemap 包含原始源码，公开部署等于把业务代码送人。常见做法是生成 `hidden-source-map` 上传到监控平台（如 Sentry），不随产物发布。\n\n也可以只在内部环境开启。sourcemap 只在打开开发者工具时才下载，对普通用户性能影响很小，主要顾虑是安全和体积。'
	},
	{
		id: 'build-009',
		cat: 'build',
		type: 'single',
		level: 2,
		hot: 78,
		source: '面试鸭精选',
		title: '文件名带 contenthash 的作用是？',
		code: '',
		options: [
			{ key: 'A', text: '内容变化才换文件名，从而利用浏览器长缓存' },
			{ key: 'B', text: '防止代码被抄袭' },
			{ key: 'C', text: '减小文件体积' },
			{ key: 'D', text: '提升压缩率' }
		],
		answer: ['A'],
		analysis:
			'配合 `Cache-Control: max-age=31536000, immutable`，文件名不变就一直命中强缓存，文件内容变了 hash 变化自然请求新文件。\n\nchunkhash 按 chunk 内容算，contenthash 按文件内容算（CSS 抽离后更准确）。要注意 runtime 代码变化可能导致无关 chunk 的 hash 变动，需用 runtimeChunk 单独拆分。'
	},
	{
		id: 'build-010',
		cat: 'build',
		type: 'single',
		level: 1,
		hot: 62,
		source: '面试鸭精选',
		title: '`^1.2.3` 这个版本范围表示？',
		code: '',
		options: [
			{ key: 'A', text: '允许升级到 1.x.x 的最新版，不改变主版本号' },
			{ key: 'B', text: '锁定 1.2.3 不变' },
			{ key: 'C', text: '允许升级到任意最新版' },
			{ key: 'D', text: '允许升级到 1.2.x' }
		],
		answer: ['A'],
		analysis:
			'语义化版本 MAJOR.MINOR.PATCH：^ 允许 MINOR 和 PATCH 升级（^1.2.3 → 1.x.x），~ 只允许 PATCH 升级（~1.2.3 → 1.2.x），不带符号则精确锁定。\n\n按 semver 约定，MAJOR 变更代表不兼容改动。但现实中有库不遵守，所以生产环境仍要靠 lock 文件兜底。'
	},
	{
		id: 'build-011',
		cat: 'build',
		type: 'single',
		level: 2,
		hot: 60,
		source: '面试鸭精选',
		title: 'pnpm 相比 npm 最大的差异是？',
		code: '',
		options: [
			{ key: 'A', text: '用内容寻址的全局仓库 + 硬链接，天然避免依赖重复安装和幽灵依赖' },
			{ key: 'B', text: '不支持 workspace' },
			{ key: 'C', text: '安装速度更慢但更稳定' },
			{ key: 'D', text: '不能使用 lock 文件' }
		],
		answer: ['A'],
		analysis:
			'pnpm 把所有包按内容哈希存到全局 store，项目里通过硬链接引用，同一版本磁盘只存一份。node_modules 采用符号链接的严格结构，包只能访问自己声明的依赖，避免了 npm 扁平化带来的「幽灵依赖」（用了没装的包也能跑）。\n\n它原生支持 monorepo workspace，安装速度和磁盘占用通常都优于 npm/yarn。'
	},
	{
		id: 'build-012',
		cat: 'build',
		type: 'single',
		level: 2,
		hot: 58,
		source: '面试鸭精选',
		title: 'monorepo 的主要挑战是？',
		code: '',
		options: [
			{ key: 'A', text: '依赖版本统一、构建编排和 CI 增量构建的复杂度上升' },
			{ key: 'B', text: '无法共享代码' },
			{ key: 'C', text: '不能使用 Git' },
			{ key: 'D', text: '包体积必然变大' }
		],
		answer: ['A'],
		analysis:
			'monorepo 把多个包放在一个仓库，代码复用和原子提交很方便，但带来几个问题：不同包对同一依赖的版本需要协调（peerDependencies 冲突）、要按依赖拓扑排序构建、CI 需要只构建受影响的包（turbo、nx 这类工具解决）。\n\n仓库体积和权限管理也是成本，团队规模小时收益有限。'
	},
	{
		id: 'build-013',
		cat: 'build',
		type: 'single',
		level: 1,
		hot: 56,
		source: '面试鸭精选',
		title: 'ESLint 和 Prettier 的职责分别是？',
		code: '',
		options: [
			{ key: 'A', text: 'ESLint 管代码质量和潜在错误，Prettier 管格式风格' },
			{ key: 'B', text: '两者都只管格式' },
			{ key: 'C', text: 'Prettier 负责类型检查' },
			{ key: 'D', text: 'ESLint 负责压缩代码' }
		],
		answer: ['A'],
		analysis:
			'ESLint 做静态分析，检查未使用变量、可能的空指针、危险的写法，部分规则可以自动修复。Prettier 只关心排版（缩进、引号、换行），不做语义判断。\n\n两者职责不同，最佳实践是让 Prettier 负责格式、关闭 ESLint 中所有与格式冲突的规则（eslint-config-prettier），并配合 husky + lint-staged 在提交前自动执行。'
	},
	{
		id: 'build-014',
		cat: 'build',
		type: 'single',
		level: 2,
		hot: 54,
		source: '面试鸭精选',
		title: '`git rebase` 与 `git merge` 的核心区别是？',
		code: '',
		options: [
			{ key: 'A', text: 'rebase 把提交重新应用到目标分支末尾，历史线性；merge 生成合并节点，保留分叉' },
			{ key: 'B', text: 'rebase 会删除代码' },
			{ key: 'C', text: 'merge 不能处理冲突' },
			{ key: 'D', text: '两者完全等价' }
		],
		answer: ['A'],
		analysis:
			'rebase 会改写提交哈希，得到干净的一条直线，适合本地提交在推送前整理；merge 保留真实的合并历史，适合公共分支。\n\n铁律：不要对已经推送到共享分支的提交做 rebase，否则会破坏别人的历史。冲突处理上，rebase 需要逐个提交解决，merge 一次性解决。'
	},
	{
		id: 'build-015',
		cat: 'build',
		type: 'multiple',
		level: 3,
		hot: 52,
		source: '面试鸭精选',
		title: '微前端方案（如 qiankun）需要重点解决的问题包括？',
		code: '',
		options: [
			{ key: 'A', text: 'JS 与 CSS 的样式隔离' },
			{ key: 'B', text: '子应用的路由与主应用路由协同' },
			{ key: 'C', text: '公共依赖共享与沙箱隔离' },
			{ key: 'D', text: '让所有子应用使用同一个框架版本' }
		],
		answer: ['A', 'B', 'C'],
		analysis:
			'微前端要解决样式污染（Shadow DOM 或 scoped 前缀）、路由冲突（activeRule 匹配与基座路由）、JS 全局变量污染（Proxy 沙箱）、公共依赖重复加载（externals 或模块联邦）。\n\n它并不要求所有子应用统一框架版本，恰恰相反——技术栈无关才是微前端的价值之一，代价是包体积和调试复杂度上升。'
	}
]
