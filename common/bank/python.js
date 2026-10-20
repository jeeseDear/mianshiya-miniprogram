/**
 * 题库 · Python 层（问答详解）
 *
 * 与其它分类不同，Python 不做选择题，而是「看题 → 看答案」的学习型内容：
 *   short   一句话回答，列表/详情页顶部用
 *   points  回答重点，面试口述时的骨架
 *   detail  详细答案，按小标题分段展开
 *   extend  扩展知识，常见追问与延伸点
 *   code    可选代码示例
 *
 * 题目清单取自「面试鸭」Python 面试题库（93 题）：
 * https://www.mianshiya.com/bank/1810643768400019458
 * 题干对应原题，重点、详细答案与扩展知识均为项目自行整理。
 */

export const categories = [
	{
		id: 'py',
		name: 'Python',
		short: 'PY',
		icon: '🐍',
		bg: '#e8f6ee',
		desc: '基础语法、数据类型、函数与生成器、面向对象、标准库、性能与并发，共 93 题'
	}
]

export const qaQuestions = [
	{
		id: 'py-001',
		cat: 'py',
		level: 1,
		hot: 99,
		source: '面试鸭 · Python',
		title: '解释型语言 Python 和编译型语言有什么区别？',
		short: 'Python 先把源码编译成字节码，再由虚拟机逐条解释执行，属于「先编译、后解释」。',
		points: [
			'编译型：运行前把源码整体翻译成机器码，执行时直接跑 CPU 指令',
			'解释型：翻译推迟到运行期，由解释器边读边执行，跨平台靠解释器',
			'Python 不生成独立可执行文件，而是先编译成字节码（.pyc）',
			'语法错误在编译字节码阶段就会报出，不是运行到那一行才发现'
		],
		detail: [
			{ h: '分界线在翻译时机', p: '编译型语言（C、Go、Rust）在运行前把源码整体翻译成目标平台的机器码，运行时直接执行二进制，因此快但要为每个平台单独编译；解释型语言把翻译推迟到运行期，一份源码配一个解释器就能跨平台跑。' },
			{ h: 'Python 其实是混合模式', p: 'CPython 会先把 .py 编译成字节码放进 __pycache__/*.pyc，再由虚拟机逐条执行。所以它既不是纯解释也不是机器码编译，性能瓶颈在「虚拟机逐条分派指令」和「每次操作都做动态类型检查」，而不是编译这一步。' }
		],
		extend: [
			'PyPy 用 JIT 把热点字节码编译成机器码，纯 Python 代码常能快数倍',
			'import 的模块会复用 .pyc，入口脚本每次运行都会重新编译字节码',
			'Cython / Nuitka 可以把 Python 编译成 C 再出二进制，常用于提速与交付'
		],
		code: ''
	},
	{
		id: 'py-002',
		cat: 'py',
		level: 1,
		hot: 92,
		source: '面试鸭 · Python',
		title: 'Python3 中 is 和 == 有什么区别？',
		short: 'is 比身份（id 是否相同），== 比值（调用 __eq__）。',
		points: [
			'is / is not 判断两个名字是否指向同一个对象',
			'== / != 调用 __eq__，比较值是否相等，可被自定义',
			'判断 None、True、False 用 is，判断值用 ==',
			'小整数与短字符串有驻留缓存，is 可能偶然为 True，不能依赖'
		],
		detail: [
			{ h: '本质区别', p: '每个对象都有唯一的 id，is 就是比较 id。== 是运算符重载，会调用左操作数的 __eq__，所以自定义类、numpy 数组、pandas 的 == 行为都可以和「布尔相等」不一样。' },
			{ h: '常见坑', p: 'a = [1, 2]; b = [1, 2] 时 a == b 为 True 但 a is b 为 False，只有 a = b 才是同一个对象。-5~256 的整数、短字符串、None/True/False 会被驻留，is 恰好为 True，所以 is 只用于判断单例。' }
		],
		extend: [
			'id(x) 可以直接查看对象地址',
			'自定义 __eq__ 时通常要同时定义 __hash__，否则实例变成不可哈希',
			'字符串驻留可以用 sys.intern 手动触发'
		],
		code: 'a = [1, 2]\nb = [1, 2]\nprint(a == b)   # True\nprint(a is b)   # False\nprint(a is a)   # True'
	},
	{
		id: 'py-003',
		cat: 'py',
		level: 3,
		hot: 82,
		source: '面试鸭 · Python',
		title: 'Python 中 read、readline、readlines 有哪些区别？',
		short: 'read 一次读完，readline 一次读一行，readlines 一次读成「每行一个元素」的列表。',
		points: [
			'read(size) 返回整个字符串或指定字节数，最占内存',
			'readline() 每次读一行，读到文件末尾返回空字符串',
			'readlines() 返回列表，每个元素是一行（保留换行符）',
			'大文件用 for line in f 迭代，内存占用与文件大小无关'
		],
		detail: [
			{ h: '返回值不同', p: 'read() 返回一个大字符串；readline() 返回单行字符串；readlines() 返回 list[str]。文本模式返回 str 并自动处理换行与编码，二进制模式返回 bytes。三者都可以带 size / hint 参数来限制一次读取的量。' },
			{ h: '怎么选', p: '小配置直接 read；按行解析用 for line in f，解释器内部带缓冲，等价于反复 readline，8G 文件也不会爆内存；readlines 只适合小文件或确实要整体列表的场景。' }
		],
		extend: [
			'文件对象本身就是迭代器，可以 next(f) 手动跳行',
			'需要随机访问可以用 mmap，或落库后用索引查',
			'二进制大文件用 while chunk := f.read(1024 * 1024) 分块处理'
		],
		code: ''
	},
	{
		id: 'py-004',
		cat: 'py',
		level: 3,
		hot: 78,
		source: '面试鸭 · Python',
		title: '什么是 Python 面向对象中的继承特点？',
		short: '支持单继承与多继承，属性按 MRO（C3 线性化）查找，super() 沿 MRO 找下一个类。',
		points: [
			'子类自动获得父类的方法与属性，可重写（override）',
			'支持多继承，用 MRO 解决同名方法的二义性',
			'super() 不是「调用父类」，而是沿 MRO 找下一个类',
			'菱形继承靠 MRO + 协作式 super() 保证每个类只初始化一次'
		],
		detail: [
			{ h: 'MRO 怎么算', p: 'Python 用 C3 线性化把父类排成一条有序链，规则是「子类优先于父类、左侧父类优先于右侧父类、单调性」。用 Cls.__mro__ 或 Cls.mro() 就能看到真实顺序，属性查找严格按这条链走。' },
			{ h: 'super() 的价值', p: '在菱形结构里直接写 Parent.__init__(self) 会让公共祖先被初始化多次；super().__init__() 会沿 MRO 继续往下走，每个类只执行一次。Mixin 正是靠这个机制层层叠加能力。' }
		],
		extend: [
			'重写方法时参数签名最好与被重写方法保持一致（LSP 原则）',
			'isinstance 会考虑继承关系，type 不会',
			'多继承层级过深会让 MRO 难以推理，优先用组合替代'
		],
		code: 'class A:\n    def hi(self):\n        print("A")\n\nclass B(A):\n    def hi(self):\n        super().hi()\n        print("B")\n\nprint(B.__mro__)  # B -> A -> object'
	},
	{
		id: 'py-005',
		cat: 'py',
		level: 1,
		hot: 75,
		source: '面试鸭 · Python',
		title: 'Python 中 any() 和 all() 方法有什么作用？',
		short: 'any 有一个为真就 True，all 全部为真才 True，两者都短路。',
		points: [
			'any(iterable)：任一元素为真即返回 True',
			'all(iterable)：所有元素为真才返回 True',
			'空序列是边界：any([]) 为 False，all([]) 为 True',
			'都支持短路，适合传生成器，不用先构造列表'
		],
		detail: [
			{ h: '语义来源', p: 'any 是「存在量词」，all 是「全称量词」，全称判断对空集天然成立，所以 all([]) 返回 True。这一点常被拿来出题，也是写校验逻辑时的隐含行为。' },
			{ h: '工程用法', p: 'any(x > 0 for x in nums) 遇到第一个正数就停，不会把整个序列算完；all(isinstance(x, int) for x in row) 用来做整行类型校验。注意元素按真值判断，0、空串、None、空容器都算 False。' }
		],
		extend: [
			'any / all 与生成器配合是惰性求值的典型用法',
			'numpy 的 any/all 是逐元素聚合，参数是 axis，语义不同',
			'需要拿到具体元素时用 next((x for x in seq if cond), None)'
		],
		code: ''
	},
	{
		id: 'py-006',
		cat: 'py',
		level: 1,
		hot: 77,
		source: '面试鸭 · Python',
		title: '说明 Python3 中装饰器的用法',
		short: '装饰器是「接收函数、返回新函数」的可调用对象，@ 只是把 f = deco(f) 写成语法糖。',
		points: [
			'本质：func = decorator(func)，在函数定义时执行一次',
			'包装函数里用 *args/**kwargs 透传参数，用 return 返回原函数结果',
			'带参数的装饰器要多套一层：先求值出装饰器，再装饰',
			'用 functools.wraps 保留原函数的 __name__、__doc__'
		],
		detail: [
			{ h: '执行时机', p: '@ 语法在「定义期」执行，不是每次调用都重新装饰。所以装饰器里可以做注册（如 Flask 路由）、缓存初始化这类一次性动作；而包装函数体才是每次调用都会跑的部分。' },
			{ h: '典型场景', p: '日志、耗时统计、权限校验、重试、缓存（lru_cache）、事务与限流。类装饰器、装饰类（如 @dataclass）也是同一机制，只要对象可调用并能返回替换品即可。' }
		],
		extend: [
			'多个装饰器自上而下书写，执行时自下而上包裹',
			'functools.lru_cache 是最常用的内置装饰器，可加 maxsize 限制',
			'装饰器栈信息会变深，异常排查时可打印 __wrapped__ 拿原函数'
		],
		code: 'import functools, time\n\ndef timer(fn):\n    @functools.wraps(fn)\n    def wrapper(*args, **kwargs):\n        t = time.perf_counter()\n        try:\n            return fn(*args, **kwargs)\n        finally:\n            print(fn.__name__, time.perf_counter() - t)\n    return wrapper'
	},
	{
		id: 'py-007',
		cat: 'py',
		level: 1,
		hot: 74,
		source: '面试鸭 · Python',
		title: '说明 Python3 中 yield 的用法',
		short: 'yield 让函数变成生成器：执行到 yield 暂停并产出值，下次 next 从暂停处继续。',
		points: [
			'含 yield 的函数调用时不执行函数体，只返回生成器对象',
			'yield 保存了当前栈帧状态，所以能惰性求值、处理无限序列',
			'生成器只能遍历一次，耗尽后再 next 抛 StopIteration',
			'yield from 可以把子生成器的值逐个透传'
		],
		detail: [
			{ h: '与 return 的区别', p: 'return 结束函数并把控制权交回调用方，局部变量销毁；yield 只是挂起，栈帧保留在生成器对象里，下一次 next 从这里继续。所以生成器能记住「上次算到哪」，天然适合分批处理。' },
			{ h: '实际用途', p: '读大文件、分批查库、无限序列（计数器）、数据管道（每个阶段一个生成器串起来）。Generator 同时是 Iterator，可以直接传给 for、sum、list，也可以被 send() 推进并传值。' }
		],
		extend: [
			'send(v) 把值送到挂起的 yield 表达式处，首次必须先 next',
			'throw() 在挂起点抛异常，close() 结束生成器',
			'协程（async/await）就是生成器机制的演进，await 处同样会挂起'
		],
		code: 'def batches(rows, size=100):\n    buf = []\n    for r in rows:\n        buf.append(r)\n        if len(buf) == size:\n            yield buf\n            buf = []\n    if buf:\n        yield buf'
	},
	{
		id: 'py-008',
		cat: 'py',
		level: 1,
		hot: 70,
		source: '面试鸭 · Python',
		title: '说明 Python 中 enumerate() 的用法',
		short: '遍历时同时给出「索引 + 元素」，可用 start 指定起始编号。',
		points: [
			'enumerate(seq, start=0) 返回 (索引, 元素) 的迭代器',
			'start 可以设为 1，直接得到人类习惯的编号',
			'比 range(len(seq)) 更直观，也避免了下标越界',
			'返回的是迭代器，要列表需 list(enumerate(x))'
		],
		detail: [
			{ h: '等价写法', p: 'enumerate(seq) 等价于 zip(range(len(seq)), seq)，但前者是 C 实现、更快也更清晰。解包写法 for i, item in enumerate(lst, 1) 是 Python 里最常见的编号方式。' },
			{ h: '注意点', p: 'enumerate 产出的是元组，不会复制原序列；遍历时修改列表长度会导致索引与实际元素错位，需要删除元素时建议倒序遍历或先收集再删。' }
		],
		extend: [
			'字典遍历用 d.items()，不需要 enumerate',
			'enumerate 可与 zip 嵌套实现二维坐标遍历',
			'需要同时拿索引和分组时，配合 itertools.groupby 使用'
		],
		code: ''
	},
	{
		id: 'py-009',
		cat: 'py',
		level: 1,
		hot: 70,
		source: '面试鸭 · Python',
		title: '解释 Python 中 //、% 和 ** 运算符',
		short: '// 向下取整的整除，% 取余（结果符号跟除数），** 是幂运算。',
		points: [
			'7 // 2 = 3，向下取整而不是截断',
			'-7 // 2 = -4，向负无穷方向取整',
			'7 % 2 = 1，负数取余结果与除数同号',
			'2 ** 10 = 1024，支持浮点与负数指数'
		],
		detail: [
			{ h: '与除法 / 的区别', p: '/ 永远返回 float（4 / 2 得 2.0），// 返回向下取整的结果，类型跟随操作数（5.5 // 2 得 2.0）。需要整数结果且要求截断时，int(a / b) 与 a // b 在负数上结果不同。' },
			{ h: '取余的符号规则', p: 'Python 的 % 满足 a == (a // b) * b + a % b，所以 -7 % 2 得 1 而不是 -1。这个特性在做「循环索引」时很好用，因为 idx % n 永远落在 0..n-1。' }
		],
		extend: [
			'divmod(a, b) 一次拿到 (商, 余数)',
			'** 的右结合：2 ** 3 ** 2 等于 2 ** 9',
			'大整数幂用 pow(a, b, mod) 做模幂，比 a ** b % mod 快很多'
		],
		code: ''
	},
	{
		id: 'py-010',
		cat: 'py',
		level: 1,
		hot: 70,
		source: '面试鸭 · Python',
		title: 'Python 有哪些特点和优点？',
		short: '语法简洁、生态庞大、跨平台、开发效率高，同时是动态类型 + 强类型。',
		points: [
			'语法接近自然语言，缩进强制格式化，代码可读性高',
			'标准库齐全，第三方生态覆盖 Web、数据、AI、运维',
			'解释执行 + 跨平台，一份代码多端运行',
			'动态类型但不做隐式弱转换（"1" + 1 直接报错）'
		],
		detail: [
			{ h: '动态类型 + 强类型', p: '变量不需要声明类型，运行时才确定；但不同类型之间不会自动强转，字符串拼接整数会抛 TypeError。这和 JS 这种动态弱类型语言有本质区别，也是 Python 代码更少出「意外字符串化」bug 的原因。' },
			{ h: '工程上的优势', p: '可读性和一致性降低了团队协作成本，丰富的库减少了重复造轮子；配合 typing、mypy、ruff 后，动态类型的短板可以被静态检查补上不少。' }
		],
		extend: [
			'「胶水语言」：能把 C/C++、Rust 写的扩展粘进来',
			'缩进是语法的一部分，混用 Tab 与空格会抛 TabError',
			'3.10+ 的模式匹配、3.12 的 PEP 695 泛型语法在持续增强表达力'
		],
		code: ''
	},
	{
		id: 'py-011',
		cat: 'py',
		level: 3,
		hot: 73,
		source: '面试鸭 · Python',
		title: 'Python 中深拷贝和浅拷贝有什么区别？',
		short: '浅拷贝只复制最外层容器，深拷贝递归复制每一层，并用 memo 处理循环引用。',
		points: [
			'浅拷贝：外层是新的，内部元素仍指向原对象',
			'深拷贝：递归复制所有层级，互不影响',
			'lst[:]、dict.copy()、copy.copy() 都是浅拷贝',
			'deepcopy 用 memo 记录已复制对象，能处理循环引用'
		],
		detail: [
			{ h: '为什么会踩坑', p: '浅拷贝只新建了外层容器，嵌套的 list/dict 还是同一份。改 a[0].append(x) 会影响 b[0]，因为两者指向同一个内层对象；只有直接替换 a[0] = x 才互不影响。' },
			{ h: '深拷贝的代价', p: 'deepcopy 要递归遍历并复制所有对象，开销大，还可能因为对象不可序列化（文件句柄、锁、数据库连接）失败。知道结构只有一层嵌套时，手动 [[x for x in row] for row in grid] 更可控。' }
		],
		extend: [
			'不可变对象（int、str、tuple 里全是不可变）深浅拷贝返回同一对象',
			'copy.deepcopy(x, memo) 可复用自己的 memo 字典',
			'自定义 __deepcopy__ 可以控制复杂对象的复制行为'
		],
		code: 'import copy\n\na = [[1], [2]]\nb = copy.copy(a)\nb[0].append(9)\nprint(a)          # [[1, 9], [2]]  <- 受影响了\n\nc = copy.deepcopy(a)\nc[0].append(7)\nprint(a)          # [[1, 9], [2]]'
	},
	{
		id: 'py-012',
		cat: 'py',
		level: 3,
		hot: 72,
		source: '面试鸭 · Python',
		title: 'Python 中的列表和元组有什么区别？',
		short: 'list 可变、不可哈希；tuple 不可变、可哈希，能当字典键且更省内存。',
		points: [
			'list 支持增删改，tuple 创建后不可变',
			'tuple 可哈希（元素全部可哈希时），能作为 dict 的键与 set 的元素',
			'tuple 内存更紧凑，创建与遍历略快',
			'语义不同：list 是同类元素集合，tuple 更像「一条记录」'
		],
		detail: [
			{ h: '不可变带来什么', p: '因为内容不能改，tuple 可以被哈希，从而作为字典键或集合元素——这是 list 做不到的。函数返回多值本质也是返回 tuple，解包即用。' },
			{ h: '性能与语义', p: 'tuple 少了容量预留和扩容逻辑，内存占用更小；在 CPython 里同内容 tuple 还常被复用。工程上「长度固定、字段含义不同」用 tuple 或 namedtuple，「需要动态增删」才用 list。' }
		],
		extend: [
			'tuple 里含 list 时整体不可哈希，会抛 TypeError',
			'单元素 tuple 要写成 (1,)，否则只是加了括号的整数',
			'namedtuple / dataclass(frozen=True) 是更可读的不可变结构'
		],
		code: ''
	},
	{
		id: 'py-013',
		cat: 'py',
		level: 1,
		hot: 70,
		source: '面试鸭 · Python',
		title: '什么是 Python 中的三元表达式？',
		short: '写法是「值1 if 条件 else 值2」，条件为真取值1，否则取值2。',
		points: [
			'语法：a if cond else b，两个分支都必须写',
			'它是表达式，可以嵌在函数调用、返回、推导式里',
			'条件在中间，和 C 系语言的 cond ? a : b 顺序不同',
			'嵌套可读性差，复杂逻辑用 if/elif 或提前 return'
		],
		detail: [
			{ h: '和 if 语句的区别', p: 'if 语句是控制流，接受任意语句块；三元表达式必须产生一个值，因此只能写表达式。正因为它有返回值，才能直接写成 return x if ok else None 或函数实参。' },
			{ h: '常见写法', p: 'value = 0 if value is None else value 做默认值；status = "ok" if code == 200 else "fail" 做映射。超过两层嵌套就该抽成 if/elif 或字典映射，可读性优先。' }
		],
		extend: [
			'注意短路：a if cond else b 只会对命中的分支求值',
			'配合生成器写 [x if x > 0 else 0 for x in nums] 很常见',
			'or 也能做默认值（x or default），但会误判 0 和空串'
		],
		code: 'score = 82\nlevel = "优秀" if score >= 90 else "及格" if score >= 60 else "不及格"'
	},
	{
		id: 'py-014',
		cat: 'py',
		level: 1,
		hot: 70,
		source: '面试鸭 · Python',
		title: '请简单介绍 Python 的 Flask 框架，有什么作用？',
		short: '轻量级 WSGI Web 框架，核心只有路由、请求上下文和模板，其余靠扩展。',
		points: [
			'核心能力：路由、请求/响应对象、Jinja2 模板、蓝图',
			'不做 ORM、后台管理，按需装扩展（Flask-SQLAlchemy 等）',
			'基于 WSGI，生产环境用 gunicorn / uWSGI 承载',
			'适合小型服务、API、内部工具；大型项目一般选 Django 或 FastAPI'
		],
		detail: [
			{ h: '为什么说它轻', p: 'Flask 只负责「把 URL 映射到函数」以及请求进出上下文，数据库、鉴权、表单校验都交给扩展。这带来极高的自由度，但项目结构需要团队自己约定，否则容易散。' },
			{ h: '常见组合', p: 'Flask + Flask-SQLAlchemy 做数据层，Flask-Login 做会话，Flask-Migrate 做迁移，gunicorn + nginx 上线。异步高并发场景更推荐 FastAPI，Django 适合需要 admin 和完整约定的业务系统。' }
		],
		extend: [
			'蓝图（Blueprint）用来拆分模块化路由',
			'请求上下文靠 thread-local / contextvars 实现，多线程下也安全',
			'Flask 2.2+ 支持 async 视图，但生态仍是同步为主'
		],
		code: 'from flask import Flask, jsonify\n\napp = Flask(__name__)\n\n@app.get("/health")\ndef health():\n    return jsonify(ok=True)'
	},
	{
		id: 'py-015',
		cat: 'py',
		level: 1,
		hot: 70,
		source: '面试鸭 · Python',
		title: '如何在 Python 中管理内存？',
		short: '引用计数为主，标记-清除 + 分代回收处理循环引用，另有内存池管理小对象。',
		points: [
			'每个对象带引用计数，归零立即释放',
			'循环引用靠 gc 的标记-清除与分代回收兜底',
			'小对象走 pymalloc 内存池，减少向系统申请的次数',
			'释放的内存通常回到解释器池，不保证立刻还给操作系统'
		],
		detail: [
			{ h: '三层机制', p: '引用计数是即时回收：赋值、传参、放入容器都会 +1，删除、离开作用域、重新赋值 -1。它无法处理「A 引用 B、B 引用 A」的环，于是 gc 模块做周期性标记-清除，并按对象存活代数分 0/1/2 三代扫描。' },
			{ h: '工程上怎么做', p: '优先靠作用域和 with 释放资源；大量临时对象用生成器、del 及时断开引用；排查内存用 tracemalloc / memory_profiler；循环引用多的场景可调 gc.set_threshold 或手动 gc.collect()。' }
		],
		extend: [
			'小整数、短字符串有缓存/驻留，不会被删除',
			'gc.disable() 能省掉扫描开销，但循环引用会滞留',
			'__slots__ 能去掉实例 __dict__，显著降低对象内存'
		],
		code: ''
	},
	{
		id: 'py-016',
		cat: 'py',
		level: 1,
		hot: 67,
		source: '面试鸭 · Python',
		title: 'Python 中 help() 函数和 dir() 函数有什么作用？',
		short: 'help 看文档说明，dir 列属性方法名。',
		points: [
			'help(obj) 展示 docstring 与方法签名，help("modules") 列模块',
			'dir(obj) 返回属性/方法名列表，不带参数时看当前作用域',
			'排查「有什么」用 dir，理解「怎么用」用 help',
			'两者都依赖对象的 __doc__ 与 __dir__'
		],
		detail: [
			{ h: '实际用法', p: '交互环境里 help(str.split) 能直接看到参数说明和示例；dir("") 能列出字符串所有方法，配合 __doc__ 快速查。IDE 的补全与悬浮文档，底层用的就是这些信息。' },
			{ h: '自定义类', p: '给类写 docstring，help() 就会展示；实现 __dir__ 可以定制 dir 的输出。这也是为什么推荐公共 API 写清楚 docstring：它同时服务 help()、IDE 和自动生成的文档。' }
		],
		extend: [
			'inspect 模块能拿到更细的签名、源码与注解',
			'help() 在非交互环境会分页输出，可传 output 参数重定向',
			'pydoc 可以把文档生成为 HTML 页面'
		],
		code: ''
	},
	{
		id: 'py-017',
		cat: 'py',
		level: 1,
		hot: 67,
		source: '面试鸭 · Python',
		title: 'Python 程序退出时，是否释放所有内存分配？',
		short: '进程退出时操作系统会回收全部内存，但不保证 Python 层的析构逻辑都执行。',
		points: [
			'内存归还是操作系统行为，进程结束必然发生',
			'__del__ 不保证被调用，不能依赖它释放资源',
			'atexit 注册的函数会在正常退出时执行，但被 kill -9 时不会',
			'文件、连接等资源用 with 或 try/finally 显式关闭'
		],
		detail: [
			{ h: '为什么不能依赖析构', p: '解释器退出时模块可能已被清理，__del__ 里的引用未必还有效，CPython 也只尽力回收。进程被强杀时更是什么都不会执行，所以「靠析构关连接」在生产环境一定会出问题。' },
			{ h: '正确姿势', p: '上下文管理器保证退出时关闭；服务进程捕获 SIGTERM 做优雅停机（停止接新请求、处理完在途任务、关闭连接池）；需要落盘的临时数据用 try/finally 或 atexit 兜底。' }
		],
		extend: [
			'weakref.finalize 比 __del__ 更安全地做清理',
			'内存泄漏排查看 tracemalloc，而不是等退出',
			'子进程退出后由父进程 wait 回收，否则会留僵尸进程'
		],
		code: ''
	},
	{
		id: 'py-018',
		cat: 'py',
		level: 3,
		hot: 68,
		source: '面试鸭 · Python',
		title: '什么是 Python 的字典，有哪些用法？',
		short: '键值对哈希表，键必须可哈希，3.7 起保持插入顺序，查找平均 O(1)。',
		points: [
			'键必须可哈希：str、int、tuple 可以，list、dict 不行',
			'get(k, default) 避免 KeyError，setdefault 适合分组累加',
			'3.7+ 按插入顺序遍历，可用 ** 或 | 合并',
			'底层是开放寻址的哈希表，扩容时会重新散列'
		],
		detail: [
			{ h: '高频操作', p: 'd[k] 取值、d.get(k) 安全取值、d.setdefault(k, []) 分组、d.items() 遍历、{**a, **b} 或 a | b 合并、del d[k] 或 d.pop(k, None) 删除。计数器直接用 collections.Counter 更省事。' },
			{ h: '为什么快', p: '哈希表用键的哈希值定位槽位，平均 O(1)。代价是额外内存，以及键必须可哈希。自定义对象要作为键，需要实现 __hash__ 和 __eq__，并保证相等对象哈希相同。' }
		],
		extend: [
			'字典推导式 {k: v for ...} 可同时过滤与转换',
			'collections.defaultdict / Counter / ChainMap 覆盖更多场景',
			'3.9+ 支持 a | b 合并，|= 原地更新'
		],
		code: 'words = ["a", "b", "a"]\ncount = {}\nfor w in words:\n    count[w] = count.get(w, 0) + 1\nprint(count)  # {"a": 2, "b": 1}'
	},
	{
		id: 'py-019',
		cat: 'py',
		level: 1,
		hot: 67,
		source: '面试鸭 · Python',
		title: '什么是 Python 的负索引？',
		short: '从末尾开始计数，-1 是最后一个元素，切片同样支持负数。',
		points: [
			's[-1] 等价于 s[len(s) - 1]',
			'负索引同样做越界检查，s[-100] 仍抛 IndexError',
			'切片支持负数：s[-3:] 取最后三个',
			'step 为负可整体反转：s[::-1]'
		],
		detail: [
			{ h: '原理', p: '序列在解析下标时会自动加上长度：index < 0 时按 len + index 处理。所以 -1 指向最后一个元素，-len 指向第一个，再往小就越界。' },
			{ h: '切片与索引的差别', p: '单下标用 -1 越界会报错；切片越界不报错，s[-100:] 会从头开始取。这也是取「最后 N 个」时用切片比用下标更安全的原因。' }
		],
		extend: [
			'字符串、list、tuple、range 都支持负索引',
			'dict 不支持，键没有「位置」概念',
			'deque 支持负索引但比 list 慢'
		],
		code: 's = "abcdef"\nprint(s[-1])    # f\nprint(s[-3:])   # def\nprint(s[::-1])  # fedcba'
	},
	{
		id: 'py-020',
		cat: 'py',
		level: 3,
		hot: 68,
		source: '面试鸭 · Python',
		title: 'Python 中 join() 和 split() 函数有什么区别？',
		short: 'join 用分隔符把字符串序列拼成一串，split 按分隔符把字符串切成列表。',
		points: [
			'分隔符.join(可迭代对象) 返回新字符串',
			'str.split(sep, maxsplit) 返回字符串列表',
			'join 的元素必须都是 str，数字要先转换',
			'split() 不传参时按任意空白切分并丢弃首尾空串'
		],
		detail: [
			{ h: '方向相反', p: 'split 是「拆」，join 是「拼」。拼接大量字符串必须用 "".join(parts)，因为字符串不可变，循环 s += x 每次都新建对象，复杂度是 O(n²)。' },
			{ h: '容易忽略的细节', p: 'join 只能接字符串，否则抛 TypeError，需 map(str, items)；split 传了分隔符时，空字段会保留（"a,,b".split(",") 得 ["a", "", "b"]），不传参才按空白压缩。' }
		],
		extend: [
			'splitlines() 按行切分并保留/去掉换行，处理文本更合适',
			'partition / rpartition 只切一刀，返回三元组',
			're.split 可以按正则切分，支持多个分隔符'
		],
		code: 's = " a  b   c "\nprint(s.split())          # ["a", "b", "c"]\nprint("-".join(["a", "b"])) # a-b'
	},
	{
		id: 'py-021',
		cat: 'py',
		level: 1,
		hot: 68,
		source: '面试鸭 · Python',
		title: 'Python 是否区分大小写？',
		short: '区分。Name 和 name 是两个完全不同的标识符。',
		points: [
			'标识符、关键字、模块名都区分大小写',
			'字符串比较也区分大小写，"A" != "a"',
			'字典键、集合元素同样区分',
			'大小写无关比较用 casefold() 或正则的 re.I'
		],
		detail: [
			{ h: '容易出错的地方', p: '从配置文件读来的键名大小写和代码里写的不一致，就会 KeyError 或 AttributeError；Linux 上文件名也区分大小写，跨平台部署时常因此出问题（Windows 不区分）。' },
			{ h: '需要忽略大小写时', p: '比较前统一 lower() 或 casefold()；正则加 re.IGNORECASE；字典查找可以先用 casefold 归一化键再存。不要指望语言层面自动忽略。' }
		],
		extend: [
			'True / False / None 首字母必须大写',
			'PEP 8 里类名 PascalCase、其它 snake_case，就是为了减少大小写误用',
			'import 的模块名在大小写不敏感的文件系统上可能掩盖问题'
		],
		code: ''
	},
	{
		id: 'py-022',
		cat: 'py',
		level: 1,
		hot: 65,
		source: '面试鸭 · Python',
		title: '说明 Python 中标识符的命名规则',
		short: '字母/数字/下划线组成，不能以数字开头，不能是关键字，且区分大小写。',
		points: [
			'首字符必须是字母或下划线，之后可含数字',
			'不能与关键字重名（keyword.kwlist 可查）',
			'Python3 允许 Unicode 标识符，但不建议用中文',
			'PEP 8 约定：变量函数 snake_case、类 PascalCase、常量全大写'
		],
		detail: [
			{ h: '硬规则与软约定', p: '硬规则由语法决定，违反直接 SyntaxError 或 NameError；软约定来自 PEP 8，违反不会报错但会破坏可读性。单下划线前缀表示内部使用，双下划线前缀触发名字改写。' },
			{ h: '推荐的命名', p: '变量/函数用 user_name、get_total，类用 HttpClient，常量用 MAX_RETRY，模块用小写短名。避免用 list、dict、str、id 这类内置名做变量，会遮蔽内置函数导致诡异 bug。' }
		],
		extend: [
			'isidentifier() 可以判断字符串是否是合法标识符',
			'soft keyword（match、case、type）可作变量名但会降低可读性',
			'类型注解里的名字不受此限制，但同样建议遵守约定'
		],
		code: ''
	},
	{
		id: 'py-023',
		cat: 'py',
		level: 1,
		hot: 65,
		source: '面试鸭 · Python',
		title: 'Python 中如何删除字符串中的前置空格？',
		short: '用 lstrip()；也可传字符集只删指定字符。',
		points: [
			'lstrip() 删除左侧空白（空格、\\t、\\n 等）',
			'strip() 删两端，rstrip() 删右侧',
			'lstrip("0") 可以删除左侧指定字符集合',
			'字符串不可变，方法返回新串，原串不变'
		],
		detail: [
			{ h: '参数是字符集不是前缀', p: 'lstrip("ab") 会删掉开头所有 a 和 b，而不是删「ab」这个前缀。要按前缀删除用 removeprefix("ab")（3.9+），要按正则删除用 re.sub(r"^\\s+", "", s)。' },
			{ h: '常见场景', p: '清洗用户输入、解析文本行、处理 CSV 字段。注意 strip 只处理两端，中间连续空白需要 re.sub(r"\\s+", " ", s) 归一化。' }
		],
		extend: [
			'removeprefix / removesuffix 是 3.9 新增的语义更明确的方法',
			'strip() 不带参数等价于删除所有空白字符集合',
			'读取文件时用 line.strip() 去掉行尾换行是常规操作'
		],
		code: 's = "   hello  "\nprint(s.lstrip())   # "hello  "\nprint(s.strip())    # "hello"\nprint(s.rstrip())   # "   hello"'
	},
	{
		id: 'py-024',
		cat: 'py',
		level: 1,
		hot: 65,
		source: '面试鸭 · Python',
		title: 'Python 中如何将字符串转换为小写？',
		short: '用 str.lower()；涉及非 ASCII 时更彻底的是 casefold()。',
		points: [
			'lower() 返回全小写的新字符串',
			'casefold() 对 ß、İ 等字符处理更彻底，适合比较',
			'upper() / title() / capitalize() 是同类方法',
			'原字符串不可变，方法不会修改调用者'
		],
		detail: [
			{ h: 'lower 与 casefold 的区别', p: 'lower 只做逐字符小写映射，casefold 按 Unicode 的大小写折叠规则做更激进的归一化，例如 "ß".casefold() 得 "ss"，因此做「大小写无关比较」时应使用 casefold。' },
			{ h: '典型用法', p: '把用户输入的邮箱、标签、HTTP header 名统一成小写再比较或入库；排序时用 key=str.lower 实现忽略大小写的排序。' }
		],
		extend: [
			'swapcase() 大小写互换，做趣味变换时用',
			'str.title() 会把每个单词首字母大写，但会拆开 don\'t 这类词',
			'格式化输出可用 f"{name.lower()}" 内联处理'
		],
		code: ''
	},
	{
		id: 'py-025',
		cat: 'py',
		level: 1,
		hot: 65,
		source: '面试鸭 · Python',
		title: 'Python 的 pass 语句有什么作用？',
		short: '空语句占位：语法上必须有语句、逻辑上又什么都不做时用它。',
		points: [
			'不执行任何操作，只占一个语句位',
			'常用于待实现的函数体、空的 if/for/while',
			'也用于 except 里「有意忽略」某个异常',
			'它不改变控制流，不能替代 continue 或 break'
		],
		detail: [
			{ h: '为什么需要它', p: 'Python 用缩进表示代码块，块内不能为空。写 def todo(): pass 或 if debug: pass 时，pass 让语法成立，同时明确表达「这里暂时不做任何事」的意图。' },
			{ h: '和 continue 的区别', p: 'pass 只是空转，循环体会继续执行后面的语句；continue 会立刻跳到下一轮。异常处理里 except SomeError: pass 表示吞掉异常，但要写注释说明原因，否则会掩盖问题。' }
		],
		extend: [
			'...（省略号）也能当占位，常见于类型存根与协议定义',
			'抽象方法常用 raise NotImplementedError 而不是 pass',
			'空类体常直接写 docstring，比 pass 更有信息量'
		],
		code: 'def load_config(path):\n    pass  # TODO: 待实现\n\nfor x in range(3):\n    if x == 1:\n        pass      # 什么都不做，继续往下\n    print(x)'
	},
	{
		id: 'py-026',
		cat: 'py',
		level: 3,
		hot: 69,
		source: '面试鸭 · Python',
		title: '什么是 Python 的闭包？',
		short: '内层函数引用外层局部变量，且外层把内层函数返回，变量被保存在 __closure__ 里。',
		points: [
			'三个条件：内层函数 + 引用自由变量 + 外层已返回',
			'自由变量存放在函数的 __closure__ 元组中',
			'修改外层变量要声明 nonlocal',
			'循环中创建闭包会共享同一个变量，用默认参数固定'
		],
		detail: [
			{ h: '和普通嵌套函数的区别', p: '只是定义在函数内部的函数不算闭包，必须真的引用外层变量并在外层返回后仍被调用。此时外层栈帧已结束，但被引用的变量通过 cell 对象存活，这就是闭包能「记住状态」的原因。' },
			{ h: '经典坑', p: 'for i in range(3): fs.append(lambda: i) 得到的三个函数都返回 2，因为它们引用同一个 i。写成 lambda i=i: i 或 functools.partial 把当前值固化，才能得到 0/1/2。' }
		],
		extend: [
			'闭包常用于装饰器、回调、工厂函数（生成带配置的函数）',
			'nonlocal 只能用于嵌套函数，改模块级变量用 global',
			'需要可变状态时，用类或 functools.lru_cache 往往更清晰'
		],
		code: 'def counter():\n    n = 0\n    def inc():\n        nonlocal n\n        n += 1\n        return n\n    return inc\n\nc = counter()\nprint(c(), c())  # 1 2'
	},
	{
		id: 'py-027',
		cat: 'py',
		level: 1,
		hot: 64,
		source: '面试鸭 · Python',
		title: '什么是 Python 的关系运算符？',
		short: '==、!=、>、<、>=、<=，返回布尔值，并支持链式比较。',
		points: [
			'六个运算符：== != > < >= <=',
			'支持链式写法：0 < x < 10 等价于 0 < x and x < 10',
			'字符串按字典序比较，列表按元素依次比较',
			'不同类型比较大小在 Python3 会抛 TypeError'
		],
		detail: [
			{ h: '链式比较', p: '链式不仅写法短，中间的 x 也只求值一次，避免重复计算。写成 0 < f(x) < 10 时 f(x) 只调用一次，这在有副作用或开销大的表达式上很重要。' },
			{ h: '比较的规则', p: '数值按大小，字符串按 Unicode 码点逐字符比较，序列按元素逐个比较（先比第一个，相等再比第二个）。自定义类可以通过 __lt__ 等魔术方法参与排序，functools.total_ordering 能少写几个。' }
		],
		extend: [
			'== 与 is 的差别是高频追问',
			'float 比较要防精度问题，用 math.isclose',
			'sorted(key=...) 比自定义 __lt__ 更灵活'
		],
		code: ''
	},
	{
		id: 'py-028',
		cat: 'py',
		level: 1,
		hot: 63,
		source: '面试鸭 · Python',
		title: '什么是 Python 的赋值和算术运算符？',
		short: '算术有 + - * / // % **，赋值有 = 与 += 这类复合赋值；没有 ++/--。',
		points: [
			'/ 永远返回 float，// 才是向下取整的整除',
			'** 是幂运算，可算负数与小数次方',
			'复合赋值 += -= *= /= **= 是「运算 + 赋值」的简写',
			'Python 没有自增自减运算符，写 x += 1'
		],
		detail: [
			{ h: '赋值的本质', p: 'Python 的 = 是「把名字绑定到对象」，不是把值拷进变量。所以 a = b 之后两者指向同一个对象，修改可变对象会互相影响；重新赋值只是让名字指向新对象，原对象引用计数减一。' },
			{ h: '可变对象的 += 陷阱', p: '列表的 a += [1] 等价于 a.extend([1])，原地修改；而 a = a + [1] 会创建新列表。若多个名字指向同一列表，+= 会「顺带」改掉别人看到的内容，这是常见的共享状态 bug。' }
		],
		extend: [
			'链式赋值 a = b = 0 合法，但赋值语句本身没有返回值',
			'海象运算符 := 可以在表达式里赋值（3.8+）',
			'*= 对列表是原地乘，如 a *= 3'
		],
		code: 'a = [1, 2]\nb = a\na += [3]\nprint(b)   # [1, 2, 3]  <- 同一个对象\n\na = a + [4]\nprint(b)   # [1, 2, 3]  <- 已经是新对象了'
	},
	{
		id: 'py-029',
		cat: 'py',
		level: 1,
		hot: 63,
		source: '面试鸭 · Python',
		title: '什么是 Python 的逻辑运算符？',
		short: 'and / or / not，返回参与运算的对象本身，并支持短路。',
		points: [
			'and：左假返回左，否则返回右',
			'or：左真返回左，否则返回右',
			'not：对真值取反，永远返回 bool',
			'短路让右侧表达式可能根本不执行'
		],
		detail: [
			{ h: '为什么不是纯布尔', p: 'and / or 返回的是操作数本身，所以 1 and "x" 得 "x"，0 or "default" 得 "default"。这常被用来写默认值，但也容易误判：x = x or [] 会把传入的空列表也换掉。' },
			{ h: '优先级与短路', p: 'not > and > or，比较运算高于 and/or，所以 x > 1 and y < 2 不需要括号。短路意味着 obj and obj.attr 能安全地避免 None 属性错误，也可以用它跳过开销大的计算。' }
		],
		extend: [
			'三目表达式 a if cond else b 更明确，推荐优先使用',
			'all / any 相当于对序列做批量逻辑判断',
			'pandas / numpy 里不能用 and，要用 & | 并加括号'
		],
		code: 'name = "" \nprint(name or "匿名")   # 匿名\nprint(1 and "x")         # x'
	},
	{
		id: 'py-030',
		cat: 'py',
		level: 1,
		hot: 64,
		source: '面试鸭 · Python',
		title: '什么是 Python 的成员运算符？',
		short: 'in / not in，判断元素是否在序列、集合或字典（判断的是键）中。',
		points: [
			'in 遍历容器判断是否存在，返回 bool',
			'对 dict 判断的是键而不是值',
			'复杂度取决于容器：list 是 O(n)，set/dict 平均 O(1)',
			'自定义类实现 __contains__ 可以自定义判断逻辑'
		],
		detail: [
			{ h: '复杂度差异', p: '对列表做 in 要逐个比较，10 万条数据会明显拖慢接口；同一批数据放进 set 后判断是哈希查找。这是把「过滤存在性」从 O(n²) 降到 O(n) 的最常见手段。' },
			{ h: '判断值而不是键', p: '要判断字典里有没有某个值，用 v in d.values()，但这是 O(n)。高频反向查询应该再建一个 value → key 的索引，或改用 set 存值。' }
		],
		extend: [
			'字符串的 in 是子串判断，"ab" in "abc" 为 True',
			'numpy 数组的 in 是逐元素比较，语义与 Python 原生不同',
			'not in 与 in 等价于取反，可读性更好'
		],
		code: 'print(2 in [1, 2, 3])        # True\nprint("a" in {"a": 1})       # True，判断键\nprint(1 in {"a": 1}.values()) # True，判断值'
	},
	{
		id: 'py-031',
		cat: 'py',
		level: 1,
		hot: 63,
		source: '面试鸭 · Python',
		title: '什么是 Python 的身份运算符？',
		short: 'is / is not，判断两个名字是否指向同一个对象。',
		points: [
			'比较的是 id，不是值',
			'is not 是 is 的取反，可读性更好',
			'判断 None 必须用 is None',
			'驻留机制会让小对象 is 偶然为 True，不能用来比值'
		],
		detail: [
			{ h: '什么时候必须用', p: '单例判断：None、True、False、哨兵对象（object()）。用 == 判断 None 会被自定义 __eq__ 干扰，返回非布尔或意外结果，所以 PEP 8 明确要求用 is。' },
			{ h: '什么时候不能用', p: '任何「值相等」的场景。a = 1000; b = 1000 时 a is b 在交互式环境里可能是 True（编译期常量合并），但在函数返回值里可能是 False，这种不确定性是线上事故的来源。' }
		],
		extend: [
			'id() 在对象销毁后可能被新对象复用',
			'is not 与 not (a is b) 等价，但前者更接近自然语言',
			'typing.Literal[None] 之类的类型标注不改变运行时行为'
		],
		code: ''
	},
	{
		id: 'py-032',
		cat: 'py',
		level: 1,
		hot: 63,
		source: '面试鸭 · Python',
		title: '什么是 Python 的位运算符？',
		short: '& | ^ ~ << >>，按二进制位运算，常用于权限标记与底层优化。',
		points: [
			'& 与、| 或、^ 异或、~ 取反、<< 左移、>> 右移',
			'~x 等于 -x - 1（补码取反）',
			'左移一位相当于乘 2，右移一位相当于整除 2',
			'位运算优先级低于算术运算，复杂表达式要加括号'
		],
		detail: [
			{ h: '常见用途', p: '权限位：READ = 1 << 0、WRITE = 1 << 1，判断权限用 flag & READ，授权用 flag |= WRITE。也用于哈希、掩码（x & 0xFF 取低 8 位）和状态压缩。' },
			{ h: '注意负数', p: 'Python 整数是任意精度的补码语义，~5 得 -6，且没有固定的 32/64 位宽度，所以「按位取反当无符号处理」需要自己加掩码，如 (~x) & 0xFFFFFFFF。' }
		],
		extend: [
			'bool 是 int 的子类，True & False 也能算',
			'枚举里用 IntFlag 表达可组合的位标记',
			'位运算比乘除快，但在 Python 里通常不是瓶颈'
		],
		code: 'READ, WRITE, EXEC = 1 << 0, 1 << 1, 1 << 2\nperm = READ | WRITE\nprint(bool(perm & READ))   # True\nprint(bin(perm))           # 0b11'
	},
	{
		id: 'py-033',
		cat: 'py',
		level: 1,
		hot: 63,
		source: '面试鸭 · Python',
		title: '如何在 Python 中使用多进制数字？',
		short: '用 0b / 0o / 0x 前缀写二、八、十六进制，用 bin/oct/hex 转换查看。',
		points: [
			'0b1010 = 10，0o17 = 15，0x1F = 31',
			'bin() / oct() / hex() 返回带前缀的字符串',
			'int("ff", 16) 可以解析字符串',
			'数字间可用下划线分隔提高可读性'
		],
		detail: [
			{ h: '前缀是语法的一部分', p: '0x 后面跟十六进制数字（0-9a-f），大小写均可；0b 只允许 0 和 1；0o 只允许 0-7。写错了会直接抛 SyntaxError，而不是运行时错误。' },
			{ h: '常用的转换', p: 'int(s, base) 是最灵活的解析入口，base=0 时会按前缀自动识别；格式化输出用 f"{n:#x}"、f"{n:08b}" 这类格式说明符，比 bin() 再手动补零更简洁。' }
		],
		extend: [
			'bytes.fromhex("0a ff") 可以把十六进制字符串转字节',
			'颜色值 ff8800 常配合 int(c, 16) 解析',
			'任意精度整数可直接处理超大十六进制数'
		],
		code: 'print(0b1010, 0o17, 0x1F)  # 10 15 31\nprint(hex(255))            # 0xff\nprint(f"{255:08b}")        # 11111111'
	},
	{
		id: 'py-034',
		cat: 'py',
		level: 1,
		hot: 64,
		source: '面试鸭 · Python',
		title: 'Python 中如何获取字典的所有键？',
		short: 'd.keys() 返回键的视图对象，需要列表时包一层 list()。',
		points: [
			'd.keys() 返回 dict_keys 视图，可迭代、支持 in 判断',
			'd.values() 与 d.items() 是配套的视图',
			'视图是动态的，字典变了它跟着变',
			'要列表或排序结果需要显式转换'
		],
		detail: [
			{ h: '视图不是快照', p: '在遍历 keys() 的过程中增删键会抛 RuntimeError。需要边遍历边改时，先 list(d.keys()) 复制一份，或者先收集要删的键再统一删。' },
			{ h: '常见操作', p: 'list(d.keys())[0] 取第一个键（3.7+ 顺序稳定）；sorted(d) 直接对字典排序；for k, v in d.items() 是最常用的遍历方式，避免再用 d[k] 二次查找。' }
		],
		extend: [
			'set(d) 可以直接得到键的集合',
			'dict.fromkeys(keys, default) 批量建字典',
			'keys() & other_keys 支持集合运算，做交集很方便'
		],
		code: 'd = {"a": 1, "b": 2}\nprint(list(d.keys()))   # ["a", "b"]\nfor k, v in d.items():\n    print(k, v)'
	},
	{
		id: 'py-035',
		cat: 'py',
		level: 1,
		hot: 63,
		source: '面试鸭 · Python',
		title: '为什么 Python 不建议使用下划线开头的标识符？',
		short: '单下划线表示「内部使用」，双下划线会触发名字改写，容易被误用或误判为私有。',
		points: [
			'_name 是约定：内部使用，from module import * 不导入',
			'__name 会被改写成 _ClassName__name（name mangling）',
			'__name__ 这类前后双下划线是系统保留的魔术属性',
			'_ 常作为「不用的变量」占位',
			'约定不等于强制，运行时仍然可以访问'
		],
		detail: [
			{ h: '两种下划线的含义', p: '单下划线是「请勿在外部依赖」的礼貌约定，import * 会跳过；双下划线前缀会被编译器改名，用于避免子类意外覆盖父类属性，但依然能通过 _Cls__x 访问，所以它不是真正的私有。' },
			{ h: '什么时候别用', p: '公共 API、框架回调、序列化字段不要随意加下划线，否则使用者会当成内部实现，升级时你也不好改。反过来，确实只在本模块用的辅助函数加前缀能明确边界。' }
		],
		extend: [
			'__all__ 可以精确控制 import * 的导出列表',
			'前后双下划线的名字不要自己发明，容易和未来语法冲突',
			'property 常用于替代「get_x / set_x」这类下划线风格的老写法'
		],
		code: ''
	},
	{
		id: 'py-036',
		cat: 'py',
		level: 1,
		hot: 63,
		source: '面试鸭 · Python',
		title: 'Python 如何声明多个变量并赋值？',
		short: 'a, b = 1, 2 解包赋值；a = b = 0 链式赋值；a, b = b, a 直接交换。',
		points: [
			'元组解包：左右数量必须一致，否则 ValueError',
			'链式赋值：多个名字绑定同一个对象',
			'交换变量不需要临时变量',
			'带星号可以收集剩余元素：a, *rest = [1, 2, 3]'
		],
		detail: [
			{ h: '解包的执行顺序', p: '右边先求值成一个元组，再按位置拆给左边。所以 a, b = b, a 是安全的交换：右边的 b、a 在赋值前已经取好值，不会出现「先改 a 再取 a」的问题。' },
			{ h: '链式赋值的隐患', p: 'a = b = [] 让两个名字指向同一个列表，改 a 会影响 b。需要各自独立时，分别写 a, b = [], []，或对可变对象显式拷贝。' }
		],
		extend: [
			'解包也适用于字符串、range、生成器',
			'a, b = 1 会报「not enough values to unpack」',
			'嵌套解包 (a, (b, c)) = (1, (2, 3)) 同样支持'
		],
		code: 'a, b = 1, 2\na, b = b, a\nprint(a, b)     # 2 1\n\nx, *mid, y = range(5)\nprint(mid)      # [1, 2, 3]'
	},
	{
		id: 'py-037',
		cat: 'py',
		level: 1,
		hot: 64,
		source: '面试鸭 · Python',
		title: '什么是 Python 元组的解封装？',
		short: '把元组或序列按位置拆给多个变量，个数要匹配，可用 *rest 收集剩余。',
		points: [
			'a, b, c = (1, 2, 3) 是本最基本的解包',
			'a, *rest = seq 中 rest 是列表，可为空',
			'* 只能出现一次，且不能单独使用',
			'函数返回多值的本质是返回元组再解包'
		],
		detail: [
			{ h: '用在哪', p: '交换变量、函数返回多值、遍历 items()、解析坐标与配置项。返回值写成 return x, y 再用 a, b = f() 接住，比返回列表更轻量，语义也更明确。' },
			{ h: '数量必须匹配', p: '左边变量个数与元素个数不一致会抛 ValueError（除非用 * 收集）。嵌套结构可以嵌套解包，但层级太深会降低可读性，必要时用 namedtuple 或 dataclass。' }
		],
		extend: [
			'星号解包也能用在函数调用：f(*args, **kwargs)',
			'解包支持任意可迭代对象，不限于 tuple',
			'PEP 448 让列表/字典也能用 * 和 ** 合并'
		],
		code: 'point = (3, 4)\nx, y = point\nprint(x + y)   # 7\n\nfirst, *rest = [1, 2, 3, 4]\nprint(first, rest)  # 1 [2, 3, 4]'
	},
	{
		id: 'py-038',
		cat: 'py',
		level: 1,
		hot: 63,
		source: '面试鸭 · Python',
		title: '什么是 Python？为什么它会这么流行？',
		short: '动态类型、强类型、解释执行的通用语言，语法简洁且生态覆盖极广。',
		points: [
			'通用语言：Web、数据、AI、自动化、测试都能做',
			'语法接近自然语言，学习成本低',
			'标准库 + PyPI 生态极其丰富',
			'「胶水」能力：轻松粘合 C/C++、系统命令、外部服务'
		],
		detail: [
			{ h: '语言定位', p: 'Python 不追求极致性能，而是把「写得快、读得懂、库够多」做到极致。动态类型降低样板代码，强类型又避免了隐式转换带来的隐蔽 bug，两者结合让它在脚本与大中型项目里都能用。' },
			{ h: '为什么生态这么强', p: '数据科学与 AI 的浪潮把 Python 推成了事实标准，反过来又吸引更多库加入。numpy/pandas 这类 C 扩展弥补了性能短板，使它在计算密集场景也能胜任。' }
		],
		extend: [
			'CPython 是参考实现，另有 PyPy（JIT）、Jython、IronPython',
			'类型注解 + mypy 让大型项目获得接近静态语言的检查能力',
			'包管理生态从 pip/venv 演进到 uv、poetry 等更快的工具'
		],
		code: ''
	},
	{
		id: 'py-039',
		cat: 'py',
		level: 1,
		hot: 63,
		source: '面试鸭 · Python',
		title: '请列举一些 Python 的应用场景',
		short: 'Web 后端、数据与 AI、自动化运维、爬虫、测试与工具链。',
		points: [
			'Web 后端：Django、Flask、FastAPI',
			'数据分析与机器学习：pandas、numpy、PyTorch',
			'自动化与运维：脚本、Ansible、定时任务',
			'爬虫与采集：requests、Scrapy；测试：pytest、selenium'
		],
		detail: [
			{ h: '按行业看', p: '互联网后端与中台、金融量化、生物信息、GIS、推荐与广告算法、AIGC 工具链，几乎所有需要「快速把想法跑起来」的领域都有 Python。' },
			{ h: '不适合的场景', p: '浏览器端（只能靠 Pyodide 之类方案）、移动端原生 App、极致性能的高频交易核心、嵌入式小内存设备。这些场景一般用 JS/TS、Kotlin/Swift、C++/Rust。' }
		],
		extend: [
			'数据管道常用 Airflow / Prefect 编排 Python 任务',
			'CI 脚本、构建工具、代码检查器大量用 Python 写',
			'大模型时代 Python 是训练与推理工具链的第一语言'
		],
		code: ''
	},
	{
		id: 'py-040',
		cat: 'py',
		level: 1,
		hot: 63,
		source: '面试鸭 · Python',
		title: 'Python 有哪些局限性？',
		short: '执行慢、GIL 限制多核并行、移动端弱、动态类型错误后置。',
		points: [
			'解释执行 + 动态类型，纯 Python 计算比 C 慢一个量级',
			'GIL 让多线程无法利用多核做 CPU 密集计算',
			'移动端与浏览器端生态薄弱',
			'类型错误可能延迟到运行期才暴露'
		],
		detail: [
			{ h: '性能怎么补', p: '热点下沉到 numpy / C 扩展 / Cython / Rust，CPU 密集用多进程或 free-threaded 构建，IO 密集用 asyncio；配合缓存与算法优化，绝大多数业务场景并不需要换语言。' },
			{ h: '工程风险怎么补', p: '用 typing + mypy/pyright 做静态检查，用 pytest 覆盖关键路径，用 ruff 统一风格。动态类型的灵活性保留，同时把错误提前到 CI 阶段。' }
		],
		extend: [
			'打包分发依赖解释器，体积与启动速度不如 Go',
			'依赖版本冲突常见，虚拟环境与锁文件是必需品',
			'Python 3.13 起提供实验性的 free-threaded（无 GIL）构建'
		],
		code: ''
	},
	{
		id: 'py-041',
		cat: 'py',
		level: 1,
		hot: 64,
		source: '面试鸭 · Python',
		title: '请解释 Python 代码的执行过程',
		short: '源码 → 编译成字节码 → 虚拟机逐条执行，字节码缓存在 __pycache__。',
		points: [
			'词法/语法分析：源码解析成 AST',
			'编译：AST 转成字节码（.pyc 缓存）',
			'执行：CPython 虚拟机按帧逐条执行字节码',
			'import 的模块复用缓存，入口脚本每次重新编译'
		],
		detail: [
			{ h: '完整链路', p: '解释器先做分词与语法分析生成 AST，再编译成字节码；运行时为每个函数调用创建栈帧，虚拟机按指令分派执行。变量查找、属性访问、函数调用都在这一步完成，也是主要开销来源。' },
			{ h: '__pycache__ 的作用', p: '被 import 的模块会把字节码连同源文件时间戳存进 __pycache__，下次导入时校验后直接加载，跳过解析编译。这只省编译时间，不省执行时间。' }
		],
		extend: [
			'dis 模块可以反汇编字节码，是理解性能的利器',
			'PYTHONDONTWRITEBYTECODE=1 可以禁用 .pyc 生成',
			'PyPy 在执行前用 JIT 把热点字节码编译成机器码'
		],
		code: 'import dis\n\ndef add(a, b):\n    return a + b\n\ndis.dis(add)'
	},
	{
		id: 'py-042',
		cat: 'py',
		level: 1,
		hot: 63,
		source: '面试鸭 · Python',
		title: 'Python 有哪些内置数据结构？',
		short: 'list、tuple、dict、set，另有 str、bytes、frozenset 等。',
		points: [
			'list 有序可变，按索引访问 O(1)',
			'tuple 有序不可变，可哈希',
			'dict 键值映射，平均 O(1) 查找，3.7+ 有序',
			'set 去重集合，平均 O(1) 判断存在'
		],
		detail: [
			{ h: '怎么选', p: '需要顺序且频繁增删用 list；表达固定记录用 tuple 或 namedtuple；按键查询用 dict；去重与集合运算用 set。队列用 collections.deque，因为它头部弹出是 O(1)。' },
			{ h: '复杂度速记', p: 'list 尾部 append 均摊 O(1)、头部 insert(0) 是 O(n)、in 是 O(n)；dict/set 的查找平均 O(1)，但哈希冲突严重时会退化。选择容器前先想清楚访问模式。' }
		],
		extend: [
			'collections 还提供 deque、Counter、defaultdict、OrderedDict',
			'array / numpy 适合同类型数值的大批量存储',
			'frozenset 不可变因此可哈希，能作为字典键'
		],
		code: ''
	},
	{
		id: 'py-043',
		cat: 'py',
		level: 1,
		hot: 64,
		source: '面试鸭 · Python',
		title: 'Python 中单引号和双引号有什么区别？',
		short: '没有语义区别，选哪种主要看字符串内容里包含另一种引号时更省转义。',
		points: [
			'两者完全等价，都是 str',
			'内容含单引号用双引号包裹，反之亦然',
			'三引号可跨行，常用作 docstring',
			'f-string 前缀 f 才做插值，与引号种类无关'
		],
		detail: [
			{ h: '风格问题', p: 'PEP 8 没有强制规定，只说保持一致。很多团队统一用单引号、含引号时切换双引号；格式化工具 black 默认双引号，接入后按工具来即可。' },
			{ h: '常见混淆', p: 'Python 没有字符类型，\'a\' 就是长度为 1 的字符串。字符串不可变，所有「修改」方法都返回新串。原始字符串 r"\\d+" 关闭转义，常用于正则与路径。' }
		],
		extend: [
			'三引号字符串保留换行，可直接写 SQL 或 HTML 片段',
			'相邻字符串字面量会自动拼接："ab" "cd" 得 "abcd"',
			'str.format、% 与 f-string 是三代格式化方式，新代码用 f-string'
		],
		code: ''
	},
	{
		id: 'py-044',
		cat: 'py',
		level: 3,
		hot: 64,
		source: '面试鸭 · Python',
		title: 'Python 中 append、insert 和 extend 有什么区别？',
		short: 'append 末尾加一个元素，insert 指定位置插入，extend 把可迭代对象逐个追加。',
		points: [
			'append(x) 把 x 当成一个整体放到末尾',
			'insert(i, x) 在下标 i 处插入，后续元素后移',
			'extend(iterable) 把每个元素依次追加',
			'三者都原地修改并返回 None'
		],
		detail: [
			{ h: 'append 与 extend 的差异', p: 'lst.append([1, 2]) 得到 [[1, 2]]，lst.extend([1, 2]) 得到 [..., 1, 2]。想合并两个列表用 extend 或 lst1 + lst2，写成 append 是新手最常见的错误。' },
			{ h: '性能注意', p: 'insert(0, x) 需要移动全部元素，是 O(n)；频繁头部插入应改用 deque.appendleft。append 均摊 O(1)，因为列表会预留额外容量。' }
		],
		extend: [
			'返回值是 None，写 lst = lst.append(x) 会得到 None',
			'extend 可以接生成器，逐个消费，不要求是列表',
			'lst += other 与 extend 等价，都会原地修改'
		],
		code: 'lst = [1]\nlst.append([2, 3])\nprint(lst)     # [1, [2, 3]]\n\nlst = [1]\nlst.extend([2, 3])\nprint(lst)     # [1, 2, 3]'
	},
	{
		id: 'py-045',
		cat: 'py',
		level: 1,
		hot: 62,
		source: '面试鸭 · Python',
		title: 'Python 中 break、continue、pass 有什么作用？',
		short: 'break 结束整个循环，continue 跳过本次，pass 什么都不做。',
		points: [
			'break 立即退出最近一层循环',
			'continue 跳到下一轮，本轮剩余语句不执行',
			'pass 是空语句，不改变控制流',
			'循环的 else 子句只在没被 break 时执行'
		],
		detail: [
			{ h: '循环 else 的用法', p: 'for ... else 中的 else 在循环正常走完时执行，被 break 打断则不执行。它天然适合表达「遍历完都没找到才提示」的逻辑，避免额外标志位。' },
			{ h: '嵌套循环', p: 'break 只跳出最近一层，外层循环需要标志位、return，或把内层抽成函数后用 return 退出。continue 同理，只影响当前所在的那一层。' }
		],
		extend: [
			'while True + break 是常见的「至少执行一次」写法',
			'break 在 try/finally 中执行时，finally 仍会运行',
			'for 循环遍历中修改列表长度会导致漏项'
		],
		code: 'for n in [3, 5, 8]:\n    if n % 2 == 0:\n        print("找到偶数", n)\n        break\nelse:\n    print("没有偶数")'
	},
	{
		id: 'py-046',
		cat: 'py',
		level: 3,
		hot: 63,
		source: '面试鸭 · Python',
		title: 'Python 中 remove、del 和 pop 有什么区别？',
		short: 'remove 按值删第一个匹配，del 按索引/切片删，pop 按索引删并返回元素。',
		points: [
			'list.remove(v) 删除第一个等于 v 的元素，找不到抛 ValueError',
			'del lst[i] / del lst[a:b] 按位置删除，无返回值',
			'list.pop(i) 删除并返回元素，默认删最后一个',
			'三者都原地修改列表'
		],
		detail: [
			{ h: '按什么删', p: 'remove 关心值，需要先把值找到，是 O(n)；del 和 pop 关心位置，按下标直接定位。要做「栈」用 pop()，做「按条件批量删」用列表推导式或倒序 del。' },
			{ h: '踩坑点', p: '遍历列表时 remove 会跳过元素，因为删除后索引整体前移。正确做法是倒序遍历、或 new = [x for x in old if cond]，或先收集要删的下标再统一 del。' }
		],
		extend: [
			'pop 在空列表上会抛 IndexError，可先判空',
			'del 也能删除变量名、字典键、切片',
			'dict.pop(k, default) 删除键并返回值，语义更安全'
		],
		code: 'lst = ["a", "b", "c"]\nprint(lst.pop())    # c\nlst.remove("a")\nprint(lst)          # ["b"]\ndel lst[0]\nprint(lst)          # []'
	},
	{
		id: 'py-047',
		cat: 'py',
		level: 1,
		hot: 63,
		source: '面试鸭 · Python',
		title: 'Python 中如何实现 switch 语句？',
		short: '3.10+ 用 match/case；之前用 if/elif 链或字典映射函数。',
		points: [
			'match/case 支持结构模式匹配，不只是值相等',
			'可以解构元组、列表、类实例，并加 if 守卫',
			'字典映射把分支做成「表驱动」，扩展性更好',
			'if/elif 链适合分支少且条件复杂的场景'
		],
		detail: [
			{ h: 'match 不是 switch', p: 'match 按模式匹配：match point: case (0, 0): ... 可以直接解构，case {"type": "a"}: 可以匹配字典结构，case _: 是默认分支。绑定变量、加守卫条件都支持。' },
			{ h: '老版本的写法', p: '用字典把「值 → 处理函数」存起来，再 handlers.get(key, default)(*args) 调用，比长串 elif 更容易扩展和测试；需要副作用时也可以映射到方法名再 getattr。' }
		],
		extend: [
			'match 的 case 顺序敏感，宽泛模式要放最后',
			'枚举 + match 是可读性最好的组合',
			'函数式写法可参考 functools.singledispatch 按类型分派'
		],
		code: 'def handle(cmd):\n    match cmd:\n        case {"type": "add", "n": n}:\n            return n\n        case ["del", idx] if idx >= 0:\n            return idx\n        case _:\n            return None'
	},
	{
		id: 'py-048',
		cat: 'py',
		level: 1,
		hot: 62,
		source: '面试鸭 · Python',
		title: 'Python 的 range 函数如何运用？请举例说明',
		short: 'range(start, stop, step) 是惰性序列，左闭右开，可索引可迭代。',
		points: [
			'range(5) → 0..4，不含 5',
			'range(1, 10, 2) → 1,3,5,7,9',
			'step 可为负，range(5, 0, -1) 倒序',
			'range 是惰性对象，不占大块内存，支持 len 与索引'
		],
		detail: [
			{ h: '常用形态', p: '单参数从 0 开始；双参数指定起点终点；三参数加步长。for i in range(n) 是计数循环的标准写法；list(range(...)) 才真正生成列表。' },
			{ h: '不是列表也不是迭代器', p: 'Python3 的 range 是序列对象，可以重复遍历、可取 len、可切片，内存固定。正因为它不是迭代器，所以能被多次 for 使用，这点常被拿来和生成器对比。' }
		],
		extend: [
			'倒序遍历还可以用 reversed(range(n)) 或 range(n-1, -1, -1)',
			'enumerate 通常比 range(len(x)) 更清晰',
			'需要浮点步长用 numpy.arange 或 itertools 累加'
		],
		code: 'print(list(range(5)))          # [0, 1, 2, 3, 4]\nprint(list(range(1, 10, 2)))    # [1, 3, 5, 7, 9]\nprint(list(range(5, 0, -1)))    # [5, 4, 3, 2, 1]'
	},
	{
		id: 'py-049',
		cat: 'py',
		level: 1,
		hot: 62,
		source: '面试鸭 · Python',
		title: '如何更改 Python 列表的数据类型？',
		short: '用列表推导式或 map 逐个转换元素，如 [str(x) for x in lst]。',
		points: [
			'列表推导式 [str(x) for x in lst] 最直观',
			'list(map(str, lst)) 返回新列表',
			'数值批量转换可用 numpy 的 astype，快且省内存',
			'转换是生成新列表，原列表不变'
		],
		detail: [
			{ h: '基本写法', p: 'Python 的 list 不限制元素类型，所谓「改类型」是逐个元素转换后构造新列表。map 返回迭代器，必须 list() 才拿到列表；推导式可同时做条件过滤和异常兜底。' },
			{ h: '注意异常', p: 'int("abc") 会抛 ValueError，批量转换时建议用 try/except 或写一个安全转换函数；超大数组应改用 numpy，因为 Python 列表存的是对象引用，逐元素转换开销很大。' }
		],
		extend: [
			'astype 只适用于 numpy 数组，可指定 dtype 与精度',
			'pandas 的 Series.astype / to_numeric 处理表格更合适',
			'转换后仍想保持惰性，可用生成器表达式配合后续消费'
		],
		code: 'lst = [1, 2, 3]\nprint([str(x) for x in lst])   # ["1", "2", "3"]\nprint(list(map(float, lst)))   # [1.0, 2.0, 3.0]'
	},
	{
		id: 'py-050',
		cat: 'py',
		level: 1,
		hot: 62,
		source: '面试鸭 · Python',
		title: 'Python 中怎么注释代码？',
		short: '用 # 写单行注释；三引号字符串常被借用作多行说明或 docstring。',
		points: [
			'# 之后到行尾都是注释',
			'没有 /* */ 这种块注释语法',
			'函数/类/模块的首个字符串是 docstring，可被 help 读取',
			'三引号当注释会参与求值（虽然会被优化），不是真正的注释'
		],
		detail: [
			{ h: '注释与文档字符串', p: '# 是真正的注释，解释器直接丢弃；三引号字符串是表达式，只是没有被赋值时会生成常量并被编译器忽略。需要被工具读取的说明必须放在 docstring 位置，而不是随便一行三引号。' },
			{ h: '团队实践', p: '注释解释「为什么这么做」而不是「做了什么」，代码本身负责表达做了什么。公共函数写 docstring（含参数、返回、异常），复杂分支在行内加简短说明，避免注释与代码不同步。' }
		],
		extend: [
			'类型注解 : int 也是文档的一部分，配合 mypy 能校验',
			'# type: ignore 可以局部关闭类型检查',
			'TODO / FIXME 注释常被 IDE 汇总成待办列表'
		],
		code: 'def area(r: float) -> float:\n    """计算圆面积。\n\n    :param r: 半径\n    :return: 面积\n    """\n    return 3.14159 * r ** 2  # 这里用近似值即可'
	},
	{
		id: 'py-051',
		cat: 'py',
		level: 3,
		hot: 63,
		source: '面试鸭 · Python',
		title: 'Python 中的 != 和 is not 运算符有什么区别？',
		short: '!= 比值是否不等（走 __ne__），is not 判断是否不是同一个对象。',
		points: [
			'!= 是值比较，可能被 __ne__ / __eq__ 自定义',
			'is not 是身份比较，等价于 not (a is b)',
			'判断 None 用 x is not None',
			'两者在自定义对象上可能给出不同结论'
		],
		detail: [
			{ h: '为什么容易混', p: '对内置不可变类型（小整数、字符串）两者常同时成立，让人以为可以互换。但一旦涉及可变对象、单例或重载了比较运算符的类，结论就会分叉。' },
			{ h: '该用哪个', p: '语义上「值不同」用 !=，「不是同一个东西 / 不是空」用 is not。None 的判断必须用 is not None：如果类实现了 __eq__ 返回非布尔值（如 numpy 数组），!= 会得到意料之外的结果。' }
		],
		extend: [
			'__ne__ 默认由 __eq__ 取反得到，但显式定义时要注意一致性',
			'numpy 数组用 != 比较返回布尔数组，放进 if 会抛歧义错误',
			'is not 的优先级高于 not，写 not x is None 也能跑但语义别扭'
		],
		code: 'a = [1]\nb = [1]\nprint(a != b)     # False\nprint(a is not b) # True  <- 确实不是同一个对象'
	},
	{
		id: 'py-052',
		cat: 'py',
		level: 1,
		hot: 63,
		source: '面试鸭 · Python',
		title: 'Python 是否有 main 函数？',
		short: '没有强制的 main 函数，用 if __name__ == "__main__" 作入口判断。',
		points: [
			'脚本从上到下执行，没有语言层面的 main 入口',
			'直接运行时 __name__ 为 "__main__"，被 import 时为模块名',
			'约定把主逻辑放进 main() 函数，再由入口判断调用',
			'这样模块既能被复用，又能独立运行'
		],
		detail: [
			{ h: '为什么需要这个判断', p: '被 import 时如果直接执行主逻辑，会产生副作用（连库、起服务、跑任务）。用 if __name__ == "__main__": main() 把「可执行」与「可导入」分开，是写可复用模块的标配。' },
			{ h: '工程惯例', p: 'main() 只做参数解析与装配，业务逻辑放在别的函数或类里，方便单元测试。命令行工具可以用 argparse 或 click 在 main 里解析参数。' }
		],
		extend: [
			'python -m package.module 也会把该模块的 __name__ 设为 "__main__"',
			'包里的 __main__.py 让目录可以直接 python -m package 运行',
			'多进程在 spawn 模式下会重新 import 模块，入口判断能避免重复执行'
		],
		code: 'def main():\n    print("run")\n\nif __name__ == "__main__":\n    main()'
	},
	{
		id: 'py-053',
		cat: 'py',
		level: 3,
		hot: 62,
		source: '面试鸭 · Python',
		title: 'Python 的 iterables（可迭代对象）和 iterators（迭代器）有什么区别？',
		short: '可迭代对象能产出迭代器；迭代器自身带 __next__，且只能遍历一次。',
		points: [
			'可迭代对象实现 __iter__，如 list、dict、str',
			'迭代器同时实现 __iter__ 和 __next__',
			'迭代器有状态，耗尽后再 next 抛 StopIteration',
			'iter(x) 把可迭代对象转成迭代器，for 内部就这么做'
		],
		detail: [
			{ h: '本质区别在「状态」', p: '列表本身没有遍历位置，每次 for 都从头发起；迭代器记录了当前位置，走完就废了，想再遍历只能重新 iter()。所以「可迭代对象可重复消费、迭代器只能消费一次」。' },
			{ h: '常见误判', p: 'range、dict 是可迭代对象，不是迭代器；生成器、map/filter、文件对象、zip 的返回值都是迭代器。文件对象用完就指针到底，第二次 for 不会有输出，这是真实项目里常见的 bug。' }
		],
		extend: [
			'collections.abc.Iterable / Iterator 可以用 isinstance 判断',
			'itertools.tee 可以把一个迭代器复制成多个',
			'自定义迭代器要实现 __iter__ 返回 self 和 __next__'
		],
		code: 'lst = [1, 2]\nit = iter(lst)\nprint(next(it), next(it))  # 1 2\nprint(list(it))            # []  <- 已耗尽\nprint(list(lst))           # [1, 2]  <- 原列表还能再遍历'
	},
	{
		id: 'py-054',
		cat: 'py',
		level: 3,
		hot: 63,
		source: '面试鸭 · Python',
		title: 'Python 中的 map 函数有什么作用？怎么使用？',
		short: '把函数依次作用到每个元素上，返回惰性迭代器，需要 list() 才拿到结果。',
		points: [
			'map(fn, iterable) 返回 map 对象（迭代器）',
			'可传多个可迭代对象，按最短截断',
			'不立即执行，消费时才逐个调用 fn',
			'写法等价于 [fn(x) for x in it]，后者通常更易读'
		],
		detail: [
			{ h: '惰性带来的差异', p: 'map 只是把函数和序列包起来，list(map(...)) 才真正计算。好处是可以处理超大或无限序列，坏处是打印看不到内容、异常延迟到消费时才抛。' },
			{ h: '多序列与替代', p: 'map(lambda a, b: a + b, xs, ys) 会并行取元素，长度按最短。多数场景推荐推导式或生成器表达式，可读性更好；需要 C 级速度且已有现成函数（如 int、str）时 map 更简洁。' }
		],
		extend: [
			'map 与 filter 可串联，但推导式通常一步搞定',
			'zip(*matrix) 可转置，map(list, ...) 常配套使用',
			'多进程 Pool.map 是另一套 API，注意区分'
		],
		code: 'lst = ["1", "2", "3"]\nprint(list(map(int, lst)))          # [1, 2, 3]\nprint([int(x) for x in lst])        # 等价写法'
	},
	{
		id: 'py-055',
		cat: 'py',
		level: 3,
		hot: 62,
		source: '面试鸭 · Python',
		title: 'Python 中的 Filter 函数有什么作用？怎么使用？',
		short: '按函数返回值真假过滤元素，返回惰性迭代器。',
		points: [
			'filter(fn, iterable) 保留 fn(x) 为真的元素',
			'fn 传 None 时按元素自身真值过滤',
			'返回 filter 对象，需要 list() 转换',
			'等价写法 [x for x in it if fn(x)]'
		],
		detail: [
			{ h: '语义说明', p: 'filter 只做筛选不改值，函数返回真就保留。filter(None, seq) 会去掉 0、""、None、[] 等假值，是清洗脏数据的快捷写法，但也容易误删合法的 0。' },
			{ h: '与推导式对比', p: '推导式能同时过滤和转换（[f(x) for x in it if cond]），可读性更好；filter 适合已经有现成谓词函数的情况，比如 filter(str.isdigit, chars)。' }
		],
		extend: [
			'itertools.filterfalse 保留谓词为假的元素',
			'filter 与 map 组合可写成 map(f, filter(g, xs))',
			'需要同时拿到原始与过滤结果时，用一次遍历分组更高效'
		],
		code: 'nums = [0, 1, 2, 3]\nprint(list(filter(None, nums)))       # [1, 2, 3]\nprint([x for x in nums if x > 1])     # [2, 3]'
	},
	{
		id: 'py-056',
		cat: 'py',
		level: 3,
		hot: 62,
		source: '面试鸭 · Python',
		title: 'Python 中 reduce 函数有什么作用？怎么使用？',
		short: 'functools.reduce 用二元函数把序列累积成一个值，可传初始值。',
		points: [
			'reduce(fn, seq, init) 从左到右两两累积',
			'不传 init 时以第一个元素作为初值',
			'Python3 已把它移到 functools 模块',
			'求和、极值优先用内置的 sum / max'
		],
		detail: [
			{ h: '执行过程', p: 'reduce(lambda a, b: a + b, [1, 2, 3], 0) 依次算 0+1=1、1+2=3、3+3=6。初值参与第一轮计算，空序列且无初值会抛 TypeError。' },
			{ h: '什么时候用', p: '需要自定义累积逻辑时才有价值，比如累乘、按字典合并、求最大对象。多数场景用 for 循环更易读、也更好调试，PEP 8 的维护者 Guido 就曾建议少用 reduce。' }
		],
		extend: [
			'math.prod 是 3.8+ 的累乘，比 reduce 更直观',
			'itertools.accumulate 返回中间结果的迭代器',
			'并行求和可用 concurrent.futures 分段计算再合并'
		],
		code: 'from functools import reduce\n\nprint(reduce(lambda a, b: a * b, [1, 2, 3, 4]))  # 24\nprint(reduce(lambda a, b: a + b, [], 0))         # 0'
	},
	{
		id: 'py-057',
		cat: 'py',
		level: 3,
		hot: 61,
		source: '面试鸭 · Python',
		title: '什么是 Python 的 pickling 和 unpickling？',
		short: 'pickle 把对象序列化成字节流，unpickling 把字节流还原成对象。',
		points: [
			'pickle.dumps / loads 处理内存字节，dump / load 处理文件',
			'只能用于 Python，跨语言要用 JSON、Protobuf',
			'lambda、文件句柄、连接等不可序列化',
			'反序列化不可信数据有代码执行风险'
		],
		detail: [
			{ h: '为什么不能跨语言', p: 'pickle 记录的是 Python 对象的类型与状态（含 __reduce__ 指令），依赖解释器实现，其它语言无法解析。而 JSON 只表达基础类型，通用但会丢失类型与自定义结构。' },
			{ h: '安全边界', p: 'unpickle 一个恶意构造的字节流可能触发任意代码执行，所以只应加载自己生成、或经过签名校验的数据。对外接口、缓存共享、消息队列里传输对象，一律用 JSON / MessagePack / Protobuf。' }
		],
		extend: [
			'版本兼容性差，类结构变化后老数据可能加载失败',
			'多进程通信中 pickle 是默认序列化方式，因此目标函数要可导入',
			'joblib 针对 numpy 数组做了优化，适合模型持久化'
		],
		code: 'import pickle\n\ndata = {"a": 1}\nraw = pickle.dumps(data)\nprint(pickle.loads(raw))  # {"a": 1}'
	},
	{
		id: 'py-058',
		cat: 'py',
		level: 3,
		hot: 63,
		source: '面试鸭 · Python',
		title: '什么是 Python 的生成器？',
		short: '用 yield 或生成器表达式创建的惰性序列，按需产出值、只能遍历一次。',
		points: [
			'含 yield 的函数调用后返回生成器对象，不执行函数体',
			'每次 next 推进到下一个 yield，栈帧状态被保留',
			'生成器表达式 (x * 2 for x in seq) 更轻量',
			'内存占用与数据量无关，适合大文件与无限序列'
		],
		detail: [
			{ h: '惰性求值的价值', p: '处理 10G 日志时，列表要装下全部行，生成器只保留当前一行和少量状态。这也是数据管道的基础：读 → 清洗 → 转换 → 写，每一环都是生成器，全程恒定内存。' },
			{ h: '使用注意', p: '生成器只能消费一次，第二次 for 不会有输出；长度未知，不能用 len；异常在消费时才抛。需要多次使用就先 list() 落地，或重新创建生成器。' }
		],
		extend: [
			'生成器实现了迭代器协议，可被 for、sum、next 消费',
			'yield from 委托给子生成器，减少手写循环',
			'send / throw / close 让它具备协程雏形'
		],
		code: 'def read_lines(path):\n    with open(path, encoding="utf-8") as f:\n        for line in f:\n            yield line.strip()\n\nfor line in read_lines("big.log"):\n    if "ERROR" in line:\n        print(line)'
	},
	{
		id: 'py-059',
		cat: 'py',
		level: 1,
		hot: 62,
		source: '面试鸭 · Python',
		title: 'Python 中如何使用索引反转字符串？',
		short: '用切片步长 -1：s[::-1]。',
		points: [
			's[::-1] 返回反转后的新字符串',
			'reversed(s) 返回迭代器，要 join 才能变回字符串',
			'字符串没有 reverse 方法',
			'列表可用 lst[::-1] 或 lst.reverse()（原地）'
		],
		detail: [
			{ h: '切片的三个参数', p: 's[start:stop:step]，step 为负时从右往左取。省略 start/stop 表示从头到尾，因此 [::-1] 就是整体反转，效率是 O(n) 的一次拷贝。' },
			{ h: '别混淆类型', p: 'reversed("abc") 得到的是迭代器，直接打印是对象地址；需要 "".join(reversed(s))。list.reverse() 原地修改并返回 None，写 lst = lst.reverse() 会得到 None。' }
		],
		extend: [
			'回文判断可写 s == s[::-1]',
			'需要按单词反转用 " ".join(s.split()[::-1])',
			'字节串 bytes 同样支持切片反转'
		],
		code: 's = "hello"\nprint(s[::-1])              # olleh\nprint("".join(reversed(s))) # olleh'
	},
	{
		id: 'py-060',
		cat: 'py',
		level: 3,
		hot: 62,
		source: '面试鸭 · Python',
		title: '什么是 Python 的 Lambda 函数，有哪些应用场景？',
		short: '匿名函数，只能写单个表达式，常用于排序 key、回调和 map/filter 参数。',
		points: [
			'语法：lambda 参数: 表达式，自动返回表达式结果',
			'只能包含表达式，不能写赋值、循环、多语句',
			'常用于 sorted / max 的 key、回调、简单映射',
			'复杂逻辑应改用 def，PEP 8 不建议把 lambda 赋给变量'
		],
		detail: [
			{ h: '为什么限制这么死', p: 'lambda 的设计目标就是「一行能写完的小函数」。它是表达式而不是语句，所以能直接放在函数实参位置，这是 def 做不到的——def 是语句，必须先定义再传。' },
			{ h: '常见场景', p: 'sorted(users, key=lambda u: u["age"], reverse=True)；max(items, key=lambda x: x[1])；button.onclick(lambda e: handle(e))；以及 map/filter 的参数。需要复用或需要文档的，一律用 def。' }
		],
		extend: [
			'operator.itemgetter / attrgetter 比 lambda 更快也更清晰',
			'functools.partial 可以固定部分参数，替代「lambda 包一层」',
			'lambda 在闭包里同样会共享循环变量'
		],
		code: 'users = [{"name": "a", "age": 30}, {"name": "b", "age": 25}]\nprint(sorted(users, key=lambda u: u["age"]))'
	},
	{
		id: 'py-061',
		cat: 'py',
		level: 3,
		hot: 62,
		source: '面试鸭 · Python',
		title: 'Python 的迭代器和生成器有什么区别？',
		short: '生成器是用 yield 创建迭代器的便捷方式；迭代器是更宽的协议，也能用类实现。',
		points: [
			'生成器必然是迭代器，迭代器不一定是生成器',
			'生成器由解释器自动保存执行状态',
			'迭代器可以实现 __next__ 手动维护状态',
			'两者都只能遍历一次，都支持惰性求值'
		],
		detail: [
			{ h: '关系', p: '迭代器是协议：实现 __iter__ 与 __next__。生成器是语法糖：写 yield 就自动获得这两个方法，并由栈帧保存局部变量和执行位置，不用手写状态机。' },
			{ h: '怎么选', p: '线性、简单的产出逻辑用生成器；需要复杂状态、可重置、或额外方法（如 send、close 之外的 API）时，用类实现迭代器更清晰。标准库里 dict 的迭代器就是类实现的。' }
		],
		extend: [
			'生成器还能用 send 接收外部输入，迭代器协议本身没有这个能力',
			'iter(callable, sentinel) 可以把函数调用包装成迭代器',
			'迭代器耗尽后需要重新 iter()，生成器同理'
		],
		code: 'class Counter:\n    def __init__(self, n):\n        self.i, self.n = 0, n\n    def __iter__(self):\n        return self\n    def __next__(self):\n        if self.i >= self.n:\n            raise StopIteration\n        self.i += 1\n        return self.i'
	},
	{
		id: 'py-062',
		cat: 'py',
		level: 3,
		hot: 61,
		source: '面试鸭 · Python',
		title: 'Python 正则表达式中 match 和 search 有什么区别？',
		short: 'match 只从字符串开头匹配，search 扫描全文找第一个匹配。',
		points: [
			'match 等价于在开头加 ^，不匹配则返回 None',
			'search 会逐位置尝试，直到找到第一个匹配',
			'要整串完全匹配用 fullmatch',
			'两者都返回 Match 对象，用 group() 取值'
		],
		detail: [
			{ h: '结果形态', p: '匹配失败返回 None，成功返回 Match；group(0) 是整体，group(1) 是第一个分组，span() 给出起止下标。findall 返回字符串列表，finditer 返回 Match 迭代器，适合需要位置的场景。' },
			{ h: '性能与写法', p: '同一正则反复使用应先 re.compile 预编译。判断「是否以某模式开头」用 match 比 search 快；需要整串校验（如手机号）用 fullmatch 或 ^...$，否则 "abc123" 用 match(r"\\d+") 会失败而 search 会成功。' }
		],
		extend: [
			're.match 与编译后 pattern.match 等价',
			'加 re.IGNORECASE / re.MULTILINE / re.DOTALL 调整语义',
			'贪婪与懒惰：* 尽量多匹配，*? 尽量少匹配'
		],
		code: 'import re\n\nprint(re.match(r"\\d+", "123abc"))   # 匹配\nprint(re.match(r"\\d+", "abc123"))   # None\nprint(re.search(r"\\d+", "abc123"))  # 匹配'
	},
	{
		id: 'py-063',
		cat: 'py',
		level: 1,
		hot: 61,
		source: '面试鸭 · Python',
		title: '为什么 Python 中没有函数重载？',
		short: '同名定义会覆盖前者；Python 用默认参数、*args/**kwargs 或 singledispatch 实现类似效果。',
		points: [
			'函数名是变量，后定义覆盖先定义',
			'没有编译期签名匹配，调用时不看参数类型',
			'默认参数与可变参数可覆盖多数「重载」需求',
			'按类型分派用 functools.singledispatch'
		],
		detail: [
			{ h: '语言设计原因', p: '重载本质是编译期按参数类型选择实现，而 Python 是动态类型，运行时才知道实参类型，函数体内完全可以用 isinstance 分支处理，所以不需要多份同名定义。' },
			{ h: '替代方案', p: '默认参数 def f(x, y=None) 处理可选参数；*args/**kwargs 处理不定参数；singledispatch 注册不同类型实现；typing.overload 只用于让类型检查器理解多种签名，运行时仍只有一个函数。' }
		],
		extend: [
			'typing.overload 必须配合真实实现，否则运行时报错',
			'singledispatchmethod 支持对方法做分派',
			'参数类型过多时，用配置对象或关键字参数比「重载」更清晰'
		],
		code: 'from functools import singledispatch\n\n@singledispatch\ndef show(x):\n    return f"obj: {x}"\n\n@show.register\nint\ndef _(x):\n    return f"int: {x}"'
	},
	{
		id: 'py-064',
		cat: 'py',
		level: 3,
		hot: 62,
		source: '面试鸭 · Python',
		title: 'Python 的 __init__ 和 __new__ 方法有什么区别？',
		short: '__new__ 负责创建并返回实例（先执行，参数是 cls），__init__ 负责初始化已创建的实例。',
		points: [
			'__new__(cls, ...) 是创建对象，必须返回实例',
			'__init__(self, ...) 是初始化，返回值必须为 None',
			'调用顺序：__new__ → __init__',
			'__new__ 返回的不是本类实例时，__init__ 不会被调用'
		],
		detail: [
			{ h: '职责划分', p: '__new__ 是类方法式的静态方法，第一个参数是 cls，内部通常 super().__new__(cls) 拿到实例再返回；__init__ 拿到已创建的 self，往里填属性。两者共同完成「构造」。' },
			{ h: '什么时候要重写 __new__', p: '单例模式、对象池、不可变类型子类化（如 int/str/tuple 子类在 __new__ 里改值）、根据参数返回不同子类实例（工厂）。普通业务类只写 __init__ 就够了。' }
		],
		extend: [
			'__init__ 返回非 None 会抛 TypeError',
			'类方法 __init_subclass__ 可在子类定义时做校验',
			'元类的 __call__ 控制整个实例化过程，比 __new__ 更底层'
		],
		code: 'class Singleton:\n    _inst = None\n    def __new__(cls, *a, **kw):\n        if cls._inst is None:\n            cls._inst = super().__new__(cls)\n        return cls._inst'
	},
	{
		id: 'py-065',
		cat: 'py',
		level: 1,
		hot: 62,
		source: '面试鸭 · Python',
		title: '你知道哪些 Python 魔术方法？',
		short: '__str__ / __repr__、__len__、__eq__、__getitem__、__iter__、__enter__ / __exit__ 等双下划线方法。',
		points: [
			'由内置函数或语法隐式调用，不用手动调',
			'__str__ 面向用户，__repr__ 面向调试',
			'__len__ / __getitem__ / __iter__ 让对象像容器',
			'__enter__ / __exit__ 支持 with 语句'
		],
		detail: [
			{ h: '常用分类', p: '构造与销毁：__new__ / __init__ / __del__；表示：__str__ / __repr__ / __format__；比较：__eq__ / __lt__ / __hash__；容器：__len__ / __getitem__ / __contains__ / __iter__；运算：__add__ / __mul__；上下文：__enter__ / __exit__。' },
			{ h: '写的时候注意', p: '__repr__ 最好返回能重建对象的表达式，日志里才好看；实现 __eq__ 时要一并考虑 __hash__，否则对象不可哈希；__getitem__ 支持切片时要处理 slice 类型。' }
		],
		extend: [
			'@dataclass 会自动生成 __init__ / __repr__ / __eq__',
			'functools.total_ordering 只需实现 __eq__ 和一个比较方法',
			'__slots__ 不是魔术方法，但同样影响实例结构与内存'
		],
		code: 'class Money:\n    def __init__(self, yuan):\n        self.yuan = yuan\n    def __repr__(self):\n        return f"Money({self.yuan})"\n    def __eq__(self, o):\n        return isinstance(o, Money) and o.yuan == self.yuan'
	},
	{
		id: 'py-066',
		cat: 'py',
		level: 3,
		hot: 62,
		source: '面试鸭 · Python',
		title: 'Python 函数参数 *args 和 **kwargs 有什么区别？怎么使用？',
		short: '*args 收集多余位置参数成元组，**kwargs 收集多余关键字参数成字典，调用时也能解包。',
		points: [
			'*args 在函数内是 tuple，**kwargs 是 dict',
			'形参顺序：位置 → 默认 → *args → 仅关键字 → **kwargs',
			'调用时 f(*lst, **dct) 是解包，不是收集',
			'常用于包装器、装饰器、参数透传'
		],
		detail: [
			{ h: '收集与解包是同一符号的两面', p: '定义处 *args 表示「剩下的位置参数都收进 tuple」，**kwargs 表示「剩下的关键字参数都收进 dict」；调用处 *lst 把序列展开成位置参数，**dct 把字典展开成关键字参数。方向相反，写法相同。' },
			{ h: '仅关键字参数', p: 'def f(a, *, b) 中的 b 只能按关键字传；def f(a, *args, b=1) 让 b 也变成仅关键字。这样能给可选参数明确的调用方式，避免位置传参的歧义。' }
		],
		extend: [
			'参数名 args / kwargs 只是约定，真正起作用的是星号',
			'functools.wraps 不会自动透传签名，需要 inspect.signature 处理',
			'Python 3.8+ 支持位置-only 参数 def f(a, /, b)'
		],
		code: 'def f(*args, **kwargs):\n    print(args, kwargs)\n\nf(1, 2, x=3)          # (1, 2) {"x": 3}\nf(*[1, 2], **{"x": 3})  # 解包调用'
	},
	{
		id: 'py-067',
		cat: 'py',
		level: 1,
		hot: 61,
		source: '面试鸭 · Python',
		title: '请介绍 Python 中变量的作用域',
		short: 'LEGB：局部 → 外层函数 → 全局 → 内置；函数内赋值创建局部变量。',
		points: [
			'Local：函数内部；Enclosing：外层嵌套函数',
			'Global：模块级；Built-in：内置命名空间',
			'查找按 L → E → G → B 顺序进行',
			'函数内出现赋值，该名字整个函数内都是局部的'
		],
		detail: [
			{ h: 'UnboundLocalError 的来源', p: '只要函数体里对某名字有赋值语句，编译器就把它当局部变量。于是「先读后赋值」会报 UnboundLocalError，而不是去读全局的同名变量。要改全局变量必须声明 global。' },
			{ h: 'nonlocal 与 global', p: '闭包里修改外层函数的变量用 nonlocal，改模块级变量用 global。两者都只影响名字绑定，不复制对象；滥用 global 会让状态难以追踪，优先用参数与返回值。' }
		],
		extend: [
			'globals() / locals() 可以在运行时查看命名空间',
			'模块级代码的查找顺序是 Global → Built-in',
			'列表推导式在 Python3 有独立作用域，不会泄漏循环变量'
		],
		code: 'x = 1\n\ndef f():\n    global x\n    x = 2\n\nf()\nprint(x)  # 2'
	},
	{
		id: 'py-068',
		cat: 'py',
		level: 3,
		hot: 62,
		source: '面试鸭 · Python',
		title: 'Python 2 和 Python 3 有什么区别？',
		short: 'print 变函数、字符串默认 Unicode、/ 变真除法、range 返回惰性对象、取消 long。',
		points: [
			'print / exec 从语句变成函数',
			'str 默认 Unicode，字节序列独立为 bytes',
			'/ 变成真除法，整除用 //',
			'range / map / filter / zip 返回惰性对象'
		],
		detail: [
			{ h: '最痛的迁移点', p: '文本与字节的边界变清晰：Py2 的 str 是字节串，Py3 的 str 是 Unicode、bytes 才是字节，两者不能隐式混用。读写文件、网络编程时必须显式 encode/decode，这也是迁移中最常见的报错来源。' },
			{ h: '其它差异', p: '去掉了 long、unicode 类型；异常语法改为 except E as e；字典不再有 iteritems 等；整数除法语义变化。Python2 已于 2020 年 1 月停止维护，官方工具 2to3 可辅助迁移，但复杂项目仍需人工核对。' }
		],
		extend: [
			'python-future 库可以让代码同时兼容两版',
			'f-string 是 3.6 引入，取代 % 与 format',
			'类型注解从 3.5 开始，3.10+ 支持 X | Y 写法'
		],
		code: '# Python 2\nprint "hi"        # 语句\n3 / 2             # 1\n\n# Python 3\nprint("hi")       # 函数\n3 / 2             # 1.5'
	},
	{
		id: 'py-069',
		cat: 'py',
		level: 3,
		hot: 61,
		source: '面试鸭 · Python',
		title: '什么是「猴子补丁」（monkey patching）？',
		short: '运行时替换模块或类的方法/属性，常用于修第三方库 bug 或测试打桩，但会污染全局。',
		points: [
			'本质是给模块/类动态赋值，替换原实现',
			'常见于测试 mock、临时修库的 bug、兼容适配',
			'补丁必须在目标使用方导入前生效',
			'会污染全局、依赖导入顺序、升级库后失效'
		],
		detail: [
			{ h: '典型用法', p: '测试时把 time.time 换成固定值、把 requests.get 换成桩函数；线上遇到第三方库的 bug，在自己的入口模块里覆盖其方法先顶上。原则是「补丁集中、注释清楚、有对应 issue 编号」。' },
			{ h: '风险与替代', p: '补丁影响整个进程，别人排查时容易怀疑人生；多个库互相打补丁还可能冲突。优先用继承、子类、包装函数或依赖注入；确实要打补丁就限定在最小的入口处，并在升级依赖后复查。' }
		],
		extend: [
			'unittest.mock.patch 是带作用域管理的安全打补丁方式',
			'gevent 的 monkey.patch_all() 是著名的全局补丁案例',
			'补丁要改「使用方引用的名字」，改定义处可能不生效'
		],
		code: 'import time\n\nfake = lambda: 1700000000\ntime.time = fake   # 全局生效，慎用\nprint(time.time())'
	},
	{
		id: 'py-070',
		cat: 'py',
		level: 1,
		hot: 61,
		source: '面试鸭 · Python',
		title: '如何在 Python 中实现字符串替换操作？',
		short: 'str.replace(old, new, count) 返回新字符串；模式替换用 re.sub。',
		points: [
			'replace 支持 count 限制替换次数',
			'字符串不可变，返回的是新对象',
			're.sub 支持正则与分组引用',
			'translate 适合逐字符映射'
		],
		detail: [
			{ h: '常见需求', p: '批量去空格用 re.sub(r"\\s+", " ", s)；把变量占位替换成实际值用 str.format 或 Template；多组固定映射用循环 replace 或 str.translate。' },
			{ h: '注意替换顺序', p: '多次 replace 时顺序会影响结果，比如先替换 "a"→"b" 再 "b"→"c" 会把原本的 a 也变成 c。复杂场景应一次用正则的 | 分支，或用 translate 一次性映射。' }
		],
		extend: [
			're.subn 返回替换次数，便于统计',
			'str.maketrans 构造 translate 映射表，性能很好',
			'模板渲染建议用 string.Template 或 jinja2，避免手写替换'
		],
		code: 's = "a-b-c"\nprint(s.replace("-", "+"))          # a+b+c\nprint(s.replace("-", "+", 1))       # a+b-c\nimport re\nprint(re.sub(r"-", "+", s))         # a+b+c'
	},
	{
		id: 'py-071',
		cat: 'py',
		level: 3,
		hot: 61,
		source: '面试鸭 · Python',
		title: 'Python 在什么情况下会出现 KeyError、TypeError、ValueError？',
		short: 'KeyError 是字典键不存在，TypeError 是类型不匹配，ValueError 是类型对但值非法。',
		points: [
			'KeyError：d["x"] 而键不存在',
			'TypeError：类型不匹配，如 1 + "a"、调用参数个数不对',
			'ValueError：类型正确但内容非法，如 int("abc")',
			'索引越界是 IndexError，名字未定义是 NameError'
		],
		detail: [
			{ h: '三类错误的边界', p: 'TypeError 说明「这个操作对这类对象没定义」，ValueError 说明「类型没问题，但值不合法」。同一个函数可能两种都抛：int(None) 是 TypeError，int("abc") 是 ValueError。' },
			{ h: '处理建议', p: '用 d.get(k, default) 或 defaultdict 规避 KeyError；类型不确定时先校验或断言；值域校验放在入口处，抛带上下文的异常。捕获时指定具体异常类型，保留堆栈信息。' }
		],
		extend: [
			'from e 可以保留原始异常链，方便排查',
			'自定义异常继承 Exception，便于按业务分类捕获',
			'assert 只用于内部不变量，不能替代参数校验'
		],
		code: 'd = {"a": 1}\nd["b"]        # KeyError\n1 + "a"       # TypeError\nint("abc")    # ValueError\n[1][5]        # IndexError'
	},
	{
		id: 'py-072',
		cat: 'py',
		level: 3,
		hot: 61,
		source: '面试鸭 · Python',
		title: '什么是 Python 中的模块和包？',
		short: '模块是一个 .py 文件，包是包含 __init__.py 的目录（命名空间包可省略），都用 import 引入。',
		points: [
			'模块 = 一个 .py 文件，有独立的命名空间',
			'包 = 目录 + __init__.py，可嵌套子包',
			'import 执行模块顶层代码并缓存到 sys.modules',
			'相对导入只能在包内使用'
		],
		detail: [
			{ h: '导入机制', p: 'import 会按 sys.path 顺序查找，找到后执行一次顶层代码并放进 sys.modules，之后复用缓存。所以模块级的副作用（读文件、连库）只发生一次，也正因如此要避免在模块级做重活。' },
			{ h: '包的形态', p: '__init__.py 可以为空，也可以做初始化与导出控制；PEP 420 的命名空间包允许没有 __init__.py，适合把一个包的多个目录合并。用 python -m pkg.mod 运行时，相对导入才符合预期。' }
		],
		extend: [
			'__all__ 控制 from pkg import * 的导出',
			'importlib.import_module 可以动态导入',
			'循环导入的常见解法是把导入移到函数内或抽取公共模块'
		],
		code: '# 目录结构\n# mypkg/__init__.py\n# mypkg/utils.py\n\nfrom mypkg import utils\nprint(utils.__name__)  # mypkg.utils'
	},
	{
		id: 'py-073',
		cat: 'py',
		level: 1,
		hot: 61,
		source: '面试鸭 · Python',
		title: '你知道哪些 Python 的编码规范？',
		short: 'PEP 8：4 空格缩进、snake_case 命名、限制行宽、导入分组、常量全大写。',
		points: [
			'缩进用 4 个空格，禁止 Tab 与空格混用',
			'命名：变量/函数 snake_case，类 PascalCase，常量 UPPER_CASE',
			'导入按「标准库 / 第三方 / 本地」分组，每组内部按字母序',
			'行宽传统是 79，团队一般放宽到 100 或 120'
		],
		detail: [
			{ h: '除了缩进还有什么', p: '运算符两侧留空格、逗号后留空格、函数之间空两行、类方法之间空一行；文档字符串用三引号；避免用 l/O/I 这类易混单字符变量名。细节都在 PEP 8 里有明确例子。' },
			{ h: '怎么落地', p: '不要靠人工记：black / ruff format 负责格式，ruff 负责 lint（未使用变量、导入顺序、复杂度），isort 单独排导入，pre-commit 在提交前自动跑。团队配置写进 pyproject.toml，CI 里也跑一遍。' }
		],
		extend: [
			'PEP 257 规定 docstring 写法，PEP 484 规定类型注解',
			'ruff 用 Rust 实现，速度远超 flake8 + isort 组合',
			'mypy / pyright 负责类型检查，与格式检查是两件事'
		],
		code: ''
	},
	{
		id: 'py-074',
		cat: 'py',
		level: 3,
		hot: 61,
		source: '面试鸭 · Python',
		title: 'Python 的类和对象有什么区别？',
		short: '类是模板/类型，对象是按类创建的实例，各自持有自己的属性。',
		points: [
			'类是 type 的实例，对象是类的实例',
			'类属性所有实例共享，实例属性各自独立',
			'type(obj) 看类型，isinstance 会考虑继承',
			'实例属性默认存在 __dict__ 中'
		],
		detail: [
			{ h: '共享与独立', p: '类体里直接写的 x = 1 是类属性，所有实例都能读到；在 __init__ 里 self.x = 1 才是实例属性。把可变对象写成类属性（如 items = []）会让所有实例共享同一个列表，是经典陷阱。' },
			{ h: '创建过程', p: '调用类名时先由元类（通常是 type）的 __call__ 触发 __new__ 创建实例，再执行 __init__ 初始化。理解这一点才能解释单例、工厂、不可变类型子类化等写法。' }
		],
		extend: [
			'__dict__ 查看实例属性，vars(obj) 等价',
			'__slots__ 可以替代 __dict__，减少内存占用',
			'类也是对象，可以动态加方法，但通常不推荐'
		],
		code: 'class A:\n    shared = []          # 类属性，所有实例共享\n    def __init__(self, v):\n        self.v = v       # 实例属性\n\na, b = A(1), A(2)\na.shared.append("x")\nprint(b.shared)          # ["x"]'
	},
	{
		id: 'py-075',
		cat: 'py',
		level: 3,
		hot: 62,
		source: '面试鸭 · Python',
		title: '什么是 Python 类中的 self？',
		short: '实例方法的第一个参数，指向调用该方法的对象，由 Python 自动传入。',
		points: [
			'obj.method(x) 实际执行 Cls.method(obj, x)',
			'self 是约定名，不是关键字',
			'类方法用 cls，静态方法两者都没有',
			'方法内必须通过 self 访问实例属性'
		],
		detail: [
			{ h: '为什么必须写', p: '实例方法本质是普通函数，需要显式接收实例才能访问它的属性。Python 不像 Java 那样有隐式 this，所以第一个参数必须写在形参列表里，调用时由描述符协议自动绑定。' },
			{ h: '三种方法', p: '实例方法 def f(self)：访问实例；类方法 @classmethod def f(cls)：访问类，常用于工厂构造；静态方法 @staticmethod def f()：与类和实例无关的工具函数，放在类里只为组织代码。' }
		],
		extend: [
			'把 self 改成别的名字能跑，但会破坏可读性与工具约定',
			'A.f(a, 1) 这种未绑定调用依然合法，但不推荐',
			'property 的 getter/setter 第一个参数同样是 self'
		],
		code: 'class Cat:\n    def __init__(self, name):\n        self.name = name\n    def say(self):\n        return self.name + ": meow"\n\nprint(Cat("mimi").say())'
	},
	{
		id: 'py-076',
		cat: 'py',
		level: 1,
		hot: 61,
		source: '面试鸭 · Python',
		title: '__init__ 方法在 Python 中有什么作用？',
		short: '实例创建完成后被调用，用来初始化属性，返回值必须是 None。',
		points: [
			'在 __new__ 之后执行，负责初始化状态',
			'不能有返回值（返回非 None 会抛 TypeError）',
			'不是构造函数，创建对象的是 __new__',
			'可配合默认参数、类型注解做参数校验'
		],
		detail: [
			{ h: '调用时机', p: 'Cls(...) 触发实例化：__new__ 返回实例后，如果它是本类实例，解释器再调用 __init__ 传入同一批参数。所以 __init__ 能拿到已经存在的 self，往里设属性。' },
			{ h: '常见写法', p: '参数校验与默认值、把外部依赖注入成属性、调用父类 super().__init__() 完成基类初始化。只执行一次的重活（如连库）不适合放在这里，因为每次实例化都会跑。' }
		],
		extend: [
			'__init_subclass__ 可在子类定义时做校验',
			'dataclass 自动生成 __init__，减少样板代码',
			'需要在实例化前拦截参数，可以重写 __new__ 或使用元类'
		],
		code: 'class User:\n    def __init__(self, name: str):\n        if not name:\n            raise ValueError("name 不能为空")\n        self.name = name'
	},
	{
		id: 'py-077',
		cat: 'py',
		level: 3,
		hot: 62,
		source: '面试鸭 · Python',
		title: '什么是 Python 的 OOPS（面向对象编程）？',
		short: '把数据和操作封装成对象，通过继承复用、通过多态让同一接口有不同实现。',
		points: [
			'封装：对外暴露接口，隐藏内部实现',
			'继承：复用父类能力并扩展',
			'多态：同一调用，不同对象不同行为',
			'抽象：定义契约，不关心具体实现'
		],
		detail: [
			{ h: '为什么用面向对象', p: '把「数据 + 行为」放在一起，让复杂系统的边界清晰；通过接口而非实现编程，可以替换具体实现（如换存储、换支付渠道）而不动调用方。' },
			{ h: 'Python 的特色', p: '没有强制私有，靠约定与名字改写；多态靠鸭子类型实现，不要求共同父类；支持多继承与 Mixin，也支持函数式写法。实际项目中常常是「面向对象 + 函数式」混用。' }
		],
		extend: [
			'SOLID 五原则是评估类设计的重要参考',
			'组合优于继承：继承耦合父类实现，组合只依赖接口',
			'数据类（dataclass）适合承载状态，服务类适合承载行为'
		],
		code: ''
	},
	{
		id: 'py-078',
		cat: 'py',
		level: 3,
		hot: 61,
		source: '面试鸭 · Python',
		title: '什么是 Python 面向对象的抽象特性？',
		short: '只暴露必要接口、隐藏实现细节，用 abc.ABC + @abstractmethod 强制子类实现。',
		points: [
			'抽象类不能被实例化',
			'子类必须实现所有抽象方法，否则实例化报错',
			'typing.Protocol 提供结构化（隐式）接口约束',
			'抽象的目的是「定义契约」，而非复用代码'
		],
		detail: [
			{ h: '怎么用 abc', p: '继承 ABC，用 @abstractmethod 标注必须实现的方法；也可以定义普通方法做通用逻辑。未实现抽象方法的子类在实例化时抛 TypeError，把错误提前到启动阶段。' },
			{ h: 'Protocol 的差别', p: 'Protocol 不要求显式继承，只要求结构匹配（有同名同签名的方法），天然契合鸭子类型，适合给已有类补接口约束，配合 mypy 做静态检查。' }
		],
		extend: [
			'@abstractmethod 与 @property 可以组合出抽象属性',
			'collections.abc 里的 Iterable、Mapping 都是抽象基类',
			'接口方法应尽量少而稳定，避免「胖接口」'
		],
		code: 'from abc import ABC, abstractmethod\n\nclass Store(ABC):\n    @abstractmethod\n    def get(self, key): ...\n\nclass RedisStore(Store):\n    def get(self, key):\n        return None'
	},
	{
		id: 'py-079',
		cat: 'py',
		level: 3,
		hot: 60,
		source: '面试鸭 · Python',
		title: '什么是 Python 面向对象的封装特性？',
		short: '用单下划线表示内部使用、双下划线触发名字改写，配合 property 提供受控访问。',
		points: [
			'_x 是约定，__x 会被改写成 _Cls__x',
			'Python 没有真正的私有成员',
			'@property 提供 getter，@x.setter 提供写校验',
			'封装的目标是「控制访问」，不是「绝对隐藏」'
		],
		detail: [
			{ h: '约定与改写', p: '单下划线告诉使用者「这是内部实现，别依赖」；双下划线通过 name mangling 避免子类意外覆盖。两者都不是安全机制，反射依然能拿到，所以别把敏感数据寄托在命名上。' },
			{ h: 'property 的价值', p: '把属性访问换成方法调用，可在读写时做校验、懒加载、触发通知，而对调用方仍是 obj.x 的写法，不破坏接口。这是重构时保留兼容性的常用手段。' }
		],
		extend: [
			'@cached_property 缓存计算结果，首次访问后复用',
			'@x.deleter 可以定义删除行为',
			'需要严格不可变用 frozen dataclass 或 __setattr__ 拦截'
		],
		code: 'class Account:\n    def __init__(self):\n        self._balance = 0\n\n    @property\n    def balance(self):\n        return self._balance\n\n    @balance.setter\n    def balance(self, v):\n        if v < 0:\n            raise ValueError("余额不能为负")\n        self._balance = v'
	},
	{
		id: 'py-080',
		cat: 'py',
		level: 3,
		hot: 60,
		source: '面试鸭 · Python',
		title: '什么是 Python 面向对象的多态特性？',
		short: '不同类实现同名方法，调用方无需关心具体类型，运行时按对象实际类型分派。',
		points: [
			'统一接口，多种实现，调用方只依赖接口',
			'Python 是动态分派，不要求共同父类',
			'鸭子类型让多态天然成立',
			'抽象基类/Protocol 用于表达契约'
		],
		detail: [
			{ h: '如何体现', p: 'for s in shapes: s.area() 中每个 shape 可以是圆、矩形或任意实现 area 的对象。调用方不需要 isinstance 判断，新增类型也不用改这段代码——这正是开闭原则的体现。' },
			{ h: '与重载的区别', p: '多态是「同名方法在不同类型上有不同行为」（运行时决定），重载是「同名函数按参数签名选不同实现」（编译期决定）。Python 没有静态重载，多态靠动态查找实现。' }
		],
		extend: [
			'isinstance 分支越多，越说明多态没用好',
			'functools.singledispatch 提供按类型分派的函数式多态',
			'多态 + 依赖注入是解耦业务与实现的核心手段'
		],
		code: 'class Circle:\n    def area(self): return 3.14\n\nclass Square:\n    def area(self): return 4\n\nfor s in [Circle(), Square()]:\n    print(s.area())'
	},
	{
		id: 'py-081',
		cat: 'py',
		level: 3,
		hot: 62,
		source: '面试鸭 · Python',
		title: 'Python 是否支持多重继承？',
		short: '支持。属性查找按 C3 线性化的 MRO 顺序，配合 super() 协作调用。',
		points: [
			'class C(A, B) 合法，查找顺序看 MRO',
			'Cls.__mro__ 可查看真实解析顺序',
			'菱形继承用 super() 保证公共祖先只初始化一次',
			'多个父类方法同名时，靠前的父类优先',
			'Mixin 是多重继承最实用的场景'
		],
		detail: [
			{ h: 'MRO 的规则', p: 'C3 线性化保证：子类在父类之前、左侧父类在右侧之前、每个类的相对顺序保持一致。它解决了旧式「深度优先」在菱形结构下重复访问的问题，也让 super() 的行为可预测。' },
			{ h: '实践建议', p: '真正需要多继承的场景很少，主要是 Mixin：只提供一小块能力（如 JSONMixin、LogMixin），不维护独立状态。业务类之间仍应优先用组合，避免「父类网状交叉」导致的初始化顺序问题。' }
		],
		extend: [
			'super() 在类体内自动使用当前类的 MRO 位置',
			'Mixin 不要重写 __init__ 而不调用 super().__init__()',
			'元类冲突（metaclass conflict）是多继承的另一个坑'
		],
		code: 'class A:\n    def hi(self): print("A")\nclass B:\n    def hi(self): print("B")\nclass C(A, B):\n    pass\n\nC().hi()          # A\nprint(C.__mro__)  # (C, A, B, object)'
	},
	{
		id: 'py-082',
		cat: 'py',
		level: 1,
		hot: 62,
		source: '面试鸭 · Python',
		title: '什么是鸭子类型（duck typing）？',
		short: '不关心对象是什么类型，只关心它有没有需要的方法或属性。',
		points: [
			'判断依据是「行为」而不是「类型」',
			'不要求继承共同的父类',
			'任何有 __iter__ 的对象都能 for 循环',
			'代价是错误暴露晚，可用 Protocol + mypy 补'
		],
		detail: [
			{ h: '典型例子', p: '文件对象与 io.StringIO 都能 read，函数参数不必声明是哪一种；只要实现了 read/close 就可以当「文件」用。标准库大量依赖这个特性，比如 json.dump(obj, fp) 只要求 fp 有 write。' },
			{ h: '如何规避风险', p: '在边界处做能力校验（hasattr 或 try/except AttributeError），内部用 typing.Protocol 声明期望的行为，mypy 能在静态阶段发现「少实现了一个方法」。' }
		],
		extend: [
			'collections.abc 系列抽象基类可做运行时结构检查',
			'「EAFP」风格：先做再捕获异常，比先检查更 Pythonic',
			'过度依赖鸭子类型会让重构缺少编译期保护'
		],
		code: 'def dump_all(items, fp):\n    for x in items:      # 只要求可迭代\n        fp.write(str(x))  # 只要求有 write'
	},
	{
		id: 'py-083',
		cat: 'py',
		level: 3,
		hot: 62,
		source: '面试鸭 · Python',
		title: '为什么 Python 执行速度慢，如何改进？',
		short: '解释执行 + 动态类型，每条指令都要做类型检查；热点下沉到 C 扩展，CPU 密集用多进程。',
		points: [
			'虚拟机逐条分派字节码，比机器码多一层开销',
			'动态类型让每次运算都要判断类型、查属性',
			'GIL 限制了多线程的 CPU 并行',
			'优化顺序：算法 → 数据结构 → 向量化 → 扩展'
		],
		detail: [
			{ h: '慢在哪', p: '一次 a + b 在 C 里是一条指令，在 CPython 里要先查两个对象的类型、找到对应的 __add__、创建新对象、维护引用计数。大部分时间花在解释器框架而不是实际计算。' },
			{ h: '提速路线', p: '先用 cProfile 定位热点，再换算法与数据结构（set 替代 list 查找）；数值计算交给 numpy 向量化；重复计算加 lru_cache；仍然不够就写 C/Cython/Rust 扩展，或换 PyPy。CPU 密集靠多进程、IO 密集靠 asyncio。' }
		],
		extend: [
			'避免在循环里做属性查找与全局查找，可先绑定到局部变量',
			'字符串拼接用 join，不要用 +=',
			'3.11+ 的自适应解释器（PEP 659）已带来明显提速'
		],
		code: '# 慢\ns = ""\nfor w in words:\n    s += w\n\n# 快\ns = "".join(words)'
	},
	{
		id: 'py-084',
		cat: 'py',
		level: 3,
		hot: 61,
		source: '面试鸭 · Python',
		title: '如何分析 Python 代码的执行性能？',
		short: 'cProfile 看函数级耗时，timeit 做微基准，line_profiler 逐行，memory_profiler 看内存。',
		points: [
			'cProfile + pstats 是函数级分析的标准工具',
			'cumtime 看总耗时，tottime 看自身耗时',
			'timeit 适合比较几种写法的小片段',
			'line_profiler 定位到具体哪一行慢'
		],
		detail: [
			{ h: '怎么读报告', p: 'ncalls 是调用次数，tottime 是本函数自身耗时，cumtime 含子调用。先按 cumtime 找大头，再看 tottime 判断是「自己算得慢」还是「调用的东西慢」；调用次数异常高往往说明循环里重复计算。' },
			{ h: '其它维度', p: 'py-spy 可以采样分析线上进程而不改代码；tracemalloc 和 memory_profiler 查内存增长；asyncio 场景注意同步阻塞调用会拖慢整个事件循环。' }
		],
		extend: [
			'python -m cProfile -o out.prof script.py 保存结果再分析',
			'snakeviz 可以把 prof 文件渲染成可交互的图',
			'微基准注意预热与重复次数，否则结果不可信'
		],
		code: 'python -m cProfile -s cumtime script.py\n\nimport timeit\ntimeit.timeit("sum(range(100))", number=10000)'
	},
	{
		id: 'py-085',
		cat: 'py',
		level: 3,
		hot: 62,
		source: '面试鸭 · Python',
		title: 'Python 中如何读取大文件，例如内存只有 4G，如何读取一个大小为 8G 的文件？',
		short: '分块或逐行迭代读取，避免一次性载入；需要随机访问用 mmap 或落库。',
		points: [
			'for line in f 逐行迭代，内存与文件大小无关',
			'二进制文件用 read(chunk_size) 循环处理',
			'不要用 read() / readlines() 全量读入',
			'需要随机访问用 mmap 或建索引/落库'
		],
		detail: [
			{ h: '为什么逐行安全', p: '文本模式下文件对象带缓冲区，每次只把一块数据读进内存并切出当前行，所以 8G 文件也只需要几 MB。readlines 会把所有行装进 list，行数一多必然 OOM。' },
			{ h: '更复杂的需求', p: '要统计/聚合就边读边算（累加、写数据库、分批写新文件）；要按偏移随机读用 mmap 把文件映射到内存，由操作系统按页调度；要反复查询就导入 SQLite/Parquet，用索引而不是扫全量。' }
		],
		extend: [
			'pandas 可用 chunksize 参数分块读 CSV',
			'多进程读同一文件可按字节区间切分并行处理',
			'gzip 等压缩文件要用流式解压库，不能直接 open'
		],
		code: 'with open("big.log", "rb") as f:\n    while True:\n        chunk = f.read(1024 * 1024)   # 1MB\n        if not chunk:\n            break\n        handle(chunk)'
	},
	{
		id: 'py-086',
		cat: 'py',
		level: 1,
		hot: 62,
		source: '面试鸭 · Python',
		title: '你使用过哪些 Python 标准库模块？',
		short: 'os/sys、json、re、datetime、collections、itertools、functools、pathlib、logging、subprocess。',
		points: [
			'文件与路径：os、pathlib、shutil、glob',
			'数据与文本：json、csv、re、datetime',
			'结构与迭代：collections、itertools、functools',
			'运行时与调试：sys、logging、argparse、subprocess、unittest'
		],
		detail: [
			{ h: '日常最高频', p: 'pathlib 用 / 拼路径比字符串拼接安全；collections 的 Counter/defaultdict/deque 覆盖计数、分组、队列；functools 的 lru_cache/partial/wraps 在写工具函数时几乎必用。' },
			{ h: '容易被忽略的', p: 'contextlib 写上下文管理器、dataclasses 减少样板、enum 表达枚举、typing 做注解、concurrent.futures 做线程/进程池、secrets 生成安全随机数。这些能显著减少对第三方库的依赖。' }
		],
		extend: [
			'标准库随 Python 一起安装，不需要 pip',
			'requests、numpy、pandas 属于第三方库，不在标准库内',
			'标准库文档中的「What\'s New」能快速了解新版本能力'
		],
		code: ''
	},
	{
		id: 'py-087',
		cat: 'py',
		level: 3,
		hot: 61,
		source: '面试鸭 · Python',
		title: 'Python 的 re 模块中 split()、sub()、subn() 方法有什么作用？',
		short: 'split 按正则切分，sub 替换全部匹配，subn 替换并返回（新串, 次数）。',
		points: [
			're.split(pattern, s, maxsplit) 按模式切分',
			're.sub(pattern, repl, s, count) 替换匹配内容',
			're.subn 额外返回替换次数',
			'repl 可以是函数，实现动态替换'
		],
		detail: [
			{ h: '与字符串方法的区别', p: 'str.split 只支持固定分隔符，re.split 支持「多分隔符、变长空白」；str.replace 只能按字面替换，re.sub 支持分组引用（\\1）与函数式替换，能按匹配内容动态生成结果。' },
			{ h: 'subn 的用处', p: '返回 (结果字符串, 替换次数)，适合在数据清洗时统计「改了多少处」，也用于判断是否有匹配（次数为 0 即无匹配），省去再调一次 search。' }
		],
		extend: [
			'count=0 表示替换全部，count=1 只替换第一处',
			'repl 传函数时，参数是 Match 对象',
			'编译后的 pattern 也有 split/sub/subn 方法，性能更好'
		],
		code: 'import re\n\nprint(re.split(r"[,;\\s]+", "a, b; c"))     # ["a", "b", "c"]\nprint(re.sub(r"\\s+", " ", " a   b "))      # " a b "\nprint(re.subn(r"\\d", "#", "a1b2"))         # ("a#b#", 2)'
	},
	{
		id: 'py-088',
		cat: 'py',
		level: 3,
		hot: 60,
		source: '面试鸭 · Python',
		title: 'Python 的 namedtuple 有什么作用？怎么使用？',
		short: '创建带字段名的轻量不可变元组子类，可用属性访问，比普通类省内存。',
		points: [
			'字段可通过属性名访问，也可当元组解包',
			'不可变，因此可哈希、可作字典键',
			'_asdict() / _replace() / _fields 是常用方法',
			'需要默认值用 defaults，需要可变用 dataclass'
		],
		detail: [
			{ h: '为什么比类省', p: 'namedtuple 由 tuple 派生，没有实例 __dict__，字段信息存在类上，所以创建快、内存小。适合表示「固定几个字段的记录」，比如坐标、配置项、查询结果行。' },
			{ h: '与 dataclass 的选择', p: '要不可变、轻量、可当元组用（解包、索引、哈希）选 namedtuple；要可变、带类型注解、默认值和方法选 dataclass；要强校验用 pydantic。' }
		],
		extend: [
			'typing.NamedTuple 支持类型注解写法',
			'_replace 返回新实例，不会修改原对象',
			'字段名不能以下划线开头，也不能是关键字'
		],
		code: 'from collections import namedtuple\n\nPoint = namedtuple("Point", "x y")\np = Point(1, 2)\nprint(p.x, p[1])        # 1 2\nprint(p._replace(x=9))  # Point(x=9, y=2)'
	},
	{
		id: 'py-089',
		cat: 'py',
		level: 1,
		hot: 62,
		source: '面试鸭 · Python',
		title: '说明 Python 中的 zip 函数',
		short: '把多个可迭代对象按位置打包成元组，长度按最短截断，返回迭代器。',
		points: [
			'zip(a, b) 返回 (a[i], b[i]) 的迭代器',
			'长度按最短的序列截断',
			'zip(*matrix) 可以转置二维结构',
			'dict(zip(keys, values)) 是构造字典的常用写法'
		],
		detail: [
			{ h: '常见用法', p: '并行遍历两个列表、把表头与数据行组合成字典、矩阵转置。zip 返回迭代器，需要列表要 list(zip(...))；它能接受任意多个可迭代对象。' },
			{ h: '长度不一致的坑', p: '默认按最短静默截断，数据错位时不易发现。3.10+ 可加 strict=True，长度不一致直接抛 ValueError；要按最长补齐则用 itertools.zip_longest。' }
		],
		extend: [
			'zip 对象只能消费一次，用完需重建',
			'enumerate 是 zip(range(n), seq) 的语法糖',
			'字典的 items() 也可看作成对序列'
		],
		code: 'names = ["a", "b"]\nages = [20, 30]\nprint(dict(zip(names, ages)))   # {"a": 20, "b": 30}\nprint(list(zip(*[[1, 2], [3, 4]])))  # [(1, 3), (2, 4)]'
	},
	{
		id: 'py-090',
		cat: 'py',
		level: 1,
		hot: 61,
		source: '面试鸭 · Python',
		title: '如何使用 Python 的 random 模块生成随机数、实现随机乱序和随机抽样？',
		short: 'random/randint/choice/shuffle/sample/uniform 分别对应浮点、整数、取一个、乱序、抽样、区间浮点。',
		points: [
			'random() 返回 [0, 1) 浮点数，randint(a, b) 含两端',
			'choice(seq) 随机取一个，choices 可重复抽样',
			'shuffle(lst) 原地打乱并返回 None',
			'sample(pop, k) 无放回抽 k 个，返回列表'
		],
		detail: [
			{ h: '乱序与抽样的区别', p: 'shuffle 只打乱原列表、不返回值，需要保留原顺序就先复制一份；sample 从原序列抽取且不重复，等价于 shuffle 后切片但更高效，也支持 range 这类序列。' },
			{ h: '可复现与安全', p: 'random.seed(42) 让结果可复现，便于测试与实验对比。random 是伪随机，不能用于令牌、密码、验证码，安全场景必须用 secrets 模块。' }
		],
		extend: [
			'randrange / choice / choices 支持 weights 加权',
			'uniform(a, b) 是连续均匀分布，gauss 是正态分布',
			'numpy.random 提供向量化的随机数生成'
		],
		code: 'import random\n\nrandom.seed(42)\nprint(random.randint(1, 10))\nlst = [1, 2, 3, 4]\nrandom.shuffle(lst)\nprint(random.sample(lst, 2))'
	},
	{
		id: 'py-091',
		cat: 'py',
		level: 3,
		hot: 66,
		source: '面试鸭 · Python',
		title: 'Python 中如何实现多线程？',
		short: 'threading.Thread 创建后 start() 启动，或用 ThreadPoolExecutor 提交任务。',
		points: [
			'Thread(target=fn, args=(...)) 后必须 start()',
			'run() 是同步执行，不会开新线程',
			'join() 等待线程结束，daemon 线程随主线程退出',
			'共享数据要加 Lock，或用线程安全的数据结构'
		],
		detail: [
			{ h: 'GIL 的影响', p: '同一时刻只有一个线程执行字节码，CPU 密集多线程无法加速；但网络请求、文件读写、sleep 等阻塞时会释放 GIL，所以 IO 密集型任务用线程依然有效。' },
			{ h: '线程池优先', p: '生产代码更推荐 ThreadPoolExecutor：submit 拿 Future、map 批量提交、as_completed 按完成顺序处理，配合 with 自动关闭，比自己管 Thread 列表更省心。' }
		],
		extend: [
			'queue.Queue 是线程间传递任务的常用结构',
			'threading.local 提供线程隔离的变量',
			'CPU 密集应改用 multiprocessing 或 ProcessPoolExecutor'
		],
		code: 'from concurrent.futures import ThreadPoolExecutor\n\ndef fetch(url):\n    return len(url)\n\nwith ThreadPoolExecutor(max_workers=8) as pool:\n    print(list(pool.map(fetch, ["a", "bb", "ccc"])))'
	},
	{
		id: 'py-092',
		cat: 'py',
		level: 3,
		hot: 63,
		source: '面试鸭 · Python',
		title: '请介绍 Python 中多线程和多进程的应用场景，以及优缺点？',
		short: 'IO 密集用多线程（开销小、共享内存），CPU 密集用多进程（绕开 GIL，但通信成本高）。',
		points: [
			'多线程轻量、共享内存，但要处理竞争与 GIL',
			'多进程吃满多核、隔离性好，但创建与 IPC 成本高',
			'判断依据：任务在等 IO 还是在算 CPU',
			'IO 密集还有第三种选择：asyncio 协程'
		],
		detail: [
			{ h: '怎么选', p: '爬虫、接口聚合、文件读写这类「大部分时间在等待」的任务用多线程或协程；图像处理、加解密、大规模数值计算这类「一直在算」的任务用多进程，否则线程只会互相抢 GIL。' },
			{ h: '成本对比', p: '线程共享内存，通信几乎零成本但要加锁防数据竞争；进程内存独立，天然无竞争，但传数据要序列化（pickle），启动开销也大，适合粗粒度任务拆分。' }
		],
		extend: [
			'协程单线程内切换，开销比线程更小，适合上万并发连接',
			'进程池 + 共享内存（multiprocessing.shared_memory）可减少拷贝',
			'3.13+ 的 free-threaded 构建在尝试移除 GIL'
		],
		code: 'from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor\n\n# IO 密集\nThreadPoolExecutor(16)\n# CPU 密集\nProcessPoolExecutor(4)'
	},
	{
		id: 'py-093',
		cat: 'py',
		level: 3,
		hot: 65,
		source: '面试鸭 · Python',
		title: '请解释 Python 线程池的工作原理？',
		short: '预先创建固定数量的线程，任务入队由空闲线程取出执行，避免频繁创建销毁并限制并发。',
		points: [
			'启动时创建 max_workers 个线程，循环从队列取任务',
			'提交任务返回 Future，用 result() 拿结果或异常',
			'队列满时任务排队，不会无限开线程',
			'submit / map / as_completed 是三个常用入口'
		],
		detail: [
			{ h: '内部结构', p: '线程池维护一个工作线程集合和一个任务队列。submit 把任务包装成 WorkItem 放进队列，空闲线程取到后执行并把结果写回 Future，调用方通过 result(timeout) 阻塞等待。' },
			{ h: '参数怎么定', p: 'IO 密集可把 max_workers 设得比 CPU 核数大（几倍到几十倍），因为线程大部分时间在等待；CPU 密集应设为核数附近，再多只会增加切换开销。任务有阻塞风险时要配超时，避免线程被永久占住。' }
		],
		extend: [
			'shutdown(wait=True) 等待所有任务结束，with 语句会自动调用',
			'线程池中的异常不会直接抛出，而是在 result() 时重新抛出',
			'CPU 密集场景用 ProcessPoolExecutor，接口一致',
			'任务队列无界时注意内存，可改用有界队列 + 限流'
		],
		code: 'from concurrent.futures import ThreadPoolExecutor, as_completed\n\nwith ThreadPoolExecutor(max_workers=4) as pool:\n    futures = [pool.submit(pow, 2, n) for n in range(5)]\n    for f in as_completed(futures):\n        print(f.result())'
	}
]
