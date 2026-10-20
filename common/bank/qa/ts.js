/**
 * 题库 · TypeScript 问答详解
 *
 * 题目清单与解析参考自「面试鸭」：https://www.mianshiya.com
 * 字段：short 一句话回答 / points 回答重点 / detail 详细答案 / extend 扩展追问
 * 共 43 题
 */

export const qaQuestions = [
	{
		id: "ts-001",
		cat: "ts",
		level: 2,
		hot: 99,
		source: "面试鸭 · TypeScript",
		title: "️ TypeScript 有哪些常用类型？",
		short: "TypeScript 的基础类型包括：string、number、boolean、null、undefined、symbol 和 bigint。",
		points: [
			"基础类型：string、number、boolean、null、undefined、symbol、bigint…",
			"复杂类型：array、tuple、enum、object…",
			"特殊类型：any、unknown、never、void…",
			"string：表示字符串。例如：let name: string = \\\"John\\\"",
		],
		detail: [
			{ h: "整体回答", p: "TypeScript 的基础类型包括：string、number、boolean、null、undefined、symbol 和 bigint。这些类型用于表示最简单的数据单元，例如字符串、数字、布尔值以及特殊的唯一值（symbol）和大整数（bigint）。" },
			{ h: "如何定义 TypeScript 中的数组类型", p: "在 TypeScript 中可以通过两种方式定义数组类型：一种是在元素类型后加[]，如 number[] 表示由数字组成的数组；另一种是使用数组泛型 Array<元素类型>，例如 Array<string> 表示字符串数组。" },
			{ h: "什么是元组（Tuple）？它与普通数组有何区别", p: "元组是 TypeScript 中一种特殊的数据结构，表示已知数量和类型的数组，各元素的类型不必相同。与普通数组不同，元组允许你明确指定每个位置上的类型，并在访问时进行类型检查。例如 [string, number] 表示第一个元素是字符串，第二个是数字。越界访问会使用联合类型进行限制。" },
			{ h: "enum 枚举的作用是什么？如何手动设置枚举成员的值", p: "enum 枚举用于定义一组命名常量，使代码更具可读性。默认情况下，枚举成员从 0 开始自动递增。你可以手动指定某个成员的值，例如 enum Color { Red = 1, Green, Blue }，此时 Green 为 2，Blue 为 3；也可以全部手动赋值，如 Red = 1, Green = 2, Blue = 4。" },
		],
		extend: ["object 类型在 TypeScript 中如何使用？", "any 和 unknown 类型的区别是什么？", "never 类型的用途是什么？举例说明。", "void 类型表示什么？何时使用？"]
	},
	{
		id: "ts-002",
		cat: "ts",
		level: 2,
		hot: 92,
		source: "面试鸭 · TypeScript",
		title: "️ 什么是 TypeScript 的对象类型？怎么定义对象类型？",
		short: "TypeScript 的对象类型用于描述非原始类型的值，比如具有特定结构的对象、数组和函数等。",
		points: [
			"我们可以通过 3 种主要方式来定义对象类型：匿名、类型别名、接口。",
			"在 TypeScript 中，对象类型用于描述非原始类型的值，比如具有特定结构的对象、数组和函数等。",
			"function greet(person: { name: string; age: numb…",
		],
		detail: [
			{ h: "整体回答", p: "TypeScript 的对象类型用于描述非原始类型的值，比如具有特定结构的对象、数组和函数等。它可以帮助开发者定义复杂的数据结构，并在编译阶段进行类型检查，提高代码的可维护性和健壮性。" },
			{ h: "TypeScript 中有哪些方式可以定义对象类型", p: "在 TypeScript 中，可以通过三种主要方式定义对象类型：匿名对象类型、类型别名（type）和接口（interface）。匿名对象直接在类型注解中定义结构；类型别名使用 type 关键字为对象结构起一个名字；接口使用 interface 关键字定义，并支持继承和扩展。" },
			{ h: "接口和类型别名有什么区别", p: "接口（interface）和类型别名（type）都可以用来定义对象类型，但接口支持继承（extends），并且可以被重复声明并自动合并，适合用于大型项目中的类型扩展；而类型别名更适合定义联合类型、交叉类型或条件类型等复杂类型，且不能被再次扩展或合并。" },
			{ h: "如何实现接口的继承", p: "通过 extends 关键字可以让一个接口继承另一个或多个接口。例如：interface Employee extends Person, Serializable 表示 Employee 接口同时拥有 Person 和 Serializable 的所有成员。这使得类型可以分层设计，提升复用性。" },
		],
		extend: ["什么是可选属性和只读属性？", "索引签名的作用是什么？", "什么是交叉类型？如何使用？", "泛型在对象类型中有什么作用？"]
	},
	{
		id: "ts-003",
		cat: "ts",
		level: 2,
		hot: 69,
		source: "面试鸭 · TypeScript",
		title: "什么是 TypeScript 的类型别名？怎么定义类型别名？",
		short: "TypeScript 的类型别名（Type Alias）是一种为现有类型定义新名称的机制，使用 type 关键字来创建。",
		points: [
			"x: number;…",
			"类型别名（Type Alias）是 TypeScript 中用来给某种特定类型创建一个新的名字的功能。",
			"type Name = string; // 为 string 类型创建一个别名叫 Name…",
		],
		detail: [
			{ h: "整体回答", p: "TypeScript 的类型别名（Type Alias）是一种为现有类型定义新名称的机制，使用 type 关键字来创建。它可以帮助提高代码的可读性和维护性，尤其是在处理复杂类型（如联合类型、交叉类型或嵌套对象）时，通过赋予一个语义化的名字使类型更清晰。" },
			{ h: "如何定义一个类型别名", p: "使用 type 关键字后跟自定义的类型名称和赋值符号 =，然后指定具体的类型。例如：type Name = string; 或 type Point = { x: number; y: number };。这样就可以在后续代码中使用 Name 或 Point 来代表对应的具体类型。" },
			{ h: "类型别名可以用于哪些类型的组合", p: "类型别名可以用于各种复杂类型组合，包括联合类型（|）和交叉类型（&）。例如，type ID = string | number; 表示 ID 可以是字符串或数字；type Cat = Animal & { meow: () => void }; 表示 Cat 是 Animal 类型与包含 meow 方法的对象类型的交集。" },
			{ h: "类型别名能否与泛型一起使用", p: "可以。类型别名支持泛型，使其更具通用性和灵活性。例如：type Response<T> = { code: number; data: T; message: string };。这样就可以根据不同数据类型复用该结构，如 Response<string> 或 Response<{ name: string }>。" },
		],
		extend: ["类型别名和接口有什么区别？", "为什么不能对类型别名进行声明合并？", "在什么场景下应该使用类型别名而不是接口？", "在什么场景下应该使用接口而不是类型别名？"]
	},
	{
		id: "ts-004",
		cat: "ts",
		level: 2,
		hot: 69,
		source: "面试鸭 · TypeScript",
		title: "什么是 TypeScript 的接口？怎么定义接口？",
		short: "TypeScript 的接口（Interface）是一种用于定义对象结构的工具，用来描述对象应该具有哪些属性、方法及其类型。",
		points: [
			"接口（Interface）是 TypeScript 中用于定义对象结构的工具。",
			"定义接口很简单，使用 interface 关键字来声明接口，然后在大括号 {} 内描述属性和类型。",
			"interface Person {…",
		],
		detail: [
			{ h: "整体回答", p: "TypeScript 的接口（Interface）是一种用于定义对象结构的工具，用来描述对象应该具有哪些属性、方法及其类型。它只在编译时进行类型检查，不会生成任何 JavaScript 代码，有助于提高代码的可读性和可维护性。" },
			{ h: "如何定义一个 TypeScript 接口", p: "使用 interface 关键字后跟接口名和一对大括号来定义接口。在大括号中描述属性及其类型。例如：interface Person { name: string; age: number; greet: () => void; }。" },
			{ h: "接口中的可选属性怎么表示", p: "在属性名后加上问号 ? 来表示该属性是可选的，即可以存在也可以不存在。例如：age?: number; 表示 age 属性可选。" },
			{ h: "如何定义只读属性", p: "使用 readonly 修饰符标记属性，表示该属性只能在初始化时赋值，之后不能被修改。例如：readonly id: number;。" },
		],
		extend: ["接口可以继承吗？如何实现？", "接口能否描述函数类型？", "什么是混合类型接口？", "readonly 和 const 有什么区别？"]
	},
	{
		id: "ts-005",
		cat: "ts",
		level: 2,
		hot: 68,
		source: "面试鸭 · TypeScript",
		title: "TypeScript 的类型别名和接口有什么区别？",
		short: "主要区别有三点：1）用途不同，类型别名可用于定义原始类型、联合类型、元组等，而接口主要用于定义对象类型；2）扩展方式不同，接口使用 extends 继承，类型别名使用交叉类型 …",
		points: [
			"类型别名（Type Aliases）可以用于定义原始类型、联合类型、元组以及复杂对象等各种类型。",
			"接口可以通过extends关键字进行扩展，而类型别名则需要使用交叉类型 & 来进行组合。",
		],
		detail: [
			{ h: "整体回答", p: "主要区别有三点：1）用途不同，类型别名可用于定义原始类型、联合类型、元组等，而接口主要用于定义对象类型；2）扩展方式不同，接口使用 extends 继承，类型别名使用交叉类型 & 组合；3）合并机制不同，接口支持声明合并，类型别名不支持。" },
			{ h: "能否用接口定义联合类型", p: "不能。接口不能直接表示联合类型（如 string | number）或元组类型，这是类型别名的优势之一。" },
			{ h: "什么是接口的声明合并", p: "接口的声明合并是指可以多次使用相同的名称定义接口，TypeScript 会自动将这些定义合并成一个接口。例如，在不同位置定义同名的 User 接口，最终的 User 类型会包含所有属性。" },
			{ h: "类型别名是否可以重复定义", p: "不可以。在 TypeScript 中重复定义同名的类型别名会导致编译错误，因为类型别名不支持声明合并。" },
		],
		extend: ["如何扩展一个接口？", "如何组合多个类型别名？", "类型别名和接口都可以用来定义函数类型吗？", "什么时候应该优先使用接口而不是类型别名？"]
	},
	{
		id: "ts-006",
		cat: "ts",
		level: 2,
		hot: 67,
		source: "面试鸭 · TypeScript",
		title: "TypeScript 中如何定义和导入模块？",
		short: "在 TypeScript 中，可以使用 export 关键字将变量、函数、类或接口等导出。",
		points: [
			"在 TypeScript 中，我们可以使用 import 和 export 关键字来定义和导入模块。",
			"定义模块：我们可以将变量、函数、类以及接口等导出，使用 export 关键字。",
			"// myModule.ts…",
		],
		detail: [
			{ h: "整体回答", p: "在 TypeScript 中，可以使用 export 关键字将变量、函数、类或接口等导出。例如：export const myVar = 42;，这样其他文件就可以通过 import 导入该内容。" },
			{ h: "TypeScript 中如何导入模块内容", p: "使用 import 语句可以从模块中导入导出的内容。例如：import { myFunction } from './myModule';，然后即可使用导入的函数、变量或类。" },
			{ h: "什么是默认导出（default export）？如何使用", p: "默认导出允许一个模块默认导出一个值，使用 export default 语法。导入时不需要大括号，例如：export default function() {}，然后通过 import func from './module' 导入。" },
			{ h: "命名导出和默认导出可以同时使用吗", p: "可以。一个模块可以有多个命名导出和最多一个默认导出。导入时可同时引入默认导出和命名导出，例如：import defaultFunc, { namedFunc } from './module'。" },
		],
		extend: ["TypeScript 中如何处理类型的导入与导出？", "什么是命名空间（namespace），它和模块有什么区别？", "如何为导入的内容重命名？", "如何导入整个模块的所有导出内容？"]
	},
	{
		id: "ts-007",
		cat: "ts",
		level: 2,
		hot: 67,
		source: "面试鸭 · TypeScript",
		title: "什么是 TypeScript 的泛型？",
		short: "泛型可以理解为类型的参数化。",
		points: [
			"泛型可以理解为类型的参数化。通过引入类型参数，我们可以编写更加通用的函数、接口和类，具备更好的复用性和灵活性。例如，…",
			"TypeScript 的泛型是一种让类型可以参数化的工具。",
			"泛型可以理解为类型的参数化。",
		],
		detail: [
			{ h: "为什么需要使用泛型", p: "使用泛型可以编写更加通用和可复用的代码。它避免了使用 any 类型带来的类型安全问题，同时可以在不同的类型上重复使用相同的逻辑，确保在编译时进行正确的类型检查。" },
			{ h: "如何定义一个泛型函数", p: "通过在函数名后添加尖括号 <T> 来声明类型参数 T，然后在参数和返回值中使用该类型。例如：function identity<T>(arg: T): T { return arg; }…" },
			{ h: "泛型中的 T 是什么意思", p: "T 是类型参数的占位符，代表调用时传入的具体类型。它可以是任意标识符，但通常使用 T、U、K、V 等作为约定。例如，T 表示 Type，K 表示 Key，V 表示 Value。" },
			{ h: "如何对泛型进行约束", p: "可以通过 extends 关键字为泛型添加约束，限制其必须具有某些结构或属性。例如：interface Lengthwise { length: number; }，然后定义函数 function logLength<T extends Lengthwise>(arg: T): T，确保传入的参数有 length 属性。" },
		],
		extend: ["泛型可以用于哪些场景？", "如何定义一个泛型接口？", "如何定义一个泛型类？", "泛型支持多个类型参数吗？"]
	},
	{
		id: "ts-008",
		cat: "ts",
		level: 2,
		hot: 66,
		source: "面试鸭 · TypeScript",
		title: "TypeScript 的关键字 static 有什么作用？",
		short: "static 关键字用于定义类的静态成员（属性或方法）。",
		points: [
			"实例成员需要通过类的实例来访问和使用。每个实例都有自己独立的一份实例成员数据。",
			"static 关键字在 TypeScript 中用于定义类的静态成员。",
			"实例成员需要通过类的实例来访问和使用。",
		],
		detail: [
			{ h: "整体回答", p: "static 关键字用于定义类的静态成员（属性或方法）。静态成员属于类本身，而不是类的实例，因此可以直接通过类名访问，无需创建实例。" },
			{ h: "静态成员和实例成员的主要区别是什么", p: "实例成员属于类的每个实例，必须通过实例访问，每个实例拥有独立的副本；而静态成员属于类本身，通过类名直接访问，所有实例共享同一份静态成员。" },
			{ h: "如何在 TypeScript 中定义和使用静态属性和方法", p: "使用 static 关键字在类中声明静态成员。例如：static myProperty: string = 'value'; 和 static myMethod() {}，然后通过 ClassName.myProperty 或 ClassName.myMethod() 直接调用。" },
			{ h: "静态成员在继承中是如何工作的", p: "静态成员会被子类继承。子类可以直接使用父类的静态成员，也可以重写同名的静态成员。重写后，通过子类调用时会执行子类的版本。" },
		],
		extend: ["能否在静态方法中使用 this 关键字？", "static 成员的常见应用场景有哪些？", "如果子类没有重写父类的静态方法，如何调用？", "静态属性在什么时候被初始化？"]
	},
	{
		id: "ts-009",
		cat: "ts",
		level: 2,
		hot: 66,
		source: "面试鸭 · TypeScript",
		title: "TypeScript 的类有哪些成员可见性？",
		short: "TypeScript 中类的成员可见性修饰符主要有三个：public、private 和 protected。",
		points: [
			"TypeScript 的类成员有三个主要的可见性修饰符：public、private 和 protected。",
			"public: 默认的修饰符，表示类成员可以在任何地方访问，没有限制。",
			"private: 表示类成员只能在声明它的类内部访问，不能在类的实例以及子类中访问。",
			"protected: 表示类成员可以在声明它的类及其子类中访问，但不能在类的实例中访问。",
		],
		detail: [
			{ h: "整体回答", p: "TypeScript 中类的成员可见性修饰符主要有三个：public、private 和 protected。public 是默认修饰符，表示成员可以在任何地方访问；private 表示成员只能在声明它的类内部访问；protected 表示成员可以在类及其子类中访问，但不能在类实例中外部访问。" },
			{ h: "如果不写可见性修饰符，TypeScript 类成员的默认访问级别是什么", p: "如果不写可见性修饰符，TypeScript 类成员的默认访问级别是 public，意味着该成员可以在类的内部、外部实例以及子类中被访问。" },
			{ h: "private 修饰符的作用是什么？能否在子类或实例中访问 private 成员", p: "private 修饰符用于限制类成员仅能在其声明的类内部访问。它不能在子类或类的实例中被访问，外部代码无法读取或修改 private 成员，从而实现封装和隐藏实现细节。" },
			{ h: "protected 修饰符与 private 有何区别", p: "protected 修饰符允许类成员在声明它的类及其子类中访问，而 private 成员只能在声明它的类内部访问。因此，protected 成员可以在子类中被使用，但不能通过类的实例在外部访问。" },
		],
		extend: ["public 成员如何在类外部访问？请举例说明。", "readonly 修饰符的作用是什么？它可以和哪些可见性修饰符一起使用？", "为什么不能在类外部访问 private 或 protected 成员？", "在子类中能否访问父类的 protected 属性？"]
	},
	{
		id: "ts-010",
		cat: "ts",
		level: 2,
		hot: 65,
		source: "面试鸭 · TypeScript",
		title: "什么是 TypeScript 的 void 类型？",
		short: "常见的例子就是在编写一个日志类函数时：",
		points: [
			"TypeScript 的 void 类型与 JavaScript 中的 undefined 稍有不同。",
			"function logMessage(message: string): void {…",
		],
		detail: [
			{ h: "void 类型可以用于变量吗", p: "虽然 TypeScript 允许将 void 类型用于变量（例如 let unusable: void = undefined;），但这种做法不推荐，因为 void 类型的变量只能被赋值为 undefined，实际用途非常有限，且会降低代码可读性。" },
			{ h: "void 和 undefined 有什么区别", p: "undefined 是一个具体的值类型，表示未定义的值；而 void 是一种类型约束，用于表示函数没有有意义的返回值。在函数返回类型中使用 void 时，函数可以返回 undefined 或不显式返回任何值。" },
			{ h: "为什么要在函数中显式使用 void 作为返回类型", p: "显式声明函数返回类型为 void 可以提高代码的可读性和可维护性，让开发者清楚地知道该函数的目的是执行操作而非返回数据，同时也便于类型检查器进行更严格的校验。" },
			{ h: "void 类型与 any 和 unknown 有何不同", p: "any 表示任意类型，会绕过类型检查；unknown 表示未知类型，需要类型断言或检查才能使用；而 void 特指函数没有返回值，三者语义完全不同。" },
		],
		extend: ["在泛型中如何使用 void？", "如果一个 void 函数写了 return 语句，会发生什么？", "箭头函数能否使用 void 返回类型？"]
	},
	{
		id: "ts-011",
		cat: "ts",
		level: 2,
		hot: 65,
		source: "面试鸭 · TypeScript",
		title: "TypeScript 类的 readonly 修饰符有什么作用？",
		short: "readonly 修饰符用于标记类、接口或类型中的属性为只读，表示该属性只能在声明时或构造函数中被初始化，之后不能再被修改。",
		points: [
			"在 TypeScript 中，我们可以使用 readonly 修饰符来声明一个类的属性为只读，这样的属性一旦在构造函数中初始化之后，…",
			"TypeScript 的 readonly 修饰符用于确保类的属性在初始化之后不可修改。",
			"class Per…",
		],
		detail: [
			{ h: "整体回答", p: "readonly 修饰符用于标记类、接口或类型中的属性为只读，表示该属性只能在声明时或构造函数中被初始化，之后不能再被修改。TypeScript 在编译阶段会检查对 readonly 属性的赋值操作，若尝试修改则报错，从而增强代码的稳定性和可维护性。" },
			{ h: "readonly 可以用在哪些场景中", p: "readonly 可以用于类的属性、接口和类型别名中。它适用于需要保证某些属性在对象创建后不可变的场景，例如配置对象、实体模型或不可变数据结构，帮助开发者避免意外修改关键数据。" },
			{ h: "如何正确使用 readonly 在类中声明只读属性", p: "在类中，使用 readonly 关键字修饰属性，并在构造函数中进行初始化。例如：class Person { readonly name: string; constructor(name: string) { this.name = name; } }。此后任何对该属性的重新赋值都将导致编译错误。" },
			{ h: "尝试修改 readonly 属性会发生什么", p: "尝试修改一个被 readonly 修饰的属性会在 TypeScript 编译阶段触发错误，提示类似 'Cannot assign to because it is a read-only property' 的信息，阻止非法写操作，确保属性的不可变性。" },
		],
		extend: ["readonly 和 const 有什么区别？", "readonly 能否与接口一起使用？", "readonly 是否影响运行时行为？", "能否在数组或对象上使用 readonly？"]
	},
	{
		id: "ts-012",
		cat: "ts",
		level: 1,
		hot: 65,
		source: "面试鸭 · TypeScript",
		title: "为什么要使用 TypeScript？TypeScript 有哪些常用特性？",
		short: "TypeScript 是 JavaScript 的超集，提供了静态类型检查，能在编译时发现类型错误，减少运行时异常。",
		points: [
			"TypeScript 是 JavaScript 的超集，它为 JavaScript 添加了 静态类型检查 …",
			"TypeScript 的特性非常多，在官方文档可以看到详细的介绍，",
		],
		detail: [
			{ h: "整体回答", p: "TypeScript 是 JavaScript 的超集，提供了静态类型检查，能在编译时发现类型错误，减少运行时异常。它增强了代码的可读性、可维护性和可重构性，尤其适合大型项目和团队协作。同时，TypeScript 支持最新的 ECMAScript 特性，并提供优秀的 IDE 支持，如智能提示、自动补全和重构工具，提升开发效率。" },
			{ h: "TypeScript 的核心特性是什么", p: "TypeScript 的核心特性是静态类型检查，允许开发者在编码阶段定义变量、函数参数和返回值的类型，从而在编译时捕获类型错误，提高代码健壮性。" },
			{ h: "TypeScript 中接口（Interface）的作用是什么", p: "接口用于定义对象的结构，规定其应包含的属性和方法。它可以用于类型检查，确保传入的对象符合预期格式，使代码更清晰、更易于维护。" },
			{ h: "类型别名（Type Alias）有什么用途", p: "类型别名用于为复杂类型创建简洁的名称，特别适用于联合类型或嵌套对象类型，提高代码可读性和复用性。例如：type ID = string | number;。" },
		],
		extend: ["联合类型和交叉类型的区别是什么？", "什么是泛型（Generics）？它的作用是什么？", "TypeScript 如何进行类型推断？", "TypeScript 支持哪些现代语言特性？"]
	},
	{
		id: "ts-013",
		cat: "ts",
		level: 2,
		hot: 65,
		source: "面试鸭 · TypeScript",
		title: "TypeScript 的关键字 infer 有什么作用？",
		short: "infer 关键字用于在条件类型中进行类型推断，它可以从复杂或未知的类型结构中提取出类型变量。",
		points: [
			"TypeScript 中的关键字 infer 通常与条件类型（conditional types）一起使用，…",
			"简而言之，infer 关键字的主要作用就是“推断类型变量”。",
			"条件类型通常写作…",
		],
		detail: [
			{ h: "整体回答", p: "infer 关键字用于在条件类型中进行类型推断，它可以从复杂或未知的类型结构中提取出类型变量。通常与 extends 条件类型配合使用，实现类型提取和转换，例如提取函数返回值类型、数组元素类型等。" },
			{ h: "infer 可以用在哪些场景下", p: "infer 常用于提取函数的返回值类型（如 ReturnType）、参数类型、数组元素类型、元组类型分解、嵌套结构的深层类型提取等场景，适用于需要动态推导类型的泛型编程中。" },
			{ h: "如何使用 infer 提取函数的返回值类型", p: "可以通过条件类型定义一个泛型工具类型，例如：type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never; 当传入函数类型时，infer R 会自动推断其返回值类型并作为结果返回。" },
			{ h: "infer 能否用于数组类型的元素提取", p: "可以。例如定义 type ElementType<T> = T extends (infer U)[] ? U : T; 当 T 是 number[] 时，ElementType<T> 会推断为 number，实现了从数组中提取元素类型的功能。" },
		],
		extend: ["如何用 infer 实现嵌套数组的深层类型提取？", "infer 是否可以在多个分支中使用？", "使用 infer 时需要注意什么？", "infer 如何提升类型安全？"]
	},
	{
		id: "ts-014",
		cat: "ts",
		level: 2,
		hot: 64,
		source: "面试鸭 · TypeScript",
		title: "什么是 TypeScript 的 object 类型？",
		short: "TypeScript 中的 object 类型表示非原始类型，即不包括 number、string、boolean、symbol、null 和 undefined 等基本类型。",
		points: [
			"TypeScript 的 object 类型用于表示非原始类型，即不包括 number, string, boolean, symbol, …",
			"TypeScript 中的 object 类型表示非原始类型，即不包括 number、string、boolean、symbol、null 和 …",
		],
		detail: [
			{ h: "整体回答", p: "TypeScript 中的 object 类型表示非原始类型，即不包括 number、string、boolean、symbol、null 和 undefined 等基本类型。它用于描述 JavaScript 对象，可以是普通对象、数组、函数等对象类型，但不能是原始值。" },
			{ h: "object 类型可以赋值哪些值", p: "object 类型可以赋值为任意对象，如普通对象 {}、数组 []、函数 function() 等，但不能赋值为原始类型，如字符串、数字、布尔值等。" },
			{ h: "object 和 Object（首字母大写）有什么区别", p: "object 是非原始类型，只允许对象类型，不允许基本类型；而 Object 是顶级类型（Top Type），它可以接受所有类型，包括基本类型如 number、string 等。" },
			{ h: "object 和 {} 有什么不同", p: "{} 类型在 TypeScript 中表示空对象类型，但它实际上允许任何类型的值（包括基本类型），行为接近于 Object；而 object 不允许基本类型，更加严格。" },
		],
		extend: ["为什么推荐使用接口或类型别名而不是 object？", "如何定义一个键为字符串、值为数字的对象类型？", "可以在 object 类型上直接访问属性吗？", "什么是类型断言，如何在 object 上使用？"]
	},
	{
		id: "ts-015",
		cat: "ts",
		level: 2,
		hot: 64,
		source: "面试鸭 · TypeScript",
		title: "什么是 TypeScript 的 never 类型？",
		short: "举个简单的例子：",
		points: [
			"TypeScript 的 never 类型表示那些永不存在的值。",
			"function error(message: string): never {…",
			"throw new Error(message);…",
		],
		detail: [
			{ h: "never 类型有哪些典型使用场景", p: "never 类型的典型使用场景包括：1）函数抛出异常，不会正常返回；2）函数包含无限循环，无法终止；3）在类型守卫中表示不可能到达的代码分支，用于死代码检测和类型收窄。" },
			{ h: "为什么 throw 语句的返回类型是 never", p: "因为 throw 语句会中断函数执行并抛出错误，函数后续代码不会被执行，也不会有正常的返回值，所以 TypeScript 将其返回类型推断为 never，表示该函数永远不会有返回结果。" },
			{ h: "never 和 void 有什么区别", p: "void 表示函数正常执行完毕但没有返回值，是可以结束的；而 never 表示函数永远不会结束（如抛出异常或无限循环），是不可达的终点。void 可以被赋值给其他变量，而 never 不能被任何类型赋值，且 never 是所有类型的子类型。" },
			{ h: "为什么说 never 是所有类型的子类型", p: "在 TypeScript 类型系统中，never 被设计为所有类型的子类型，意味着它可以被赋值给任意类型。这一特性使得 never 在联合类型中可以被自动移除（如 string | number | never 等价于 string | number），也支持类型推导中的安全处理。" },
		],
		extend: ["如何利用 never 实现 exhaustive checking（穷尽性检查）？", "infinite loop 函数的返回类型为什么是 never？", "never 类型能被赋值给其他变量吗？", "能不能声明一个 never 类型的变量并赋值？"]
	},
	{
		id: "ts-016",
		cat: "ts",
		level: 2,
		hot: 64,
		source: "面试鸭 · TypeScript",
		title: "TypeScript 的关键字 extends 有什么作用？",
		short: "在 TypeScript 中，extends 主要有两个用途：一是实现类的继承，使子类可以继承父类的属性和方法；二是用于泛型约束，…",
		points: [
			"name: string;…",
			"在 TypeScript 中，关键字 extends 主要用于表示类型继承和类型约束。",
			"类型继承：用来实现类的继承。",
		],
		detail: [
			{ h: "整体回答", p: "在 TypeScript 中，extends 主要有两个用途：一是实现类的继承，使子类可以继承父类的属性和方法；二是用于泛型约束，限定泛型参数必须符合某个类型或具有某些结构特征。" },
			{ h: "如何使用 extends 实现类的继承", p: "通过在类声明时使用 'class Child extends Parent' 的语法，子类可以继承父类的所有公共和受保护成员，并可添加新的方法或重写已有方法。例如：'class Dog extends Animal' 表示 Dog 类继承自 Animal 类。" },
			{ h: "什么是泛型约束？如何用 extends 实现", p: "泛型约束是通过 extends 关键字限制泛型参数的类型范围，确保传入的类型具备某些特定属性或方法。例如：'function logLength<T extends Lengthwise>(arg: T)' 表示泛型 T 必须具有 length 属性。" },
			{ h: "接口之间能否使用 extends？如何使用", p: "可以。接口可以通过 extends 继承一个或多个其他接口，从而合并它们的成员。例如：'interface Square extends Shape' 表示 Square 接口包含了 Shape 接口的所有成员，并可添加新的成员。" },
		],
		extend: ["TypeScript 中如何实现多重继承的效果？", "条件类型中的 extends 是什么意思？", "能否用 extends 约束泛型必须是某个类的实例？", "使用 extends 进行类型约束时，如果传入不符合约束的类型会发生什么？"]
	},
	{
		id: "ts-017",
		cat: "ts",
		level: 2,
		hot: 64,
		source: "面试鸭 · TypeScript",
		title: "什么是 TypeScript 的 unknown 类型？和 any 类型有什么区别？",
		short: "unknown 是 TypeScript 中的一种顶层类型，表示一个我们不知道其具体类型的值。",
		points: [
			"为什么使用 unknown:…",
			"TypeScript 的 unknown 类型表示我们不知道的值，它和 any 类型都能够表示所有值，但有本质区别。",
			"也就是说，unknown 更加安全和严格，它要求你在使用值之前必须明确其类型。",
		],
		detail: [
			{ h: "整体回答", p: "unknown 是 TypeScript 中的一种顶层类型，表示一个我们不知道其具体类型的值。它可以接收任意类型的值，但在使用该值之前必须进行类型检查或类型断言，以确保类型安全。" },
			{ h: "unknown 和 any 的主要区别是什么", p: "主要区别在于类型安全性：any 会绕过所有类型检查，允许对值进行任意操作；而 unknown 要求在执行大多数操作前必须进行类型检查或断言，因此更加严格和安全。" },
			{ h: "为什么推荐用 unknown 代替 any", p: "因为 unknown 强制开发者在使用值之前进行类型检查，能够更好地利用 TypeScript 的类型系统，减少运行时错误，提升代码的健壮性和可维护性。" },
			{ h: "能否直接操作 unknown 类型的变量", p: "不能。直接操作 unknown 类型的变量会报错，必须先通过类型守卫、类型断言或条件判断等方式确定其具体类型后才能进行相应操作。" },
		],
		extend: ["如何安全地使用 unknown 类型的值？", "unknown 类型可以赋值给其他类型吗？", "any 和 unknown 都是顶级类型吗？", "在函数参数中使用 unknown 有什么好处？"]
	},
	{
		id: "ts-018",
		cat: "ts",
		level: 2,
		hot: 64,
		source: "面试鸭 · TypeScript",
		title: "什么是 TypeScript 的 Function 类型？",
		short: "下面来详细解释一下什么是 TypeScript 的 Function 类型以及如何使用它：",
		points: [
			"在 TypeScript 中，Function 类型是一种用于对函数签名进行类型约束的类型标注。",
			"在 TypeScript 中，我们可以使用 Function 类型来约束一个变量，使得这个变…",
		],
		detail: [
			{ h: "如何在 TypeScript 中声明一个函数类型的变量", p: "可以通过赋值签名的方式声明函数类型变量，例如：let myFunction: (a: number, b: number) => number;，这表示该变量必须是一个接收两个 number 参数并返回 number 的函数。" },
			{ h: "能否使用接口来定义函数类型？如果可以，请举例说明。", p: "可以。使用接口可以更清晰地定义函数类型，尤其适用于复杂场景。例如：interface MyFunction { (a: number, b: number): number; }，然后可以将变量声明为 let add: MyFunction = (x, y) => x + y;。" },
			{ h: "TypeScript 中如何处理函数类型中的可选参数", p: "在函数类型中，可以通过在参数名后加 ? 来标记可选参数。例如：(a: number, b?: number) => number 表示第二个参数是可选的，在实现时可以为其提供默认值。" },
			{ h: "什么是混合类型的函数？如何在 TypeScript 中实现", p: "混合类型函数是指既可被调用又拥有属性或方法的函数。可以通过接口定义这种类型，例如：interface Counter { (start: number): string; interval: number; reset(): void; }，然后实现该接口的函数可以同时作为函数调用和访问其属性。" },
		],
		extend: ["TypeScript 中有哪些内置的函数相关类型？", "为什么推荐使用显式的函数类型注解而不是泛泛的 Function 类型？", "在函数类型中设置默认参数时需要注意什么？", "函数类型与 JavaScript 中的普通函数有何区别？"]
	},
	{
		id: "ts-019",
		cat: "ts",
		level: 2,
		hot: 64,
		source: "面试鸭 · TypeScript",
		title: "什么是 TypeScript 的索引访问类型？",
		short: "比如说，我们有一个接口 Person ：",
		points: [
			"name: string;…",
			"age: number;…",
			"TypeScript 的索引访问类型（Indexed Access Types），有时候也被称为查找类型（Lookup Type），…",
		],
		detail: [
			{ h: "如何使用索引访问类型获取对象属性的类型", p: "你可以使用类型语法 T[K] 来获取类型 T 中属性 K 的类型。例如：type NameType = Person['name']，结果 NameType 就是 string 类型。" },
			{ h: "索引访问类型可以和联合类型一起使用吗", p: "可以。当联合类型作为键的类型时，索引访问类型会返回对应属性类型的联合类型。例如：type PersonValues = Person['name' | 'age'] 得到 string | number。" },
			{ h: "keyof 操作符在索引访问类型中有什么作用", p: "keyof 操作符用于获取一个类型的全部键的联合类型。它常与索引访问类型结合使用，确保键的合法性，例如泛型函数中约束 K 必须是 T 的键：K extends keyof T。" },
			{ h: "索引访问类型如何提升泛型函数的类型安全性", p: "在泛型函数中，通过 T[K] 返回值类型可以精确表示根据传入键获取的属性类型，避免 any 或不准确的类型。例如 getProperty(obj, key) 的返回类型为 T[K]，能正确推导出具体属性类型。" },
		],
		extend: ["能否用索引访问类型实现条件类型中的类型判断？", "如果访问一个不存在的属性，索引访问类型会发生什么？", "索引访问类型支持嵌套对象吗？", "索引访问类型和映射类型有何区别？"]
	},
	{
		id: "ts-020",
		cat: "ts",
		level: 2,
		hot: 63,
		source: "面试鸭 · TypeScript",
		title: "什么是 TypeScript 的 any 类型？",
		short: "举个简单的例子，假设你有一个变量 x，你不知道它会是什么类型，你可以定义它为 any 类型：",
		points: [
			"TypeScript 的 any 类型是一个特殊的类型，用来表示可以是任何类型的值。",
			"let x: any;…",
			"x = 42; // OK…",
		],
		detail: [
			{ h: "在什么情况下可以使用 any 类型", p: "通常在从 JavaScript 迁移项目到 TypeScript 时、第三方库类型定义不全或接口需要接收多种类型参数的情况下，可以暂时使用 any 类型来提高灵活性，但应尽量减少使用以保证类型安全。" },
			{ h: "使用 any 类型有什么风险", p: "使用 any 类型会失去 TypeScript 提供的类型安全性，编译器不会对 any 类型的变量做类型检查，这可能导致运行时错误，并降低代码的可维护性和开发时的智能提示体验。" },
			{ h: "any 和 unknown 的区别是什么", p: "any 和 unknown 都可以接受任意类型的值，但 any 会完全绕过类型检查，而 unknown 虽然也可以赋任意类型，但在使用时必须先进行类型检查（如类型守卫），因此 unknown 更加类型安全。" },
			{ h: "如何安全地替代 any 类型", p: "可以使用 unknown 类型作为 any 的更安全替代方案。此外，还可以结合类型断言、类型守卫和泛型等机制，在保持灵活性的同时增强类型安全性。" },
		],
		extend: ["为什么建议避免过度使用 any？", "能否为 any 类型的变量调用方法或属性？", "如何将 any 类型转换为更具体的类型？", "any 类型是否会影响 TypeScript 的类型推断？"]
	},
	{
		id: "ts-021",
		cat: "ts",
		level: 2,
		hot: 63,
		source: "面试鸭 · TypeScript",
		title: "什么是 TypeScript 的条件类型？",
		short: "基本形式与语法：",
		points: [
			"条件类型是 TypeScript 中的一种高级类型工具，它允许我们根据一个条件来选择类型。",
			"T extends U ?…",
		],
		detail: [
			{ h: "条件类型的语法结构是怎样的", p: "条件类型的语法结构为 T extends U ? X : Y，其中 T 是被检查的类型，U 是目标类型，X 是条件成立时的返回类型，Y 是条件不成立时的返回类型。这与 JavaScript 中的三元表达式类似，但作用于类型层面。" },
			{ h: "如何理解 T extends U 在条件类型中的含义", p: "T extends U 并非表示类型继承，而是表示类型 T 是否可以赋值给类型 U，即 T 是否满足 U 的约束。例如，string 类型可以赋值给 string | number，因此 string extends string | number 为真。这是类型兼容性判断，而非面向对象中的继承概念。" },
			{ h: "什么是分布式条件类型", p: "分布式条件类型是指当条件类型作用于联合类型时，会自动将该条件分配到联合类型的每一个成员上，并最终合并结果。例如，type Example<T> = T extends string ? 'yes' : 'no'; 在 Example<string | number> 中会被分解为 Example<string> 和 Example<number>，得到 'yes' | 'no'。这种特性常用于类型过滤操作。" },
			{ h: "如何使用条件类型实现类型过滤", p: "可以通过条件类型将联合类型中符合条件的成员排除。例如：type Filter<T, U> = T extends U ? never : T;，当 T 是 U 的子类型时返回 never，从而在联合类型中将其移除。如 Filter<string | number, number> 结果为 string。" },
		],
		extend: ["TypeScript 中有哪些基于条件类型的内置工具类型？", "为什么 never 在条件类型中特殊处理？", "条件类型可以用于哪些实际开发场景？", "使用条件类型时需要注意什么问题？"]
	},
	{
		id: "ts-022",
		cat: "ts",
		level: 2,
		hot: 63,
		source: "面试鸭 · TypeScript",
		title: "TypeScript 的类型操作符 keyof 有什么作用？",
		short: "keyof 操作符用于获取一个对象类型的所有键名，并生成一个由这些键名组成的字符串或数字字面量的联合类型。",
		points: [
			"name: string;…",
			"age: number;…",
			"keyof 是 TypeScript 中非常重要的类型操作符。",
		],
		detail: [
			{ h: "整体回答", p: "keyof 操作符用于获取一个对象类型的所有键名，并生成一个由这些键名组成的字符串或数字字面量的联合类型。例如，对于类型 Person，keyof Person 的结果是 \\\"name\\\" | \\\"age\\\" | \\\"location\\\"，表示该对象所有可能的键。" },
			{ h: "如何使用 keyof 实现函数参数的类型安全约束", p: "可以通过泛型结合 keyof 来约束函数的参数，使其只能接受对象中存在的键。例如：function getProperty<T, K extends keyof T>(obj: T, key: K) { return obj[key]; }，这样调用时传入的 key 必须是 obj 属性之一，否则会触发 TypeScript 编译错误。" },
			{ h: "keyof 如何与映射类型配合使用", p: "keyof 可以与映射类型结合，遍历对象类型的键来创建新类型。例如：type ReadonlyPerson = { readonly [K in keyof Person]: Person[K]; }，这将生成一个所有属性都为只读的新类型，等效于在每个属性前加 readonly 修饰符。" },
			{ h: "keyof 能否用于基本类型或非对象类型", p: "不能直接用于基本类型如 string、number、boolean 等。keyof 只适用于对象类型、类类型或能够具有属性的类型。对基本类型使用 keyof 会导致编译错误，除非是包装对象类型（如 String、Number），但通常不推荐这样做。" },
		],
		extend: ["keyof 在联合类型上的行为是怎样的？", "如何使用 keyof 和条件类型筛选特定类型的键？", "keyof 的返回类型一定是字符串吗？", "什么是 keyof 的索引类型查询？"],
		code: "type Person = {\n  name: string;\n  age: number;\n  location: string;\n};"
	},
	{
		id: "ts-023",
		cat: "ts",
		level: 2,
		hot: 63,
		source: "面试鸭 · TypeScript",
		title: "什么是 TypeScript 的映射类型？",
		short: "回答重点 TypeScript 的映射类型是一种高级类型，它允许我们根据已有类型生成新的类型。",
		points: [
			"TypeScript 的映射类型是一种高级类型，它允许我们根据已有类型生成新的类型。",
			"TypeScript 的映射类型是一种高级类型，它允许我们基于已有的类型生成新的类型。",
		],
		detail: [
			{ h: "映射类型的基本语法是什么", p: "映射类型的基本语法是：{ [P in keyof T]: T[P]; }，其中 T 是源类型，keyof T 获取 T 的所有键名，P 遍历这些键名，T[P] 表示对应属性的类型，最终生成一个新类型。" },
			{ h: "如何使用映射类型实现 Partial", p: "Partial 映射类型将原类型的每个属性变为可选。其定义为：type Partial<T> = { [P in keyof T]?: T[P]; }，通过在属性后添加 ? 实现可选。" },
			{ h: "Readonly 映射类型的作用是什么", p: "Readonly 映射类型将原类型的每个属性设为只读，防止被重新赋值。其定义为：type Readonly<T> = { readonly [P in keyof T]: T[P]; }。" },
			{ h: "Pick 映射类型有什么用途", p: "Pick 映射类型用于从原类型中选择一组指定的属性来创建新类型。其定义为：type Pick<T, K extends keyof T> = { [P in K]: T[P]; }，适用于提取对象的部分结构。" },
		],
		extend: ["Record 映射类型的使用场景是什么？", "keyof 关键字在映射类型中的作用是什么？", "映射类型是否支持嵌套类型的处理？", "如何自定义一个将所有属性设为必填的映射类型？"]
	},
	{
		id: "ts-024",
		cat: "ts",
		level: 2,
		hot: 63,
		source: "面试鸭 · TypeScript",
		title: "TypeScript 的类型操作符 typeof 有什么作用？",
		short: "TypeScript 中的 typeof 操作符有两个主要用途：一是在运行时获取值的类型（与 JavaScript 相同），二是在静态类型检查时获取变量或表达式的类型，…",
		points: [
			"在运行时，用来获取一个值的类型…",
			"在静态类型检查时，用来获取一个已有变量的类型，主要用于类型推断…",
			"typeof 是 TypeScript 中的一个关键字，用来获取变量或表达式的类型。",
		],
		detail: [
			{ h: "整体回答", p: "TypeScript 中的 typeof 操作符有两个主要用途：一是在运行时获取值的类型（与 JavaScript 相同），二是在静态类型检查时获取变量或表达式的类型，用于类型推断和类型复用。" },
			{ h: "typeof 在 TypeScript 和 JavaScript 中的区别是什么", p: "在 JavaScript 中，typeof 只能在运行时返回值的原始类型字符串（如 'number'、'string' 等）。而在 TypeScript 中，除了运行时行为外，typeof 还可在编译时被用于类型系统中，提取变量的类型并用于类型定义，例如 type T = typeof value。" },
			{ h: "如何使用 typeof 实现类型推断", p: "可以通过 type NewType = typeof variable 的语法来让 TypeScript 根据已有变量的值自动推断出其类型。例如：let x = 10; type XType = typeof x; 此时 XType 被推断为 number 类型。" },
			{ h: "为什么在 TypeScript 中使用 typeof 来获取对象的类型", p: "使用 typeof 可以精确获取对象的结构类型（包括属性名和对应类型），从而实现类型安全和复用。尤其当对象是常量或配置项时，可以避免手动重复书写类型定义。" },
		],
		extend: ["typeof 和 keyof 如何结合使用？", "能否用 typeof 获取函数的返回值类型？", "typeof 在处理常量对象时有什么优势？", "下面代码中 type ColorKeys = keyof typeof colors …"]
	},
	{
		id: "ts-025",
		cat: "ts",
		level: 2,
		hot: 62,
		source: "面试鸭 · TypeScript",
		title: "TypeScript 的内置工具类型 Awaited 有什么作用？",
		short: "Awaited 用于提取并解析 Promise 或类似 Promise 的类型所解析出的值类型，能够自动推断异步操作返回值的具体类型，简化对异步代码的类型处理。",
		points: [
			"在 TypeScript 中，Awaited 是一种内置工具类型，用于提取并解析一个 Promise 或者像 Promise …",
			"假设有一个异步函数，我们想要得到它返回值的具体类型。",
			"type Example =…",
		],
		detail: [
			{ h: "整体回答", p: "Awaited 用于提取并解析 Promise 或类似 Promise 的类型所解析出的值类型，能够自动推断异步操作返回值的具体类型，简化对异步代码的类型处理。" },
			{ h: "Awaited 能否处理多层嵌套的 Promise", p: "可以，Awaited 具有递归特性，能解析多层嵌套的 Promise，例如 Promise<Promise<string>> 会被完全解析为 string 类型。" },
			{ h: "如何使用 Awaited 获取 async 函数返回值的实际类型", p: "结合 ReturnType 和 Awaited，如：type Result = Awaited<ReturnType<typeof asyncFunction>>，即可得到 async 函数解析后的值类型。" },
			{ h: "为什么使用 Awaited 比手动类型推断更好", p: "Awaited 减少了手动使用条件类型和 infer 推断的复杂性，避免了冗余代码和潜在的类型错误，使类型系统更简洁、安全。" },
		],
		extend: ["Awaited 在什么场景下特别有用？", "Awaited 是否只适用于标准的 Promise？", "如果类型不是 Promise，Awaited 会如何处理？", "Awaited 是从哪个 TypeScript 版本开始引入的？"]
	},
	{
		id: "ts-026",
		cat: "ts",
		level: 2,
		hot: 62,
		source: "面试鸭 · TypeScript",
		title: "什么是 TypeScript 的模板字面量类型？",
		short: "回答重点 TypeScript 的模板字面量类型（Template Literal Types）是一种类型操作，它允许我们通过字符串模板字面量创建新的字符串类型。",
		points: [
			"TypeScript 的模板字面量类型（Template Literal Types）是一种类型操作，…",
			"你可以把模板字面量类型看作是 JavaScript 中字符串模板字面量（Template Literals）的类型版本。",
		],
		detail: [
			{ h: "模板字面量类型的基本语法是什么", p: "模板字面量类型的语法是使用反引号（）和 ${Type} 插值形式，将一个或多个字符串字面量类型组合成新的字符串类型，例如：${'a'}${'b'} 会生成 'ab' 类型。" },
			{ h: "模板字面量类型能与联合类型一起使用吗", p: "可以，当模板字面量类型中包含联合类型时，TypeScript 会自动展开所有可能的组合。例如：type Method = ${'/user' | '/post'}/${'create' | 'delete'} 会生成 '/user/create' | '/user/delete' | '/post/create' | '/post/delete' 四种类型。" },
			{ h: "如何利用模板字面量类型实现字符串的大小写转换", p: "可以通过条件类型结合 infer 和内置的 Uppercase、Lowercase 等映射类型来实现。例如：type ToUpper<S extends string> = S extends ${infer F}${infer R} ? ${Uppercase<F>}${ToUpper<R>} : S; 可递归地将字符串转为大写。" },
			{ h: "模板字面量类型在实际项目中有哪些应用场景", p: "常见应用场景包括：定义 API 路由路径、构建事件名称（如 'user:created'）、状态管理中的 action type、国际化 key 的类型约束等，能够提升字符串值的类型安全性和可维护性。" },
		],
		extend: ["模板字面量类型如何与 infer 结合进行模式匹配？", "TypeScript 内置了哪些与模板字面量类型相关的工具类型？", "模板字面量类型是否支持数字和布尔类型的插值？", "能否用模板字面量类型限制函数参数的合法值？"]
	},
	{
		id: "ts-027",
		cat: "ts",
		level: 2,
		hot: 62,
		source: "面试鸭 · TypeScript",
		title: "TypeScript 的内置工具类型 Partial 有什么作用？",
		short: "Partial 是 TypeScript 的内置工具类型，用于将某个类型的属性全部变为可选。",
		points: [
			"name: string;…",
			"age: number;…",
			"const partialUser: Partial<User> = {…",
		],
		detail: [
			{ h: "整体回答", p: "Partial 是 TypeScript 的内置工具类型，用于将某个类型的属性全部变为可选。通过 Partial<T>，可以创建一个新的类型，其中原类型 T 的所有属性都变成可选项，适用于部分更新对象的场景。" },
			{ h: "如何使用 Partial 在 React 状态更新中", p: "在 React 中，当状态接口包含多个属性时，可以使用 Partial<State> 来定义更新函数的参数类型，从而允许只传入需要更新的部分属性，而不需要提供完整的状态对象。" },
			{ h: "Partial 的内部实现原理是什么", p: "Partial 的实现基于 TypeScript 的映射类型，其简化定义为：type Partial<T> = { [P in keyof T]?: T[P]; }。它通过遍历 keyof T 的所有键，并将每个属性标记为可选（?:），从而生成新的可选属性类型。" },
			{ h: "除了 Partial，TypeScript 还有哪些常用的内置工具类型", p: "TypeScript 提供了多种内置工具类型，如 Required（使所有属性必选）、Readonly（使所有属性只读）、Pick（从类型中选择指定属性）、Omit（从类型中排除指定属性）等，它们可用于灵活地组合和转换类型。" },
		],
		extend: ["能否举例说明 Pick 和 Omit 的使用？", "为什么使用 Partial 可以提高代码的灵活性？", "Partial 是否会影响嵌套对象的属性？", "什么时候不应该使用 Partial？"]
	},
	{
		id: "ts-028",
		cat: "ts",
		level: 2,
		hot: 62,
		source: "面试鸭 · TypeScript",
		title: "TypeScript 的内置工具类型 Omit 有什么作用？",
		short: "Omit 工具类型用于从一个对象类型中剔除指定的属性，生成一个新的类型。",
		points: [
			"id: number;…",
			"name: string;…",
			"TypeScript 的内置工具类型 Omit 是用来从一个类型中剔除某些属性的。",
		],
		detail: [
			{ h: "整体回答", p: "Omit 工具类型用于从一个对象类型中剔除指定的属性，生成一个新的类型。它是 Pick 的逆向操作，常用于基于已有类型创建部分省略属性的新类型。" },
			{ h: "如何使用 Omit 从类型中删除某个属性", p: "可以通过 Omit<T, K> 的形式使用，其中 T 是原类型，K 是要剔除的属性名。例如：type NewType = Omit<User, 'age'> 会创建一个去掉 'age' 属性的 User 类型。" },
			{ h: "Omit 的内部实现原理是什么", p: "Omit 的实现是 type Omit<T, K> = Pick<T, Exclude<keyof T, K>>。它首先通过 keyof T 获取所有键，再用 Exclude 排除指定的键 K，最后用 Pick 挑选出剩余的键来构成新类型。" },
			{ h: "Omit 和 Pick 有什么区别", p: "Pick 用于从类型中选取某些属性生成新类型，而 Omit 则是排除某些属性后生成新类型，两者功能相反，互为补充。" },
		],
		extend: ["能否在嵌套对象中使用 Omit 剔除深层属性？", "Omit 如何与其他工具类型结合使用？", "使用 Omit 时，如果剔除的属性不存在会发生什么？", "Omit 在实际项目中的常见应用场景有哪些？"]
	},
	{
		id: "ts-029",
		cat: "ts",
		level: 2,
		hot: 61,
		source: "面试鸭 · TypeScript",
		title: "TypeScript 的内置工具类型 Pick 有什么作用？",
		short: "Pick 是 TypeScript 的内置工具类型，用于从一个已有类型中选择指定的属性，创建一个只包含这些属性的新类型。",
		points: [
			"name: string;…",
			"age: number;…",
			"Pick 是 TypeScript 的一个内置工具类型，用于从现有类型中选择部分属性，并创建一个新类型。",
		],
		detail: [
			{ h: "整体回答", p: "Pick 是 TypeScript 的内置工具类型，用于从一个已有类型中选择指定的属性，创建一个只包含这些属性的新类型。例如，Pick<Person, 'name' | 'age'> 会生成一个仅包含 name 和 age 属性的新类型。" },
			{ h: "Pick 如何使用？能否举例说明", p: "Pick 的语法是 Pick<T, K>，其中 T 是原类型，K 是要选取的属性名的联合类型。例如，interface Person { name: string; age: number; address: string; }，使用 type PersonNameAndAge = Pick<Person, 'name' | 'age'> 可创建只含 name 和 age 的新类型。" },
			{ h: "Pick 和 Omit 的区别是什么", p: "Pick 用于从原类型中选择某些属性生成新类型，而 Omit 则是排除指定属性后生成剩余属性的新类型。例如，Pick<Person, 'name'> 只保留 name，Omit<Person, 'address'> 则移除 address，保留其他属性。" },
			{ h: "如何实现一个与 Pick 功能相同的自定义工具类型", p: "可以通过映射类型和 keyof 操作符手动实现 Pick。例如：type MyPick<T, K extends keyof T> = { [P in K]: T[P]; }。这个类型会遍历 K 中的每个属性名，并从 T 中取出对应类型，构建新类型。" },
		],
		extend: ["Pick 能否与 Partial、Readonly 等工具类型组合使用？", "Pick 的第二个类型参数为什么必须是 keyof T 的子集？", "Pick 在实际项目中的常见应用场景有哪些？", "如果尝试使用 Pick 提取不存在的属性会发生什么？"],
		code: "interface Person {\n  name: string;\n  age: number;\n  address: string;\n}"
	},
	{
		id: "ts-030",
		cat: "ts",
		level: 2,
		hot: 61,
		source: "面试鸭 · TypeScript",
		title: "TypeScript 的内置工具类型 Record 有什么作用？",
		short: "Record<K, T> 用于构造一个对象类型，其属性键的类型为 K，属性值的类型为 T。",
		points: [
			"TypeScript 中的内置工具类型 Record 用来构建一个对象类型，其属性键是指定的 Key 类型，属性值是指定的 Value 类型。",
			"type UserAges = Record<string, number>;…",
		],
		detail: [
			{ h: "整体回答", p: "Record<K, T> 用于构造一个对象类型，其属性键的类型为 K，属性值的类型为 T。它常用于将某个类型的属性映射到另一个类型，简化对象类型的定义。例如，Record<string, number> 表示一个所有属性名都是字符串、属性值都是数字的对象类型。" },
			{ h: "如何使用 Record 定义一个属性名为字符串、属性值为布尔的对象类型", p: "可以使用 Record<string, boolean> 来定义。例如：type Flags = Record<string, boolean>; const permissions: Flags = { isAdmin: true, canEdit: false };…" },
			{ h: "Record 能否限制属性名的具体取值，而不仅仅是类型", p: "可以。通过将第一个类型参数设为联合类型，即可限制具体的属性名。例如：type Direction = 'up' | 'down'; type DirectionConfig = Record<Direction, string>; 这样对象只能有 'up' 和 'down' 两个键。" },
			{ h: "Record<string, any> 和普通对象类型有什么区别", p: "Record<string, any> 表示一个索引签名对象，所有字符串属性的值都为 any 类型。虽然灵活性高，但会失去类型检查的优势；相比之下，明确指定属性和类型的接口更安全、可读性更好。" },
		],
		extend: ["Record 工具类型的底层实现原理是什么？", "什么时候应该使用 Record，什么时候使用接口或类型别名直接定义对象？", "能否用 Record 来表示嵌套的对象结构？", "Record 是否支持数字作为键？"]
	},
	{
		id: "ts-031",
		cat: "ts",
		level: 2,
		hot: 61,
		source: "面试鸭 · TypeScript",
		title: "TypeScript 的内置工具类型 Exclude 有什么作用？",
		short: "Exclude<T, U> 用于从联合类型 T 中排除所有可以赋值给 U 的类型，返回剩余的类型。",
		points: [
			"TypeScript 的内置工具类型 Exclude 可以用来从联合类型中排除特定的类型。简单来说，Exclude<T, U> 会生成一个类型，…",
			"TypeScript 的内置工具类型 Exclude 可以用来从联合类型中排除特定的类型。",
			"type T = 'a'…",
		],
		detail: [
			{ h: "整体回答", p: "Exclude<T, U> 用于从联合类型 T 中排除所有可以赋值给 U 的类型，返回剩余的类型。它常用于过滤联合类型中的某些成员类型。" },
			{ h: "Exclude<T, U> 在什么情况下会返回 never", p: "当 T 中的所有类型都可以赋值给 U 时，Exclude<T, U> 会返回 never。例如，Exclude<'a', 'a'> 的结果是 never。" },
			{ h: "Exclude 是如何实现类型排除的", p: "Exclude 利用了 TypeScript 的条件类型和分布式条件类型的特性。其内部实现为：T extends U ? never : T，即如果 T 中的每个成员属于 U，则返回 never，否则保留该成员。" },
			{ h: "Exclude 可以用来处理对象类型吗", p: "Exclude 主要用于联合类型，对对象类型直接使用效果有限。但如果对象类型构成联合类型的一部分，Exclude 可以从中排除特定的对象类型。" },
		],
		extend: ["Exclude 和 Omit 有什么区别？", "如何用 Exclude 实现一个去除 null 和 undefined 的类型？", "Exclude 能否排除联合类型中的部分字符串字面量？", "为什么 Exclude 是分布式条件类型？"],
		code: "type T = 'a' | 'b' | 'c';\ntype U = 'a';\ntype Result = Exclude<T, U>; // Result 的类型为 'b' | 'c'"
	},
	{
		id: "ts-032",
		cat: "ts",
		level: 2,
		hot: 61,
		source: "面试鸭 · TypeScript",
		title: "TypeScript 的内置工具类型 Required 有什么作用？",
		short: "Required 工具类型的作用是将一个类型中的所有可选属性转换为必需属性。",
		points: [
			"name?: string;…",
			"age?: number;…",
			"TypeScript的内置工具类型Required的作用是将类型中的所有属性都变为必需的（required）。",
		],
		detail: [
			{ h: "整体回答", p: "Required 工具类型的作用是将一个类型中的所有可选属性转换为必需属性。应用 Required 后，对象必须包含该类型的所有属性，不能再省略或设置为 undefined。" },
			{ h: "如何使用 Required 工具类型", p: "可以通过在类型上包裹 Required<T> 来使用。例如：interface User { name?: string; age?: number; }，那么 Required<User> 就会要求 name 和 age 都必须存在且不能为 undefined。" },
			{ h: "Required 工具类型的内部实现原理是什么", p: "Required 的实现基于映射类型和 keyof 操作符，其定义为：type Required<T> = { [P in keyof T]-?: T[P]; }。它遍历类型 T 的所有属性，并通过 -? 移除属性的可选修饰符，使其变为必需。" },
			{ h: "Required 能否用于嵌套对象或深层属性", p: "标准的 Required 只作用于对象的一层属性，不会递归处理嵌套对象。如果需要深层必填，需自定义如 DeepRequired 这样的工具类型来实现递归 Required。" },
		],
		extend: ["Required 与其他工具类型 Partial 有何区别？", "什么时候应该使用 Required 工具类型？", "Required 是否会影响只读属性？", "能否对部分属性使用 Required？"]
	},
	{
		id: "ts-033",
		cat: "ts",
		level: 2,
		hot: 61,
		source: "面试鸭 · TypeScript",
		title: "TypeScript 的内置工具类型 ThisType 有什么作用？",
		short: "ThisType 是 TypeScript 提供的一个内置工具类型，用于在对象字面量中指定方法内 this 的类型。",
		points: [
			"name: string;…",
			"let person: Person & ThisType<{ greet: () => void }>…",
			"ThisType 是 TypeScript 提供的一个内置工具类型，用于在对象字面量类型中指定 this 的类型。",
		],
		detail: [
			{ h: "整体回答", p: "ThisType 是 TypeScript 提供的一个内置工具类型，用于在对象字面量中指定方法内 this 的类型。它不改变类型的结构，而是为上下文中的 this 提供类型提示，确保在对象方法中能正确访问到期望的属性和方法。" },
			{ h: "如何使用 ThisType 来增强对象方法中 this 的类型安全性", p: "可以通过将对象类型与 ThisType 联合使用，例如：Person & ThisType<{ greet: () => void }>，来明确指定在方法中 this 应该具有的类型，从而让 TypeScript 正确推断 this 上可访问的属性和方法。" },
			{ h: "ThisType 是否会实际改变 this 的运行时行为", p: "不会。ThisType 仅是一个编译时的类型提示工具，不影响运行时行为。它只是告诉 TypeScript 编译器在特定上下文中 this 应该被视为什么类型，用于增强类型检查能力。" },
			{ h: "为什么建议配合 noImplicitThis 使用 ThisType", p: "开启 noImplicitThis 编译选项后，TypeScript 会对未明确类型的 this 表达式报错。结合 ThisType 可以显式提供 this 的类型，避免此类错误，提升代码的类型安全性和可维护性。" },
		],
		extend: ["ThisType 在哪些实际项目或框架中有典型应用？", "ThisType 能否单独使用？它的实现机制是什么？", "在什么情况下不应该使用 ThisType？", "如何结合 Partial 或 Readonly 等工具类型与 ThisType 使用？"]
	},
	{
		id: "ts-034",
		cat: "ts",
		level: 2,
		hot: 61,
		source: "面试鸭 · TypeScript",
		title: "TypeScript 的内置工具类型 Readonly 有什么作用？",
		short: "Readonly 是 TypeScript 的内置工具类型，用于将对象类型的所有属性设为只读。",
		points: [
			"name: string;…",
			"TypeScript 的内置工具类型 Readonly 用于将对象类型中的所有属性设为只读。",
			"interface Person {…",
		],
		detail: [
			{ h: "整体回答", p: "Readonly 是 TypeScript 的内置工具类型，用于将对象类型的所有属性设为只读。使用 Readonly<T> 后，T 中的所有属性都不能被重新赋值，从而防止对象数据被意外修改，提升代码的安全性和可维护性。" },
			{ h: "如何使用 Readonly 来定义一个不可变的对象", p: "可以通过将类型包装在 Readonly 中来定义不可变对象。例如：const obj: Readonly<Person> = { name: 'John', age: 30 }; 此时再尝试修改 obj.name 或 obj.age 都会触发编译错误。" },
			{ h: "Readonly 是否会影响嵌套对象的属性", p: "不会。Readonly 只会将第一层属性设为只读，嵌套对象内部的属性仍然是可变的。例如，如果对象有一个 address 属性，使用 Readonly 后仍可以修改 address.city 这样的深层属性。" },
			{ h: "如何实现一个深层只读（DeepReadonly）的工具类型", p: "可以通过递归的方式定义 DeepReadonly 工具类型：type DeepReadonly<T> = { readonly [P in keyof T]: DeepReadonly<T[P]>; }; 这样可以确保对象所有层级的属性都被设为只读。" },
		],
		extend: ["Readonly 常见的应用场景有哪些？", "Readonly 可以和其他工具类型组合使用吗？", "为什么在状态管理中推荐使用 Readonly？", "对数组使用 Readonly 会有什么效果？"],
		code: "interface Person {\n  name: string;\n  age: number;\n}"
	},
	{
		id: "ts-035",
		cat: "ts",
		level: 2,
		hot: 61,
		source: "面试鸭 · TypeScript",
		title: "TypeScript 的内置工具类型 Extract 有什么作用？",
		short: "Extract<T, U> 用于从类型 T 中提取出可以赋值给类型 U 的那些部分，即取 T 和 U 的交集。",
		points: [
			"TypeScript 内置工具类型 Extract 的主要作用是从两个类型中选取其交集部分。",
			"type A = 'foo'…",
			"type B = 'bar'…",
		],
		detail: [
			{ h: "整体回答", p: "Extract<T, U> 用于从类型 T 中提取出可以赋值给类型 U 的那些部分，即取 T 和 U 的交集。它常用于从联合类型中筛选出符合特定条件的子类型。" },
			{ h: "请举一个使用 Extract 的简单例子。", p: "例如：type A = 'foo' | 'bar' | 'baz'; type B = 'bar' | 'qux'; type Result = Extract<A, B>; 此时 Result 类型为 'bar'，因为它是 A 和 B 的共有成员。" },
			{ h: "Extract 与 Exclude 的区别是什么", p: "Extract<T, U> 提取 T 中能够赋值给 U 的类型（交集），而 Exclude<T, U> 则是从 T 中排除可以赋值给 U 的类型（差集）。两者功能相反。" },
			{ h: "Extract 在实际开发中有哪些应用场景", p: "常见应用场景包括：过滤联合类型中的特定成员、在处理事件或配置项时提取符合条件的子类型，以及实现更安全的类型转换和条件判断。" },
		],
		extend: ["如何使用 Extract 从复杂的对象联合类型中提取特定类型？", "Extract 是否可以用于非联合类型？", "Extract 的底层实现原理是什么？", "结合 Pick 和 Extract 可以做什么？"]
	},
	{
		id: "ts-036",
		cat: "ts",
		level: 2,
		hot: 61,
		source: "面试鸭 · TypeScript",
		title: "TypeScript 的内置工具类型 NonNullable 有什么作用？",
		short: "NonNullable 工具类型用于从一个类型中排除 null 和 undefined，生成一个新的非空类型。",
		points: [
			"TypeScript 的内置工具类型 NonNullable 用于从类型中排除 null 和 undefined，从而生成一个新的类型。",
			"具体来说，如果我们有一个类型 T，使用 NonNullable<T> 可以生成一个新类型，该类型排除了 T 中的 null 和 undefined。",
		],
		detail: [
			{ h: "整体回答", p: "NonNullable 工具类型用于从一个类型中排除 null 和 undefined，生成一个新的非空类型。它能帮助开发者确保某个变量或属性不会是 null 或 undefined，从而减少运行时的空值引用错误。" },
			{ h: "NonNullable 的实现原理是什么", p: "NonNullable 是通过条件类型实现的，其定义为：type NonNullable<T> = T extends null | undefined ? never : T。如果类型 T 是 null 或 undefined，则返回 never 类型（表示不可能存在），否则返回 T，从而达到排除 null 和 undefined 的目的。" },
			{ h: "如何使用 NonNullable 处理函数返回值的类型", p: "可以通过 ReturnType 获取函数的返回类型，并结合 NonNullable 排除 null 或 undefined。例如：let user: NonNullable<ReturnType<typeof getUser>> = getUser(1); 这样可以确保 user 变量的类型不包含 null 或 undefined，提升类型安全性。" },
			{ h: "NonNullable 如何与其他工具类型结合使用", p: "NonNullable 可以与映射类型结合使用，例如遍历对象的所有属性并应用 NonNullable。如：type SafeUser = { [K in keyof User]: NonNullable<User[K]> }; 这样可以生成一个所有属性都非空的新类型，增强数据的安全性。" },
		],
		extend: ["NonNullable 能否去除联合类型中的 null 和 undefined？", "为什么需要使用 NonNullable 来增强类型安全？", "NonNullable 对基础类型有什么影响？", "在什么场景下应该使用 NonNullable？"]
	},
	{
		id: "ts-037",
		cat: "ts",
		level: 2,
		hot: 61,
		source: "面试鸭 · TypeScript",
		title: "TypeScript 的内置工具类型 ReturnType 有什么作用？",
		short: "ReturnType 是 TypeScript 的内置工具类型，用于提取一个函数类型的返回值类型。",
		points: [
			"ReturnType 是 TypeScript 提供的一种内置工具类型，它用于提取函数类型的返回值类型。",
			"type MyFunc = () => number;…",
			"type ReturnTypeOfMyFunc = ReturnType<MyFunc>; // number…",
		],
		detail: [
			{ h: "整体回答", p: "ReturnType 是 TypeScript 的内置工具类型，用于提取一个函数类型的返回值类型。它接收一个函数类型作为泛型参数，并推导出该函数调用后返回的数据类型，从而实现类型的安全复用。" },
			{ h: "如何使用 ReturnType 提取函数的返回类型", p: "可以通过 ReturnType<typeof functionName> 的方式来提取函数的返回类型。例如：function foo() { return { a: 1 }; }，那么 ReturnType<typeof foo> 就是 { a: number }。" },
			{ h: "ReturnType 能否用于非函数类型", p: "不能。ReturnType 只能用于函数类型。如果传入的类型不是函数，TypeScript 会报错，因为它要求泛型参数必须符合 (...args: any) => any 的函数签名。" },
			{ h: "ReturnType 和 Parameters 有什么区别", p: "ReturnType 用于提取函数的返回值类型，而 Parameters 用于提取函数的参数类型。例如：对于 (a: number) => string，ReturnType 得到 string，Parameters 得到 [number]（元组形式）。" },
		],
		extend: ["如何手动实现一个类似 ReturnType 的工具类型？", "在接口或复杂类型中使用 ReturnType 有什么好处？", "ReturnType 如何处理异步函数的返回类型？", "能否用 ReturnType 提取带有泛型的函数的返回类型？"],
		code: "type MyFunc = () => number;\ntype ReturnTypeOfMyFunc = ReturnType<MyFunc>;  // number"
	},
	{
		id: "ts-038",
		cat: "ts",
		level: 2,
		hot: 61,
		source: "面试鸭 · TypeScript",
		title: "TypeScript 的内置工具类型 InstanceType 有什么作用？",
		short: "InstanceType 用于获取构造函数类型（如类的构造函数）所创建的实例对象的类型。",
		points: [
			"name: string;…",
			"TypeScript 的内置工具类型 InstanceType 的作用是获取构造函数类型（也就是类的类型）产生的实例对象的类型。",
			"class Person {…",
		],
		detail: [
			{ h: "整体回答", p: "InstanceType 用于获取构造函数类型（如类的构造函数）所创建的实例对象的类型。通过 InstanceType<typeof Class> 可以提取出该类实例的类型，从而在不直接使用 new 关键字的情况下获得正确的类型推断。" },
			{ h: "如何使用 InstanceType 获取类的实例类型", p: "可以通过 'InstanceType<typeof ClassName>' 的方式来获取类 ClassName 的实例类型。例如：class Person {}; type PersonInstance = InstanceType<typeof Person>; 这样 PersonInstance 就等同于 Person 类的实例类型。" },
			{ h: "InstanceType 的底层实现原理是什么", p: "InstanceType 利用了条件类型和 infer 关键字来推断构造函数返回的实例类型。其核心实现是：type InstanceType<T extends new (...args: any) => any> = T extends new (...args: any) => infer R ? R : any; 它检查传入的类型是否为构造函数，如果是，则 infer 推断出其返回实例的类型 R 并返回。" },
			{ h: "能否手动实现一个类似 InstanceType 的工具类型", p: "可以。例如：type MyInstanceType<T extends new (...args: any) => any> = T extends new (...args: any) => infer R ? R : any; 这个自定义类型与内置的 InstanceType 行为一致，能够从构造函数类型中提取出其实例类型。" },
		],
		extend: ["为什么需要使用 typeof Class 来配合 InstanceType？", "InstanceType 在实际项目中有哪些应用场景？", "如果传给 InstanceType 的不是一个构造函数类型会发生什么？", "InstanceType 能否用于抽象类？"]
	},
	{
		id: "ts-039",
		cat: "ts",
		level: 2,
		hot: 60,
		source: "面试鸭 · TypeScript",
		title: "TypeScript 的内置工具类型 Parameters 有什么作用？",
		short: "Parameters 是 TypeScript 的内置工具类型，用于提取函数类型的参数类型，并将这些参数类型组成一个元组类型。",
		points: [
			"function exampleFunction(a: string, b: number): void {}…",
			"TypeScript 的内置工具类型 Parameters 用于提取函数类型的参数类型，并将这些参数类型组成一个元组。",
			"type Params = Parameters<typeof exampleFunction>;…",
		],
		detail: [
			{ h: "整体回答", p: "Parameters 是 TypeScript 的内置工具类型，用于提取函数类型的参数类型，并将这些参数类型组成一个元组类型。它可以帮助开发者避免手动重复定义函数参数的类型，提高类型安全性与代码可维护性。" },
			{ h: "Parameters 如何从函数中提取参数类型", p: "Parameters 使用条件类型和 infer 关键字来推断函数的参数类型。其定义为：type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;，其中 infer P 会自动捕获函数参数的类型并作为元组返回。" },
			{ h: "如果传给 Parameters 的不是一个函数类型，会发生什么", p: "由于 Parameters 的泛型约束为 T extends (...args: any) => any，它只接受函数类型。如果传入非函数类型，将导致类型错误或返回 never 类型，表示无效输入。" },
			{ h: "请举一个 Parameters 的实际使用例子。", p: "例如有一个函数 function createUser(name: string, age: number): User，可以通过 type CreateUserParams = Parameters<typeof createUser>; 得到参数类型 [string, number]，然后在其他函数如日志记录或包装函数中复用该类型，确保类型一致性。" },
		],
		extend: ["Parameters 返回的类型是数组还是元组？", "Parameters 能否用于可选参数或剩余参数的函数？", "Parameters 和 typeof 结合使用的目的是什么？", "除了 Parameters，还有哪些常用的 TypeScript 内置工具类型？"],
		code: "function exampleFunction(a: string, b: number): void {}\n\ntype Params = Parameters<typeof exampleFunction>;"
	},
	{
		id: "ts-040",
		cat: "ts",
		level: 2,
		hot: 60,
		source: "面试鸭 · TypeScript",
		title: "TypeScript 的内置工具类型 NoInfer 有什么作用？",
		short: "NoInfer 用于阻止 TypeScript 对某个类型参数进行自动类型推断，确保该类型保持为手动指定的类型，而不是被上下文推断为更宽泛的类型。",
		points: [
			"在 TypeScript 里，内置工具类型 NoInfer 是一种类型操纵技巧，它主要用于防止 TypeScript 的类型系统自动推断某些类型。",
			"一个常见的使用场景是当我们希望类型参数在上下文中保持一致时，可以使用 NoInfer 来避免意外的类型更改。",
		],
		detail: [
			{ h: "整体回答", p: "NoInfer 用于阻止 TypeScript 对某个类型参数进行自动类型推断，确保该类型保持为手动指定的类型，而不是被上下文推断为更宽泛的类型。这在需要精确控制泛型类型时非常有用。" },
			{ h: "NoInfer 是如何防止类型推断的", p: "NoInfer 利用条件类型和分布性技巧，构造一个不能被正常推导的类型结构。常见实现是 T & { [K in keyof T]: T[K] }，这种写法会破坏 TypeScript 的默认推断行为，从而保留用户显式传入的类型。" },
			{ h: "举一个使用 NoInfer 的实际场景。", p: "当一个函数接收泛型参数并希望保持调用者指定的精确类型时，可以使用 NoInfer。例如：function foo<T>(arg: NoInfer<T>): T，这样即使传入一个子类型或扩展对象，T 也不会被自动推断为更宽泛的类型，保证类型一致性。" },
			{ h: "NoInfer 的典型实现方式是什么", p: "常见的 NoInfer 实现是：type NoInfer<T> = T & { [K in keyof T]: T[K] };。这个类型通过将 T 与其自身的映射类型结合，干扰 TypeScript 的类型推断机制，从而达到禁止推断的效果。" },
		],
		extend: ["使用 NoInfer 有哪些潜在缺点？", "NoInfer 和显式类型注释有什么区别？", "为什么在某些库中会用到 NoInfer？", "NoInfer 能否影响性能或编译结果？"]
	},
	{
		id: "ts-041",
		cat: "ts",
		level: 2,
		hot: 60,
		source: "面试鸭 · TypeScript",
		title: "TypeScript 的内置工具类型 ConstructorParameters 有什么作用？",
		short: "ConstructorParameters 是 TypeScript 的内置工具类型，用于提取构造函数的参数类型，并将其作为元组类型返回。",
		points: [
			"TypeScript 内置工具类型 ConstructorParameters 的作用是提取构造函数的参数类型，并将它们打包成一个元组类型。",
			"class Example {…",
			"constructor(name: string, age: number) {}…",
		],
		detail: [
			{ h: "整体回答", p: "ConstructorParameters 是 TypeScript 的内置工具类型，用于提取构造函数的参数类型，并将其作为元组类型返回。例如，对于参数为 string 和 number 的构造函数，ConstructorParameters<typeof Example> 会得到 [string, number] 类型。" },
			{ h: "如何使用 ConstructorParameters 提取类的构造函数参数类型", p: "可以通过将类的构造函数类型传递给 ConstructorParameters 来提取参数类型。例如：class Example { constructor(name: string, age: number) {} }，然后使用 type Params = ConstructorParameters<typeof Example>，结果为 [string, number]。" },
			{ h: "ConstructorParameters 的底层实现原理是什么", p: "ConstructorParameters 的实现基于条件类型和 infer 关键字。其定义为：type ConstructorParameters<T extends new (...args: any) => any> = T extends new (...args: infer P) => any ? P : never; 它通过 infer 推断出 new 调用时的参数类型 P 并返回。" },
			{ h: "ConstructorParameters 要求传入的类型必须满足什么条件", p: "ConstructorParameters 要求传入的类型必须是构造函数类型，即具有 new (...args: any) => any 结构的类型。如果不是构造函数，编译器会报错或返回 never 类型。" },
		],
		extend: ["ConstructorParameters 与 Parameters 有什么区别？", "能否为非类的构造函数使用 ConstructorParameters？", "当类的构造函数没有参数时，ConstructorParameters 的结果是什么？", "在什么实际场景中会使用 ConstructorParameters？"],
		code: "class Example {\n  constructor(name: string, age: number) {}\n}"
	},
	{
		id: "ts-042",
		cat: "ts",
		level: 2,
		hot: 60,
		source: "面试鸭 · TypeScript",
		title: "TypeScript 的内置工具类型 OmitThisParameter 有什么作用？",
		short: "OmitThisParameter 是 TypeScript 的内置工具类型，用于移除函数类型中的 this 参数。",
		points: [
			"TypeScript 的内置工具类型 OmitThisParameter 用于移除函数类型中的 this 参数。",
			"在 JavaScript 和 TypeScript 中，函数可以使用 this 参数来访问其所在对象的属性和方法。",
		],
		detail: [
			{ h: "整体回答", p: "OmitThisParameter 是 TypeScript 的内置工具类型，用于移除函数类型中的 this 参数。它会创建一个与原函数类型相同但不包含 this 参数的新类型，使函数更通用或便于在不同上下文中使用。" },
			{ h: "JavaScript/TypeScript 中的 this 参数有什么特点", p: "在 TypeScript 中，this 参数可以显式地定义在函数参数列表中（如 this: SomeType），用于约束函数内部对 this 的引用类型。它不影响运行时行为，仅在编译时进行类型检查，确保函数被正确调用。" },
			{ h: "如何使用 OmitThisParameter 移除函数的 this 参数", p: "可以通过将带有 this 参数的函数类型作为泛型参数传入 OmitThisParameter 来使用。例如：type NewFunc = OmitThisParameter<SomeMethod>，结果类型将是一个没有 this 参数但其余参数和返回值相同的函数类型。" },
			{ h: "举一个 OmitThisParameter 的实际使用例子。", p: "假设有一个方法 greet(this: MyObject, message: string): string，使用 OmitThisParameter<MyObject['greet']> 后，得到的新类型为 (message: string) => string，去除了 this 约束，可用于更广泛的场景，如绑定或高阶函数处理。" },
		],
		extend: ["OmitThisParameter 在什么场景下特别有用？", "OmitThisParameter 对运行时有影响吗？", "如果函数本身没有 this 参数，使用 OmitThisParameter 会怎样？", "OmitThisParameter 和其他工具类型如 Partial、Pick 有什么异同？"]
	},
	{
		id: "ts-043",
		cat: "ts",
		level: 2,
		hot: 60,
		source: "面试鸭 · TypeScript",
		title: "TypeScript 的内置工具类型 ThisParameterType 有什么作用？",
		short: "ThisParameterType 是 TypeScript 的内置工具类型，用于提取函数类型中 this 参数的类型。",
		points: [
			"The ThisParameterType 是 TypeScript 的一个内置工具类型，用于提取函数类型中 this 参数的类型。",
			"function myFunc(this: { name:…",
		],
		detail: [
			{ h: "整体回答", p: "ThisParameterType 是 TypeScript 的内置工具类型，用于提取函数类型中 this 参数的类型。如果函数显式声明了 this 参数，它会返回该类型的定义；如果没有声明，则返回 unknown。这在需要操作或复用函数 this 上下文的类型时非常有用。" },
			{ h: "如何使用 ThisParameterType 提取函数的 this 参数类型", p: "可以通过将函数类型传入 ThisParameterType 来提取其 this 参数类型。例如：type MyFuncThisType = ThisParameterType<typeof myFunc>;，其中 myFunc 是一个带有 this: { name: string } 参数的函数，结果 MyFuncThisType 就是 { name: string } 类型。" },
			{ h: "当函数没有显式声明 this 参数时，ThisParameterType 返回什", p: "如果函数没有显式声明 this 参数，ThisParameterType 会返回 unknown 类型。" },
			{ h: "ThisParameterType 在哪些实际场景中有应用", p: "ThisParameterType 主要应用于类型重用和类型安全两个场景：一是避免重复定义 this 的类型，提升代码可维护性；二是在高阶函数或上下文绑定等操作中确保 this 类型的一致性，增强类型检查能力。" },
		],
		extend: ["OmitThisParameter 工具类型的作用是什么？", "Parameters 工具类型能否提取 this 参数的类型？", "ReturnType 工具类型的功能是什么？", "ThisParameterType 和 Parameters 有什么区别？"]
	},
]
