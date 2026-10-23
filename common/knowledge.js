/**
 * 基础知识点
 *
 * @deprecated 页面已改用 common/question-source.js（知识点摘要随题库镜像一起下发，
 *             详情走 GET /api/knowledge/{id}）。本文件仅作离线兜底参考，
 *             新代码请勿再直接 import。
 *
 * 与「问答详解」（common/bank/qa/*.js）分开维护：
 * 知识点是阅读型内容，按分类组织，用于面试前的快速过一遍，
 * 每张卡片包含一句话总结、核心要点、可选代码示例与易错提醒。
 *
 * 约定：纯数据，不引入任何运行时依赖；cat 必须是 categories 中的 id。
 */

export const knowledge = [
	/* ------------------------------ JavaScript ------------------------------ */
	{
		id: 'js-scope',
		cat: 'js',
		title: '变量声明与作用域',
		summary: 'var / let / const 的差异，本质是「声明提升」与「初始化时机」不同。',
		points: [
			'var 会提升到函数作用域顶部并初始化为 undefined；let/const 提升到块级作用域但不初始化，声明前访问抛 ReferenceError（暂时性死区 TDZ）',
			'let 可以重新赋值，const 只保证绑定不变——引用类型的内容仍然可以修改',
			'块级作用域让 for 循环里的变量每次迭代都是新绑定，这也是闭包捕获循环变量不再出错的原因',
			'函数声明会整体提升，函数表达式只提升变量名；同一作用域内重复声明 let/const 直接报语法错误',
			'全局 var 和函数声明会成为 window 属性，let/const 不会'
		],
		code: "for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)) // 3 3 3\nfor (let j = 0; j < 3; j++) setTimeout(() => console.log(j)) // 0 1 2",
		tips: [
			'面试常问「为什么 let 能解决循环里的闭包问题」，要答到「每次迭代创建新的绑定环境」这一层，而不是只说块级作用域'
		]
	},
	{
		id: 'js-closure',
		cat: 'js',
		title: '闭包',
		summary: '函数与其词法环境的组合：内层函数引用的外层变量，在外层函数返回后依然存活。',
		points: [
			'闭包的形成条件是「函数嵌套 + 内层引用外层变量」，与是否 return 无关',
			'变量保存在函数的 [[Environment]] 里，不会被 GC 回收，过度持有大对象会造成内存占用',
			'典型用途：私有变量、函数工厂、防抖节流、柯里化、模块模式',
			'常见陷阱是循环中的延迟绑定，用 let 或默认参数 `fn = (x = i) => x` 固定取值',
			'每次调用外层函数都会生成一份独立的作用域，闭包之间互不影响'
		],
		tips: [
			'被问到「闭包会内存泄漏吗」，正确说法是：持有不再需要的引用才叫泄漏，正常使用不算'
		]
	},
	{
		id: 'js-proto',
		cat: 'js',
		title: '原型与原型链',
		summary: '属性查找沿 __proto__ 逐级向上，直到 Object.prototype 为止。',
		points: [
			'每个对象有 [[Prototype]]（浏览器暴露为 __proto__），函数额外有 prototype 属性，指向 new 出来的实例的原型',
			'`instanceof` 检查的是原型链上是否存在构造函数的 prototype，`isPrototypeOf` 同理',
			'`Object.create(null)` 创建无原型对象，常用于字典，避免原型属性污染',
			'class 本质是原型继承的语法糖，extends 会同时建立构造函数与原型两条链',
			'属性查找是沿链的线性过程，过深的原型链会影响性能，也容易造成「原型污染」安全问题'
		],
		code: "function Foo() {}\nconst f = new Foo()\nObject.getPrototypeOf(f) === Foo.prototype // true\nFoo.prototype.__proto__ === Object.prototype // true",
		tips: ['不要用 `f.__proto__` 做业务判断，用 Object.getPrototypeOf 更规范；判断自有属性用 hasOwnProperty / Object.hasOwn']
	},
	{
		id: 'js-this',
		cat: 'js',
		title: 'this 的绑定规则',
		summary: 'this 在函数被调用时确定，优先级：new > 显式绑定 > 隐式绑定 > 默认绑定。',
		points: [
			'默认绑定：独立调用时，严格模式为 undefined，非严格模式指向全局对象',
			'隐式绑定：作为对象方法调用，this 指向调用者；方法被单独取出后赋值给变量会丢失绑定',
			'显式绑定：call / apply / bind 指定 this，bind 返回新函数且不可再次改变',
			'new 绑定：构造函数调用时 this 指向新创建的实例，优先级最高',
			'箭头函数没有自己的 this，取定义时外层作用域的 this，也无法被 call/apply 改变'
		],
		tips: ['React 类组件的事件回调丢 this、Vue 选项式里 methods 互相调用，都是这类问题的变体']
	},
	{
		id: 'js-loop',
		cat: 'js',
		title: '事件循环与异步',
		summary: '同步代码执行完 → 清空微任务队列 → 取一个宏任务 → 再清空微任务，如此循环。',
		points: [
			'微任务：Promise.then、queueMicrotask、MutationObserver、process.nextTick（Node）；宏任务：setTimeout、setInterval、I/O、UI 渲染',
			'每次宏任务结束后会把微任务队列全部清空，所以微任务里再产生微任务会继续执行，可能饿死渲染',
			'Promise 的状态一旦确定不可更改，then 的回调总是异步执行',
			'async/await 本质是 Promise 的语法糖，await 之后的代码相当于 then 回调，属于微任务',
			'定时器时间不精确：嵌套层级深时浏览器有最小 4ms 限制，后台标签页会被节流'
		],
		code: "console.log('1')\nsetTimeout(() => console.log('2'))\nPromise.resolve().then(() => console.log('3'))\nconsole.log('4')\n// 输出 1 4 3 2",
		tips: ['分析输出顺序题时，先把代码按「同步 / 微任务 / 宏任务」三段分层再排序，比逐行推演更稳']
	},
	{
		id: 'js-type',
		cat: 'js',
		title: '类型转换与相等判断',
		summary: '原始类型 7 种，判断类型优先 typeof，判断空值用 === null/undefined，避免 == 的隐式转换。',
		points: [
			'原始类型：undefined、null、boolean、number、string、symbol、bigint；其余都是对象',
			'`typeof null === "object"` 是历史遗留 bug；判断数组用 Array.isArray，判断 NaN 用 Number.isNaN',
			'`==` 会做隐式转换（null == undefined 为 true，null == 0 为 false），工程里统一用 `===`',
			'对象转原始值走 ToPrimitive：先 Symbol.toPrimitive，再 valueOf，最后 toString',
			'0.1 + 0.2 !== 0.3 是 IEEE 754 双精度浮点误差，金额场景用整数分或 decimal 库'
		],
		tips: ['`Object.is(NaN, NaN)` 为 true、`Object.is(0, -0)` 为 false，这是它与 === 仅有的两处差异']
	},

	/* ------------------------------ TypeScript ------------------------------ */
	{
		id: 'ts-base',
		cat: 'ts',
		title: '基础类型与类型推断',
		summary: 'TS 在 JS 之上加了一层静态类型，编译后类型全部擦除，运行时不存在。',
		points: [
			'基础类型：string、number、boolean、null、undefined、symbol、bigint，加上 any、unknown、never、void、object',
			'字面量类型（如 "success"）配合联合类型可以精确描述状态枚举，比 string 安全得多',
			'没有类型注解时 TS 会自动推断，函数返回值建议显式标注，避免推断出过宽的类型',
			'`as const` 保留字面量与只读特性，是替代 enum 的现代写法',
			'`any` 等于关闭检查，`unknown` 是安全版 any，必须收窄后才能使用'
		],
		tips: ['面试被问「TS 类型会影响运行时吗」，答案是不会，除非用了装饰器元数据或 enum 这类会产物的语法']
	},
	{
		id: 'ts-iface',
		cat: 'ts',
		title: 'interface 与 type',
		summary: '描述对象结构用 interface，需要联合、交叉、条件、映射等组合能力时用 type。',
		points: [
			'interface 支持声明合并，适合给第三方库扩展类型；type 重复声明会报错',
			'type 能表达联合、交叉、元组、条件类型、映射类型，interface 只能描述对象/函数结构',
			'两者都能被继承/交叉：interface extends、type & ',
			'implements 只能用于类约束，类可以 implements 接口或对象类型',
			'性能上 interface 的检查更惰性，超大联合类型用 type 时编辑器可能变慢'
		],
		tips: ['团队约定比「谁更强」更重要：常见约定是「对外 API 用 interface，内部组合用 type」']
	},
	{
		id: 'ts-generic',
		cat: 'ts',
		title: '泛型与约束',
		summary: '泛型让类型像参数一样传递，`extends` 用来约束取值范围并保留推断能力。',
		points: [
			'函数、接口、类、类型别名都可以声明泛型参数，调用时通常由实参自动推断',
			'`T extends object` 这类约束既限制范围，又让上下文中能安全访问属性',
			'`keyof T` + `T[K]` 是「按键取值」的标准组合，可实现安全的 get/set 工具',
			'默认类型 `T = string` 只在无法推断且未显式传参时生效',
			'泛型不能被 JSON 序列化，也不能用于运行时判断，因为编译后会被擦除'
		],
		code: "function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {\n  return keys.reduce((acc, k) => ((acc[k] = obj[k]), acc), {} as Pick<T, K>)\n}",
		tips: ['写工具类型时先想「能不能用内置工具类型组合出来」，避免手写复杂条件类型']
	},
	{
		id: 'ts-narrow',
		cat: 'ts',
		title: '联合类型与类型收窄',
		summary: 'TS 通过控制流分析，在分支中自动把联合类型收窄成更精确的成员。',
		points: [
			'可触发收窄的判断：typeof、instanceof、in、字面量相等比较、真值判断、自定义类型谓词',
			'可辨识联合（discriminated union）用一个公共字段（如 type、status）区分成员，是最实用的建模方式',
			'穷尽检查：switch 的 default 里把值赋给 never，新增成员忘记处理时编译报错',
			'断言 `as` 与 `!` 不参与收窄，它们只是让编译器闭嘴，用错会在运行时炸掉',
			'`satisfies` 做兼容性校验但保留窄类型，适合配置表这类既要约束又要精确的场景'
		],
		tips: ['面试高频题：为什么不用 as 做类型转换？因为它是「单向兼容」的承诺，没有运行时保障']
	},
	{
		id: 'ts-util',
		cat: 'ts',
		title: '内置工具类型',
		summary: 'Partial / Required / Readonly / Pick / Omit / Record / Exclude / Extract / ReturnType 是最常用的一批。',
		points: [
			'Partial 与 Required 控制可选性，Readonly 控制只读，三者都只作用于第一层',
			'Pick 与 Omit 从对象类型中挑选或排除键，常用于从实体派生 DTO',
			'Record<K, V> 构造键值映射，K 的约束是 keyof any（string | number | symbol）',
			'Exclude / Extract 操作联合类型，NonNullable 去掉 null 与 undefined',
			'ReturnType / Parameters / Awaited 从函数或 Promise 反推类型，避免手写重复结构'
		],
		tips: ['手写 DeepPartial 时注意数组、函数、Date 等特殊类型要单独判断，否则会被错误递归']
	},
	{
		id: 'ts-config',
		cat: 'ts',
		title: 'tsconfig 与声明文件',
		summary: 'tsconfig 决定类型检查的严格程度与产物形态，.d.ts 描述没有类型信息的模块。',
		points: [
			'`strict: true` 是多个开关的集合，核心是 strictNullChecks 与 noImplicitAny，新项目建议直接开',
			'`moduleResolution` 决定模块解析策略，bundler 模式适配 Vite 等现代工具',
			'`paths` 配置路径别名后，打包工具需要同步配置才能正确解析',
			'`skipLibCheck` 跳过依赖的类型检查，能显著加快编译，代价是可能漏掉依赖的类型错误',
			'引入 .vue/.css/图片等非 TS 模块需要写声明：`declare module "*.vue"`'
		],
		tips: ['`noEmit` 与 `isolatedModules` 是 Vite 项目的常见组合，后者会限制 const enum 等跨文件特性']
	},

	/* ------------------------------ CSS ------------------------------ */
	{
		id: 'css-box',
		cat: 'css',
		title: '盒模型',
		summary: '标准盒模型的 width 只含内容，border-box 的 width 包含 padding 与 border。',
		points: [
			'`box-sizing: border-box` 让宽高包含内边距与边框，布局计算更直观，工程里通常全局设置',
			'块级元素宽度默认填满父容器，行内元素宽高由内容决定、不支持设置宽高（inline-block 可以）',
			'垂直方向的 margin 会发生塌陷，水平方向不会；padding 不会塌陷',
			'`margin: 0 auto` 只能让有确定宽度的块级元素水平居中',
			'`overflow` 影响 BFC 与滚动容器，是很多「position: sticky 失效」问题的根因'
		],
		tips: ['面试常结合「1px 边框」「百分比 padding 撑高容器」一起问，注意百分比 padding 是相对包含块宽度计算的']
	},
	{
		id: 'css-flex',
		cat: 'css',
		title: 'Flex 布局',
		summary: '一维布局模型，靠主轴与交叉轴两组属性控制排列与对齐。',
		points: [
			'容器属性：flex-direction、flex-wrap、justify-content（主轴）、align-items（交叉轴）、align-content（多行）、gap',
			'`flex: 1` 展开为 `1 1 0%`，`flex: auto` 是 `1 1 auto`，`flex: none` 是 `0 0 auto`',
			'flex-basis 在主轴方向优先于 width；basis 为 auto 时回退到 width',
			'子项默认 `min-width: auto`，内容过宽时不会收缩，需要设 `min-width: 0` 才允许省略号生效',
			'flex 容器会创建 BFC，子项的 margin 不会与容器塌陷'
		],
		code: ".ellipsis-row { display: flex; }\n.ellipsis-row .text { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }",
		tips: ['「flex 子项里的文字不省略」是最高频的实际问题，答案就是 min-width: 0']
	},
	{
		id: 'css-grid',
		cat: 'css',
		title: 'Grid 布局',
		summary: '二维布局模型，先划分行列轨道，再把子项放进单元格。',
		points: [
			'`grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))` 是最常用的响应式卡片网格',
			'fr 分配的是「扣除固定尺寸与 gap 后的剩余空间」',
			'`grid-area` / `grid-column: 1 / -1` 可以跨行跨列，适合做不规则布局',
			'`place-items` 是 align-items 与 justify-items 的简写，用于单元格内对齐',
			'Grid 适合整体页面骨架，Flex 适合一行内的元素排列，两者经常嵌套使用'
		],
		tips: ['容器查询（@container）配合 Grid 是组件级自适应的现代方案，比媒体查询更贴合组件复用']
	},
	{
		id: 'css-selector',
		cat: 'css',
		title: '选择器与优先级',
		summary: '优先级按 (id, class/属性/伪类, 标签/伪元素) 三元组比较，同级才看书写顺序。',
		points: [
			'`!important` 会覆盖普通声明，破坏可维护性，只应在覆盖第三方样式时谨慎使用',
			'`:is()` 取参数中最高权重，`:where()` 权重恒为 0，适合写基础样式',
			'`@layer` 可以先按层比较，未分层的样式优先级最高，便于业务覆盖组件库',
			'`::before/::after` 必须写 content 才会生成盒子，默认是行内元素',
			'`nth-child` 按所有子元素计数，`nth-of-type` 只在同标签中计数'
		],
		tips: ['行内样式的优先级高于任何选择器，但低于 !important；Shadow DOM 内部样式默认不受外部影响']
	},
	{
		id: 'css-stack',
		cat: 'css',
		title: '层叠上下文与定位',
		summary: 'z-index 只在同一个层叠上下文内比较，父级层级低会整体压住子级。',
		points: [
			'z-index 生效前提：元素是定位元素（relative/absolute/fixed/sticky）或 flex/grid 子项',
			'创建层叠上下文的常见方式：定位 + z-index、transform、filter、opacity < 1、will-change、isolation',
			'子元素的 z-index 再大也跳不出父级层叠上下文，这是「弹窗被遮挡」的根因',
			'`position: sticky` 的参照是最近的可滚动祖先，祖先出现 overflow 非 visible 就会失效',
			'`position: fixed` 在有 transform 的祖先内会退化为相对该祖先定位'
		],
		tips: ['排查层级问题先看祖先链有没有 transform / filter / overflow，比盲目加 z-index: 9999 有效']
	},
	{
		id: 'css-responsive',
		cat: 'css',
		title: '单位与响应式',
		summary: 'px 固定、em 相对父级字号、rem 相对根字号、vw/vh 相对视口。',
		points: [
			'移动端常用「html 字号 + rem」或直接 vw 做等比缩放，小程序 rpx 则是 750 设计稿的换算单位',
			'`100vh` 在移动端会被地址栏影响，`100dvh` 跟随动态视口高度',
			'`clamp(min, preferred, max)` 可做流式字号，`min()` / `max()` 也是常用函数',
			'媒体查询按断点适配布局，容器查询按组件自身宽度适配，后者更适合组件库',
			'`prefers-color-scheme` 与 `prefers-reduced-motion` 是无障碍相关的常用媒体特性'
		],
		tips: ['设计稿 750px 转 rpx：1px = 1rpx；H5 上可用 postcss 自动把 px 转 vw，避免手动换算']
	},

	/* ------------------------------ HTML ------------------------------ */
	{
		id: 'html-struct',
		cat: 'html',
		title: '文档结构与语义化',
		summary: '语义化标签让结构自带含义，利于 SEO、无障碍与代码可读性。',
		points: [
			'`<!DOCTYPE html>` 触发标准模式，缺失会进入怪异模式导致盒模型异常',
			'head 三件套：charset、viewport、title；SEO 还需要 description 与 canonical',
			'article 表示可独立分发的内容，section 表示主题分区，纯样式分组用 div',
			'标题层级 h1~h6 应按结构递进，不要为了字号随意跳级',
			'语义化也影响无障碍：屏幕阅读器依赖角色与结构进行导航'
		],
		tips: ['「div 一把梭」是常见扣分点，面试回答要能说出 article/section/nav/main 的判定标准']
	},
	{
		id: 'html-form',
		cat: 'html',
		title: '表单',
		summary: '表单是前端交互的入口，type、label、校验属性决定了体验与可访问性。',
		points: [
			'input 的 type 会改变键盘与校验行为：email、tel、number、date、password',
			'label 的 for 关联控件 id，点击文字即可聚焦，是移动端体验的关键细节',
			'原生校验：required、pattern、min/max、novalidate（关闭浏览器气泡改自定义提示）',
			'fieldset + legend 做语义分组，禁用 fieldset 可一次性禁用组内控件',
			'autocomplete 正确填写（username、current-password、one-time-code）能让密码管理器正常工作'
		],
		tips: ['form 的 submit 会刷新页面，SPA 里要 preventDefault；原生校验只能作为体验优化，服务端校验不可省']
	},
	{
		id: 'html-load',
		cat: 'html',
		title: '资源加载与性能标签',
		summary: 'script 的加载时机、link 的预加载提示，直接决定首屏速度。',
		points: [
			'普通 script 会阻塞解析；defer 在解析完成后按顺序执行，async 下载完立即执行、顺序不确定',
			'`rel="preload"` 预加载当前页关键资源（需 as 指定类型），`prefetch` 预取下一跳的低优先级资源',
			'`rel="preconnect"` 提前建连（DNS + TCP + TLS），`dns-prefetch` 只做 DNS 解析',
			'`<img loading="lazy">` 原生懒加载，`decoding="async"` 避免解码阻塞',
			'图片用 srcset + sizes 适配不同 DPR，用 picture + source 做格式回退（WebP/AVIF）'
		],
		tips: ['preload 用错会抢带宽：只 preload 首屏确定会用到的资源，且必须与页面实际请求的类型一致']
	},
	{
		id: 'html-storage',
		cat: 'html',
		title: '浏览器存储',
		summary: 'Cookie、localStorage、sessionStorage、IndexedDB 各有容量与用途边界。',
		points: [
			'Cookie 约 4KB，同源请求自动携带，适合会话标识；必须配 HttpOnly + Secure + SameSite',
			'localStorage 约 5MB、长期有效、同源共享；sessionStorage 按标签页隔离、关闭即清空',
			'两者都只能存字符串，对象要 JSON 序列化；读写是同步的，大对象会阻塞主线程',
			'IndexedDB 支持大容量与事务，适合离线数据、文件缓存，API 是异步的',
			'跨标签页同步可监听 storage 事件，或用 BroadcastChannel'
		],
		tips: ['「token 存 localStorage 还是 Cookie」要结合 XSS/CSRF 风险回答，没有绝对答案，关键在配套防护']
	},
	{
		id: 'html-media',
		cat: 'html',
		title: '多媒体与图形',
		summary: 'img/video/audio 负责媒体资源，canvas 与 svg 负责绘制，canvas 是位图、svg 是矢量。',
		points: [
			'video 的 preload（none/metadata/auto）、poster、playsinline 决定加载与播放行为',
			'自动播放需要 muted，移动端还需 playsinline 才能内联播放',
			'canvas 逐像素绘制、适合大量图形与像素操作；svg 是 DOM、支持 CSS 与事件、缩放不失真',
			'WebGL 用于 3D 与高性能渲染，底层是 GPU 管线',
			'图片必须有 alt：有意义写描述，纯装饰写 alt=""'
		],
		tips: ['图表在数据量大时选 canvas、需要交互与可访问性时选 svg，这是图表库提供双渲染器的原因']
	},
	{
		id: 'html-a11y',
		cat: 'html',
		title: '可访问性基础',
		summary: '让键盘用户与读屏用户也能完整使用页面，核心是可聚焦、可命名、可感知。',
		points: [
			'交互元素优先用原生 button/a/input，原生标签自带键盘与语义支持',
			'tabindex=0 进入 Tab 顺序，tabindex=-1 只能脚本聚焦（弹窗焦点管理常用）',
			'纯图标按钮需要 aria-label 提供可访问名称；有可见文本时不要重复设置',
			'表单错误提示用 aria-describedby 关联，动态区域用 aria-live 播报',
			'保留可见的键盘焦点样式（:focus-visible），不要全局 outline: none'
		],
		tips: ['弹窗要做焦点陷阱与关闭后焦点归还，这是无障碍评审最常见的扣分项']
	},

	/* ------------------------------ Vue ------------------------------ */
	{
		id: 'vue-reactivity',
		cat: 'vue',
		title: '响应式原理',
		summary: 'Vue 3 用 Proxy 拦截读写 + effect 依赖收集，数据变化时精准触发更新。',
		points: [
			'ref 包装任意类型，脚本里通过 .value 访问，模板中自动解包；reactive 只对对象有效',
			'computed 是惰性 effect，有缓存，依赖不变不重算；不要在 computed 里做副作用',
			'watch 显式声明依赖、能拿新旧值；watchEffect 自动收集、立即执行一次',
			'解构 reactive 会丢失响应性，需要用 toRefs；shallowRef 只监听 .value 整体替换',
			'Vue 2 的 defineProperty 无法监听新增属性与数组下标，这是 $set 存在的原因'
		],
		tips: ['「为什么改了对象属性视图不更新」先看是 reactive 解构、还是给 ref 内部对象整体替换导致']
	},
	{
		id: 'vue-comms',
		cat: 'vue',
		title: '组件通信',
		summary: '父子用 props / emit，跨层用 provide-inject，全局用 Pinia。',
		points: [
			'props 向下、emit 向上，v-model 是 `:modelValue` + `@update:modelValue` 的语法糖',
			'$attrs 承载未声明的属性与事件，配合 inheritAttrs: false 精确控制透传落点',
			'provide / inject 解决跨层传递，注入的响应式值建议配套 getter/setter 方法',
			'插槽分默认插槽、具名插槽、作用域插槽，作用域插槽把子组件数据暴露给父组件渲染',
			'事件总线（mitt）适合简单场景，复杂状态一律用状态管理，避免数据流不可追踪'
		],
		tips: ['「兄弟组件怎么通信」的标准答案是状态提升到父级，再考虑 Pinia，不要上来就事件总线']
	},
	{
		id: 'vue-lifecycle',
		cat: 'vue',
		title: '生命周期',
		summary: 'setup 最早，随后 created、mounted、updated、unmounted；组合式里用 onXxx 注册。',
		points: [
			'setup 在 beforeCreate 之前执行，拿不到 this，也访问不到组件实例方法',
			'onMounted 时 DOM 已可用，适合初始化图表、测量尺寸、绑定第三方库',
			'onUnmounted 负责清理定时器、事件监听、订阅，否则会造成内存泄漏',
			'keep-alive 缓存的组件触发 activated / deactivated 而非 mounted / unmounted',
			'nextTick 等 DOM 更新完成后执行回调，Vue 3 基于微任务'
		],
		tips: ['「接口请求放哪个生命周期」：组合式统一在 setup/onMounted 里发起，注意组件卸载时的取消逻辑']
	},
	{
		id: 'vue-directive',
		cat: 'vue',
		title: '模板指令',
		summary: 'v-if/v-show 控制渲染，v-for 列表渲染，v-model 双向绑定，key 决定复用。',
		points: [
			'v-if 销毁重建、v-show 只切 display；频繁切换用 v-show，初始不渲染用 v-if',
			'v-for 必须配稳定唯一的 key，避免用数组下标导致状态错位',
			'Vue 3 中 v-if 优先级高于 v-for，不能在同元素上用 v-if 访问迭代变量',
			'v-model 支持多个（v-model:title）与修饰符（.trim/.number/.lazy）',
			'v-memo 可跳过子树更新，v-once 只渲染一次，都是长列表的优化手段'
		],
		tips: ['自定义指令适合封装聚焦、拖拽、权限隐藏、埋点等 DOM 层逻辑，不适合承载业务状态']
	},
	{
		id: 'vue-composition',
		cat: 'vue',
		title: '组合式 API',
		summary: '把「同一个功能的 state、computed、watch、生命周期」写在一起，按功能而非选项组织代码。',
		points: [
			'`<script setup>` 是编译时语法糖，顶层变量与导入自动暴露给模板',
			'defineProps / defineEmits / defineExpose 是编译器宏，不需要 import',
			'组合式函数（composable）是普通函数，返回响应式状态与方法，替代 mixin 的逻辑复用',
			'`<script setup>` 组件实例默认封闭，父组件要访问内部方法必须 defineExpose',
			'组合式函数内部可以使用生命周期钩子，必须在 setup 同步执行期间调用'
		],
		tips: ['「composable 相比 mixin 好在哪」要答到：来源清晰、无命名冲突、可传参、可组合']
	},
	{
		id: 'vue-ecosystem',
		cat: 'vue',
		title: '路由与状态管理',
		summary: 'Vue Router 管页面与守卫，Pinia 管跨组件共享状态。',
		points: [
			'路由模式：history 需要服务端 fallback，hash 不需要；meta 常用来存权限与标题',
			'导航守卫：全局 beforeEach 做鉴权，组件内 beforeRouteEnter/Update 处理局部逻辑',
			'路由懒加载 `() => import()` 是拆包与首屏优化的基础手段',
			'Pinia 用 defineStore 声明 state/getters/actions，去掉 mutations，TS 推导开箱可用',
			'需要持久化的状态用插件写 localStorage，注意版本迁移与敏感信息'
		],
		tips: ['守卫里忘记调用 next 或返回值会让导航挂起；异步鉴权要对登录页放行避免死循环']
	},

	/* ------------------------------ React ------------------------------ */
	{
		id: 'react-jsx',
		cat: 'react',
		title: 'JSX 与渲染',
		summary: 'JSX 编译成 React.createElement 调用，产出描述 UI 的对象，由 React 负责更新 DOM。',
		points: [
			'JSX 中表达式用 {}，属性用 camelCase（className、htmlFor），style 接收对象',
			'虚拟 DOM 的价值是声明式 + 批量最小更新 + 跨平台，而不是绝对性能',
			'Fiber 把渲染拆成可中断的小单元，支持并发特性与时间切片',
			'reconciliation 采用同层比较：type 不同直接重建子树，同类型比较 props 递归',
			'列表 key 必须是稳定唯一标识，用下标在重排时会复用错组件实例'
		],
		tips: ['「React 比原生 DOM 快吗」是伪命题：单次精确更新直接操作 DOM 更快，虚拟 DOM 赢在复杂状态下的可维护性']
	},
	{
		id: 'react-state',
		cat: 'react',
		title: 'State 与更新',
		summary: 'state 是不可变快照，更新会触发重渲染，多次更新会被批处理合并。',
		points: [
			'直接修改对象/数组不会触发更新，必须创建新引用（展开、map、filter 或 immer）',
			'setState 是异步批处理的，同一轮里读不到新值；依赖旧值要用函数式更新 `setX(v => v + 1)`',
			'React 18 起自动批处理覆盖 Promise、setTimeout 与原生事件',
			'状态提升：兄弟组件共享数据时把 state 放到共同父级，保证单一数据源',
			'派生状态不要用 state 存，直接在渲染中计算，避免不同步'
		],
		tips: ['「连续 setCount(count+1) 三次为什么只加 1」是最经典的闭包快照题']
	},
	{
		id: 'react-effect',
		cat: 'react',
		title: '副作用与生命周期',
		summary: 'useEffect 在渲染提交后执行，依赖数组决定何时重新执行，返回值负责清理。',
		points: [
			'不传依赖：每次渲染后执行；空数组：仅挂载后执行一次；有依赖：依赖变化时执行',
			'清理函数在下一次 effect 执行前与组件卸载时调用，用于取消订阅、清除定时器、中止请求',
			'useLayoutEffect 在 DOM 变更后、绘制前同步执行，适合测量布局；会阻塞绘制',
			'事件处理、数据请求之外的副作用（订阅、DOM 操作）才需要 effect',
			'依赖漏写会读到过期闭包变量，用 eslint 的 exhaustive-deps 规则兜底'
		],
		tips: ['「定时器里拿到的 state 永远是初始值」= 闭包陷阱，解法是函数式更新、useRef 或正确写依赖']
	},
	{
		id: 'react-hooks',
		cat: 'react',
		title: 'Hooks 规则与常用 Hooks',
		summary: 'Hooks 按调用顺序存储，只能在顶层调用；常用的一共不到十个。',
		points: [
			'不能在条件、循环、嵌套函数里调用 Hook，否则状态会错位',
			'useState 管状态、useRef 管可变引用（不触发渲染）、useContext 读上下文',
			'useMemo 缓存计算结果、useCallback 缓存函数引用、React.memo 浅比较 props',
			'useReducer 适合状态关联复杂或下一状态依赖上一状态的场景',
			'自定义 Hook 本质是复用有状态逻辑的函数，必须以 use 开头'
		],
		tips: ['不要给所有函数都套 useCallback：缓存本身有比较成本，先定位真实性能问题']
	},
	{
		id: 'react-perf',
		cat: 'react',
		title: '性能优化',
		summary: '先测量再优化：减少无效渲染、缩小更新范围、拆分加载体积。',
		points: [
			'用 React DevTools Profiler 找出重复渲染的组件与原因',
			'memo + useMemo/useCallback 保持引用稳定，避免对象 props 每次新建',
			'Context 的 value 用 useMemo 稳定，按更新频率拆分多个 Context',
			'长列表用虚拟滚动（react-window），避免一次渲染上千节点',
			'路由级 lazy + Suspense 拆包，减少首屏 JS 体积'
		],
		tips: ['startTransition / useDeferredValue 把非紧急更新降级，保证输入等高优交互不卡顿']
	},
	{
		id: 'react-manage',
		cat: 'react',
		title: '状态管理与组件复用',
		summary: '局部 state → 状态提升 → Context → 状态库，按复杂度逐级选择。',
		points: [
			'HOC 包装组件注入 props，render props 通过函数传渲染逻辑，Hook 直接复用逻辑',
			'Context 适合低频变化的全局数据（主题、用户信息），高频变化需要选择器订阅',
			'Zustand/Redux Toolkit 提供选择器与中间件，适合跨页面共享的复杂状态',
			'服务端状态（接口数据）用 TanStack Query/SWR 管理缓存与重新验证，不要塞进全局 store',
			'受控组件便于校验与联动，非受控 + ref 代码更少，按交互复杂度选择'
		],
		tips: ['「什么时候该上状态库」的判断标准：跨页面共享 + 更新频繁 + 需要调试追踪，三者都满足才值得']
	},

	/* ------------------------------ Node.js ------------------------------ */
	{
		id: 'node-module',
		cat: 'node',
		title: '模块系统',
		summary: 'CommonJS 运行时同步加载、有缓存；ESM 静态结构、支持 tree-shaking。',
		points: [
			'CJS 用 require / module.exports，首次加载后结果缓存在 require.cache，模块级状态是共享的',
			'ESM 的 import 会提升到模块顶部，依赖在解析阶段确定，因此可以被静态分析',
			'ESM 中拿不到 __dirname / __filename，需要从 import.meta.url 转换',
			'循环依赖在 CJS 里会拿到未执行完的部分导出（常见为空对象）',
			'package.json 的 type、exports 决定 Node 如何解析入口与子路径'
		],
		tips: ['「为什么 require 两次拿到同一个对象」考的就是模块缓存，改缓存可强制重新加载但不推荐用于业务']
	},
	{
		id: 'node-loop',
		cat: 'node',
		title: '事件循环与异步',
		summary: 'Node 是单线程 + 非阻塞 IO，事件循环分阶段推进，阶段间清空微任务。',
		points: [
			'阶段顺序：timers → pending callbacks → poll → check(setImmediate) → close callbacks',
			'微任务：process.nextTick（优先）与 Promise.then，每个宏任务后清空',
			'递归 nextTick 会饿死事件循环，需要让出控制权时用 setImmediate',
			'poll 阶段会阻塞等待 IO 事件，是耗时最长的一环',
			'setTimeout(fn, 0) 不保证立即执行，且嵌套调用有最小延迟限制'
		],
		tips: ['「nextTick 和 setImmediate 谁先」是高频题：同一轮内 nextTick 先，但 IO 回调里的顺序依赖上下文']
	},
	{
		id: 'node-stream',
		cat: 'node',
		title: 'Buffer 与 Stream',
		summary: 'Buffer 是定长字节数组，Stream 是分块处理数据、控制内存占用的抽象。',
		points: [
			'Buffer 继承 Uint8Array，长度固定；alloc 会清零，allocUnsafe 更快但可能残留旧数据',
			'四种流：Readable、Writable、Duplex、Transform',
			'背压：write() 返回 false 时应等待 drain 事件，pipe 会自动处理',
			'pipe 不会传递错误，生产代码用 stream.pipeline 统一销毁与错误处理',
			'大文件读写必须用流，readFile 一次性读入会 OOM'
		],
		tips: ['「如何拷贝大文件」的标准答案是 createReadStream + pipeline，而不是 readFile + writeFile']
	},
	{
		id: 'node-fs',
		cat: 'node',
		title: '文件与路径',
		summary: '异步优先、流式处理大文件，路径拼接与解析统一用 path 模块。',
		points: [
			'同步 API 会阻塞事件循环，只适合启动阶段读配置或 CLI 脚本',
			'path.join 只拼接规范化，path.resolve 生成绝对路径（相对 cwd）',
			'__dirname 是文件所在目录，process.cwd 是进程启动目录，部署方式不同会变',
			'路径拼接要防目录穿越（..），对外提供的静态服务必须做白名单校验',
			'文件监听用 fs.watch（平台差异大）或 chokidar 这类封装库'
		],
		tips: ['「读相对路径文件找不到」八成是用了 cwd 而不是 __dirname']
	},
	{
		id: 'node-process',
		cat: 'node',
		title: '进程、线程与集群',
		summary: '单线程受 GIL 式限制无法吃满多核，用 cluster 或 worker_threads 扩展。',
		points: [
			'cluster 创建多个进程共享端口，主进程负责分发连接，适合 HTTP 服务横向扩展',
			'worker_threads 同进程内多线程，可用 SharedArrayBuffer 共享内存，适合 CPU 密集计算',
			'child_process：exec 走 shell 并缓冲输出，spawn 流式输出更适合大数据量',
			'进程间不共享内存，会话状态要放 Redis 等外部存储',
			'优雅停机：停止接收新请求 → 等待在途请求 → 关闭连接池 → 退出'
		],
		tips: ['容器部署时用 K8s 做多副本即可，不必再叠一层 PM2 cluster']
	},
	{
		id: 'node-npm',
		cat: 'node',
		title: '包管理与依赖',
		summary: 'package.json 声明范围，lock 文件锁定精确版本，语义化版本决定可升级范围。',
		points: [
			'`^1.2.3` 允许次版本与补丁升级，`~1.2.3` 只允许补丁，精确版本不带前缀',
			'lock 文件记录依赖树的实际版本与完整性哈希，应用项目必须提交',
			'peerDependencies 用于插件声明宿主依赖，安装冲突时要显式对齐版本',
			'npm ls / pnpm why 可定位依赖来源，overrides/resolutions 可强制统一版本',
			'幽灵依赖：node_modules 扁平化后能 import 未声明的包，pnpm 的严格结构可以避免'
		],
		tips: ['「升级依赖后本地能跑线上报错」通常是 lock 未提交或 CI 用了不同包管理器']
	},

	/* ------------------------------ 浏览器与网络 ------------------------------ */
	{
		id: 'browser-render',
		cat: 'browser',
		title: '渲染流程',
		summary: 'HTML → DOM，CSS → CSSOM，合成渲染树后布局、绘制、合成上屏。',
		points: [
			'解析 HTML 时遇到同步 script 会阻塞，defer/async/module 可避免',
			'布局（reflow）计算几何信息，绘制（repaint）填充像素，合成（composite）交给 GPU',
			'改 width/height/font-size 触发重排，改 color 只重绘，改 transform/opacity 只走合成',
			'频繁读取 offsetHeight 等属性会强制同步布局（布局抖动）',
			'主线程同时负责 JS 与渲染，长任务会直接导致掉帧与输入延迟'
		],
		tips: ['优化动画优先用 transform/opacity，并避免在滚动回调里读写布局属性']
	},
	{
		id: 'browser-cache',
		cat: 'browser',
		title: 'HTTP 缓存',
		summary: '强缓存不发请求，协商缓存发请求验证后返回 304。',
		points: [
			'强缓存：Cache-Control（max-age、no-cache、no-store、immutable）优先于 Expires',
			'协商缓存：ETag/If-None-Match 精确到内容，Last-Modified/If-Modified-Since 精确到秒',
			'no-cache 是「可以缓存但每次要验证」，no-store 才是完全不缓存',
			'最佳实践：HTML 不缓存，带 contenthash 的静态资源长期强缓存',
			'Service Worker 可以在此之上做离线缓存与自定义策略'
		],
		tips: ['「发布后用户看到旧页面」通常是 HTML 被强缓存，入口文件必须走协商或短缓存']
	},
	{
		id: 'browser-cors',
		cat: 'browser',
		title: '同源策略与跨域',
		summary: '同源 = 协议 + 域名 + 端口完全相同，跨域限制的是「读响应」，请求本身可以发出。',
		points: [
			'CORS：服务端返回 Access-Control-Allow-Origin 等响应头，浏览器据此放行',
			'带自定义头或 application/json 会触发 OPTIONS 预检，需要响应 Allow-Methods/Allow-Headers',
			'携带 Cookie 时不能使用 `*`，必须回显具体 Origin 且 Allow-Credentials: true',
			'开发环境常用代理（devServer proxy / Vite proxy）绕开跨域，生产用同域部署或网关转发',
			'JSONP 只支持 GET 且有 XSS 风险，已基本淘汰'
		],
		tips: ['「跨域是浏览器行为，服务端之间调用不受限」这句话要能自然说出来']
	},
	{
		id: 'browser-net',
		cat: 'browser',
		title: '网络协议栈',
		summary: 'DNS 找地址、TCP 建连接、TLS 保安全、HTTP 传数据，HTTP/2 多路复用、HTTP/3 用 QUIC。',
		points: [
			'DNS 逐级查询并缓存，可用 dns-prefetch、HTTPDNS 优化与防劫持',
			'TCP 三次握手确认双方收发能力；TLS 握手协商密钥并校验证书',
			'HTTP/1.1 有队头阻塞，浏览器同域并发约 6 个连接',
			'HTTP/2 多路复用 + 头部压缩，但底层 TCP 丢包仍会拖累所有流',
			'HTTP/3 基于 QUIC（UDP），支持 0-RTT 与连接迁移，避免传输层队头阻塞'
		],
		tips: ['HTTP/2 下不要再做域名分片，合并域名复用连接反而更快']
	},
	{
		id: 'browser-security',
		cat: 'browser',
		title: '前端安全',
		summary: 'XSS 防「代码被执行」，CSRF 防「身份被借用」，两者防护手段不同。',
		points: [
			'XSS 防护：输入校验 + 按输出上下文编码 + CSP 限制脚本来源',
			'innerHTML、v-html、dangerouslySetInnerHTML 是 XSS 高发点，必须净化（DOMPurify）',
			'CSRF 防护：SameSite Cookie、校验 Origin/Referer、CSRF Token',
			'Cookie 的 HttpOnly 防止脚本读取，Secure 限定 HTTPS，SameSite 限制跨站携带',
			'点击劫持用 X-Frame-Options / frame-ancestors 防护，第三方依赖要定期审计'
		],
		tips: ['「HTML 转义能不能防 CSRF」不能——那是 XSS 的手段，两者常被混淆']
	},
	{
		id: 'browser-api',
		cat: 'browser',
		title: '常用 Web API',
		summary: '存储、观察者、通信、性能四类 API 覆盖了大部分业务场景。',
		points: [
			'IntersectionObserver 做懒加载与曝光埋点，避免 scroll 里高频计算',
			'MutationObserver 监听 DOM 变化，ResizeObserver 监听尺寸变化',
			'Web Worker 后台计算、Service Worker 拦截请求做离线缓存，都不能访问 DOM',
			'BroadcastChannel / storage 事件做跨标签页通信',
			'navigator.sendBeacon 保证页面卸载时的埋点送达；PerformanceObserver 采集 LCP/CLS 等指标'
		],
		tips: ['「页面关闭时上报数据」首选 sendBeacon，其次是 fetch keepalive，不要用同步 XHR']
	},

	/* ------------------------------ 工程化 ------------------------------ */
	{
		id: 'build-module',
		cat: 'build',
		title: '模块化演进',
		summary: '从全局脚本到 IIFE、CJS、AMD，再到 ESM，核心诉求是「作用域隔离 + 依赖可追踪」。',
		points: [
			'IIFE 用函数作用域隔离变量，通过参数注入依赖',
			'CommonJS 同步加载、运行时求值，适合 Node；AMD 异步加载，浏览器时代产物',
			'ESM 静态结构、编译期可分析，支持 tree-shaking 与循环引用的实时绑定',
			'ESM 的 import 是只读引用，导出值变化会实时反映（live binding）',
			'现代构建工具以 ESM 为一等公民，CJS 依赖通过预构建转换'
		],
		tips: ['「为什么 ESM 能做 tree-shaking」的答案只有一句：依赖关系在静态解析阶段就确定']
	},
	{
		id: 'build-webpack',
		cat: 'build',
		title: 'Webpack 核心概念',
		summary: 'entry 出发递归构建依赖图，loader 转换文件，plugin 介入生命周期，最终输出 bundle。',
		points: [
			'entry / output / module.rules / plugins / mode 是五大配置块',
			'loader 从右到左链式执行，只处理单个文件；plugin 通过 Tapable 钩子做全局操作',
			'splitChunks 拆包、MiniCssExtractPlugin 抽离样式、DefinePlugin 注入常量',
			'`[contenthash]` 按文件内容生成，是长期缓存的关键',
			'持久化缓存（filesystem）能大幅提升二次构建速度，但配置或依赖变更需清缓存'
		],
		tips: ['「loader 和 plugin 的区别」是必问题，记住 loader 管文件、plugin 管流程']
	},
	{
		id: 'build-vite',
		cat: 'build',
		title: 'Vite 原理',
		summary: '开发期用浏览器原生 ESM 按需编译，依赖用 esbuild 预构建；生产用 Rollup 打包。',
		points: [
			'dev 只启动静态服务器，请求到哪个模块才转换哪个模块，冷启动与项目规模解耦',
			'依赖预构建：把 CJS 转 ESM 并合并请求，产物缓存到 node_modules/.vite',
			'HMR 基于 ESM 的模块边界，只让受影响的模块链失效，粒度比整页刷新更细',
			'生产构建用 Rollup，插件生态成熟；rolldown 是正在推进的 Rust 替代方案',
			'`optimizeDeps.include/exclude` 用来处理预构建识别失败的依赖'
		],
		tips: ['「Vite 生产环境为什么不用 esbuild 打包」要答到：代码分割、CSS 处理与插件生态成熟度']
	},
	{
		id: 'build-compile',
		cat: 'build',
		title: '编译与转译',
		summary: 'Babel 转语法、core-js 补 API、PostCSS 处理样式、browserslist 决定兼容范围。',
		points: [
			'Babel 解析成 AST 后用插件转换，preset-env 依据 browserslist 决定需要哪些转换',
			'polyfill 补的是运行时 API（Promise、Array.at），语法转换补的是写法（可选链、箭头函数）',
			'PostCSS 是 CSS 转换平台，Autoprefixer 依据 browserslist 自动加前缀',
			'esbuild / swc 用原生语言实现，速度比 Babel 快一个量级，适合开发期',
			'`useBuiltIns: usage` 按实际使用注入 polyfill，避免全量引入'
		],
		tips: ['「polyfill 会不会打进包」会，而且会增加体积，所以兼容范围要按真实用户分布定']
	},
	{
		id: 'build-optimize',
		cat: 'build',
		title: '产物与加载优化',
		summary: '减小体积、拆好包、用好缓存与预加载，是构建优化的三条主线。',
		points: [
			'tree-shaking + 按需引入（组件库）+ 依赖替换（dayjs 替代 moment）',
			'代码分割：路由级懒加载、抽离 vendor、按交互触发懒加载',
			'压缩：Terser/esbuild 压 JS，cssnano 压 CSS，构建期预压缩 gzip/brotli',
			'缓存策略：contenthash + 长期强缓存，HTML 短缓存',
			'预加载：preload 关键资源、modulepreload 预解析模块依赖图'
		],
		tips: ['先用 bundle-analyzer 看体积构成再动手，盲目拆包会增加请求数与调度开销']
	},
	{
		id: 'build-ci',
		cat: 'build',
		title: '规范与流水线',
		summary: 'ESLint 管质量、Prettier 管风格、Husky 拦提交、CI 做门禁与发布。',
		points: [
			'ESLint 关注潜在 bug 与规范，Prettier 只管排版，两者用 eslint-config-prettier 解耦',
			'Husky + lint-staged 只检查暂存区文件，避免全量检查拖慢提交',
			'commitlint 约束提交信息，changesets 管理多包版本与发布',
			'CI 流程：安装依赖（带缓存）→ lint/单测 → 构建 → 上传产物 → 部署',
			'灰度发布配合监控与回滚能力，比一次性全量发布安全得多'
		],
		tips: ['「提交前检查应该多严」要平衡：卡得太死会让人用 --no-verify 绕过，反而更糟']
	},

	/* ------------------------------ 算法与数据结构 ------------------------------ */
	{
		id: 'algo-complexity',
		cat: 'algo',
		title: '复杂度分析',
		summary: '只看增长趋势不看常数：O(1) < O(log n) < O(n) < O(n log n) < O(n²)。',
		points: [
			'时间复杂度关注最坏或均摊情况，空间复杂度包含递归栈',
			'忽略常数与低阶项，嵌套循环相乘、顺序执行相加',
			'二分与树的高度是 log n，排序最优是 n log n（比较排序下界）',
			'哈希表平均 O(1)、最坏 O(n)；数组随机访问 O(1)、插入删除 O(n)',
			'递归算法要写出递推式，如 T(n) = 2T(n/2) + O(n) → O(n log n)'
		],
		tips: ['面试写代码后主动报复杂度，并说明瓶颈在哪，比等面试官问更好']
	},
	{
		id: 'algo-struct',
		cat: 'algo',
		title: '常用数据结构',
		summary: '数组、链表、栈、队列、哈希表、树、堆、图，选型取决于访问模式。',
		points: [
			'数组连续内存、缓存友好；链表插入删除 O(1) 但查找 O(n) 且缓存不友好',
			'栈后进先出（括号匹配、DFS、撤销），队列先进先出（BFS、任务调度）',
			'哈希表 O(1) 查找，需要处理冲突与扩容；TreeMap/有序结构在需要范围查询时更合适',
			'堆解决 TopK 与优先队列，插入删除 O(log n)，取极值 O(1)',
			'并查集处理连通性，Trie 处理前缀匹配'
		],
		tips: ['JS 里没有内置堆，面试需要手写或用排序近似，要能说清复杂度差异']
	},
	{
		id: 'algo-sort',
		cat: 'algo',
		title: '排序算法',
		summary: '快排平均最快、归并稳定、堆排原地，工程里多用混合排序。',
		points: [
			'快排：平均 O(n log n)，最坏 O(n²)（划分极不均衡），不稳定，原地',
			'归并：稳定 O(n log n)，需要 O(n) 额外空间，适合链表与外部排序',
			'堆排：O(n log n) 原地但不稳定，缓存不友好',
			'插入排序在基本有序时接近 O(n)，是小数组的优选',
			'V8 的 Array.sort 用 Timsort（归并 + 插入），稳定且对部分有序数据高效'
		],
		tips: ['「如何避免快排最坏情况」：随机基准、三数取中、三路划分处理大量重复元素']
	},
	{
		id: 'algo-search',
		cat: 'algo',
		title: '查找与双指针',
		summary: '有序用二分，无序用哈希，连续区间用滑动窗口。',
		points: [
			'二分要求有序且支持随机访问，注意边界（left <= right 还是 <）与 mid 溢出',
			'哈希表 O(n) 空间换 O(1) 查找，适合两数之和、去重、计数',
			'双指针分对撞（有序数组两数之和）与快慢（链表判环、去重）',
			'滑动窗口维护可增量更新的状态，解决「最长/最短满足条件的连续子数组」',
			'前缀和把区间求和降到 O(1)，二维场景用二维前缀和'
		],
		tips: ['二分查找的变体（找左边界、右边界、旋转数组）比基础版更常考']
	},
	{
		id: 'algo-recursion',
		cat: 'algo',
		title: '递归与分治',
		summary: '递归要写清「终止条件 + 单层逻辑 + 返回值含义」，分治是递归的一种应用。',
		points: [
			'递归三要素：参数与返回值、终止条件、单层递归逻辑',
			'递归深度受调用栈限制，JS 约一万层就会栈溢出，需改迭代或显式栈',
			'分治：分解 → 解决子问题 → 合并，归并排序与快排都是典型',
			'回溯是带撤销的递归（组合、排列、子集），注意剪枝与去重',
			'树的问题几乎都可以用递归解决，先想清楚遍历顺序（前/中/后/层序）'
		],
		tips: ['写递归前先在纸上画三层调用，确认终止条件与返回值，比直接敲代码快']
	},
	{
		id: 'algo-dp',
		cat: 'algo',
		title: '动态规划',
		summary: '有重叠子问题与最优子结构时，用表格或记忆化避免重复计算。',
		points: [
			'五步法：定义 dp 含义 → 推导状态转移 → 初始化 → 确定遍历顺序 → 举例验证',
			'01 背包倒序遍历容量，完全背包正序遍历，顺序决定物品能否重复使用',
			'一维滚动数组可以压缩空间，但要注意依赖方向',
			'线性 DP（打家劫舍、股票）、区间 DP（回文）、树形 DP 是常见分类',
			'贪心是 DP 的特例，能用贪心时优先贪心（更简单），但需要证明局部最优可得全局最优'
		],
		tips: ['「这题为什么不能用贪心」是常见追问，准备一个反例比背结论更有说服力']
	},

	/* ------------------------------ Python ------------------------------ */
	{
		id: 'py-type',
		cat: 'py',
		title: '数据类型与可变性',
		summary: '一切皆对象，变量是引用；可变与不可变决定了赋值、传参与哈希行为。',
		points: [
			'不可变：int、float、str、tuple、frozenset；可变：list、dict、set、bytearray',
			'不可变对象可哈希，能作为 dict 键与 set 元素；list 不可哈希',
			'dict 3.7+ 保持插入顺序，set 无序去重，查找都是平均 O(1)',
			'`a = b` 只复制引用，浅拷贝 copy() 复制一层，深拷贝 deepcopy() 递归复制',
			'`is` 比较身份（id），`==` 比较值；判断 None 一律用 `is None`'
		],
		tips: ['小整数（-5~256）与短字符串有驻留机制，用 is 比较偶然为真，不能依赖']
	},
	{
		id: 'py-func',
		cat: 'py',
		title: '函数与参数',
		summary: '位置参数、默认参数、*args、仅关键字参数、**kwargs，顺序固定。',
		points: [
			'默认参数在函数定义时求值一次，可变默认值（`lst=[]`）会被所有调用共享，是经典陷阱',
			'*args 收集多余位置参数为元组，**kwargs 收集关键字参数为字典；调用时可用 * / ** 解包',
			'函数是一等对象，可以赋值、作为参数、作为返回值，装饰器与闭包都基于这一点',
			'lambda 只能包含单个表达式，适合作为 key / 短回调',
			'类型注解不影响运行，`from __future__ import annotations` 可延迟求值避免循环引用'
		],
		tips: ['「默认参数为什么不能用 []」几乎必问，正确写法是 `lst=None` 再在函数体内初始化']
	},
	{
		id: 'py-scope',
		cat: 'py',
		title: '作用域与闭包',
		summary: 'LEGB 查找顺序：局部 → 外层函数 → 全局 → 内置。',
		points: [
			'函数内只要有赋值语句，该名字在整个函数内都是局部变量，先用后赋值会 UnboundLocalError',
			'global 修改模块级变量，nonlocal 修改最近外层函数变量',
			'闭包持有外层变量引用，`__closure__` 可查看；循环中的 lambda 是延迟绑定，需要默认参数固定',
			'装饰器本质是 `f = deco(f)`，包装时用 functools.wraps 保留元信息',
			'类体不是闭包作用域，类内方法访问类变量必须用 self 或类名'
		],
		tips: ['装饰器带参数时是三层函数：外层收参数、中层收函数、内层是包装逻辑']
	},
	{
		id: 'py-oop',
		cat: 'py',
		title: '面向对象',
		summary: '一切皆对象；`__new__` 创建实例，`__init__` 初始化，MRO 决定方法查找顺序。',
		points: [
			'实例方法收 self，classmethod 收 cls（替代构造器），staticmethod 无隐式参数',
			'`__new__` 返回实例，`__init__` 初始化；返回非本类实例时 `__init__` 不执行',
			'多继承按 C3 线性化，`super()` 沿 MRO 调用下一环，而不是「调用父类」',
			'定义 `__eq__` 后 `__hash__` 会变为 None，需要哈希时必须显式重写',
			'`@property` 把方法变成属性访问，`@dataclass` 自动生成构造与比较方法，`__slots__` 省内存'
		],
		tips: ['「`__str__` 和 `__repr__` 区别」：前者给用户看（print），后者给开发者看（调试/交互式）']
	},
	{
		id: 'py-concurrency',
		cat: 'py',
		title: '并发模型',
		summary: 'GIL 让多线程无法并行跑字节码：IO 密集用线程/协程，CPU 密集用多进程。',
		points: [
			'GIL 保证同一时刻只有一个线程执行字节码，IO 阻塞时会释放，所以多线程对 IO 有效',
			'multiprocessing 每个进程独立解释器与内存，真正并行，代价是进程开销与序列化通信',
			'asyncio 单线程事件循环，async/await 在等待点切换，适合海量 IO 并发',
			'协程里调用阻塞函数会卡死整个循环，需要 run_in_executor 或异步库',
			'线程安全靠 Lock/Queue，共享可变状态越少越好'
		],
		tips: ['「Python 多线程有用吗」要分场景回答：IO 密集有用，CPU 密集受 GIL 限制']
	},
	{
		id: 'py-ecosystem',
		cat: 'py',
		title: '常用标准库与生态',
		summary: '标准库覆盖集合、迭代、文件、网络；数据与 Web 生态靠 numpy/pandas/FastAPI。',
		points: [
			'collections：Counter 计数、defaultdict 默认值、deque 双端队列、namedtuple',
			'itertools：chain、groupby、product、islice 等惰性迭代工具',
			'numpy 的 ndarray 用连续内存 + 向量化运算，比 list 循环快一到两个数量级',
			'pandas 的 loc 按标签、iloc 按位置索引，条件筛选推荐 `df.loc[条件, 列]`',
			'Web：FastAPI（类型注解 + Pydantic + 异步）与 Flask（轻量同步）；测试用 pytest + fixture'
		],
		tips: ['面试写 Python 题时优先用标准库（Counter、defaultdict、heapq），比手写更快也更专业']
	}
]

/** 按分类筛选 */
export function knowledgeOfCat(cat) {
	return knowledge.filter((k) => k.cat === cat)
}

/** 按 id 查询 */
export function findKnowledge(id) {
	return knowledge.find((k) => k.id === id) || null
}

/** 分类下的知识点数量 */
export function countKnowledge(cat) {
	return cat ? knowledgeOfCat(cat).length : knowledge.length
}

/** 搜索：标题 + 总结 + 要点 */
export function searchKnowledge(keyword) {
	const kw = String(keyword || '').trim().toLowerCase()
	if (!kw) return []
	return knowledge.filter((k) => {
		const hay = (k.title + ' ' + k.summary + ' ' + k.points.join(' ') + ' ' + (k.tips || []).join(' ')).toLowerCase()
		return hay.indexOf(kw) > -1
	})
}
