/**
 * 题库 · 工程化补充（build-016 ~ build-050）
 */

import { makeQuestions } from './helper.js'

export const questions = makeQuestions('build', [
	['016', 2, 86, 'Webpack 的构建流程大致是？', [
		'初始化参数 → 确定入口 → 编译模块（loader 转换）→ 生成依赖图 → 输出 chunk 与资源',
		'直接合并所有文件后输出',
		'先执行插件再读取配置',
		'只做压缩不做依赖分析'
	], ['A'], 'Webpack 从 entry 出发递归解析 import/require，用 loader 把非 JS 资源转成模块，形成依赖图；再按 splitChunks 等规则组装 chunk，最后 emit 文件并触发插件钩子。\n\n整个过程由 Tapable 的钩子驱动，插件在关键节点介入。'],

	['017', 2, 88, 'loader 与 plugin 的区别是？', [
		'loader 做文件级转换（输入源码输出源码），plugin 在构建生命周期挂钩子做更广的任务',
		'两者完全等价',
		'plugin 只能处理 CSS',
		'loader 可以修改 webpack 配置'
	], ['A'], 'loader 是「模块转换管道」，职责单一、可链式组合（从右到左执行）；plugin 通过 apply(compiler) 注册钩子，能做分包、注入 HTML、定义环境变量等全局操作。\n\n判断标准：单个文件的语法转换用 loader，构建流程控制用 plugin。'],

	['018', 3, 84, '下面哪项不是 tree shaking 生效的必要条件？', [
		'使用 ESM 的静态 import/export',
		'代码无副作用或正确标注 sideEffects',
		'生产模式并开启压缩（去除死代码）',
		'必须使用 CommonJS 规范'
	], ['D'], 'Tree shaking 依赖 ESM 的静态结构才能分析出未使用的导出；CJS 是运行时求值，无法可靠静态分析。\n\n还需要 package.json 的 sideEffects 声明与 terser 的 dead_code 消除配合。'],

	['019', 2, 82, '代码分割（code splitting）的核心收益是？', [
		'把代码拆成按需加载的 chunk，减小首屏体积、提升加载速度',
		'减少构建时间',
		'让代码更难被逆向',
		'自动修复循环依赖'
	], ['A'], '常见手段：路由级动态 import、拆 vendor、按交互触发懒加载组件。拆得太细会增加请求数与调度开销，需要平衡。\n\nHTTP/2 多路复用让适中粒度的拆分收益更高。'],

	['020', 3, 80, 'Webpack HMR 的基本原理是？', [
		'文件变更后只重新编译该模块，通过 WebSocket 推送更新，运行时替换模块并触发 accept 回调',
		'刷新整个页面',
		'重启 dev server',
		'重新安装依赖'
	], ['A'], 'dev server 与浏览器建立 WebSocket，变更时推送 hash 与新模块代码，HMR runtime 用新模块替换旧模块，沿依赖链向上查找 accept 处理，找不到就整页刷新。\n\n框架层（vue-loader、react-refresh）负责保留组件状态。'],

	['021', 3, 86, 'Vite 开发环境为什么启动快？', [
		'利用浏览器原生 ESM 按需编译，开发时不打包；依赖用 esbuild 预构建',
		'使用多线程压缩所有文件',
		'把代码提前编译好放在缓存里',
		'跳过了类型检查'
	], ['A'], 'Vite dev 只启动一个静态服务器，浏览器请求哪个模块就即时转换哪个模块，冷启动与项目规模基本解耦；第三方依赖用 esbuild 预打包成单个 ESM 文件，避免大量请求与 CJS 转换。\n\n生产构建则交给 Rollup 做完整打包与优化。'],

	['022', 2, 74, 'Vite 生产构建默认使用的打包器是？', [
		'Rollup',
		'esbuild',
		'Webpack',
		'Parcel'
	], ['A'], 'Vite 用 Rollup 做生产打包（插件生态成熟、产物质量好），esbuild 只负责开发期的依赖预构建与 TS 转译。\n\n较新的 rolldown-vite 在尝试用 Rust 实现替代 Rollup。'],

	['023', 2, 80, 'Babel 的主要职责是？', [
		'把新语法转换为目标环境可运行的代码（语法转换 + 按需 polyfill）',
		'打包模块',
		'压缩图片',
		'运行单元测试'
	], ['A'], 'Babel 解析源码为 AST，用插件做语法转换，再由 preset-env 根据 browserslist 决定需要哪些转换与 polyfill。\n\n它不负责模块打包（那是 bundler 的事），也不做类型检查（那是 tsc）。'],

	['024', 2, 78, 'polyfill 与语法转换的区别是？', [
		'语法转换改写代码写法；polyfill 在运行时补齐缺失的 API（如 Promise、Array.prototype.at）',
		'两者是一回事',
		'polyfill 只能处理箭头函数',
		'语法转换能补齐所有新 API'
	], ['A'], '箭头函数、可选链这类新语法可以降级重写；但新增的内置对象/方法无法靠改写语法实现，必须在运行时注入实现。\n\npolyfill 会增加包体，应按目标浏览器按需引入（useBuiltIns: usage）。'],

	['025', 2, 76, '`browserslist` 配置的作用是？', [
		'声明需要兼容的浏览器范围，供 Babel、Autoprefixer、esbuild 等工具决定转换与前缀策略',
		'指定开发服务器端口',
		'配置 ESLint 规则',
		'声明依赖版本'
	], ['A'], '一份配置多处复用（package.json 或 .browserslistrc），例如 `> 1%, last 2 versions, not dead`。\n\n范围越宽，产物越大、polyfill 越多，需要按业务真实用户分布权衡。'],

	['026', 2, 80, 'source map 的作用是？', [
		'建立压缩/转译后代码到源码的映射，便于调试与错误定位',
		'压缩代码体积',
		'加密源码',
		'提升运行速度'
	], ['A'], '浏览器 DevTools 依据 map 文件还原源码与断点位置。生产环境应生成 map 但不上传到公开目录，而是上传到监控平台用于还原错误堆栈。\n\n`hidden-source-map` 是常见折中方案。'],

	['027', 3, 78, '`[hash]`、`[chunkhash]`、`[contenthash]` 的区别是？', [
		'hash 是全量构建哈希，chunkhash 按 chunk 内容，contenthash 按单个文件内容',
		'三者完全相同',
		'contenthash 按项目版本号',
		'chunkhash 只用于图片'
	], ['A'], 'contenthash 粒度最细，只有文件内容变化才改文件名，最利于长期缓存；chunkhash 在 chunk 内任一模块变化时会一起变；hash 全项目共用一个，改一个文件全部失效。\n\n现代 Webpack 5 默认用 chunk 的内容哈希 + 确定性 id，通常直接用 [contenthash]。'],

	['028', 2, 80, '下列哪项对减小打包体积帮助最小？', [
		'开启 devtool: "source-map"',
		'按需引入组件库（如 babel-plugin-import）',
		'使用 terser/esbuild 压缩并去除 console',
		'用 dayjs 替换 moment、剔除大体积依赖'
	], ['A'], 'source map 是额外的调试文件，不进入运行包，但会显著增大产物目录体积并可能泄露源码，生产要谨慎。\n\n真正有效的减包手段是：按需引入、依赖替换、压缩与 tree shaking、拆分非首屏代码。'],

	['029', 2, 76, '`<link rel="preload">` 与 `<link rel="modulepreload">` 的关系是？', [
		'modulepreload 用于 ESM 模块预加载，会预先解析依赖图；preload 只加载指定资源',
		'两者完全一样',
		'preload 只能加载 JS 模块',
		'modulepreload 会阻塞渲染'
	], ['A'], 'modulepreload 在支持 ESM 的环境下能提前抓取并解析模块及其静态依赖，减少瀑布式请求；preload 需要指定 as 且只处理单个资源。\n\n两者都不执行代码。'],

	['030', 3, 70, 'Webpack Module Federation 解决的核心问题是？', [
		'让多个独立构建的应用在运行时共享模块，实现微前端式的远程加载',
		'压缩代码',
		'替代 npm 安装依赖',
		'自动生成路由'
	], ['A'], '通过 exposes/remotes 声明，宿主在运行时加载远程应用的模块，共享依赖可通过 shared 配置去重。\n\n版本不一致时可能出现多份 React 实例，需要谨慎设计共享策略。'],

	['031', 2, 74, '构建工具中的环境变量注入（如 `import.meta.env`）本质是？', [
		'构建时做字符串替换，把变量替换成字面量',
		'运行时从服务器拉取配置',
		'写入 localStorage',
		'通过 Cookie 传递'
	], ['A'], 'DefinePlugin / define 会在打包时把 `process.env.NODE_ENV` 这类表达式替换成字符串字面量，因此无法动态读取、也不能用于敏感密钥（会被打进产物）。\n\n只有以特定前缀开头的变量才会暴露给客户端。'],

	['032', 2, 72, 'PostCSS 与 Autoprefixer 的关系是？', [
		'PostCSS 是 CSS 转换平台，Autoprefixer 是其中一个按 browserslist 自动补前缀的插件',
		'两者是竞争关系',
		'Autoprefixer 是 PostCSS 的替代品',
		'PostCSS 只能压缩 CSS'
	], ['A'], 'PostCSS 把 CSS 解析成 AST，插件链依次处理；Autoprefixer 根据目标浏览器补 -webkit- 等前缀，postcss-preset-env 则转换新语法。\n\n现代浏览器对 flex/grid 已无需前缀，但用户基数大时仍有价值。'],

	['033', 2, 74, 'Vue 的 `<style scoped>` 实现原理是？', [
		'编译时给元素加唯一属性（如 data-v-xxx），并把选择器改写成属性选择器',
		'用 Shadow DOM 隔离样式',
		'用 iframe 隔离',
		'运行时动态计算样式'
	], ['A'], 'scoped 通过属性选择器提高特异性实现「伪隔离」，但无法穿透子组件根节点以外的地方，深层修改需要 :deep()。\n\n它也不是绝对的样式隔离，全局样式仍可能命中同名元素。'],

	['034', 2, 70, 'Webpack 5 的 asset modules 相比 url-loader 的优势是？', [
		'内置处理资源，无需额外 loader 即可按大小自动 inline 或输出文件',
		'能自动压缩图片',
		'支持 HTTP/2',
		'能替代 file-loader 与 babel'
	], ['A'], '`type: "asset"` 配合 `parser.dataUrlCondition.maxSize` 即可实现小图转 base64、大图输出文件，减少 loader 依赖与配置复杂度。\n\n图片压缩仍需 image-minimizer 类插件。'],

	['035', 2, 74, 'Webpack 5 的持久化缓存（filesystem cache）要注意什么？', [
		'缓存与配置、依赖版本强相关，配置变化或升级依赖需清理缓存',
		'开启后永远不会失效',
		'只能缓存 JS',
		'会显著增大运行时体积'
	], ['A'], '`cache: { type: "filesystem" }` 把模块编译结果写到磁盘，二次构建大幅提速；但配置、loader 版本变化会导致缓存失效或出现「改了不生效」的诡异现象。\n\nCI 环境可用 cache 目录做增量构建。'],

	['036', 2, 72, 'Monorepo 中 pnpm workspace 的主要优势是？', [
		'统一管理多包依赖与脚本，通过软链接复用本地包，节省磁盘与安装时间',
		'自动发布 npm 包',
		'替代 git',
		'自动做代码分割'
	], ['A'], 'workspace 协议让子包互相引用走本地软链，改代码即时生效；pnpm 的内容寻址存储让相同版本依赖只存一份。\n\n配合 changesets 可管理版本与发布。'],

	['037', 3, 70, 'pnpm 相比 npm 节省磁盘空间的关键机制是？', [
		'全局内容寻址存储 + 硬链接，同一版本文件只存一份',
		'压缩 node_modules',
		'把依赖存到数据库',
		'按需下载代码片段'
	], ['A'], 'pnpm 把包内容按哈希存到全局 store，项目 node_modules 用硬链接指向同一份文件，并用符号链接构造严格的依赖树。\n\n严格结构还顺带解决了「幽灵依赖」问题。'],

	['038', 2, 74, 'ESLint 与 Prettier 的分工是？', [
		'ESLint 检查代码质量与潜在问题，Prettier 只负责格式化风格',
		'两者功能完全重叠',
		'Prettier 会做类型检查',
		'ESLint 只格式化不检查'
	], ['A'], 'ESLint 关注未使用变量、hooks 依赖、潜在 bug 等；Prettier 关注缩进、引号、换行等排版，不做逻辑判断。\n\n同时使用时应关闭 ESLint 中与格式相关的规则（eslint-config-prettier），避免互相打架。'],

	['039', 2, 70, 'Husky + lint-staged 的作用是？', [
		'在 git 提交前只对暂存区文件执行 lint/格式化，拦截不合格代码',
		'自动合并分支',
		'生成 changelog',
		'加速构建'
	], ['A'], 'Husky 注册 git hooks（pre-commit、commit-msg），lint-staged 只处理本次改动的文件，避免全量检查拖慢提交。\n\ncommit-msg 钩子常配合 commitlint 约束提交信息格式。'],

	['040', 2, 72, 'CI/CD 流水线中，前端构建通常包含哪些环节？', [
		'安装依赖 → lint/单测 → 构建 → 产物上传/部署 →（可选）自动化测试与回滚',
		'只做构建',
		'只做部署',
		'先部署再测试'
	], ['A'], '质量门禁前置能尽早失败（fail fast）：lint 与单测成本低、反馈快，放在构建之前；构建产物带版本号上传 CDN/对象存储，再由部署环节切换。\n\n配合缓存 node_modules 与构建缓存可把流水线压缩到几分钟。'],

	['041', 2, 68, '单元测试覆盖率 100% 说明什么？', [
		'所有代码行都被执行过，但不代表逻辑分支与边界都被正确断言',
		'代码没有 bug',
		'所有需求都被满足',
		'性能达标'
	], ['A'], '覆盖率衡量「被执行到的代码比例」，无法衡量断言质量与场景完整性；盲目追求 100% 会催生无意义断言。\n\n更实用的是关注核心业务模块的行/分支覆盖，并配合集成测试。'],

	['042', 3, 72, 'qiankun 这类微前端框架的核心能力是？', [
		'基于 single-spa 做应用注册与生命周期调度，用沙箱隔离 JS 与样式',
		'把多个应用打包成一个',
		'替代 iframe 的完全隔离',
		'自动生成路由'
	], ['A'], '主应用负责路由与容器，子应用暴露 bootstrap/mount/unmount；框架通过 Proxy 快照或 legacy 沙箱隔离全局变量，用 scoped 样式或 Shadow DOM 隔离样式。\n\n沙箱并非绝对隔离，第三方脚本污染 window 仍可能串味。'],

	['043', 2, 74, 'SSR 相比纯 CSR 的主要收益是？', [
		'首屏更快可见、利于 SEO；代价是需要服务端渲染开销与同构适配',
		'开发更简单',
		'完全不需要 JS',
		'带宽占用更低'
	], ['A'], 'SSR 返回带内容的 HTML，首屏无需等待 JS 下载执行；搜索引擎也能直接抓取内容。\n\n代价是要处理服务端无 window 的兼容、hydration 一致性、缓存与扩容，运维复杂度显著上升。'],

	['044', 3, 78, '静态资源部署到 CDN 时，HTML 与带 hash 的 JS 应如何设置缓存？', [
		'HTML 不缓存或极短缓存，带 contenthash 的静态资源设长期强缓存',
		'两者都设长期强缓存',
		'两者都不缓存',
		'HTML 长期缓存，JS 不缓存'
	], ['A'], 'HTML 是入口，必须能及时拿到新版本（no-cache 或秒级 max-age）；JS/CSS 文件名带内容哈希，内容变则文件名变，可以放心设 `max-age=31536000, immutable`。\n\n这样发布时只失效 HTML，静态资源自动指向新文件。'],

	['045', 2, 66, 'Brotli 相比 gzip 的特点是？', [
		'压缩率更高（尤其文本），但压缩耗时更长，需浏览器支持',
		'压缩率更低但更快',
		'只能压缩图片',
		'需要 HTTPS 才能使用'
	], ['A'], 'Brotli 静态字典对 HTML/CSS/JS 效果显著，通常比 gzip 小 15%~25%；压缩成本高，适合构建期预压缩后由 CDN 直接下发。\n\n通过 Accept-Encoding 协商，不支持时回退 gzip。'],

	['046', 2, 72, '线上报错的堆栈是压缩后的代码，如何还原？', [
		'用对应版本的 source map 通过 source-map 库或监控平台还原',
		'重新部署未压缩代码',
		'凭经验猜测',
		'用 prettier 格式化即可'
	], ['A'], '关键是发布时保存每个版本产物对应的 map，并在监控平台按版本号映射；定期清理策略要保留足够长的历史。\n\n也可用 Sentry 这类平台自动完成 sourcemap 上传与还原。'],

	['047', 2, 68, '分析打包产物构成，常用工具是？', [
		'webpack-bundle-analyzer / rollup-plugin-visualizer',
		'Lighthouse',
		'Postman',
		'ESLint'
	], ['A'], '可视化 treemap 能直观看出哪个依赖占了最大体积，是减包第一步（先定位再优化）。\n\n配合 `--stats` 或 stats.json 可以做更细的分析与体积基线对比。'],

	['048', 2, 70, '组件库「按需引入」的目的是？', [
		'只打包实际使用的组件与其样式，避免整包引入',
		'减少 API 请求',
		'提升运行时性能',
		'让代码可读性更好'
	], ['A'], '全量引入会把几百个组件与样式都打进产物，按需引入（unplugin-vue-components、babel-plugin-import）只保留用到的部分。\n\n注意有些组件库的样式需要单独引入或自动导入插件处理。'],

	['049', 2, 72, '下列哪项对提升构建速度最直接有效？', [
		'开启持久化缓存、缩小 loader 处理范围（include/exclude）、用 esbuild/swc 替代 babel',
		'增加更多 source map 类型',
		'关闭 tree shaking',
		'把所有依赖打进一个 chunk'
	], ['A'], '构建慢通常是「处理了太多不需要处理的文件」或「用了慢的转译器」。缓存、缩小范围、并行与更快的工具（esbuild/swc）收益最大。\n\n分析工具如 speed-measure-webpack-plugin 能定位耗时插件。'],

	['050', 2, 68, '前端灰度发布常见做法是？', [
		'按用户比例/白名单分流到不同版本，配合监控与快速回滚',
		'一次性全量发布',
		'只在本地测试',
		'发布后关闭监控'
	], ['A'], '灰度可控地放量，先小流量验证核心指标（错误率、性能、转化），异常时立即回滚或切流。\n\n实现依赖网关/配置中心的分流能力，以及「上一个版本随时可回退」的部署策略。']
])
