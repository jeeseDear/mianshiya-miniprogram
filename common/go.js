/**
 * 围棋引擎（9 路小棋盘，纯逻辑，无 UI 依赖）
 *
 * 棋盘：长度 size*size 的一维数组，索引 = row*size + col
 * 取值：0 空 / 1 黑 / 2 白
 *
 * 规则实现范围：气、提子、禁入点（自杀）、单劫（简单劫）、
 * 终局数子（中国规则：己方活子 + 己方围空，白方贴 KOMI 子）
 */

export const SIZE = 9
export const EMPTY = 0
export const BLACK = 1
export const WHITE = 2

/* 9 路盘贴 3.75 子（中国规则习惯值） */
export const KOMI = 3.75

export function initBoard(size = SIZE) {
	return new Array(size * size).fill(EMPTY)
}

export function opposite(color) {
	return color === BLACK ? WHITE : BLACK
}

/* 上下左右四个邻点（自动裁掉越界） */
export function neighbors(size, idx) {
	const r = (idx / size) | 0
	const c = idx % size
	const out = []
	if (r > 0) out.push(idx - size)
	if (r < size - 1) out.push(idx + size)
	if (c > 0) out.push(idx - 1)
	if (c < size - 1) out.push(idx + 1)
	return out
}

/* 取某点所在棋块（同色连通块）及其气（相邻空点数） */
export function groupAt(b, size, idx) {
	const color = b[idx]
	if (!color) return { stones: [], liberties: [] }
	const stones = []
	const libs = {}
	const seen = {}
	const stack = [idx]
	seen[idx] = 1
	while (stack.length) {
		const cur = stack.pop()
		stones.push(cur)
		const ns = neighbors(size, cur)
		for (let i = 0; i < ns.length; i++) {
			const n = ns[i]
			if (b[n] === EMPTY) libs[n] = 1
			else if (b[n] === color && !seen[n]) {
				seen[n] = 1
				stack.push(n)
			}
		}
	}
	return { stones, liberties: Object.keys(libs).map(Number) }
}

/**
 * 试下一子
 * @returns {{board:number[], captured:number[], ko:number}|null} null 表示非法（占位 / 打劫 / 自杀）
 */
export function tryMove(b, size, idx, color, ko) {
	if (idx < 0 || idx >= b.length) return null
	if (idx === ko) return null
	if (b[idx] !== EMPTY) return null

	const next = b.slice()
	next[idx] = color
	const enemy = opposite(color)
	const captured = []

	// 先提对方没气的块（可能提多块）
	const ns = neighbors(size, idx)
	for (let i = 0; i < ns.length; i++) {
		const n = ns[i]
		if (next[n] !== enemy) continue
		const g = groupAt(next, size, n)
		if (g.liberties.length) continue
		for (let k = 0; k < g.stones.length; k++) {
			const s = g.stones[k]
			next[s] = EMPTY
			if (captured.indexOf(s) < 0) captured.push(s)
		}
	}

	// 提完之后自己这块必须还有气，否则是禁入点
	const mine = groupAt(next, size, idx)
	if (!mine.liberties.length) return null

	// 简单劫：只提一子、自己落子后是孤单子、且只剩一口气 → 对方不能立刻提回
	let nextKo = -1
	if (captured.length === 1 && mine.stones.length === 1 && mine.liberties.length === 1) {
		nextKo = captured[0]
	}

	return { board: next, captured, ko: nextKo }
}

/* 是否像一个眼（四邻全己方，斜角己方占多数）——AI 用来自动避开自己填眼 */
export function isEyeLike(b, size, idx, color) {
	const ns = neighbors(size, idx)
	for (let i = 0; i < ns.length; i++) {
		if (b[ns[i]] !== color) return false
	}
	const r = (idx / size) | 0
	const c = idx % size
	const diag = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
	let own = 0
	let total = 0
	for (let k = 0; k < 4; k++) {
		const rr = r + diag[k][0]
		const cc = c + diag[k][1]
		if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue
		total += 1
		if (b[rr * size + cc] === color) own += 1
	}
	if (!total) return true
	return own >= Math.ceil(total / 2)
}

/**
 * 数子（中国规则）
 * @returns {{black:number, white:number, komi:number, whiteTotal:number, diff:number, result:string}}
 *          result 是黑方（玩家）视角：win / lose / draw
 */
export function score(b, size, komi = KOMI) {
	let black = 0
	let white = 0
	for (let i = 0; i < b.length; i++) {
		if (b[i] === BLACK) black += 1
		else if (b[i] === WHITE) white += 1
	}

	// 空地按连通块归属：只被一方围住才算该方空
	const seen = {}
	for (let i = 0; i < b.length; i++) {
		if (b[i] !== EMPTY || seen[i]) continue
		const stack = [i]
		const region = []
		const border = {}
		seen[i] = 1
		while (stack.length) {
			const cur = stack.pop()
			region.push(cur)
			const ns = neighbors(size, cur)
			for (let k = 0; k < ns.length; k++) {
				const n = ns[k]
				if (b[n] === EMPTY) {
					if (!seen[n]) {
						seen[n] = 1
						stack.push(n)
					}
				} else {
					border[b[n]] = 1
				}
			}
		}
		if (border[BLACK] && !border[WHITE]) black += region.length
		else if (border[WHITE] && !border[BLACK]) white += region.length
	}

	const whiteTotal = white + komi
	const gap = black - whiteTotal
	let result = 'draw'
	if (gap > 0.001) result = 'win'
	else if (gap < -0.001) result = 'lose'

	return {
		black: black,
		white: white,
		komi: komi,
		whiteTotal: whiteTotal,
		diff: Math.abs(gap),
		result: result
	}
}

/**
 * 选点（1 层启发式，够用且很快）
 * 打分维度：提子价值、自己是否送死、连接 / 贴身、打吃对方、离边距离、少量随机
 * @returns {number} 落子点索引，无人可下时返回 -1
 */
export function pickMove(b, size, color, ko) {
	const enemy = opposite(color)
	const nsCache = {}
	let stones = 0
	for (let i = 0; i < b.length; i++) {
		if (b[i]) stones += 1
		if (!nsCache[i]) nsCache[i] = neighbors(size, i)
	}

	let best = -1
	let bestScore = -Infinity

	for (let i = 0; i < b.length; i++) {
		if (b[i] !== EMPTY) continue
		// 不自己填眼
		if (isEyeLike(b, size, i, color)) continue
		const mv = tryMove(b, size, i, color, ko)
		if (!mv) continue

		let s = 0
		const mine = groupAt(mv.board, size, i)

		// 提子是最实在的收益
		if (mv.captured.length) s += 12 + mv.captured.length * 5
		// 送死（下完只剩一口气还没提到子）——块越大越亏
		if (mine.liberties.length === 1 && !mv.captured.length) {
			s -= 10 + mine.stones.length * 3
		} else {
			s += Math.min(mine.liberties.length, 4) * 1.2
		}

		const ns = nsCache[i]
		for (let k = 0; k < ns.length; k++) {
			const n = ns[k]
			if (b[n] === color) {
				s += 1.6
			} else if (b[n] === enemy) {
				s += 2.2
				const eg = groupAt(mv.board, size, n)
				if (eg.liberties.length === 1) s += 6
				else if (eg.liberties.length === 2) s += 2
			}
		}

		// 略微偏好开阔处，一线少下
		const r = (i / size) | 0
		const c = i % size
		s += Math.min(r, c, size - 1 - r, size - 1 - c) * 0.6
		// 开局抢中心
		if (stones === 0) s += 10 - Math.abs(r - ((size / 2) | 0)) - Math.abs(c - ((size / 2) | 0))
		// 避免每局一模一样
		s += Math.random() * 1.8

		if (s > bestScore) {
			bestScore = s
			best = i
		}
	}

	return bestScore === -Infinity ? -1 : best
}
