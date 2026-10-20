/**
 * 题库 · TypeScript 补充（ts-016 ~ ts-050）
 */

import { makeQuestions } from './helper.js'

export const questions = makeQuestions('ts', [
	['016', 2, 82, '给泛型参数指定默认类型的正确写法是？', [
		'`function f<T = string>(x: T): T`',
		'`function f<T: string>(x: T): T`',
		'`function f<T default string>(x: T): T`',
		'`function f<T extends = string>(x: T): T`'
	], ['A'], '泛型默认值用等号声明，与类型参数约束可以组合：`function f<T extends object = {}>()`。\n\n默认值只在不显式传参且无法从实参推断时生效，常用于给工具函数提供兜底类型。'],

	['017', 1, 88, '`keyof` 运算符的结果是？', [
		'对象所有属性值组成的联合类型',
		'对象所有属性名（键）组成的联合类型',
		'固定返回 string',
		'一个布尔值'
	], ['B'], '`keyof T` 得到 T 的所有键组成的联合类型，例如 `keyof { a: 1; b: 2 }` 是 `"a" | "b"`。\n\n它常与索引访问类型 `T[K]` 搭配，是映射类型和工具类型的基础，比如 `Pick<T, keyof T>`。'],

	['018', 2, 80, '`type V = Person["name"]` 这种写法叫什么？', [
		'索引访问类型，取出某个属性的类型',
		'类型断言',
		'接口继承',
		'类型守卫'
	], ['A'], '索引访问类型（Indexed Access Types）用 `T[K]` 取属性类型，K 可以是字面量、联合或 `keyof` 的结果。\n\n例如 `type PersonValues = Person[keyof Person]` 得到所有属性值类型的联合。'],

	['019', 3, 78, '`type R<T> = T extends any ? T[] : never`，则 `R<string | number>` 是？', [
		'`(string | number)[]`',
		'`string[] | number[]`',
		'`never`',
		'`any[]`'
	], ['B'], '裸类型参数（naked type parameter）出现在条件类型左侧时具有分配性，会把联合类型拆开分别计算再合并：`string[] | number[]`。\n\n想避免分配，可以用 `[T] extends [any]` 把类型包进元组。'],

	['020', 2, 82, '`Exclude<"a" | "b" | "c", "a">` 的结果是？', [
		'`"a" | "b" | "c"`',
		'`"b" | "c"`',
		'`"a"`',
		'`never`'
	], ['B'], 'Exclude 的实现是 `T extends U ? never : T`，配合分发特性逐个判断，从联合类型中剔除可赋值给 U 的成员。\n\n对应的 Extract 是取其交集：`Extract<"a" | "b", "b" | "c">` 得到 `"b"`。'],

	['021', 3, 86, '`infer` 关键字的作用是？', [
		'在条件类型中声明一个待推断的类型变量',
		'把类型转换为接口',
		'强制类型断言',
		'声明全局变量'
	], ['A'], '`infer` 只能出现在条件类型的 extends 右侧，用于「先占位、后推断」，例如 `ReturnType` 的实现：`type ReturnType<T> = T extends (...args: any) => infer R ? R : any`。\n\n在 `infer` 前后加同一变量可以提取字符串/元组的部分结构，也是递归工具类型的常用手法。'],

	['022', 2, 84, '`Pick<Person, "name" | "age">` 的语义是？', [
		'从 Person 中挑出 name 和 age 两个属性组成新类型',
		'删除 name 和 age',
		'把 name 和 age 变成可选',
		'把 Person 所有属性变成只读'
	], ['A'], 'Pick 通过映射类型筛选指定键：`{ [K in "name" | "age"]: Person[K] }`。\n\n对应的 Omit 是「排除指定键」，两者一正一反，常用于从实体类型派生 DTO。'],

	['023', 3, 78, '`Omit<T, K>` 的等价实现是？', [
		'`Pick<T, Exclude<keyof T, K>>`',
		'`Pick<T, Extract<keyof T, K>>`',
		'`Partial<Pick<T, K>>`',
		'`Record<K, T>`'
	], ['A'], 'Omit 先用 `Exclude<keyof T, K>` 求出「剩下的键」，再用 Pick 取出来。\n\n注意 Omit 的 K 只约束为 `keyof any`，写错属性名不会报错，需要严格校验时自己封装一个 `StrictOmit`。'],

	['024', 1, 80, '`Record<string, number>` 表示？', [
		'一个键为 string、值为 number 的对象类型',
		'一个字符串或数字',
		'一个数组',
		'一个函数类型'
	], ['A'], 'Record 用映射类型构造索引签名结构：`{ [K in string]: number }`，相当于 `{ [key: string]: number }`。\n\n也常用于枚举到配置的映射：`Record<Status, string>`，能保证每个枚举值都有对应条目。'],

	['025', 2, 84, '`Partial<T>` 的作用是？', [
		'把 T 的第一层属性全部变为可选',
		'递归地把所有层级变为可选',
		'把属性变为只读',
		'删除所有可选属性'
	], ['A'], 'Partial 只处理第一层：`{ [K in keyof T]?: T[K] }`，嵌套对象不受影响。\n\n需要深层可选要自己写递归版本（DeepPartial），注意数组和函数类型要单独判断，否则会被误处理。'],

	['026', 2, 76, '`Required<T>` 与 `Partial<T>` 的关系是？', [
		'相反：Required 去掉可选修饰符 `?`，让所有属性必填',
		'完全相同',
		'Required 只是把类型变成 never',
		'Required 只能用于接口'
	], ['A'], 'Required 通过 `-?` 移除可选修饰符，常用于「配置项默认值已填充」之后的类型收窄。\n\n与之类似的还有 `-readonly` 去掉只读。'],

	['027', 2, 78, '`Readonly<T>` 的约束在什么时候生效？', [
		'仅编译期，运行时对象依然可以被改写',
		'运行时通过 Object.freeze 自动冻结',
		'编译期和运行时都生效',
		'只在严格模式下生效'
	], ['A'], 'Readonly 只是类型层面的只读标记，JS 产物的属性仍可写；真正运行时不可变要用 `Object.freeze`（且只冻结第一层）。\n\n另外 `readonly` 数组类型 `readonly string[]` 会禁止 push 等方法。'],

	['028', 2, 74, '`Parameters<typeof fn>` 得到的是什么类型？', [
		'函数参数组成的元组类型',
		'函数的返回值类型',
		'函数的 this 类型',
		'一个字符串联合类型'
	], ['A'], 'Parameters 通过 `infer P` 提取参数元组，例如 `function f(a: string, b: number)` 得到 `[a: string, b: number]`。\n\n搭配 `ReturnType`、`Awaited` 可以在不手写类型的情况下从实现反推类型。'],

	['029', 3, 76, '`Awaited<Promise<Promise<number>>>` 的结果是？', [
		'`Promise<number>`',
		'`number`',
		'`Promise<Promise<number>>`',
		'`unknown`'
	], ['B'], 'Awaited 会递归解包 thenable 直到非 Promise 类型，所以多层嵌套最终得到 `number`。\n\n它的实现正是用 `infer` 配合递归条件类型，也体现了 TS 对递归类型深度有限制（约 50 层）。'],

	['030', 2, 80, '映射类型的语法是？', [
		'`{ [K in keyof T]: T[K] }`',
		'`{ K: keyof T }`',
		'`type M = T extends keyof ? K : never`',
		'`{ keyof T: T[K] }`'
	], ['A'], '映射类型用 `[K in Keys]` 遍历联合类型生成属性，`keyof T` 作为 Keys 就是「逐属性拷贝」并在值上做变换。\n\n加上 `+?`/`-?`、`+readonly`/`-readonly`、`as` 重映射就能实现各种工具类型。'],

	['031', 3, 72, '`{ [K in keyof T]-?: T[K] }` 中 `-?` 的含义是？', [
		'移除可选修饰符，让属性变为必填',
		'给属性加上可选修饰符',
		'删除该属性',
		'把属性变成只读'
	], ['A'], '`-` 前缀用于移除修饰符：`-?` 去可选、`-readonly` 去只读；对应的 `+?`、`+readonly` 与不写前缀等价。\n\n这正是 `Required<T>` 的实现方式。'],

	['032', 2, 86, '`const config = { mode: "dark" } as const` 的效果是？', [
		'属性变只读，且类型被收窄为字面量 `"dark"`',
		'把对象转成 JSON 字符串',
		'运行时冻结对象',
		'把类型变成 any'
	], ['A'], '`as const` 让字面量保持最窄类型（不会宽化成 string），并把对象属性标记为 readonly、数组变成 readonly 元组。\n\n它不产生运行时冻结，改写属性在编译期报错、运行时照样能改。'],

	['033', 3, 80, 'TS 4.9 引入的 `satisfies` 主要解决什么问题？', [
		'校验值符合某类型，同时保留更精确的推断结果（不像注解那样宽化）',
		'强制类型转换',
		'替代 interface',
		'让对象变成只读'
	], ['A'], '用 `const cfg: Config = {...}` 注解会把类型宽化成 Config，丢失字面量细节；`satisfies Config` 只做兼容性检查，变量的实际类型仍是推断出的窄类型，后续取值能拿到精确的字面量。\n\n典型场景是配置表、路由表这类「既要约束又要精确」的数据。'],

	['034', 2, 76, '数字枚举 `enum E { A, B }` 编译后会生成什么？', [
		'一个对象，同时包含 `E.A = 0` 和 `E[0] = "A"` 的反向映射',
		'一个只含键的数组',
		'一个 Map 实例',
		'什么都没有，仅用于类型检查'
	], ['A'], '数字枚举会生成双向映射对象（所以可以用 `E[0]` 反查名字），字符串枚举则只有正向映射。\n\n反向映射会让枚举对象变大，也容易误用，现代代码更常用 `as const` 对象 + 联合类型替代。'],

	['035', 3, 74, '`const enum` 在开启 `isolatedModules`（如 Vite/esbuild 转译）时为什么容易出问题？', [
		'它需要跨文件内联常量，单文件转译无法获得其他文件的枚举值',
		'esbuild 不支持任何枚举',
		'const enum 只能定义在 .d.ts 中',
		'它会让代码体积变大'
	], ['A'], 'const enum 依赖编译器在整个程序范围内内联，而 esbuild/Babel 逐文件转译，看不到别的模块定义，只能报错或退化成普通枚举。\n\n所以开启 isolatedModules 时通常用 `as const` 对象替代枚举，或者禁用 const enum。'],

	['036', 1, 84, '`const n = value as number` 在运行时会做什么？', [
		'什么都不做，只影响编译期类型',
		'把字符串转成数字',
		'抛错如果类型不符',
		'调用 Number() 转换'
	], ['A'], '类型断言只告诉编译器「相信我」，不产生任何运行时检查或转换，断言错了就会在运行时炸掉。\n\n需要真正转换用 `Number(value)`；需要运行时校验用类型守卫或 zod 之类的 schema 库。'],

	['037', 2, 78, '非空断言 `obj!.name` 的含义是？', [
		'告诉编译器 obj 不为 null/undefined，编译后 `!` 会被删除',
		'运行时若为空则抛异常',
		'把 obj 转成 any',
		'给 obj 加一个默认值'
	], ['A'], '`!` 只是从类型里剔除 null 和 undefined，运行时不做任何检查，值为空时依旧是 TypeError。\n\n能通过 if 判断或可选链解决时优先用真实判空，非空断言只适合「逻辑上已保证」的场景。'],

	['038', 2, 72, '函数重载声明应该按什么顺序写？', [
		'从最具体到最宽泛',
		'从最宽泛到最具体',
		'按字母序',
		'顺序无所谓'
	], ['A'], 'TS 按声明顺序自上而下匹配第一个兼容的签名，所以具体签名必须放在前面，否则宽泛签名会抢先匹配，导致返回类型推断错误。\n\n实现签名对外不可见，参数要能兼容所有重载。'],

	['039', 3, 68, '函数签名中的 `this: Window` 参数有什么作用？', [
		'约束函数调用时的 this 类型，且该参数不占用实际实参位置',
		'声明一个名叫 this 的普通参数',
		'把函数绑定到 Window',
		'让函数变成箭头函数'
	], ['A'], '`this` 参数是 TS 特有的伪参数，只在类型层面约束调用上下文，编译后消失。\n\n常见于回调、事件处理函数的类型声明，比如 `function handler(this: HTMLElement, e: Event)`。'],

	['040', 1, 76, '抽象类（abstract class）的特点是？', [
		'不能直接实例化，抽象方法必须由子类实现',
		'可以被 new，只是不能继承',
		'所有方法都必须是抽象方法',
		'抽象类不能有构造函数'
	], ['A'], '抽象类可以有实现、状态和构造函数（供子类 super 调用），但自身不能 new；抽象方法只有签名没有实现，子类不实现就无法编译。\n\n接口只描述结构、编译后完全消失，抽象类会产出真实代码，还能提供部分默认实现。'],

	['041', 3, 80, '`private` 修饰符与 `#` 私有字段的区别是？', [
		'`private` 只在编译期检查，运行时仍可访问；`#` 是运行时真正私有',
		'两者完全等价',
		'`#` 只是语法糖，编译后变成 private',
		'`private` 支持继承访问，`#` 不支持'
	], ['A'], '`private` 会被编译成普通属性，用 `obj["secret"]` 或反射依然能拿到；`#field` 是 JS 原生私有语义，外部访问直接抛语法/运行时错误。\n\n需要真正封装（比如下发到浏览器的库代码）时用 `#`。'],

	['042', 3, 74, '开启 `exactOptionalPropertyTypes` 后，`{ name?: string }` 与 `{ name: string | undefined }` 的区别是？', [
		'前者不允许显式赋值为 undefined，后者允许',
		'两者完全等价',
		'后者语法错误',
		'前者不允许省略该属性'
	], ['A'], '默认情况下 `?` 隐含「可以省略」且「可以显式写 undefined」；开启 exactOptionalPropertyTypes 后，`?` 只表示可以省略，显式写 `undefined` 不再合法，需要 `| undefined`。\n\n它属于 strict 之外的额外严格项，迁移老项目时要谨慎。'],

	['043', 2, 76, '定义索引签名 `{ [key: string]: number }` 时要注意什么？', [
		'所有已声明属性的类型都必须能赋值给 number',
		'索引签名不能与具体属性共存',
		'索引签名只支持 symbol',
		'索引签名会强制所有键必填'
	], ['A'], '索引签名描述「任意键的取值范围」，所以 `{ [k: string]: number; name: string }` 会报错，因为 name 不是 number。\n\n需要混合类型时把值放宽为联合类型，或改用映射类型精确描述。'],

	['044', 3, 68, '`keyof any` 的结果是？', [
		'`string | number | symbol`',
		'`string`',
		'`any`',
		'`never`'
	], ['A'], 'JS 对象的键只能是 string、number、symbol，所以 `keyof any` 是这三者的联合。\n\n`Record<K, V>` 的 K 约束就是 `keyof any`，这也是 `PropertyKey` 类型的定义来源。'],

	['045', 3, 82, '在联合类型分支里用 `const _x: never = value` 的目的通常是？', [
		'做穷尽性检查，漏掉某个分支时编译报错',
		'强制类型转换',
		'消除运行时警告',
		'把类型变成 any'
	], ['A'], '当所有分支都被处理完，value 的类型被收窄为 never，能赋值给 never 说明「没有遗漏」；新增成员后若漏处理，赋值立即报错。\n\n这是让编译器帮你维护 switch/if 分支完整性的标准做法。'],

	['046', 1, 84, '下列哪种方式可以收窄联合类型？', [
		'`typeof`、`instanceof`、`in` 判断，以及自定义类型谓词',
		'只能用 `as` 断言',
		'只能通过注释声明',
		'收窄必须手写 any'
	], ['A'], '`typeof x === "string"`、`x instanceof Date`、`"a" in x` 都是 TS 能理解的控制流收窄；自定义 `function isX(v: unknown): v is X` 也能参与收窄。\n\n断言是「强制认定」而非收窄，不校验真实性。'],

	['047', 2, 74, '类型谓词 `function isUser(v: unknown): v is User` 的作用是？', [
		'告诉编译器：该函数返回 true 时，参数可以被当作 User 使用',
		'把任意值转换成 User',
		'声明 User 是接口',
		'抛异常如果类型不符'
	], ['A'], '类型谓词的返回值仍是 boolean，但 TS 会据此在调用处收窄参数类型。\n\n注意谓词本身不做校验，函数体里必须真的判断（如检查必需字段），否则就是自欺欺人的断言。'],

	['048', 2, 72, '在 TS 项目里引入 `.vue`/`.css` 等非 TS 文件，常需要做什么？', [
		'写声明文件，如 `declare module "*.vue"`',
		'关闭 strict 模式',
		'把它们改成 .ts',
		'不需要任何配置'
	], ['A'], 'TS 默认只认识代码文件，遇到未知扩展名会报「找不到模块」。通过 `env.d.ts` 里的 `declare module "*.vue" { const c: DefineComponent; export default c }` 声明模块形状即可。\n\n现代脚手架一般已内置这些声明。'],

	['049', 2, 80, '`tsconfig.json` 中 `strict: true` 会开启什么？', [
		'一组严格检查，包括 strictNullChecks、noImplicitAny、strictFunctionTypes 等',
		'只开启空值检查',
		'只开启类型检查的增量编译',
		'强制所有文件使用 .tsx'
	], ['A'], 'strict 是多个开关的集合，核心是 strictNullChecks（null/undefined 独立成类型）与 noImplicitAny（禁止隐式 any）。\n\n新项目建议直接开启，老项目可逐个启用子选项逐步收紧。'],

	['050', 3, 70, '`type Getter<T extends string> = \`get${Capitalize<T>}\``，则 `Getter<"name">` 是？', [
		'`"getName"`',
		'`"getname"`',
		'`string`',
		'`never`'
	], ['A'], '模板字面量类型支持在字符串中嵌入类型，配合内置的 Capitalize 等大小写工具类型可以生成精确的字符串联合。\n\n这类能力常用于从字段名推导事件名、getter 名，配合映射类型与 `as` 重映射生成整张 API 类型。']
])
