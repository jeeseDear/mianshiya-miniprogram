/**
 * 题库 · 算法层：算法与数据结构
 * 约定：纯数据，不引入任何运行时依赖
 */

export const categories = [
	{
		id: 'algo',
		name: '算法与数据结构',
		short: '算法',
		icon: '🧠',
		bg: '#fdf0e6',
		desc: '复杂度分析、数组链表、树与图、动态规划与手写实现'
	}
]

export const questions = [
	{
		id: 'algo-001',
		cat: 'algo',
		type: 'single',
		level: 1,
		hot: 86,
		source: '面试鸭精选',
		title: '快速排序的平均时间复杂度是？',
		code: '',
		options: [
			{ key: 'A', text: 'O(n)' },
			{ key: 'B', text: 'O(n log n)' },
			{ key: 'C', text: 'O(n²)' },
			{ key: 'D', text: 'O(log n)' }
		],
		answer: ['B'],
		analysis:
			'每次划分平均把数组分成两半，递归深度 log n，每层扫描 n 个元素，整体 O(n log n)。\n\n最坏情况是每次基准都选到最大或最小值（如已排序数组取首元素），退化为 O(n²)，随机化取基准或三数取中可以把最坏情况概率降到极低。空间复杂度 O(log n)（递归栈），不稳定排序。'
	},
	{
		id: 'algo-002',
		cat: 'algo',
		type: 'single',
		level: 2,
		hot: 84,
		source: '面试鸭精选',
		title: '用 `[...new Set(arr)]` 数组去重，它依赖什么特性？',
		code: '',
		options: [
			{ key: 'A', text: 'Set 内部用哈希判断值唯一，SameValueZero 规则下 NaN 也会去重' },
			{ key: 'B', text: 'Set 会深度比较对象内容' },
			{ key: 'C', text: 'Set 只能存字符串' },
			{ key: 'D', text: 'Set 会自动排序' }
		],
		answer: ['A'],
		analysis:
			'Set 按 SameValueZero 判断相等：基本类型按值比较，NaN 等于 NaN（所以能去重），对象按引用比较（两个内容相同的对象不会被去重）。\n\n需要按对象字段去重时用 Map 以 id 为键，或 reduce + findIndex。另外 Set 保持插入顺序。'
	},
	{
		id: 'algo-003',
		cat: 'algo',
		type: 'single',
		level: 1,
		hot: 78,
		source: '面试鸭精选',
		title: '二分查找的前提条件是？',
		code: '',
		options: [
			{ key: 'A', text: '数据必须有序（或具有单调性）' },
			{ key: 'B', text: '数据必须是数字' },
			{ key: 'C', text: '数据长度必须是 2 的幂' },
			{ key: 'D', text: '必须使用递归实现' }
		],
		answer: ['A'],
		analysis:
			'二分要求序列有序，或者能定义出「单调性」的判定条件（如「找第一个满足条件的值」这类二分答案）。时间复杂度 O(log n)。\n\n易错点：`mid = (left + right) / 2` 在超大数组下可能溢出，写成 `left + ((right - left) >> 1)`；边界更新时要保证区间收缩，否则会死循环。'
	},
	{
		id: 'algo-004',
		cat: 'algo',
		type: 'single',
		level: 2,
		hot: 80,
		source: '面试鸭精选',
		title: '原地反转单链表的空间复杂度是？',
		code: '',
		options: [
			{ key: 'A', text: 'O(1)' },
			{ key: 'B', text: 'O(n)' },
			{ key: 'C', text: 'O(log n)' },
			{ key: 'D', text: 'O(n²)' }
		],
		answer: ['A'],
		analysis:
			'迭代法只用 prev、cur、next 三个指针，逐节点改指向，空间 O(1)，时间 O(n)。\n\n递归法代码更简洁，但递归深度等于链表长度，空间是 O(n)，长链表有栈溢出风险。面试中通常要求写迭代版本。'
	},
	{
		id: 'algo-005',
		cat: 'algo',
		type: 'single',
		level: 3,
		hot: 82,
		source: '面试鸭精选',
		title: '手写深拷贝时，处理循环引用最常用的做法是？',
		code: "const a = { name: 'a' }\na.self = a",
		options: [
			{ key: 'A', text: '用 WeakMap 记录「原对象 → 拷贝对象」的映射，命中则直接返回' },
			{ key: 'B', text: '用 JSON.parse(JSON.stringify())' },
			{ key: 'C', text: '用 Object.assign' },
			{ key: 'D', text: '递归时加一个层数上限' }
		],
		answer: ['A'],
		analysis:
			'递归前先查 WeakMap，如果当前对象已经拷贝过就直接返回之前的副本，从而断开循环。用 WeakMap 而不是 Map，是为了不阻止原对象被垃圾回收。\n\nJSON 方案遇到循环引用直接抛错，而且会丢失 undefined、函数、Symbol、Date 变成字符串、RegExp 变成空对象。Object.assign 是浅拷贝。完整实现还要处理数组、Date、RegExp、Map/Set 和原型。'
	},
	{
		id: 'algo-006',
		cat: 'algo',
		type: 'single',
		level: 2,
		hot: 88,
		source: '面试鸭精选',
		title: '下面这个防抖函数的实际效果是？',
		code: "function debounce(fn, delay) {\n  let timer = null\n  return function (...args) {\n    clearTimeout(timer)\n    timer = setTimeout(() => fn.apply(this, args), delay)\n  }\n}",
		options: [
			{ key: 'A', text: '连续触发时只在停止触发 delay 毫秒后执行一次' },
			{ key: 'B', text: '每隔 delay 毫秒执行一次' },
			{ key: 'C', text: '第一次触发立即执行' },
			{ key: 'D', text: '每次触发都立即执行' }
		],
		answer: ['A'],
		analysis:
			'这是最经典的尾部防抖：每次触发都清掉上一个定时器重新计时，只有停止触发超过 delay 才真正执行。适合搜索输入、窗口 resize。\n\n如果希望首次立即执行（leading），需要在 timer 为 null 时先调用一次；节流（throttle）则是固定间隔执行，两者语义不同。'
	},
	{
		id: 'algo-007',
		cat: 'algo',
		type: 'single',
		level: 2,
		hot: 74,
		source: '面试鸭精选',
		title: '`[1, [2, [3, [4]]]].flat(2)` 的结果是？',
		code: '',
		options: [
			{ key: 'A', text: '[1, 2, 3, 4]' },
			{ key: 'B', text: '[1, 2, 3, [4]]' },
			{ key: 'C', text: '[1, [2, [3, [4]]]]' },
			{ key: 'D', text: '[1, 2, [3, [4]]]' }
		],
		answer: ['B'],
		analysis:
			'flat 的参数是展开的层数，默认 1。flat(2) 只展开两层：第一层去掉外层的 [2, [3, [4]]] 包裹，第二层再去掉 [3, [4]] 的包裹，最终剩下 [4] 仍是数组。\n\n完全展开用 `flat(Infinity)`。flat 会自动跳过空位，但不会处理 undefined 和 null。'
	},
	{
		id: 'algo-008',
		cat: 'algo',
		type: 'single',
		level: 2,
		hot: 82,
		source: '面试鸭精选',
		title: '「两数之和」用哈希表求解的时间复杂度是？',
		code: '',
		options: [
			{ key: 'A', text: 'O(n²)' },
			{ key: 'B', text: 'O(n)' },
			{ key: 'C', text: 'O(n log n)' },
			{ key: 'D', text: 'O(log n)' }
		],
		answer: ['B'],
		analysis:
			'遍历数组，对每个元素先查哈希表里是否存在 `target - nums[i]`，存在则直接返回，不存在就把当前值和下标存进去。每个元素只访问一次，哈希查找平均 O(1)，整体 O(n)，空间 O(n)。\n\n暴力双重循环是 O(n²)。注意要先查后存，避免同一个元素被用两次（target 为偶数且出现重复值时）。'
	},
	{
		id: 'algo-009',
		cat: 'algo',
		type: 'single',
		level: 2,
		hot: 76,
		source: '面试鸭精选',
		title: '二叉树的前序遍历顺序是？',
		code: '',
		options: [
			{ key: 'A', text: '根 → 左 → 右' },
			{ key: 'B', text: '左 → 根 → 右' },
			{ key: 'C', text: '左 → 右 → 根' },
			{ key: 'D', text: '右 → 根 → 左' }
		],
		answer: ['A'],
		analysis:
			'前序（先序）根左右，中序左根右，后序左右根。中序遍历二叉搜索树可以得到升序序列，这是最常见的应用。\n\n递归实现最简单；迭代实现前序用栈（先压右再压左），中序用栈一路向左压栈，后序可以按「根右左」遍历后反转结果。'
	},
	{
		id: 'algo-010',
		cat: 'algo',
		type: 'single',
		level: 2,
		hot: 78,
		source: '面试鸭精选',
		title: '爬楼梯（每次 1 或 2 阶，共 5 阶）有多少种走法？',
		code: '',
		options: [
			{ key: 'A', text: '5' },
			{ key: 'B', text: '8' },
			{ key: 'C', text: '13' },
			{ key: 'D', text: '6' }
		],
		answer: ['B'],
		analysis:
			'递推式 f(n) = f(n-1) + f(n-2)，f(1)=1，f(2)=2，本质是斐波那契数列。序列为 1、2、3、5、8、13……所以 f(5)=8。\n\n朴素递归会重复计算，时间复杂度指数级；用滚动变量或数组做 DP，时间 O(n)、空间 O(1)（只保留前两项）。'
	},
	{
		id: 'algo-011',
		cat: 'algo',
		type: 'single',
		level: 2,
		hot: 72,
		source: '面试鸭精选',
		title: '判断括号字符串是否有效，最合适的数据结构是？',
		code: '',
		options: [
			{ key: 'A', text: '栈' },
			{ key: 'B', text: '队列' },
			{ key: 'C', text: '哈希表' },
			{ key: 'D', text: '二叉堆' }
		],
		answer: ['A'],
		analysis:
			'遇到左括号入栈，遇到右括号检查栈顶是否为对应的左括号，是则弹出，否则无效。遍历结束后栈必须为空。\n\n这是栈「后进先出」特性的经典应用，时间复杂度 O(n)，空间 O(n)。队列是先进先出，无法匹配最近的未闭合括号。'
	},
	{
		id: 'algo-012',
		cat: 'algo',
		type: 'single',
		level: 3,
		hot: 70,
		source: '面试鸭精选',
		title: '实现柯里化 `curry(fn)` 后，`curry(add)(1)(2)(3)` 能返回 6，依赖的关键机制是？',
		code: '',
		options: [
			{ key: 'A', text: '累积参数，当参数个数达到 fn.length 时才真正调用' },
			{ key: 'B', text: '用 bind 固定 this' },
			{ key: 'C', text: '用 Proxy 拦截函数调用' },
			{ key: 'D', text: '递归调用自身直到栈溢出' }
		],
		answer: ['A'],
		analysis:
			'柯里化把多参数函数转成单参数链式调用：每次返回一个新函数，把已收到的参数存起来，直到参数数量达到原函数期望的个数（fn.length）才执行。\n\n注意 fn.length 不包含有默认值的参数和剩余参数，这类函数需要额外指定参数个数，否则永远无法触发执行。'
	},
	{
		id: 'algo-013',
		cat: 'algo',
		type: 'single',
		level: 3,
		hot: 66,
		source: '面试鸭精选',
		title: '归并排序相比快速排序的特点是？',
		code: '',
		options: [
			{ key: 'A', text: '稳定排序，最坏也是 O(n log n)，但需要 O(n) 额外空间' },
			{ key: 'B', text: '不稳定且最坏 O(n²)' },
			{ key: 'C', text: '原地排序不需要额外空间' },
			{ key: 'D', text: '平均复杂度是 O(n)' }
		],
		answer: ['A'],
		analysis:
			'归并排序自底向上分治，合并时需要额外数组，空间 O(n)；时间复杂度稳定在 O(n log n)，且相等元素不会交换相对顺序（稳定）。\n\n快排原地进行、常数更小、实际更快，但不稳定且最坏 O(n²)。需要稳定排序或对最坏情况敏感（如外部排序）时选归并。'
	},
	{
		id: 'algo-014',
		cat: 'algo',
		type: 'single',
		level: 3,
		hot: 64,
		source: '面试鸭精选',
		title: '用两个栈实现队列，出队操作的均摊时间复杂度是？',
		code: '',
		options: [
			{ key: 'A', text: 'O(1)' },
			{ key: 'B', text: 'O(n)' },
			{ key: 'C', text: 'O(log n)' },
			{ key: 'D', text: 'O(n²)' }
		],
		answer: ['A'],
		analysis:
			'入队压入 inStack；出队时若 outStack 为空，就把 inStack 全部倒入 outStack，再弹出栈顶。每个元素最多被移动一次，均摊下来每次操作 O(1)。\n\n单次出队最坏可能是 O(n)（需要整体倒一次），但均摊分析后是常数。这是「均摊复杂度」的经典例子。'
	},
	{
		id: 'algo-015',
		cat: 'algo',
		type: 'multiple',
		level: 2,
		hot: 68,
		source: '面试鸭精选',
		title: '关于数组和链表的对比，正确的有？',
		code: '',
		options: [
			{ key: 'A', text: '数组随机访问 O(1)，链表随机访问 O(n)' },
			{ key: 'B', text: '链表在已知节点位置时插入删除 O(1)，数组通常需要移动元素' },
			{ key: 'C', text: '数组内存连续，缓存友好；链表节点分散，缓存命中率低' },
			{ key: 'D', text: '链表的查找效率高于数组' }
		],
		answer: ['A', 'B', 'C'],
		analysis:
			'数组靠下标直接定位，但中间插入删除要整体移动；链表插入删除只改指针，但必须先遍历找到位置，且节点分散导致 CPU 缓存不友好。\n\n所以链表的查找效率并不高，它的优势只在「已知位置的高频增删」。实际工程中数组（尤其是动态数组）用得远多于链表。'
	}
]
