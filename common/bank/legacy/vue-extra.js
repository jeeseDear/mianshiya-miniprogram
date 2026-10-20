/**
 * 题库 · Vue 补充（vue-016 ~ vue-050）
 */

import { makeQuestions } from './helper.js'

export const questions = makeQuestions('vue', [
	['016', 2, 92, 'Vue 3 的响应式系统基于什么实现？', [
		'Proxy 拦截对象的读写，配合 effect 收集依赖',
		'Object.defineProperty 遍历属性',
		'定时轮询对比差异',
		'编译期静态分析'
	], ['A'], 'Vue 3 用 Proxy 代理整个对象，能监听新增/删除属性、数组下标与 length 变化，还能懒递归（访问到才代理）。\n\nVue 2 的 defineProperty 必须初始化时遍历所有属性，无法监听后加的属性和数组下标赋值，这是 `$set` 存在的原因。'],

	['017', 2, 90, '`ref` 与 `reactive` 的区别是？', [
		'ref 可包装任意类型（含基本类型），通过 .value 访问；reactive 只能用于对象，直接访问属性',
		'两者完全等价',
		'reactive 支持基本类型',
		'ref 不能用于对象'
	], ['A'], 'ref 内部用 RefImpl 包装，基本类型靠 value 的 getter/setter 追踪，对象会被转成 reactive；reactive 基于 Proxy，对基本类型无效。\n\n解构 reactive 会丢失响应性，需要 `toRefs`；模板中 ref 会自动解包，脚本里必须写 .value。'],

	['018', 1, 88, 'computed 相比普通函数调用的优势是？', [
		'有缓存，依赖不变时不会重新计算',
		'可以在模板里直接写',
		'自动异步执行',
		'不用返回值'
	], ['A'], 'computed 内部是一个惰性 effect，依赖变化才标记为脏，读取时才重算，多次访问复用结果。\n\n所以不要在 computed 里做副作用（发请求、改状态），那是 watch 的职责。'],

	['019', 2, 86, '`watch` 与 `watchEffect` 的区别是？', [
		'watch 显式声明依赖且能拿到新旧值；watchEffect 自动收集依赖、立即执行一次',
		'两者完全一样',
		'watchEffect 不能停止',
		'watch 不支持深度监听'
	], ['A'], 'watch 需要指明源（ref、getter、数组），回调收到 newVal/oldVal，默认懒执行（immediate 可改）；watchEffect 运行一次即自动追踪用到的响应式数据，适合依赖不固定的场景。\n\n两者都返回停止函数，组件卸载时会自动停止。'],

	['020', 2, 82, 'Vue 3 中 setup 与 beforeCreate 的执行顺序是？', [
		'setup 先于 beforeCreate 执行',
		'beforeCreate 先执行',
		'两者同时执行',
		'取决于是否使用 <script setup>'
	], ['A'], 'setup 在组件实例创建初期、beforeCreate 之前调用，因此拿不到 this，也访问不到组件实例上的方法。\n\n组合式 API 下 created 之前的钩子基本被 setup 取代。'],

	['021', 1, 88, '`v-if` 与 `v-show` 的选择依据是？', [
		'频繁切换用 v-show（改 display），初始不渲染或条件很少变为真用 v-if',
		'v-if 性能永远更好',
		'v-show 会销毁组件',
		'两者完全等价'
	], ['A'], 'v-if 是真正的条件渲染，切换时销毁/重建组件与事件监听，初始为假时零渲染开销；v-show 始终渲染只切 display，切换成本低但初始渲染开销大。\n\nv-if 与 v-for 同用时要避免（Vue 3 中 v-if 优先级更高，容易访问不到循环变量）。'],

	['022', 2, 90, '列表渲染中 `key` 的作用是？', [
		'帮助 diff 算法识别节点身份，正确复用或移动 DOM，避免状态错乱',
		'设置元素唯一 id 供 CSS 使用',
		'提升网络请求速度',
		'用于排序'
	], ['A'], 'key 是虚拟节点的身份标识，diff 时据此判断「同一节点」从而复用组件实例与 DOM；缺失或不稳定会导致输入框内容错位、动画异常、多余的重渲染。\n\n应使用业务唯一 id，避免用 index。'],

	['023', 3, 84, 'Vue 3 的 diff 算法主要做了什么优化？', [
		'同层比较 + 最长递增子序列（LIS）减少节点移动',
		'全量重建 DOM',
		'跨层级递归比对',
		'按 key 排序后整体替换'
	], ['A'], 'Vue 3 的 patchKeyedChildren 先做首尾快速比对，再处理乱序区间，用最长递增子序列找出无需移动的节点，把移动次数降到最少。\n\n同时引入静态提升、Patch Flag 等编译优化，跳过不会变化的节点。'],

	['024', 2, 82, '父组件向深层子组件传值，最合适的方式是？', [
		'provide / inject',
		'逐层 props 透传',
		'把所有状态放全局 window',
		'用 v-model 逐层绑定'
	], ['A'], 'provide/inject 让祖先直接向任意后代注入依赖，避免 props 层层传递（prop drilling）。\n\n注入的响应式值建议提供 readonly 包装或配套的修改方法，避免子组件随意改写导致数据流混乱。'],

	['025', 2, 78, '作用域插槽（scoped slot）解决的问题是？', [
		'子组件把内部数据暴露给父组件，由父组件决定如何渲染',
		'给插槽设置 CSS 作用域',
		'限制插槽数量',
		'让插槽内容自动继承 props'
	], ['A'], '子组件用 `<slot :item="item">` 把数据传出去，父组件通过 `v-slot="{ item }"` 拿到并渲染，实现「逻辑在子、结构由父决定」的复用模式。\n\n表格、下拉选择等组件大量使用这一模式。'],

	['026', 2, 76, '`<component :is="cur">` 的作用是？', [
		'动态渲染指定组件，cur 可以是组件名、组件对象或 HTML 标签名',
		'条件渲染的语法糖',
		'注册全局组件',
		'设置组件样式'
	], ['A'], '动态组件让同一位置按状态切换不同组件，配合 `<keep-alive>` 可缓存切换前的状态。\n\n注意用 `<script setup>` 时组件名需要显式导入或用 defineAsyncComponent，字符串名不再自动解析。'],

	['027', 2, 84, '`<keep-alive>` 的作用是？', [
		'缓存组件实例，切换时不销毁，保留内部状态与滚动位置',
		'缓存接口请求结果',
		'延迟加载组件',
		'防止组件重复注册'
	], ['A'], '被缓存的组件触发 activated / deactivated 而非 mounted / unmounted，可用 include/exclude 精确控制，max 限制缓存数量（LRU）。\n\n注意缓存会占用内存，且需要清理定时器、事件监听等副作用。'],

	['028', 2, 80, '`nextTick` 的典型使用场景是？', [
		'修改响应式数据后，等待 DOM 更新完成再读取或操作 DOM',
		'延迟发送请求',
		'让计算属性重新求值',
		'强制刷新页面'
	], ['A'], 'Vue 的 DOM 更新是异步批量的，同一轮修改会在微任务中统一 patch；nextTick 的回调排在更新之后，因此能拿到最新 DOM 尺寸或节点。\n\nVue 3 中它基于 Promise.then（微任务）实现，也可以直接 await。'],

	['029', 2, 86, 'Vue 3 组件上 `v-model` 的编译结果是？', [
		'`:modelValue` 属性 + `@update:modelValue` 事件',
		'`:value` + `@input`',
		'`:model` + `@change`',
		'仅一个双向绑定指令，没有对应事件'
	], ['A'], 'Vue 3 把 modelValue 作为默认 prop 与事件名，支持多个 v-model（`v-model:title`），也允许自定义修饰符。\n\nVue 2 默认是 value + input，且一个组件只能有一个 v-model。'],

	['030', 2, 74, '`defineEmits(["change"])` 声明事件的好处是？', [
		'明确组件对外事件，配合类型推导并在开发期提示未声明的事件',
		'自动把事件绑定到原生 DOM',
		'让事件支持冒泡',
		'可以替代 props'
	], ['A'], '声明后 emit 调用能获得参数类型检查，也避免把原生事件误当作组件事件透传（配合 inheritAttrs 的落点判断）。\n\nVue 3 中未声明的事件会落到根元素上，容易产生意外行为。'],

	['031', 2, 76, '`toRefs(reactiveObj)` 的作用是？', [
		'把响应式对象转成一组 ref，解构后仍保持响应性',
		'深拷贝对象',
		'把 ref 转成普通值',
		'冻结对象'
	], ['A'], '直接解构 reactive 对象会拿到普通值、丢失响应性；toRefs 为每个属性创建指向原对象的 ref，解构后读写仍然联动。\n\n返回的 ref 与源属性是「同一个数据的两个入口」。'],

	['032', 2, 80, 'Pinia 相比 Vuex 的主要变化是？', [
		'去掉 mutations，action 可直接改状态；支持完整 TS 推导与组合式写法',
		'不再需要 store',
		'只能用于 Vue 2',
		'必须使用 namespace 模块'
	], ['A'], 'Pinia 用 defineStore 声明，state/getters/actions 一体，天然分模块、无嵌套模块的命名空间负担，TS 推导开箱可用。\n\nVuex 的 mutation 是为了 devtools 追踪同步变更，Pinia 通过 action 与 devtools 集成取代了它。'],

	['033', 2, 82, 'Vue Router 中 `beforeEach` 守卫的典型用途是？', [
		'登录鉴权、权限校验与路由跳转拦截',
		'组件销毁时清理定时器',
		'监听路由参数变化重新请求',
		'设置页面标题样式'
	], ['A'], '全局前置守卫在每次导航确认前执行，可返回 false 取消、返回路由地址重定向。\n\n注意必须调用 next() 或返回值，否则导航会挂起；异步鉴权要避免死循环（对登录页放行）。'],

	['034', 2, 76, '`defineAsyncComponent` 的作用是？', [
		'按需异步加载组件代码，减小首屏体积',
		'定义全局组件',
		'把组件转成函数式组件',
		'让组件支持 SSR'
	], ['A'], '异步组件在首次渲染时才发起 chunk 请求，配合 loadingComponent、errorComponent、delay 提升体验。\n\n路由级懒加载 `() => import()` 也是同一思路，是拆包的核心手段。'],

	['035', 2, 72, '`<Teleport to="body">` 解决什么问题？', [
		'把内容渲染到指定 DOM 节点，避免被父级 overflow、transform、z-index 影响',
		'把组件变成全局组件',
		'实现组件懒加载',
		'创建新的 Vue 应用'
	], ['A'], '弹窗、下拉菜单、Toast 常受父容器 `overflow: hidden` 或层叠上下文限制，Teleport 把真实 DOM 挂到 body 下，逻辑上仍是当前组件的子级（props、事件、上下文都保留）。\n\n注意挂载目标必须在 Teleport 生效前存在。'],

	['036', 3, 66, '`<Suspense>` 在 Vue 3 中主要用于？', [
		'等待异步组件或异步 setup 完成，期间展示 fallback 内容',
		'处理请求错误',
		'实现组件缓存',
		'做服务端渲染'
	], ['A'], 'Suspense 包裹异步依赖，在 resolve 前显示 #fallback 插槽，适合「整块区域等数据就绪再渲染」的场景。\n\n它目前仍是实验性 API，生产使用需评估稳定性。'],

	['037', 2, 74, '自定义指令的钩子中，`mounted` 与 `updated` 的区别是？', [
		'mounted 在元素挂载到 DOM 后调用一次，updated 在所在组件更新后调用',
		'mounted 每次更新都调用',
		'updated 只在卸载时调用',
		'两者完全一样'
	], ['A'], '常用钩子：created（绑定前）、beforeMount、mounted（DOM 可用）、beforeUpdate、updated、beforeUnmount、unmounted。\n\n适合封装聚焦、拖拽、权限隐藏、埋点等 DOM 层逻辑。'],

	['038', 2, 76, '组合式函数（composable）相比 mixin 的优势是？', [
		'来源清晰、可显式传参、无命名冲突，逻辑可组合复用',
		'mixin 支持类型推导',
		'composable 能替代所有组件',
		'mixin 性能更好'
	], ['A'], 'mixin 的属性和方法会「隐式合并」进组件，多个 mixin 容易命名冲突、来源难追踪；composable 是普通函数，返回值显式解构，依赖关系一目了然。\n\n这是 Vue 3 推荐逻辑复用的主要原因。'],

	['039', 2, 78, '`shallowRef` 的适用场景是？', [
		'只关心引用替换的大对象（如整块图表数据），避免深层代理的性能开销',
		'需要深层响应式的表单',
		'替代 computed',
		'监听 DOM 尺寸'
	], ['A'], 'shallowRef 只有 `.value` 被整体替换时才触发更新，内部属性变化不响应；对不可变数据流或大数组非常划算。\n\n类似的还有 shallowReactive、shallowReadonly。'],

	['040', 2, 76, '子组件想拿到父级传下来但未在 props 中声明的属性，应该用？', [
		'`$attrs`（配合 `inheritAttrs: false` 控制落点）',
		'`$props`',
		'`$slots`',
		'`$parent.data`'
	], ['A'], '$attrs 收集未被 props 声明的属性与事件监听，透传给内部元素时非常有用（如二次封装 el-input）。\n\n设置 inheritAttrs: false 可避免属性重复落到根元素上。'],

	['041', 2, 70, '`v-memo` 的作用是？', [
		'命中依赖时跳过该子树的更新，用于长列表性能优化',
		'缓存接口结果',
		'记忆组件内部状态',
		'替代 key'
	], ['A'], '`v-memo="[dep]"` 在依赖数组不变时直接复用上次的 vnode，跳过 diff 与 patch，适合大列表中的局部静态区域。\n\n它有明确的使用条件，滥用反而增加比较成本。'],

	['042', 2, 72, 'Vue 3 SSR 中「hydration」指的是？', [
		'客户端接管服务端返回的 HTML，复用已有 DOM 并绑定事件',
		'服务端渲染成字符串',
		'把组件编译成 render 函数',
		'生成静态站点'
	], ['A'], '服务端产出 HTML 让首屏可见，客户端加载 JS 后通过 hydrate 把事件与响应式接上，而不是重新创建 DOM。\n\n若两端渲染结果不一致会出现 hydration mismatch，需要排查随机数、时间、浏览器专属 API。'],

	['043', 2, 84, 'Vue 2 与 Vue 3 的主要差异，不包括？', [
		'响应式实现从 defineProperty 换成 Proxy',
		'新增组合式 API 与 Fragment 多根节点',
		'移除过滤器、事件总线等 API',
		'模板语法彻底废弃，只能写 JSX'
	], ['D'], 'Vue 3 仍然以模板为默认写法，JSX 只是可选项。真正的大变化是响应式底层、组合式 API、多根节点、Teleport/Suspense，以及移除 filters、$on/$off 等。\n\nVue 2.7 也回填了部分组合式 API 能力，方便渐进迁移。'],

	['044', 3, 68, '`watch(source, cb, { deep: true })` 的 deep 选项会带来什么问题？', [
		'递归遍历大对象，产生明显性能开销，且新旧值可能指向同一引用',
		'无法监听数组',
		'会让回调变成同步执行',
		'会导致内存泄漏'
	], ['A'], 'deep 遍历所有嵌套属性建立依赖，对象越大越慢；同时因为引用未变，回调参数的 oldValue 与 newValue 常常相同，需要自己存快照。\n\n更优做法是精确监听具体字段的 getter。'],

	['045', 2, 70, 'Vue 模板最终会被编译成什么？', [
		'render 函数（返回虚拟 DOM 的 JS 代码）',
		'直接生成 HTML 字符串',
		'Web Component',
		'CSS 变量'
	], ['A'], '编译分三步：parse 生成 AST、transform 做静态提升等优化、generate 产出 render 函数；运行时执行 render 得到 vnode 再 patch 成真实 DOM。\n\n构建时预编译（vue-loader）能把这步从运行时移到打包阶段。'],

	['046', 3, 74, '在 `<script setup>` 中写 `const { title } = defineProps(["title"])` 有什么风险？', [
		'Vue 3.5 之前解构拿到的是普通值快照，父组件更新后子组件不会跟着变',
		'会导致编译报错',
		'会和 v-model 冲突',
		'解构后无法再使用 props'
	], ['A'], 'props 本身是响应式对象，直接解构相当于提前取值，失去了对属性的追踪。旧版本要用 `toRef(props, "title")` 或 `const props = defineProps(...)` 后访问 `props.title`。\n\nVue 3.5+ 已支持响应式解构（编译器转换），但团队里仍需确认版本。'],

	['047', 2, 80, 'Vue 3 中同一元素上 `v-if` 与 `v-for` 同时使用会怎样？', [
		'v-if 优先级更高，拿不到 v-for 的迭代变量，容易报错',
		'v-for 优先级更高，先循环再判断',
		'两者互不影响，正常执行',
		'编译期直接报语法错误'
	], ['A'], 'Vue 3 改为 v-if 优先于 v-for，此时条件里引用的 item 还不存在。正确做法是用 computed 先过滤出需要的列表，或把判断移到内层元素/模板上。\n\nVue 2 的顺序相反，这是迁移时容易踩的坑。'],

	['048', 2, 68, 'Vue 3 移除过滤器（filters）的主要原因是？', [
		'语法限制多（不能在 v-model、复杂表达式里用），用计算属性或方法替代更统一',
		'过滤器有安全漏洞',
		'过滤器性能太差',
		'过滤器只在 Vue 1 中存在'
	], ['A'], '过滤器只能在插值和 v-bind 中使用、不能链式传参、无法在 JS 逻辑中复用。Vue 3 统一用 computed 或普通函数，逻辑更清晰也更好测试。\n\n迁移时把 `{{ msg | format }}` 改成 `{{ format(msg) }}` 即可。'],

	['049', 2, 70, '`app.use(plugin)` 的工作原理是？', [
		'调用插件的 install 方法，把 app 与配置传进去，用于注册全局组件、指令、provide',
		'把插件挂到 window 上',
		'自动下载插件代码',
		'创建一个新的 Vue 应用'
	], ['A'], '插件可以是带 install 方法的对象，也可以直接是函数；Vue Router、Pinia 都是通过 use 注册的。\n\n同一插件多次 use 会被去重，避免重复注册。'],

	['050', 3, 72, '父组件通过 ref 访问 `<script setup>` 子组件实例时，为什么拿不到内部方法？', [
		'`<script setup>` 默认封闭，必须用 defineExpose 显式暴露',
		'因为子组件还没有挂载',
		'因为 ref 只能用于 DOM 元素',
		'因为方法必须是 async'
	], ['A'], '`<script setup>` 的组件实例对外是封闭的，避免内部实现被随意调用；需要暴露时用 `defineExpose({ focus, reset })`。\n\n这是「最小暴露面」的设计，也让重构内部实现更安全。']
])
