/**
 * 消消乐引擎（8×8 三消，纯逻辑，无 UI 依赖）
 *
 * 棋盘：长度 size*size 的一维数组，索引 = row*size + col
 * 取值：1 ~ colors 表示不同颜色，0 表示空格（仅在下落过程中短暂存在）
 */

export const SIZE = 8
export const COLORS = 6
export const MOVES = 25

/* 三连基础分：每消一个方块 10 分，再乘连击倍数 */
export const SCORE_PER_TILE = 10

export function createBoard(size = SIZE, colors = COLORS) {
	const b = new Array(size * size)
	for (let i = 0; i < b.length; i++) {
		const r = (i / size) | 0
		const c = i % size
		// 生成时就避开「左边两个同色 / 上面两个同色」，保证初始盘面无三连
		const banned = {}
		if (c >= 2 && b[i - 1] === b[i - 2]) banned[b[i - 1]] = 1
		if (r >= 2 && b[i - size] === b[i - size * 2]) banned[b[i - size]] = 1
		let v = 1
		let guard = 0
		do {
			v = 1 + ((Math.random() * colors) | 0)
			guard += 1
		} while (banned[v] && guard < 50)
		b[i] = v
	}
	return b
}

/* 找出所有处于三连及以上的格子（横竖都算，重复的合并） */
export function findMatches(b, size = SIZE) {
	const hit = {}

	for (let r = 0; r < size; r++) {
		let run = 1
		for (let c = 1; c <= size; c++) {
			const cur = c < size ? b[r * size + c] : 0
			const prev = b[r * size + c - 1]
			if (cur !== 0 && cur === prev) {
				run += 1
			} else {
				if (run >= 3) {
					for (let k = c - run; k < c; k++) hit[r * size + k] = 1
				}
				run = 1
			}
		}
	}

	for (let c = 0; c < size; c++) {
		let run = 1
		for (let r = 1; r <= size; r++) {
			const cur = r < size ? b[r * size + c] : 0
			const prev = b[(r - 1) * size + c]
			if (cur !== 0 && cur === prev) {
				run += 1
			} else {
				if (run >= 3) {
					for (let k = r - run; k < r; k++) hit[k * size + c] = 1
				}
				run = 1
			}
		}
	}

	return Object.keys(hit).map(Number)
}

export function swap(b, i, j) {
	const next = b.slice()
	next[i] = b[j]
	next[j] = b[i]
	return next
}

export function areAdjacent(a, b, size = SIZE) {
	const ra = (a / size) | 0
	const ca = a % size
	const rb = (b / size) | 0
	const cb = b % size
	return Math.abs(ra - rb) + Math.abs(ca - cb) === 1
}

/**
 * 消掉指定格子并让上方方块下落，顶部补新块
 * @returns {{board:number[], fresh:number[]}} fresh 是本轮新生成的格子索引（用于补间动画）
 */
export function collapse(b, size = SIZE, colors = COLORS, cleared = []) {
	const next = b.slice()
	const mark = {}
	for (let i = 0; i < cleared.length; i++) mark[cleared[i]] = 1
	for (let i = 0; i < next.length; i++) {
		if (mark[i]) next[i] = 0
	}

	const fresh = []
	for (let c = 0; c < size; c++) {
		let write = size - 1
		for (let r = size - 1; r >= 0; r--) {
			const v = next[r * size + c]
			if (!v) continue
			if (write !== r) {
				next[write * size + c] = v
				next[r * size + c] = 0
			}
			write -= 1
		}
		for (let r = write; r >= 0; r--) {
			next[r * size + c] = 1 + ((Math.random() * colors) | 0)
			fresh.push(r * size + c)
		}
	}

	return { board: next, fresh }
}

/* 是否还存在可消的相邻交换（死局判定） */
export function findMove(b, size = SIZE) {
	for (let i = 0; i < b.length; i++) {
		const r = (i / size) | 0
		const c = i % size
		if (c < size - 1) {
			const j = i + 1
			if (b[i] !== b[j] && findMatches(swap(b, i, j), size).length) return [i, j]
		}
		if (r < size - 1) {
			const j = i + size
			if (b[i] !== b[j] && findMatches(swap(b, i, j), size).length) return [i, j]
		}
	}
	return null
}

/* 死局重排：生成一个无三连且至少有一步可走的盘面 */
export function shuffle(b, size = SIZE, colors = COLORS) {
	for (let t = 0; t < 80; t++) {
		const next = createBoard(size, colors)
		if (!findMatches(next, size).length && findMove(next, size)) return next
	}
	return createBoard(size, colors)
}

/* 一次消除的得分（连击倍数从 1 开始） */
export function scoreOf(clearedCount, combo) {
	return clearedCount * SCORE_PER_TILE * combo
}
