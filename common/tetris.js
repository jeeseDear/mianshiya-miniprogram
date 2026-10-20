/**
 * 俄罗斯方块引擎（纯逻辑，无 UI）
 * 棋盘 10 列 × 20 行，用一维数组表示：0 为空，1~7 为方块颜色
 * 方块类型：0 I / 1 O / 2 T / 3 S / 4 Z / 5 J / 6 L
 */
export const COLS = 10
export const ROWS = 20

// 每种方块的初始形状，按顺时针旋转 4 次得到全部姿态
const BASE = [
	// I
	[
		[0, 0, 0, 0],
		[1, 1, 1, 1],
		[0, 0, 0, 0],
		[0, 0, 0, 0]
	],
	// O
	[
		[2, 2],
		[2, 2]
	],
	// T
	[
		[0, 3, 0],
		[3, 3, 3],
		[0, 0, 0]
	],
	// S
	[
		[0, 4, 4],
		[4, 4, 0],
		[0, 0, 0]
	],
	// Z
	[
		[5, 5, 0],
		[0, 5, 5],
		[0, 0, 0]
	],
	// J
	[
		[6, 0, 0],
		[6, 6, 6],
		[0, 0, 0]
	],
	// L
	[
		[0, 0, 7],
		[7, 7, 7],
		[0, 0, 0]
	]
]

function rotateCW(m) {
	const n = m.length
	const out = []
	for (let r = 0; r < n; r++) {
		const row = []
		for (let c = 0; c < n; c++) row.push(m[n - 1 - c][r])
		out.push(row)
	}
	return out
}

// SHAPES[type][rot] = { size, cells: [[r, c], ...] }
const SHAPES = BASE.map((base) => {
	const list = []
	let m = base
	for (let i = 0; i < 4; i++) {
		const cells = []
		for (let r = 0; r < m.length; r++) {
			for (let c = 0; c < m.length; c++) {
				if (m[r][c]) cells.push([r, c])
			}
		}
		list.push({ size: m.length, cells })
		m = rotateCW(m)
	}
	return list
})

export function createBoard() {
	return new Array(COLS * ROWS).fill(0)
}

export function cellsOf(type, rot) {
	return SHAPES[type][rot & 3].cells
}

export function sizeOf(type, rot) {
	return SHAPES[type][rot & 3].size
}

/** 7-bag 随机：每 7 个一轮，保证不会长时间不出某一种 */
export function newBag() {
	const arr = [0, 1, 2, 3, 4, 5, 6]
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		const t = arr[i]
		arr[i] = arr[j]
		arr[j] = t
	}
	return arr
}

export function makePiece(type) {
	const size = sizeOf(type, 0)
	return {
		type,
		rot: 0,
		x: Math.floor((COLS - size) / 2),
		y: 0
	}
}

export function collides(board, p) {
	const cells = cellsOf(p.type, p.rot)
	for (let i = 0; i < cells.length; i++) {
		const r = p.y + cells[i][0]
		const c = p.x + cells[i][1]
		if (c < 0 || c >= COLS || r >= ROWS) return true
		if (r >= 0 && board[r * COLS + c]) return true
	}
	return false
}

/** 能走就返回新方块，否则返回 null（不修改原对象） */
export function tryMove(board, p, dx, dy) {
	const next = { type: p.type, rot: p.rot, x: p.x + dx, y: p.y + dy }
	return collides(board, next) ? null : next
}

/** 顺时针旋转，带简单墙踢（左右各试 1、2 格） */
export function tryRotate(board, p, dir) {
	const step = dir || 1
	const rot = (p.rot + step + 4) & 3
	const kicks = [0, -1, 1, -2, 2]
	for (let i = 0; i < kicks.length; i++) {
		const next = { type: p.type, rot, x: p.x + kicks[i], y: p.y }
		if (!collides(board, next)) return next
	}
	return null
}

/** 直落到底的位置（用来画幽灵落点和硬降） */
export function ghostOf(board, p) {
	let y = p.y
	while (!collides(board, { type: p.type, rot: p.rot, x: p.x, y: y + 1 })) y += 1
	return { type: p.type, rot: p.rot, x: p.x, y }
}

/** 把方块固定到棋盘，返回新数组 */
export function lock(board, p) {
	const out = board.slice()
	const cells = cellsOf(p.type, p.rot)
	const v = p.type + 1
	for (let i = 0; i < cells.length; i++) {
		const r = p.y + cells[i][0]
		const c = p.x + cells[i][1]
		if (r >= 0 && r < ROWS && c >= 0 && c < COLS) out[r * COLS + c] = v
	}
	return out
}

/** 消除满行，返回 { board, count, rows }，rows 是消除前的行号（用于闪白动画） */
export function clearLines(board) {
	const keep = []
	const rows = []
	for (let r = 0; r < ROWS; r++) {
		let full = true
		for (let c = 0; c < COLS; c++) {
			if (!board[r * COLS + c]) {
				full = false
				break
			}
		}
		if (full) rows.push(r)
		else keep.push(r)
	}
	if (!rows.length) return { board: board.slice(), count: 0, rows }

	const out = new Array(COLS * ROWS).fill(0)
	let w = ROWS - 1
	for (let i = keep.length - 1; i >= 0; i--) {
		const src = keep[i] * COLS
		for (let c = 0; c < COLS; c++) out[w * COLS + c] = board[src + c]
		w -= 1
	}
	return { board: out, count: rows.length, rows }
}

const LINE_SCORE = [0, 100, 300, 500, 800]

/** 一次消 n 行的得分，等级越高倍率越大 */
export function scoreOf(count, level) {
	if (!count) return 0
	const idx = count > 4 ? 4 : count
	return LINE_SCORE[idx] * (level || 1)
}

/** 每级的下落间隔（毫秒），越低越快，最快 110ms */
export function speedOf(level) {
	const lv = level || 1
	return Math.max(110, 800 - (lv - 1) * 65)
}
