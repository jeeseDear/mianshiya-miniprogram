/**
 * 题库 · Node.js 补充（node-016 ~ node-050）
 */

import { makeQuestions } from './helper.js'

export const questions = makeQuestions('node', [
	['016', 3, 86, 'Node.js 事件循环中，timer 阶段与 poll 阶段的顺序是？', [
		'一次循环依次经过 timers → pending callbacks → poll → check → close callbacks',
		'先执行 check 再执行 timers',
		'poll 阶段在所有阶段之前',
		'只有 timers 和 close 两个阶段'
	], ['A'], '规范顺序：timers（setTimeout/setInterval）→ pending callbacks → idle/prepare → poll（等待 IO）→ check（setImmediate）→ close callbacks，每阶段之间清空微任务队列。\n\npoll 阶段会阻塞等待 IO 事件，是耗时最长的一环。'],

	['017', 3, 88, '`process.nextTick` 与 `setImmediate` 的区别是？', [
		'nextTick 在当前操作结束后、进入下一阶段前执行；setImmediate 在 check 阶段执行',
		'两者完全等价',
		'setImmediate 比 nextTick 更早执行',
		'nextTick 属于宏任务队列末尾'
	], ['A'], 'nextTick 属于微任务级别的「当前栈清空后立即执行」，优先级高于 Promise.then 之外的其他回调，且在事件循环各阶段之间都会清空；setImmediate 排在 check 阶段。\n\n递归调用 nextTick 会饿死事件循环，需要让出控制权时用 setImmediate。'],

	['018', 2, 78, 'Buffer 的本质是？', [
		'一块堆外分配的固定长度字节数组，用于处理二进制数据',
		'JS 字符串的别名',
		'一种文件流',
		'动态扩容的数组'
	], ['A'], 'Buffer 继承 Uint8Array，长度固定，读写二进制高效，常用于网络与文件 IO；转字符串要指定编码，否则中文会乱码。\n\n`Buffer.alloc` 会初始化清零，`Buffer.allocUnsafe` 更快但可能残留旧数据。'],

	['019', 3, 80, 'Stream 的「背压（backpressure）」指什么？', [
		'下游消费速度跟不上时，上游暂停写入，避免内存堆积',
		'数据压缩',
		'流被意外关闭',
		'缓冲区自动扩容'
	], ['A'], '`write()` 返回 false 表示缓冲已满，生产者应等待 drain 事件再继续；`pipe()` 会自动处理这一机制。\n\n忽略背压会让内存持续增长，最终 OOM。'],

	['020', 2, 76, 'Node 中为什么不推荐使用 `fs.readFileSync` 处理请求？', [
		'同步 IO 会阻塞事件循环，导致并发请求全部排队',
		'同步 API 不能读大文件',
		'同步 API 已被废弃',
		'同步 API 不支持 utf-8'
	], ['A'], 'Node 单线程执行 JS，同步 IO 期间无法处理其他回调，吞吐量骤降。启动时读配置、CLI 脚本可以用同步 API，服务运行时一律用异步或流。\n\n大文件更要用 createReadStream 分块处理。'],

	['021', 2, 84, '`require` 同一个模块多次，会发生什么？', [
		'命中 require.cache，返回同一个导出对象引用，模块代码只执行一次',
		'每次都重新执行模块代码',
		'返回深拷贝',
		'第二次返回 undefined'
	], ['A'], '模块首次加载后缓存在 `require.cache[resolvedPath]`，后续直接返回缓存对象，所以模块级状态是共享的。\n\n需要重新加载可删除缓存项（不推荐，容易引发状态不一致）。'],

	['022', 2, 82, 'CommonJS 与 ESM 的主要差异，不包括？', [
		'CJS 同步加载、运行时确定；ESM 静态结构、支持 tree-shaking',
		'CJS 用 require/module.exports；ESM 用 import/export',
		'ESM 的 import 会提升到模块顶部',
		'ESM 只能运行在浏览器中'
	], ['D'], 'Node 早已支持 ESM（.mjs 或 package.json 的 type: module）。关键差异是加载时机与静态可分析性：ESM 的依赖在解析阶段确定，因此能做 tree-shaking；CJS 是运行时同步求值。\n\nESM 中拿不到 __dirname，需要 import.meta.url 转换。'],

	['023', 2, 78, 'Node 的 cluster 模块用于？', [
		'创建多个进程共享同一端口，充分利用多核 CPU',
		'在单进程内创建线程',
		'实现数据库集群',
		'管理 npm 包'
	], ['A'], '主进程 fork 出多个 worker 进程，由主进程接收连接并分发（默认轮询），各 worker 独立运行 JS，绕过单线程限制。\n\n进程间不共享内存，会话状态要放 Redis 等外部存储。'],

	['024', 3, 76, 'worker_threads 相比 child_process 的优势是？', [
		'线程间可共享内存（SharedArrayBuffer），创建开销更小',
		'不受任何限制',
		'可以直接访问主线程变量',
		'不需要消息通信'
	], ['A'], 'worker_threads 在同一进程内创建线程，可用 MessagePort 通信、SharedArrayBuffer 共享内存，适合 CPU 密集计算；进程模型隔离性更强但开销大。\n\n每个 worker 仍有独立的事件循环与 JS 堆。'],

	['025', 2, 72, '`path.join("/a", "../b")` 与 `path.resolve("/a", "../b")` 的结果分别是？', [
		'`/b` 与 `/b`（此处恰好相同，但 resolve 会基于 cwd 生成绝对路径）',
		'`/a/b` 与 `/b`',
		'`/b` 与 `/a/b`',
		'两者都返回相对路径'
	], ['A'], 'join 只做拼接与规范化，结果可能是相对路径；resolve 从右到左拼接并返回绝对路径（没有绝对段时以 cwd 为基准）。\n\n本例中 `/a` 是绝对路径，两者结果一致；但 `path.join("a","b")` 是 `a/b`，`resolve("a","b")` 是 `/当前目录/a/b`。'],

	['026', 2, 74, '`__dirname` 与 `process.cwd()` 的区别是？', [
		'__dirname 是当前模块文件所在目录；cwd 是启动 Node 进程时的工作目录',
		'两者永远相同',
		'cwd 返回文件路径',
		'__dirname 会随 cd 改变'
	], ['A'], 'cwd 取决于启动命令所在的目录，部署方式不同就会变；__dirname 始终指向源文件位置，读相对资源时更可靠。\n\nESM 中用 `path.dirname(fileURLToPath(import.meta.url))` 替代。'],

	['027', 3, 70, 'package.json 的 `exports` 字段作用是？', [
		'精确控制包的对外入口与子路径，可针对 import/require 提供不同文件',
		'声明依赖版本',
		'指定入口 HTML',
		'配置 eslint'
	], ['A'], 'exports 会「封闭」包的可访问路径，未列出的子路径无法被导入，同时支持条件导出（import/require/browser/types）。\n\n它优先于 main，配置错误会导致 `ERR_PACKAGE_PATH_NOT_EXPORTED`。'],

	['028', 2, 74, '依赖版本 `^1.2.3` 与 `~1.2.3` 的区别是？', [
		'^ 允许升级次版本与修订号（<2.0.0），~ 只允许修订号（<1.3.0）',
		'两者完全相同',
		'~ 允许大版本升级',
		'^ 表示精确版本'
	], ['A'], '^ 锁大版本、放开中版本与补丁；~ 锁中版本、只放开补丁；精确版本不带前缀。\n\n遵循 semver 时，破坏性变更只在大版本发生，所以 ^ 是 npm 默认策略。'],

	['029', 2, 78, '提交 lock 文件（package-lock.json / pnpm-lock.yaml）的意义是？', [
		'固定整棵依赖树的精确版本，保证不同环境安装结果一致',
		'加快 npm install 的唯一手段',
		'替代 package.json',
		'减小仓库体积'
	], ['A'], 'package.json 只声明范围，lock 记录每个包的实际版本、下载地址与完整性哈希，避免「本地能跑、CI 报错」的版本漂移。\n\n应用项目必须提交 lock；库项目可视情况提交。'],

	['030', 2, 72, '在 Node 中读取环境变量应使用？', [
		'`process.env.KEY`',
		'`global.env.KEY`',
		'`window.env.KEY`',
		'`require("env").KEY`'
	], ['A'], 'process.env 是进程环境变量映射，值都是字符串（"false" 也是真值），需要自行转换类型。\n\n本地开发常用 dotenv 加载 .env 文件，生产环境由部署平台注入，敏感信息不要提交到仓库。'],

	['031', 2, 82, '用原生 http 模块创建服务，`req` 与 `res` 分别是什么？', [
		'req 是可读流（IncomingMessage），res 是可写流（ServerResponse）',
		'两者都是字符串',
		'req 是响应对象，res 是请求对象',
		'两者都是 Promise'
	], ['A'], '请求体需要监听 data/end 事件或 pipe 到别处读取；响应通过 writeHead/setHeader 设置头部后 write/end 输出。\n\nExpress 等框架只是在这之上做了路由与中间件封装。'],

	['032', 2, 80, 'Express 中间件中调用 `next()` 表示？', [
		'把控制权交给下一个匹配的中间件',
		'结束响应',
		'抛出错误',
		'重新执行当前中间件'
	], ['A'], '中间件签名 (req, res, next)，不调用 next 且不结束响应会导致请求挂起；`next(err)` 会跳到错误处理中间件。\n\n错误处理中间件必须是四参数 (err, req, res, next)。'],

	['033', 3, 74, '`uncaughtException` 事件的处理建议是？', [
		'记录日志后尽快优雅退出并由进程管理器重启，而不是继续运行',
		'捕获后忽略，继续服务',
		'用它替代所有 try/catch',
		'只在开发环境监听'
	], ['A'], '抛出未捕获异常说明进程状态已不可信，继续运行可能产生脏数据。正确做法是记录现场、关闭连接、退出，交给 PM2/K8s 拉起。\n\n能用 try/catch 或 Promise.catch 处理的地方不要依赖全局兜底。'],

	['034', 3, 76, '下列哪项最容易造成 Node 内存泄漏？', [
		'在全局数组或 Map 中持续累积数据、未移除的事件监听与定时器',
		'使用 const 声明变量',
		'频繁创建字符串',
		'使用 async/await'
	], ['A'], '常见泄漏源：无上限的缓存容器、未 clearInterval、EventEmitter 监听器不断累积、闭包持有大对象、未销毁的 stream。\n\n排查手段是 heap snapshot 对比与 --inspect 配合 DevTools。'],

	['035', 3, 72, '`child_process.exec` 与 `spawn` 的差别是？', [
		'exec 走 shell、缓冲全部输出（有 maxBuffer 限制）；spawn 直接启动进程、流式输出更适合大数据量',
		'两者完全一样',
		'spawn 必须经过 shell',
		'exec 不支持回调'
	], ['A'], 'exec 方便执行带管道的命令，但输出会累积在内存；spawn 不经过 shell（加 shell: true 才行），stdout 是流，适合长时间运行或大输出。\n\n执行不可信输入时要避免拼 shell 命令，防止命令注入。'],

	['036', 2, 66, 'Node 内置 crypto 模块可用于？', [
		'哈希、HMAC、对称/非对称加密与随机数生成',
		'压缩文件',
		'解析 HTML',
		'操作数据库'
	], ['A'], '常用 API：createHash("sha256")、createHmac、randomBytes（安全随机）、scrypt 做密码哈希（比 md5/sha 更抗暴力破解）。\n\n密码存储应加盐并用慢哈希，绝不能用 md5。'],

	['037', 2, 64, '`zlib.gzip` 常用于什么场景？', [
		'压缩响应体或文件，减少传输体积',
		'加密数据',
		'解析 JSON',
		'建立 TCP 连接'
	], ['A'], 'HTTP 服务可按 Accept-Encoding 对文本响应做 gzip/br 压缩；静态资源一般在构建期预压缩。\n\n图片、视频本身已压缩，再 gzip 收益很低。'],

	['038', 2, 66, '解析 URL 查询参数，现代推荐的方式是？', [
		'`new URL(req.url, "http://localhost")` 后读 searchParams',
		'手动 split("?") 后 split("&")',
		'用 eval 解析',
		'用正则匹配所有参数'
	], ['A'], 'WHATWG URL 提供 searchParams（URLSearchParams），自动处理编码与重复键；querystring 模块已标记为遗留 API。\n\n手动 split 在参数值含 & 或中文编码时会出错。'],

	['039', 2, 70, '处理 multipart 文件上传，通常的做法是？', [
		'使用 multer / busboy 等流式解析库，边接收边写盘或转存对象存储',
		'先 readFile 整个请求再切分',
		'用 JSON.parse 解析请求体',
		'把文件转成 base64 放在 header'
	], ['A'], 'multipart 是流式协议，用流式解析能避免大文件占满内存；还可配合限制大小、类型白名单与磁盘配额。\n\n直接读取整个请求体在并发上传时极易 OOM。'],

	['040', 3, 72, '什么是「优雅停机（graceful shutdown）」？', [
		'收到退出信号后停止接收新请求，等待在途请求处理完再关闭连接与资源',
		'直接 process.exit(0)',
		'重启进程前清空数据库',
		'拒绝所有请求立即退出'
	], ['A'], '监听 SIGTERM/SIGINT，先 `server.close()` 停止接受新连接，等现有请求完成（配合超时强制退出），再关闭数据库连接池、刷新日志。\n\n容器滚动发布时缺了这一步会导致请求被硬中断、用户看到 502。'],

	['041', 2, 68, 'PM2 的 `cluster` 模式作用是？', [
		'以多进程方式运行应用并负载均衡，同时负责崩溃重启与日志管理',
		'压缩代码',
		'替代 nginx',
		'做数据库迁移'
	], ['A'], 'PM2 用 cluster 拉起多个实例共享端口，进程崩溃自动重启，还提供 reload 实现零停机发布。\n\n容器化部署中这层通常由 K8s 承担，二者不必重复。'],

	['042', 2, 66, '生产环境日志的推荐做法是？', [
		'结构化 JSON 日志 + 分级（level）+ 输出到 stdout 由采集系统收集',
		'全部 console.log 到本地文件',
		'只在出错时打印',
		'把日志写进数据库'
	], ['A'], '结构化日志便于检索聚合（pino/winston），stdout 交给容器日志驱动或 Filebeat 采集，应用不负责轮转。\n\n务必对手机号、token 等敏感字段脱敏。'],

	['043', 3, 62, '排查 Node 服务 CPU 飙高，常用手段是？', [
		'用 clinic / node --prof 采集火焰图，定位热点函数',
		'重启服务',
		'增加内存',
		'关闭日志'
	], ['A'], '`node --inspect` 配合 Chrome DevTools 抓 CPU profile，clinic flame 生成火焰图，快速看出哪个函数占满主线程。\n\n常见根因是死循环、大 JSON 序列化、正则回溯、同步加密计算。'],

	['044', 3, 68, '`stream.pipe` 的错误处理要注意什么？', [
		'pipe 不会自动把源流的错误传给目标流，需要显式监听 error 或使用 pipeline',
		'pipe 会自动处理所有错误',
		'pipe 只能用于文件',
		'pipe 会阻塞事件循环'
	], ['A'], '源流出错时 pipe 不会关闭目标流，容易造成句柄泄漏；`stream.pipeline()` 会在任一端出错时统一销毁所有流并回调错误。\n\n生产代码应优先用 pipeline + promisify。'],

	['045', 2, 62, '为什么 `setTimeout(fn, 0)` 不能保证立即执行？', [
		'它只是把回调放入 timers 阶段，需等待当前同步代码与前面的阶段完成，且有最小延迟限制',
		'setTimeout 被废弃了',
		'Node 不支持 0 延迟',
		'定时器精度是 1 秒'
	], ['A'], '定时器回调只能在事件循环进入 timers 阶段时执行，前面的同步代码与微任务都会先跑完；浏览器还有 4ms 的最小间隔限制（嵌套调用）。\n\n需要「本轮结束立即执行」用 process.nextTick 或 queueMicrotask。'],

	['046', 3, 64, 'CommonJS 出现循环依赖时会怎样？', [
		'后加载的模块拿到的是对方「尚未执行完」的部分导出（可能是空对象）',
		'直接抛错',
		'自动延迟到下一轮事件循环',
		'自动去重后正常执行'
	], ['A'], 'CJS 是同步执行，遇到循环引用会返回 module.exports 的当前快照，所以常常拿到不完整的对象；ESM 因为有提升与实时绑定，表现不同但同样要避免循环依赖。\n\n重构拆分公共模块是根本解法。'],

	['047', 3, 62, '大量递归调用 `process.nextTick` 会怎样？', [
		'微任务队列被不断填满，事件循环无法进入下一阶段，IO 回调被饿死',
		'自动转为宏任务',
		'触发栈溢出',
		'没有任何影响'
	], ['A'], 'nextTick 队列会在当前操作结束后全部清空，如果回调里又添加 nextTick，就会一直循环导致 IO 饥饿（类似浏览器里的微任务死循环）。\n\n需要分批处理时改用 setImmediate 让出事件循环。'],

	['048', 2, 66, 'Node 中提供静态文件服务，最简单的方式是？', [
		'Express 的 `express.static(root)`，或自己用 fs.createReadStream 响应',
		'用 fs.readFileSync 拼接 HTML',
		'用 require 读取文件',
		'用 Buffer.from 输出路径'
	], ['A'], 'express.static 内置了 MIME 推断、缓存头、Range 请求等能力；自实现时至少要注意路径穿越（`../`）防护与正确的 Content-Type。\n\n生产环境通常交给 Nginx/CDN。'],

	['049', 2, 70, 'Node 服务处理跨域，正确的做法是？', [
		'设置 CORS 响应头（Access-Control-Allow-Origin 等）并正确处理 OPTIONS 预检',
		'设置 Access-Control-Allow-Origin: * 且携带凭证',
		'在请求头里加 X-Forwarded-For',
		'把前端和服务部署到同一端口即可，无需任何配置'
	], ['A'], '简单请求只需 Allow-Origin；带自定义头或非简单方法会先发 OPTIONS 预检，需要返回 Allow-Methods/Allow-Headers 并缓存。\n\n注意 `Allow-Origin: *` 与 credentials 不能共存，需回显具体来源并校验白名单。'],

	['050', 2, 68, 'Node.js 最适合下列哪类场景？', [
		'I/O 密集的高并发服务，如 API 网关、实时通信、SSR',
		'大规模矩阵运算',
		'视频编码渲染',
		'操作系统驱动开发'
	], ['A'], '单线程 + 非阻塞 IO + 事件循环让 Node 在大量并发连接、轻计算场景非常高效；CPU 密集任务会阻塞主线程，需要 worker_threads、子进程或换语言。\n\n所以它擅长「IO 编排」，不擅长重计算。']
])
