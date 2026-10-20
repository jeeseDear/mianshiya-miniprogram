/**
 * 题库构造工具
 *
 * 自建题目数量多，逐条写完整对象太啰嗦，这里用一个工厂函数统一组装字段，
 * 各分类文件只需按「行」描述题目，数据仍然保持纯静态、可直接被编译器分析。
 *
 * 行格式：[序号, 难度, 热度, 题干, 选项数组, 答案数组, 解析, 代码（可选）]
 * 选项顺序即 A/B/C/D，答案数组长度 > 1 自动判定为多选。
 *
 * 为避免「正确答案总是 A」影响刷题体验，这里按题目 id 做一次确定性打乱，
 * 选项位置变了但答案键会同步重算；含「以上都对」类选项时保持原顺序。
 */

const KEYS = ['A', 'B', 'C', 'D', 'E', 'F']

function seedOf(str) {
	let h = 2166136261
	for (let i = 0; i < str.length; i += 1) {
		h ^= str.charCodeAt(i)
		h = Math.imul(h, 16777619)
	}
	return h >>> 0
}

function seededShuffle(list, seed) {
	const arr = list.slice()
	let s = seed || 1
	for (let i = arr.length - 1; i > 0; i -= 1) {
		s = (Math.imul(s, 1103515245) + 12345) >>> 0
		const j = s % (i + 1)
		const t = arr[i]
		arr[i] = arr[j]
		arr[j] = t
	}
	return arr
}

export function makeQuestions(cat, rows) {
	return rows.map((row) => {
		const [no, level, hot, title, options, answer, analysis, code] = row
		const id = cat + '-' + no
		let order = options.map((text, i) => ({ text, key: KEYS[i] }))
		if (!options.some((text) => String(text).indexOf('以上') > -1)) {
			order = seededShuffle(order, seedOf(id))
		}
		return {
			id,
			cat,
			type: answer.length > 1 ? 'multiple' : 'single',
			level,
			hot,
			source: '面试鸭精选',
			title,
			code: code || '',
			options: order.map((o, i) => ({ key: KEYS[i], text: o.text })),
			answer: answer
				.map((a) => {
					const hit = order.findIndex((o) => o.key === a)
					return hit > -1 ? KEYS[hit] : a
				})
				.sort(),
			analysis
		}
	})
}
