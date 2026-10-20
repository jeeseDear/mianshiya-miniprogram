/**
 * 题库 · 语言层：TypeScript / CSS / HTML
 * 约定：纯数据，不引入任何运行时依赖
 */

export const categories = [
	{
		id: 'ts',
		name: 'TypeScript',
		short: 'TS',
		icon: '🔷',
		bg: '#e8f1fd',
		desc: '类型收窄、泛型约束、条件类型、工具类型与工程实践'
	},
	{
		id: 'css',
		name: 'CSS',
		short: 'CSS',
		icon: '🎨',
		bg: '#fdeef0',
		desc: '盒模型、BFC、Flex/Grid、层叠上下文、响应式与动效'
	},
	{
		id: 'html',
		name: 'HTML',
		short: 'HTML',
		icon: '📄',
		bg: '#fff2e8',
		desc: '语义化、资源加载、表单、存储、多媒体与可访问性'
	}
]

export const questions = [
	/* ------------------------------ TypeScript ------------------------------ */
	{
		id: 'ts-001',
		cat: 'ts',
		type: 'single',
		level: 1,
		hot: 92,
		source: '面试鸭精选',
		title: 'interface 和 type 的核心区别是什么？',
		code: '',
		options: [
			{ key: 'A', text: '两者完全等价，只是写法不同' },
			{ key: 'B', text: 'interface 支持同名声明自动合并，type 不支持' },
			{ key: 'C', text: 'type 只能定义基本类型，不能描述对象' },
			{ key: 'D', text: 'interface 不能描述函数类型' }
		],
		answer: ['B'],
		analysis:
			'interface 允许多次声明同名接口并自动合并（声明合并），type 重复声明会直接报错。\n\ntype 的表达能力更广，能写联合类型、交叉类型、条件类型、映射类型；interface 只能描述对象/函数结构。日常约定：描述对象结构优先 interface（利于扩展和错误提示），需要组合类型时用 type。'
	},
	{
		id: 'ts-002',
		cat: 'ts',
		type: 'single',
		level: 1,
		hot: 90,
		source: '面试鸭精选',
		title: 'unknown 和 any 的关键差别是什么？',
		code: '',
		options: [
			{ key: 'A', text: 'unknown 不能赋值给任何类型，any 可以' },
			{ key: 'B', text: 'unknown 必须先收窄类型才能使用，any 直接放行' },
			{ key: 'C', text: '两者没有任何区别' },
			{ key: 'D', text: 'unknown 是 any 的别名' }
		],
		answer: ['B'],
		analysis:
			'any 会关闭类型检查，任何操作都放行，等于放弃了类型系统。\n\nunknown 是「安全版的 any」：任何值都可以赋给 unknown，但使用前必须先用 typeof、instanceof 或类型守卫收窄，否则编译报错。能不用 any 的地方尽量用 unknown，尤其是在处理接口返回、catch 到的错误这类外部输入时。'
	},
	{
		id: 'ts-003',
		cat: 'ts',
		type: 'single',
		level: 2,
		hot: 84,
		source: '面试鸭精选',
		title: 'never 类型通常出现在什么场景？',
		code: '',
		options: [
			{ key: 'A', text: '表示一个可以为 null 的值' },
			{ key: 'B', text: '表示一个永远不会有返回值的函数，且是所有类型的子类型' },
			{ key: 'C', text: '表示任意对象类型' },
			{ key: 'D', text: '表示数组为空' }
		],
		answer: ['B'],
		analysis:
			'never 表示「不可能存在的值」，常见于两种场景：函数永远抛异常或存在死循环，返回值类型为 never；以及条件类型中过滤掉所有分支后得到的空联合类型。\n\nnever 是所有类型的子类型，可以赋给任何类型，但没有任何类型能赋给 never（除了 never 自己）。常用来做穷尽性检查：switch 分支写完后 default 里赋值给 never 变量，漏掉分支时会编译报错。'
	},
	{
		id: 'ts-004',
		cat: 'ts',
		type: 'single',
		level: 2,
		hot: 86,
		source: '面试鸭精选',
		title: '泛型约束 `T extends { id: number }` 的作用是什么？',
		code: '',
		options: [
			{ key: 'A', text: '让 T 只能是对象字面量' },
			{ key: 'B', text: '限制 T 必须有 number 类型的 id 属性，同时保留具体类型' },
			{ key: 'C', text: '把 T 转成 number 类型' },
			{ key: 'D', text: '等价于 T = { id: number }' }
		],
		answer: ['B'],
		analysis:
			'extends 在这里是「约束」而不是继承：要求传入的类型至少满足 { id: number } 这个结构，函数体内才能安全访问 id。\n\n和直接写死参数类型相比，泛型约束保留了调用方的具体类型信息，返回值仍能准确推导出原始类型，不会退化成宽泛的 { id: number }。'
	},
	{
		id: 'ts-005',
		cat: 'ts',
		type: 'single',
		level: 2,
		hot: 80,
		source: '面试鸭精选',
		title: '`keyof Person` 的结果是什么？（Person 有 name、age 两个属性）',
		code: "interface Person {\n  name: string\n  age: number\n}",
		options: [
			{ key: 'A', text: "'name' | 'age'" },
			{ key: 'B', text: 'string | number' },
			{ key: 'C', text: "['name', 'age']" },
			{ key: 'D', text: '{ name: string, age: number }' }
		],
		answer: ['A'],
		analysis:
			'keyof 取的是类型所有属性名组成的联合类型，结果是字符串字面量联合 \'name\' | \'age\'。\n\n常配合索引访问类型使用：`Person[keyof Person]` 得到 string | number，也就是所有属性值类型的联合。表单校验、动态取值这类场景用得非常频繁。'
	},
	{
		id: 'ts-006',
		cat: 'ts',
		type: 'single',
		level: 2,
		hot: 78,
		source: '面试鸭精选',
		title: '可选链 `?.` 和非空断言 `!` 的本质区别是？',
		code: '',
		options: [
			{ key: 'A', text: '两者都在运行时做空值判断' },
			{ key: 'B', text: '可选链运行时短路返回 undefined，非空断言只在编译期去掉 null/undefined' },
			{ key: 'C', text: '非空断言会在运行时抛错' },
			{ key: 'D', text: '可选链只能用于函数调用' }
		],
		answer: ['B'],
		analysis:
			'`a?.b` 会被编译成运行时判断，a 为 null 或 undefined 时整个表达式短路为 undefined，不会报错。\n\n`a!.b` 只是告诉编译器「我保证它不是空」，编译后 `!` 会被直接删掉，没有任何运行时保护。如果判断错了，运行时照样抛 TypeError。所以非空断言要慎用，尤其是外部数据。'
	},
	{
		id: 'ts-007',
		cat: 'ts',
		type: 'single',
		level: 2,
		hot: 82,
		source: '面试鸭精选',
		title: '类型谓词 `value is string` 用在哪里？',
		code: '',
		options: [
			{ key: 'A', text: '声明一个变量是 string' },
			{ key: 'B', text: '作为自定义类型守卫的返回值类型，调用后自动收窄' },
			{ key: 'C', text: '把任意值强制转成 string' },
			{ key: 'D', text: '判断两个字符串是否相等' }
		],
		answer: ['B'],
		analysis:
			'类型谓词写在函数返回类型位置，例如 `function isString(v: unknown): v is string`。调用该函数后，TypeScript 会在对应的分支里把参数收窄为 string。\n\n内置的 Array.isArray、typeof、instanceof 都有类似的收窄能力；自定义守卫适合判断业务数据结构，比强转 as 安全得多。'
	},
	{
		id: 'ts-008',
		cat: 'ts',
		type: 'single',
		level: 2,
		hot: 76,
		source: '面试鸭精选',
		title: '`Partial<User>` 的结果是？',
		code: '',
		options: [
			{ key: 'A', text: '所有属性变成可选' },
			{ key: 'B', text: '所有属性变成只读' },
			{ key: 'C', text: '只保留一个属性' },
			{ key: 'D', text: '把所有属性转成 string' }
		],
		answer: ['A'],
		analysis:
			'Partial 是内置映射类型，等价于 `{ [K in keyof T]?: T[K] }`，把每一层属性都加上 `?`。常用于表单草稿、局部更新参数（PATCH 接口）。\n\n配套的还有 Required（去可选）、Readonly（加 readonly）、Pick / Omit（挑选或排除字段）、Record（构造键值映射）。'
	},
	{
		id: 'ts-009',
		cat: 'ts',
		type: 'single',
		level: 3,
		hot: 72,
		source: '面试鸭精选',
		title: '条件类型 `T extends string ? A : B` 在 T 是联合类型时会怎样？',
		code: '',
		options: [
			{ key: 'A', text: '整个联合类型当成一个整体判断一次' },
			{ key: 'B', text: '对联合类型逐项分发，结果也是联合类型' },
			{ key: 'C', text: '直接报错' },
			{ key: 'D', text: '只判断第一个成员' }
		],
		answer: ['B'],
		analysis:
			'这叫「分布式条件类型」：当 T 是裸类型参数且传入联合类型时，会对每个成员分别求值再合并。`string | number extends string` 的结果是 `A | B`。\n\n如果不想分发，用方括号包一层：`[T] extends [string] ? A : B`，这样会整体判断。'
	},
	{
		id: 'ts-010',
		cat: 'ts',
		type: 'single',
		level: 3,
		hot: 70,
		source: '面试鸭精选',
		title: '`infer` 关键字的作用是什么？',
		code: 'type ReturnOf<T> = T extends (...args: any[]) => infer R ? R : never',
		options: [
			{ key: 'A', text: '声明一个新变量' },
			{ key: 'B', text: '在条件类型中占位并推导出某个位置的类型' },
			{ key: 'C', text: '推断运行时的值' },
			{ key: 'D', text: '把类型转成 any' }
		],
		answer: ['B'],
		analysis:
			'infer 只能在 extends 条件类型的右侧使用，用来「抓取」某个位置的类型并命名。上面的 ReturnOf 就是内置 ReturnType 的实现思路：匹配函数签名时把返回值类型捕获为 R。\n\n常见用法还有提取数组元素类型、Promise 的 resolve 类型、函数参数元组等。'
	},
	{
		id: 'ts-011',
		cat: 'ts',
		type: 'single',
		level: 1,
		hot: 74,
		source: '面试鸭精选',
		title: '`as const` 断言会产生什么效果？',
		code: '',
		options: [
			{ key: 'A', text: '把对象冻结，运行时不可修改' },
			{ key: 'B', text: '推导出最窄的字面量类型，并把属性设为 readonly' },
			{ key: 'C', text: '把值转成常量字符串' },
			{ key: 'D', text: '等价于 Object.freeze' }
		],
		answer: ['B'],
		analysis:
			'as const 是纯编译期行为：对象属性变成 readonly，数组变成 readonly 元组，字符串/数字保留字面量类型而不是被放宽成 string/number。\n\n它对运行时没有任何影响，不能代替 Object.freeze。常用于配置表、action type 常量，配合 typeof 还能反推出联合类型。'
	},
	{
		id: 'ts-012',
		cat: 'ts',
		type: 'single',
		level: 2,
		hot: 68,
		source: '面试鸭精选',
		title: '`satisfies` 操作符解决的是什么问题？',
		code: '',
		options: [
			{ key: 'A', text: '检查值是否符合某个类型，同时保留值本身的精确推导' },
			{ key: 'B', text: '强制类型转换' },
			{ key: 'C', text: '声明一个接口' },
			{ key: 'D', text: '断言的别名' }
		],
		answer: ['A'],
		analysis:
			'用 `const conf: Config = {...}` 做类型标注时，类型会被拓宽成 Config，丢失字面量信息；用 `as Config` 又不做校验。\n\n`satisfies Config` 两者兼得：既检查是否满足 Config，又保留原对象的精确类型，后面访问属性时仍是具体的字面量类型。适合配置对象、路由表、主题映射。'
	},
	{
		id: 'ts-013',
		cat: 'ts',
		type: 'single',
		level: 2,
		hot: 66,
		source: '面试鸭精选',
		title: '枚举 enum 与 const enum 的区别是？',
		code: '',
		options: [
			{ key: 'A', text: 'const enum 在编译后会被完全内联，不生成运行时对象' },
			{ key: 'B', text: 'const enum 只能在函数内使用' },
			{ key: 'C', text: 'enum 不能有字符串值' },
			{ key: 'D', text: '两者完全一样' }
		],
		answer: ['A'],
		analysis:
			'普通 enum 会生成一个真实的对象，运行时可以通过 Enum.Member 访问，会有额外体积。\n\nconst enum 在编译时把所有引用替换成字面量，产物里不留对象，体积更小；但它不能跨包使用（isolatedModules 下会报错），所以现代工程里更推荐用 `as const` 对象 + 联合类型来替代枚举。'
	},
	{
		id: 'ts-014',
		cat: 'ts',
		type: 'single',
		level: 1,
		hot: 72,
		source: '面试鸭精选',
		title: '以下哪个写法能正确描述「键为 string、值为 number」的字典？',
		code: '',
		options: [
			{ key: 'A', text: 'Array<number>' },
			{ key: 'B', text: 'Record<string, number>' },
			{ key: 'C', text: 'Map<number, string>' },
			{ key: 'D', text: 'string[]' }
		],
		answer: ['B'],
		analysis:
			'Record<K, V> 等价于 `{ [P in K]: V }`，是最简洁的字典写法。也可以用索引签名 `{ [key: string]: number }`，效果一致。\n\n注意 Record 的键是「已知集合」时更安全，比如 Record<\'sm\' | \'md\' | \'lg\', string> 会强制把三个尺寸都写全。'
	},
	{
		id: 'ts-015',
		cat: 'ts',
		type: 'multiple',
		level: 3,
		hot: 64,
		source: '面试鸭精选',
		title: '下面哪些方式可以让联合类型 `string | number` 在分支中被收窄？',
		code: '',
		options: [
			{ key: 'A', text: 'typeof value === "string"' },
			{ key: 'B', text: 'Array.isArray(value)' },
			{ key: 'C', text: '自定义类型守卫 value is string' },
			{ key: 'D', text: '直接用 as string 强转' }
		],
		answer: ['A', 'C'],
		analysis:
			'typeof 是最常用的收窄手段，`typeof v === "string"` 分支里 v 会被收窄为 string；自定义类型谓词同样能收窄。\n\nArray.isArray 只能用来判断数组，对 string | number 这个联合没有意义；as 是强制断言，只是骗过编译器，不属于类型收窄。'
	},

	/* --------------------------------- CSS --------------------------------- */
	{
		id: 'css-001',
		cat: 'css',
		type: 'single',
		level: 1,
		hot: 94,
		source: '面试鸭精选',
		title: '默认盒模型下，设置 `width: 200px; padding: 20px; border: 5px solid` 后，元素占据的横向宽度是多少？',
		code: '',
		options: [
			{ key: 'A', text: '200px' },
			{ key: 'B', text: '240px' },
			{ key: 'C', text: '250px' },
			{ key: 'D', text: '190px' }
		],
		answer: ['C'],
		analysis:
			'默认是 content-box，width 只表示内容区宽度，实际占位 = width + padding-left/right + border-left/right = 200 + 40 + 10 = 250px。\n\n改成 border-box 后，width 包含 padding 和 border，占位就是 200px，内容区被压缩为 200 - 40 - 10 = 150px。这也是大多数项目全局设置 `* { box-sizing: border-box }` 的原因。'
	},
	{
		id: 'css-002',
		cat: 'css',
		type: 'single',
		level: 2,
		hot: 88,
		source: '面试鸭精选',
		title: '下列哪种情况不会创建 BFC？',
		code: '',
		options: [
			{ key: 'A', text: 'float: left' },
			{ key: 'B', text: 'position: absolute' },
			{ key: 'C', text: 'display: inline-block' },
			{ key: 'D', text: 'position: relative' }
		],
		answer: ['D'],
		analysis:
			'常见触发 BFC 的条件：float 不为 none、position 为 absolute/fixed、display 为 inline-block/table-cell/flex/grid/flow-root、overflow 不为 visible。\n\nposition: relative 不会创建 BFC，它只创建层叠上下文（配合 z-index），这是最容易混淆的一点。BFC 的典型用途是清除浮动、阻止 margin 合并、避免被浮动元素环绕。'
	},
	{
		id: 'css-003',
		cat: 'css',
		type: 'single',
		level: 2,
		hot: 86,
		source: '面试鸭精选',
		title: '`flex: 1` 等价于哪一组属性？',
		code: '',
		options: [
			{ key: 'A', text: 'flex-grow: 1; flex-shrink: 1; flex-basis: 0%' },
			{ key: 'B', text: 'flex-grow: 1; flex-shrink: 0; flex-basis: auto' },
			{ key: 'C', text: 'flex-grow: 1; flex-shrink: 1; flex-basis: auto' },
			{ key: 'D', text: 'flex-grow: 0; flex-shrink: 1; flex-basis: 0%' }
		],
		answer: ['A'],
		analysis:
			'flex 的简写规则是 grow / shrink / basis，`flex: 1` 展开为 `1 1 0%`。basis 为 0% 意味着「不参考内容宽度，完全按剩余空间均分」。\n\n常见的 `flex: auto` 是 `1 1 auto`，会先按内容宽度分配再分剩余空间；`flex: none` 是 `0 0 auto`，不放大也不收缩。这三个值的差异是面试高频追问点。'
	},
	{
		id: 'css-004',
		cat: 'css',
		type: 'single',
		level: 2,
		hot: 82,
		source: '面试鸭精选',
		title: '`position: sticky` 生效需要满足什么条件？',
		code: '',
		options: [
			{ key: 'A', text: '父级必须有固定高度' },
			{ key: 'B', text: '最近的滚动祖先不能有 overflow: hidden/auto/scroll 且不能是 visible 之外的裁剪容器，同时要设置 top/left 等阈值' },
			{ key: 'C', text: '必须搭配 z-index 使用' },
			{ key: 'D', text: '只能用在 body 的直接子元素上' }
		],
		answer: ['B'],
		analysis:
			'sticky 的行为是「在容器范围内，滚动到阈值后固定」。必须给 top/bottom/left/right 中至少一个值，否则不会吸附。\n\n最常见的失效原因：某个祖先元素设置了 `overflow: hidden/auto/scroll`，导致粘性元素的滚动参照变成了那个祖先，页面滚动时它就不动了。排查时沿着 DOM 往上找 overflow 即可。'
	},
	{
		id: 'css-005',
		cat: 'css',
		type: 'single',
		level: 2,
		hot: 80,
		source: '面试鸭精选',
		title: '`z-index` 在什么情况下会失效？',
		code: '',
		options: [
			{ key: 'A', text: '元素没有设置 position 或未形成层叠上下文时' },
			{ key: 'B', text: '元素是 inline 元素时' },
			{ key: 'C', text: '父元素有 padding 时' },
			{ key: 'D', text: 'z-index 为负数时' }
		],
		answer: ['A'],
		analysis:
			'z-index 只对「已定位元素」（position 为 relative/absolute/fixed/sticky）或 flex/grid 子项生效。普通静态定位元素设置 z-index 是无效的。\n\n更隐蔽的问题是层叠上下文：父元素如果创建了层叠上下文（如 opacity < 1、transform 不为 none、isolation: isolate），子元素的 z-index 只在这个上下文内部比较，无法越过父级去盖住别的元素。'
	},
	{
		id: 'css-006',
		cat: 'css',
		type: 'single',
		level: 2,
		hot: 78,
		source: '面试鸭精选',
		title: '下面哪组选择器的权重最高？',
		code: '',
		options: [
			{ key: 'A', text: '#nav .item a' },
			{ key: 'B', text: '.nav .item a:hover' },
			{ key: 'C', text: 'div.nav ul li a' },
			{ key: 'D', text: 'a.link.active' }
		],
		answer: ['A'],
		analysis:
			'权重按 (ID, 类/属性/伪类, 元素/伪元素) 三元组比较：\n\nA = (1,1,1)，B = (0,3,1)，C = (0,1,4)，D = (0,2,1)。ID 选择器的权重高于任意数量的类，所以 A 最高。\n\n注意 !important 不属于权重体系，它会直接覆盖普通声明；内联样式的权重相当于 (1,0,0,0)，也高于任何选择器。'
	},
	{
		id: 'css-007',
		cat: 'css',
		type: 'single',
		level: 3,
		hot: 76,
		source: '面试鸭精选',
		title: '移动端 1px 边框「看起来太粗」，最根本的原因是？',
		code: '',
		options: [
			{ key: 'A', text: '浏览器默认边框颜色太深' },
			{ key: 'B', text: 'DPR 大于 1 时 1 个 CSS 像素对应多个物理像素' },
			{ key: 'C', text: 'rem 换算错误' },
			{ key: 'D', text: '没有设置 viewport' }
		],
		answer: ['B'],
		analysis:
			'在 DPR = 2 的屏幕上，`border: 1px` 会占 2 个物理像素，视觉上明显偏粗。\n\n常见解法：① 用 `transform: scaleY(0.5)` 配合伪元素画线；② 用 `border-image` 或背景渐变；③ 用 `box-shadow: 0 0 0 0.5px` 模拟；④ 现代方案是 `border: 1px solid` + `@media (-webkit-min-device-pixel-ratio: 2)` 单独处理，或直接使用 `1px` 的 SVG 背景。'
	},
	{
		id: 'css-008',
		cat: 'css',
		type: 'single',
		level: 1,
		hot: 90,
		source: '面试鸭精选',
		title: '用 Flex 让子元素水平垂直居中，正确的是？',
		code: '',
		options: [
			{ key: 'A', text: 'justify-content: center; align-items: center' },
			{ key: 'B', text: 'align-content: center; justify-items: center' },
			{ key: 'C', text: 'text-align: center; vertical-align: middle' },
			{ key: 'D', text: 'margin: auto 0' }
		],
		answer: ['A'],
		analysis:
			'flex 容器默认主轴为水平方向，justify-content 控制主轴对齐，align-items 控制交叉轴对齐，两个都设为 center 即可实现水平垂直居中。\n\n如果容器是 `flex-direction: column`，主轴变成垂直方向，此时 justify-content 控制垂直、align-items 控制水平，方向要跟着换。'
	},
	{
		id: 'css-009',
		cat: 'css',
		type: 'single',
		level: 2,
		hot: 74,
		source: '面试鸭精选',
		title: '两个相邻块级元素的上下 margin 分别为 30px 和 20px，实际间距是多少？',
		code: '',
		options: [
			{ key: 'A', text: '50px' },
			{ key: 'B', text: '30px' },
			{ key: 'C', text: '20px' },
			{ key: 'D', text: '0px' }
		],
		answer: ['B'],
		analysis:
			'垂直方向的相邻 margin 会发生「外边距合并」，取两者中的较大值，也就是 30px，而不是相加。\n\n合并只发生在垂直方向，水平方向不会合并；浮动的元素、绝对定位元素、以及创建了 BFC 的容器内部的父子元素也不会按常规合并。父元素与第一个子元素之间如果没有 padding/border 隔开，也会发生合并。'
	},
	{
		id: 'css-010',
		cat: 'css',
		type: 'single',
		level: 1,
		hot: 76,
		source: '面试鸭精选',
		title: '伪类 `:hover` 和伪元素 `::before` 的区别是？',
		code: '',
		options: [
			{ key: 'A', text: '伪类用单冒号，伪元素用双冒号，前者描述状态，后者创建虚拟元素' },
			{ key: 'B', text: '两者完全等价' },
			{ key: 'C', text: '伪元素不能设置 content' },
			{ key: 'D', text: '伪类只能用于 a 标签' }
		],
		answer: ['A'],
		analysis:
			'伪类（:hover、:focus、:nth-child）用于匹配元素的某种状态或位置，不额外生成节点。伪元素（::before、::after、::first-line）会在渲染树中生成虚拟的子元素，常配合 content 使用。\n\nCSS3 规范要求伪元素用双冒号以作区分，但 :before/:after 这种单冒号写法为了兼容旧浏览器依然有效。'
	},
	{
		id: 'css-011',
		cat: 'css',
		type: 'single',
		level: 2,
		hot: 84,
		source: '面试鸭精选',
		title: '以下哪个属性变化一定会触发重排（reflow）？',
		code: '',
		options: [
			{ key: 'A', text: 'color' },
			{ key: 'B', text: 'background-color' },
			{ key: 'C', text: 'width' },
			{ key: 'D', text: 'visibility' }
		],
		answer: ['C'],
		analysis:
			'重排会重新计算几何信息（位置、尺寸），重绘只重新画像素。width、height、margin、padding、font-size 这类影响布局的属性变化必然触发重排，进而引发重绘。\n\ncolor、background-color 只触发重绘；visibility 变化也只重绘（元素仍占位，布局没变）；transform 和 opacity 在合成层中可以只走 GPU 合成，代价最小，这也是动画优先用它们的原因。'
	},
	{
		id: 'css-012',
		cat: 'css',
		type: 'single',
		level: 1,
		hot: 72,
		source: '面试鸭精选',
		title: '`display: none` 与 `visibility: hidden` 的关键区别是？',
		code: '',
		options: [
			{ key: 'A', text: '前者不占位且不参与布局，后者占位但不可见' },
			{ key: 'B', text: '两者都不占位' },
			{ key: 'C', text: '前者可以被屏幕阅读器读到' },
			{ key: 'D', text: '后者会触发重排' }
		],
		answer: ['A'],
		analysis:
			'`display: none` 会把元素从渲染树中移除，不占位、不参与布局，切换时触发重排。\n\n`visibility: hidden` 只是不可见，元素仍然占据原本的空间，切换时只触发重绘，性能开销更小。另外 visibility 是可继承的，但子元素设置 `visibility: visible` 可以单独显示出来，display 做不到。'
	},
	{
		id: 'css-013',
		cat: 'css',
		type: 'single',
		level: 2,
		hot: 70,
		source: '面试鸭精选',
		title: '实现「最多显示两行，超出省略」，需要哪些属性？',
		code: '',
		options: [
			{ key: 'A', text: 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap' },
			{ key: 'B', text: 'display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden' },
			{ key: 'C', text: 'text-overflow: ellipsis 加 line-height: 2' },
			{ key: 'D', text: 'word-break: break-all' }
		],
		answer: ['B'],
		analysis:
			'单行省略用 A 那组（text-overflow 只对单行 nowrap 生效）。多行省略需要 `-webkit-line-clamp`：先把元素变成 -webkit-box，设置排列方向为垂直，再用 line-clamp 限制行数，最后 overflow: hidden。\n\n该方案在移动端和主流浏览器都支持，但不属于标准属性，需要考虑兼容时可改用 JS 截断。'
	},
	{
		id: 'css-014',
		cat: 'css',
		type: 'single',
		level: 2,
		hot: 68,
		source: '面试鸭精选',
		title: 'Grid 布局中 `grid-template-columns: 1fr 2fr` 的含义是？',
		code: '',
		options: [
			{ key: 'A', text: '第一列固定 1px，第二列固定 2px' },
			{ key: 'B', text: '两列按 1:2 分配可用空间' },
			{ key: 'C', text: '第一列 1 行，第二列 2 行' },
			{ key: 'D', text: '两列各占 50%' }
		],
		answer: ['B'],
		analysis:
			'fr 是「剩余空间份额」，1fr 2fr 表示把可用空间按 1:2 分成三份。它和百分比的区别在于：fr 会自动扣除固定列和 gap 后再分配，不会溢出。\n\n`minmax(0, 1fr)` 常用于防止内容撑破网格；`auto` 则会先按内容宽度分配。'
	},
	{
		id: 'css-015',
		cat: 'css',
		type: 'multiple',
		level: 3,
		hot: 66,
		source: '面试鸭精选',
		title: '哪些做法可以创建新的层叠上下文（stacking context）？',
		code: '',
		options: [
			{ key: 'A', text: 'position: fixed' },
			{ key: 'B', text: 'opacity: 0.9' },
			{ key: 'C', text: 'transform: translateZ(0)' },
			{ key: 'D', text: 'color: red' }
		],
		answer: ['A', 'B', 'C'],
		analysis:
			'创建层叠上下文的常见方式：根元素 html、position 为 fixed/sticky、position 非 static 且 z-index 不为 auto、opacity 小于 1、transform/filter/perspective 不为 none、isolation: isolate、will-change 指定了上述属性、flex/grid 子项且 z-index 不为 auto。\n\ncolor 只是绘制属性，和层叠上下文无关。理解层叠上下文是排查「z-index 设到 9999 也盖不住」这类问题的关键。'
	},

	/* --------------------------------- HTML -------------------------------- */
	{
		id: 'html-001',
		cat: 'html',
		type: 'single',
		level: 1,
		hot: 88,
		source: '面试鸭精选',
		title: 'HTML 语义化最直接的好处是什么？',
		code: '',
		options: [
			{ key: 'A', text: '让页面体积更小' },
			{ key: 'B', text: '提升可访问性、SEO 和代码可维护性' },
			{ key: 'C', text: '让 CSS 生效更快' },
			{ key: 'D', text: '可以省略 class 属性' }
		],
		answer: ['B'],
		analysis:
			'用 header/nav/main/article/aside/footer 这类标签替代通篇 div，能让屏幕阅读器正确识别页面结构，也便于搜索引擎理解内容层级，同时提升团队协作时的可读性。\n\n语义化不减少体积，也不影响 CSS 生效速度；它解决的是「结构和含义」的问题。'
	},
	{
		id: 'html-002',
		cat: 'html',
		type: 'single',
		level: 1,
		hot: 76,
		source: '面试鸭精选',
		title: '`<!DOCTYPE html>` 的作用是？',
		code: '',
		options: [
			{ key: 'A', text: '声明页面使用 HTML5，让浏览器以标准模式渲染' },
			{ key: 'B', text: '引入 HTML5 的 polyfill' },
			{ key: 'C', text: '告诉浏览器页面编码是 UTF-8' },
			{ key: 'D', text: '定义页面标题' }
		],
		answer: ['A'],
		analysis:
			'doctype 必须是文档第一行，它告诉浏览器用哪种文档类型解析页面。缺失或写错会让浏览器进入怪异模式（quirks mode），盒模型计算、行高、百分比高度等行为都会和标准模式不一致。\n\n编码声明是 `<meta charset="utf-8">`，和 doctype 是两件事。'
	},
	{
		id: 'html-003',
		cat: 'html',
		type: 'single',
		level: 1,
		hot: 80,
		source: '面试鸭精选',
		title: '`src` 和 `href` 的区别是？',
		code: '',
		options: [
			{ key: 'A', text: 'src 用于替换当前元素内容并阻塞解析，href 建立关联且不阻塞' },
			{ key: 'B', text: '两者完全等价' },
			{ key: 'C', text: 'href 只能用于 a 标签' },
			{ key: 'D', text: 'src 是超链接，href 是资源地址' }
		],
		answer: ['A'],
		analysis:
			'src 表示「引入并替换」，浏览器会暂停后续解析去下载资源（img、script、iframe 都是这样）。href 表示「建立引用关系」，是并行下载，不阻塞文档解析（link、a）。\n\n所以 `<script src>` 会阻塞 HTML 解析，而 `<link href>` 加载 CSS 不会阻塞解析，但会阻塞渲染。'
	},
	{
		id: 'html-004',
		cat: 'html',
		type: 'single',
		level: 2,
		hot: 86,
		source: '面试鸭精选',
		title: '`<script defer>` 和 `<script async>` 的区别是？',
		code: '',
		options: [
			{ key: 'A', text: '两者都是下载完立即执行' },
			{ key: 'B', text: 'defer 按文档顺序在 DOMContentLoaded 前执行，async 下载完就执行、顺序不保证' },
			{ key: 'C', text: 'async 会阻塞 HTML 解析' },
			{ key: 'D', text: 'defer 只能用于内联脚本' }
		],
		answer: ['B'],
		analysis:
			'两者都是「并行下载、不阻塞解析」。区别在执行时机：defer 会等文档解析完成后、DOMContentLoaded 触发前，按脚本出现顺序依次执行；async 是下载完立刻执行，多个 async 脚本的执行顺序不确定。\n\n有依赖关系的脚本用 defer，独立统计类脚本用 async。内联脚本上这两个属性都不生效。'
	},
	{
		id: 'html-005',
		cat: 'html',
		type: 'single',
		level: 2,
		hot: 90,
		source: '面试鸭精选',
		title: '关于 Cookie、localStorage、sessionStorage，说法正确的是？',
		code: '',
		options: [
			{ key: 'A', text: '三者都会随请求自动发送到服务端' },
			{ key: 'B', text: 'localStorage 长期有效，sessionStorage 关闭标签页即清除，两者都不随请求发送' },
			{ key: 'C', text: 'sessionStorage 在同源的所有标签页之间共享' },
			{ key: 'D', text: 'localStorage 容量通常只有 4KB' }
		],
		answer: ['B'],
		analysis:
			'Cookie 容量约 4KB，每次同源请求都会自动带上，适合存会话标识；localStorage 约 5MB，持久保存，除非手动清除；sessionStorage 约 5MB，仅在当前标签页会话内有效，新开标签页不共享。\n\n后两者都只存在客户端，不会随请求发送，因此不适合存敏感信息（XSS 可直接读取）。'
	},
	{
		id: 'html-006',
		cat: 'html',
		type: 'single',
		level: 2,
		hot: 78,
		source: '面试鸭精选',
		title: '`<meta name="viewport" content="width=device-width, initial-scale=1">` 的作用是？',
		code: '',
		options: [
			{ key: 'A', text: '让页面宽度等于设备逻辑宽度，并按 1:1 缩放' },
			{ key: 'B', text: '禁止用户缩放页面' },
			{ key: 'C', text: '设置页面编码' },
			{ key: 'D', text: '开启响应式图片' }
		],
		answer: ['A'],
		analysis:
			'不设置 viewport 时，移动端浏览器会按约 980px 的虚拟视口渲染再整体缩小，页面文字会变得很小。设置 width=device-width 让布局视口等于设备宽度，initial-scale=1 保证初始缩放为 1。\n\n如果加上 `user-scalable=no` 或 `maximum-scale=1` 会禁止手势缩放，对可访问性不友好，现在通常不建议。'
	},
	{
		id: 'html-007',
		cat: 'html',
		type: 'single',
		level: 2,
		hot: 74,
		source: '面试鸭精选',
		title: '给 `<span>` 设置 width 和 height 为什么可能不生效？',
		code: '',
		options: [
			{ key: 'A', text: 'span 是行内元素，宽高由内容决定，需要改成 inline-block 或 block' },
			{ key: 'B', text: 'span 不能设置任何样式' },
			{ key: 'C', text: '必须配合 !important' },
			{ key: 'D', text: 'span 的宽高只能由 JS 设置' }
		],
		answer: ['A'],
		analysis:
			'行内元素（span、a、em 等）的 width/height 会被忽略，垂直方向的 margin 和 padding 也不撑开行高，只有水平方向的 padding 会影响布局。\n\n需要设置尺寸时，把它变成 `display: inline-block` 或 `block`（flex/grid 子项也会被块级化，同样可以设置宽高）。'
	},
	{
		id: 'html-008',
		cat: 'html',
		type: 'single',
		level: 1,
		hot: 68,
		source: '面试鸭精选',
		title: '`<label for="name">` 的 for 属性应该和什么对应？',
		code: '',
		options: [
			{ key: 'A', text: 'input 的 name 属性' },
			{ key: 'B', text: 'input 的 id 属性' },
			{ key: 'C', text: 'input 的 class 属性' },
			{ key: 'D', text: 'form 的 id' }
		],
		answer: ['B'],
		analysis:
			'for 的值必须等于目标表单控件的 id。关联之后，点击 label 就会聚焦或选中对应控件，屏幕阅读器也能正确朗读。\n\n另一种写法是把控件直接嵌在 label 内部，这样不需要 for。扩大点击区域对移动端体验提升很明显，尤其是 checkbox 和 radio。'
	},
	{
		id: 'html-009',
		cat: 'html',
		type: 'single',
		level: 2,
		hot: 70,
		source: '面试鸭精选',
		title: '过度使用 iframe 的主要问题不包括？',
		code: '',
		options: [
			{ key: 'A', text: '会阻塞主页面的 onload 事件' },
			{ key: 'B', text: '不利于 SEO，爬虫难以索引内部内容' },
			{ key: 'C', text: '会增加内存和性能开销' },
			{ key: 'D', text: '会让主页面无法使用 CSS 变量' }
		],
		answer: ['D'],
		analysis:
			'iframe 的常见问题：阻塞主页面 onload、独立的文档环境带来额外内存开销、不利于 SEO、跨域时无法直接通信、后退前进历史记录混乱。\n\n它和主页面是否使用 CSS 变量没有关系。现代用法一般配合 sandbox 属性限制权限，并设置 loading="lazy" 延迟加载。'
	},
	{
		id: 'html-010',
		cat: 'html',
		type: 'single',
		level: 1,
		hot: 66,
		source: '面试鸭精选',
		title: '`<img loading="lazy">` 的作用是？',
		code: '',
		options: [
			{ key: 'A', text: '图片解码放到 Worker 里' },
			{ key: 'B', text: '图片进入视口附近时才发起请求，减少首屏流量' },
			{ key: 'C', text: '自动压缩图片' },
			{ key: 'D', text: '图片加载失败时显示占位图' }
		],
		answer: ['B'],
		analysis:
			'原生懒加载，浏览器自行判断图片是否即将进入视口，未进入时不发请求。适合长列表、瀑布流、文章配图。\n\n注意首屏图片不要加 lazy，否则会推迟关键内容加载，反而拖慢 LCP。需要更精细控制（如提前预加载距离）时可以用 IntersectionObserver 自己实现。'
	},
	{
		id: 'html-011',
		cat: 'html',
		type: 'single',
		level: 2,
		hot: 72,
		source: '面试鸭精选',
		title: 'Canvas 和 SVG 的核心差异是？',
		code: '',
		options: [
			{ key: 'A', text: 'Canvas 是像素级位图绘制，SVG 是基于 XML 的矢量图形' },
			{ key: 'B', text: 'Canvas 不能做动画' },
			{ key: 'C', text: 'SVG 不能响应鼠标事件' },
			{ key: 'D', text: '两者都是位图' }
		],
		answer: ['A'],
		analysis:
			'Canvas 通过 JS 往位图画布上绘制，适合大量图形（粒子、游戏、图表），但缩放会失真，且每个图形不是独立 DOM 节点，事件需要自己计算命中。\n\nSVG 是矢量图形，节点即 DOM，天然支持 CSS 和事件，缩放不失真，适合图标、地图、少量可交互图形。图形数量极大时 SVG 的 DOM 开销会显著高于 Canvas。'
	},
	{
		id: 'html-012',
		cat: 'html',
		type: 'single',
		level: 1,
		hot: 62,
		source: '面试鸭精选',
		title: '自定义数据属性 `data-*` 应该怎么读取？',
		code: '<div id="card" data-user-id="42"></div>',
		options: [
			{ key: 'A', text: "el.dataUserId" },
			{ key: 'B', text: "el.dataset.userId" },
			{ key: 'C', text: "el.getAttribute('userId')" },
			{ key: 'D', text: "el.data('userId')" }
		],
		answer: ['B'],
		analysis:
			'data-* 属性通过 `dataset` 读取，连字符会转成驼峰：data-user-id → dataset.userId。也可以用 `getAttribute(\'data-user-id\')`。\n\ndataset 写入时如果是数字会变成字符串，需要自行转换。它适合存放小的配置或标识，不适合存储大量数据。'
	},
	{
		id: 'html-013',
		cat: 'html',
		type: 'single',
		level: 2,
		hot: 64,
		source: '面试鸭精选',
		title: '表单上传文件时，`<form>` 必须设置什么？',
		code: '',
		options: [
			{ key: 'A', text: 'method="post" 且 enctype="multipart/form-data"' },
			{ key: 'B', text: 'method="get" 且 enctype="text/plain"' },
			{ key: 'C', text: '只需要 accept 属性' },
			{ key: 'D', text: 'target="_blank"' }
		],
		answer: ['A'],
		analysis:
			'文件是二进制数据，必须用 POST 提交，并把 enctype 设为 multipart/form-data，浏览器才会把内容按分片编码成 multipart 格式。默认的 application/x-www-form-urlencoded 无法正确传输文件。\n\n`accept` 只是给文件选择框的建议过滤，不限制实际选择，服务端仍需校验类型和大小。'
	},
	{
		id: 'html-014',
		cat: 'html',
		type: 'single',
		level: 2,
		hot: 60,
		source: '面试鸭精选',
		title: '给纯图标按钮加 `aria-label` 的目的是？',
		code: '',
		options: [
			{ key: 'A', text: '让屏幕阅读器能读出按钮的用途' },
			{ key: 'B', text: '提升图标清晰度' },
			{ key: 'C', text: '加快按钮点击响应' },
			{ key: 'D', text: '替换 title 属性' }
		],
		answer: ['A'],
		analysis:
			'只有图标没有文字的按钮，屏幕阅读器无法得知它的功能，`aria-label` 提供了一个可访问名称。\n\n如果按钮内有可见文字，不需要再写 aria-label，否则可能覆盖可见文本造成不一致。装饰性图标应加 `aria-hidden="true"`，避免被重复朗读。'
	},
	{
		id: 'html-015',
		cat: 'html',
		type: 'multiple',
		level: 1,
		hot: 58,
		source: '面试鸭精选',
		title: '下面哪些是块级元素？',
		code: '',
		options: [
			{ key: 'A', text: 'div' },
			{ key: 'B', text: 'p' },
			{ key: 'C', text: 'span' },
			{ key: 'D', text: 'ul' }
		],
		answer: ['A', 'B', 'D'],
		analysis:
			'块级元素独占一行，可以设置宽高，默认宽度撑满父容器，典型的有 div、p、h1-h6、ul/ol/li、section、article、header、footer。\n\nspan、a、strong、em、img、input 属于行内（inline）或行内替换元素，不会独占一行。注意 img 虽然是行内元素，但可以设置宽高（替换元素）。'
	}
]
