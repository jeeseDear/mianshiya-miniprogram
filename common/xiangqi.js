/**
 * 中国象棋引擎（纯逻辑，无 UI 依赖）
 *
 * 棋盘用长度 90 的数组表示：索引 = row * 9 + col
 * row 0 在最上（黑方底线），row 9 在最下（红方底线）
 * 棋子值：正数 = 红方，负数 = 黑方，绝对值表示兵种
 */

export const ROWS = 10
export const COLS = 9

export const RED = 1
export const BLACK = -1

/* 兵种 */
export const K = 1 // 帅 / 将
export const A = 2 // 仕 / 士
export const B = 3 // 相 / 象
export const N = 4 // 马
export const R = 5 // 车
export const C = 6 // 炮
export const P = 7 // 兵 / 卒

/* 棋子汉字 */
export const NAMES = {
	1: { 1: '帅', 2: '仕', 3: '相', 4: '马', 5: '车', 6: '炮', 7: '兵' },
	'-1': { 1: '将', 2: '士', 3: '象', 4: '马', 5: '车', 6: '炮', 7: '卒' }
}

const DIR4 = [[0, 1], [0, -1], [1, 0], [-1, 0]]
const DIAG1 = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
const DIAG2 = [[-2, -2], [-2, 2], [2, -2], [2, 2]]
const HORSE = [[-2, -1], [-2, 1], [2, -1], [2, 1], [-1, -2], [1, -2], [-1, 2], [1, 2]]

export function sideOf(p) {
	return p > 0 ? RED : BLACK
}

/* 走法编码成一个整数：from * 100 + to */
export function moveFrom(mv) {
	return (mv / 100) | 0
}

export function moveTo(mv) {
	return mv % 100
}

export function initBoard() {
	const b = new Array(ROWS * COLS).fill(0)
	const back = [R, N, B, A, K, A, B, N, R]
	for (let c = 0; c < COLS; c++) {
		b[0 * COLS + c] = -back[c]
		b[9 * COLS + c] = back[c]
	}
	b[2 * COLS + 1] = -C
	b[2 * COLS + 7] = -C
	b[7 * COLS + 1] = C
	b[7 * COLS + 7] = C
	for (let c = 0; c < COLS; c += 2) {
		b[3 * COLS + c] = -P
		b[6 * COLS + c] = P
	}
	return b
}

export function inPalace(r, c, side) {
	if (c < 3 || c > 5) return false
	return side === RED ? r >= 7 && r <= 9 : r >= 0 && r <= 2
}

/* ---------- 生成伪合法走法 ---------- */
export function genMoves(b, side) {
	const list = []
	for (let i = 0; i < 90; i++) {
		const p = b[i]
		if (!p || (p > 0 ? RED : BLACK) !== side) continue
		const t = Math.abs(p)
		const r = (i / COLS) | 0
		const c = i % COLS

		if (t === R || t === C) {
			for (let d = 0; d < 4; d++) {
				let rr = r + DIR4[d][0]
				let cc = c + DIR4[d][1]
				let jumped = false
				while (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS) {
					const q = b[rr * COLS + cc]
					if (t === R) {
						if (!q) list.push(i * 100 + (rr * COLS + cc))
						else {
							if ((q > 0 ? RED : BLACK) !== side) list.push(i * 100 + (rr * COLS + cc))
							break
						}
					} else if (!jumped) {
						if (!q) list.push(i * 100 + (rr * COLS + cc))
						else jumped = true
					} else if (q) {
						if ((q > 0 ? RED : BLACK) !== side) list.push(i * 100 + (rr * COLS + cc))
						break
					}
					rr += DIR4[d][0]
					cc += DIR4[d][1]
				}
			}
			continue
		}

		if (t === N) {
			for (let k = 0; k < 8; k++) {
				const rr = r + HORSE[k][0]
				const cc = c + HORSE[k][1]
				if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS) continue
				const legR = HORSE[k][0] === 2 || HORSE[k][0] === -2 ? r + HORSE[k][0] / 2 : r
				const legC = HORSE[k][1] === 2 || HORSE[k][1] === -2 ? c + HORSE[k][1] / 2 : c
				if (b[legR * COLS + legC]) continue
				const q = b[rr * COLS + cc]
				if (!q || (q > 0 ? RED : BLACK) !== side) list.push(i * 100 + (rr * COLS + cc))
			}
			continue
		}

		if (t === B) {
			for (let k = 0; k < 4; k++) {
				const rr = r + DIAG2[k][0]
				const cc = c + DIAG2[k][1]
				if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS) continue
				// 相/象不过河
				if (side === RED && rr < 5) continue
				if (side === BLACK && rr > 4) continue
				if (b[(r + DIAG2[k][0] / 2) * COLS + (c + DIAG2[k][1] / 2)]) continue
				const q = b[rr * COLS + cc]
				if (!q || (q > 0 ? RED : BLACK) !== side) list.push(i * 100 + (rr * COLS + cc))
			}
			continue
		}

		if (t === A) {
			for (let k = 0; k < 4; k++) {
				const rr = r + DIAG1[k][0]
				const cc = c + DIAG1[k][1]
				if (!inPalace(rr, cc, side)) continue
				const q = b[rr * COLS + cc]
				if (!q || (q > 0 ? RED : BLACK) !== side) list.push(i * 100 + (rr * COLS + cc))
			}
			continue
		}

		if (t === K) {
			for (let d = 0; d < 4; d++) {
				const rr = r + DIR4[d][0]
				const cc = c + DIR4[d][1]
				if (!inPalace(rr, cc, side)) continue
				const q = b[rr * COLS + cc]
				if (!q || (q > 0 ? RED : BLACK) !== side) list.push(i * 100 + (rr * COLS + cc))
			}
			// 飞将：同列无子可直取对方将
			let rr = r + (side === RED ? -1 : 1)
			while (rr >= 0 && rr < ROWS) {
				const q = b[rr * COLS + c]
				if (q) {
					if (Math.abs(q) === K && (q > 0 ? RED : BLACK) !== side) list.push(i * 100 + (rr * COLS + c))
					break
				}
				rr += side === RED ? -1 : 1
			}
			continue
		}

		if (t === P) {
			const fr = side === RED ? -1 : 1
			const rr = r + fr
			if (rr >= 0 && rr < ROWS) {
				const q = b[rr * COLS + c]
				if (!q || (q > 0 ? RED : BLACK) !== side) list.push(i * 100 + (rr * COLS + c))
			}
			const crossed = side === RED ? r <= 4 : r >= 5
			if (crossed) {
				for (let dc = -1; dc <= 1; dc += 2) {
					const cc = c + dc
					if (cc < 0 || cc >= COLS) continue
					const q = b[r * COLS + cc]
					if (!q || (q > 0 ? RED : BLACK) !== side) list.push(i * 100 + (r * COLS + cc))
				}
			}
		}
	}
	return list
}

/* ---------- 某个格子是否被 by 方攻击 ---------- */
export function attacked(b, idx, by) {
	const r = (idx / COLS) | 0
	const c = idx % COLS
	const targetIsKing = Math.abs(b[idx]) === K

	for (let d = 0; d < 4; d++) {
		let rr = r + DIR4[d][0]
		let cc = c + DIR4[d][1]
		let screen = 0
		while (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS) {
			const q = b[rr * COLS + cc]
			if (q) {
				const s = q > 0 ? RED : BLACK
				const t = Math.abs(q)
				if (screen === 0) {
					if (s === by) {
						if (t === R) return true
						if (t === K) {
							if (Math.abs(rr - r) + Math.abs(cc - c) === 1) return true
							if (DIR4[d][0] !== 0 && targetIsKing) return true
						}
					}
					screen = 1
				} else {
					if (s === by && t === C) return true
					break
				}
			}
			rr += DIR4[d][0]
			cc += DIR4[d][1]
		}
	}

	for (let k = 0; k < 8; k++) {
		const rr = r + HORSE[k][0]
		const cc = c + HORSE[k][1]
		if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS) continue
		const q = b[rr * COLS + cc]
		if (!q || (q > 0 ? RED : BLACK) !== by || Math.abs(q) !== N) continue
		const dr = r - rr
		const dc = c - cc
		const legR = rr + (Math.abs(dr) === 2 ? dr / 2 : 0)
		const legC = cc + (Math.abs(dc) === 2 ? dc / 2 : 0)
		if (!b[legR * COLS + legC]) return true
	}

	const pr = r + (by === RED ? 1 : -1)
	if (pr >= 0 && pr < ROWS) {
		const q = b[pr * COLS + c]
		if (q && (q > 0 ? RED : BLACK) === by && Math.abs(q) === P) return true
	}
	for (let dc = -1; dc <= 1; dc += 2) {
		const cc = c + dc
		if (cc < 0 || cc >= COLS) continue
		const q = b[r * COLS + cc]
		if (!q || (q > 0 ? RED : BLACK) !== by || Math.abs(q) !== P) continue
		if (by === RED ? r <= 4 : r >= 5) return true
	}

	for (let k = 0; k < 4; k++) {
		const rr = r + DIAG2[k][0]
		const cc = c + DIAG2[k][1]
		if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS) continue
		const q = b[rr * COLS + cc]
		if (!q || (q > 0 ? RED : BLACK) !== by || Math.abs(q) !== B) continue
		if (!b[(r + DIAG2[k][0] / 2) * COLS + (c + DIAG2[k][1] / 2)]) return true
	}

	for (let k = 0; k < 4; k++) {
		const rr = r + DIAG1[k][0]
		const cc = c + DIAG1[k][1]
		if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS) continue
		const q = b[rr * COLS + cc]
		if (q && (q > 0 ? RED : BLACK) === by && Math.abs(q) === A) return true
	}
	return false
}

export function findKing(b, side) {
	for (let i = 0; i < 90; i++) {
		const p = b[i]
		if (p && Math.abs(p) === K && (p > 0 ? RED : BLACK) === side) return i
	}
	return -1
}

/* ---------- 落子 / 撤销 ---------- */
export function applyMove(b, mv) {
	const f = (mv / 100) | 0
	const t = mv % 100
	const cap = b[t]
	b[t] = b[f]
	b[f] = 0
	return cap
}

export function undoMove(b, mv, cap) {
	const f = (mv / 100) | 0
	const t = mv % 100
	b[f] = b[t]
	b[t] = cap
}

/* ---------- 过滤掉「送将」的走法 ---------- */
export function legalMoves(b, side) {
	const all = genMoves(b, side)
	const king = findKing(b, side)
	const out = []
	for (let i = 0; i < all.length; i++) {
		const mv = all[i]
		const f = (mv / 100) | 0
		const t = mv % 100
		const movedKing = Math.abs(b[f]) === K
		const cap = applyMove(b, mv)
		const myKing = movedKing ? t : king
		if (myKing >= 0 && !attacked(b, myKing, -side)) out.push(mv)
		undoMove(b, mv, cap)
	}
	return out
}

export function movesFrom(b, side, idx) {
	const all = legalMoves(b, side)
	const out = []
	for (let i = 0; i < all.length; i++) {
		if (moveFrom(all[i]) === idx) out.push(moveTo(all[i]))
	}
	return out
}

/* ---------- 局面评估（从 side 视角） ---------- */
const VALUE = [0, 10000, 220, 220, 420, 900, 480, 100]

export function evaluate(b, side) {
	let score = 0
	for (let i = 0; i < 90; i++) {
		const p = b[i]
		if (!p) continue
		const s = p > 0 ? RED : BLACK
		const t = Math.abs(p)
		let v = VALUE[t]
		if (t === P) {
			const r = (i / COLS) | 0
			const crossed = s === RED ? r <= 4 : r >= 5
			if (crossed) v += 60
			// 越靠近对方底线越值钱
			v += s === RED ? (6 - Math.min(r, 6)) * 8 : (Math.max(r, 3) - 3) * 8
		}
		score += s * v
	}
	return score * side
}

/* ---------- 搜索 ---------- */
let stopFlag = 0

function orderMoves(b, moves) {
	// 吃子优先：被吃子价值 - 吃子方价值 / 10
	const score = {}
	for (let i = 0; i < moves.length; i++) {
		const mv = moves[i]
		const cap = b[mv % 100]
		score[mv] = cap ? VALUE[Math.abs(cap)] * 10 - VALUE[Math.abs(b[(mv / 100) | 0])] : 0
	}
	moves.sort((x, y) => score[y] - score[x])
	return moves
}

function negamax(b, side, depth, alpha, beta, deadline) {
	if ((++negamax.nodes & 511) === 0 && Date.now() > deadline) {
		stopFlag = 1
	}
	if (stopFlag) return 0
	if (depth <= 0) return evaluate(b, side)

	const moves = orderMoves(b, genMoves(b, side))
	if (!moves.length) return -99999

	let best = -Infinity
	for (let i = 0; i < moves.length; i++) {
		const mv = moves[i]
		const cap = applyMove(b, mv)
		const val = -negamax(b, -side, depth - 1, -beta, -alpha, deadline)
		undoMove(b, mv, cap)
		if (stopFlag) return best === -Infinity ? 0 : best
		if (val > best) best = val
		if (best > alpha) alpha = best
		if (alpha >= beta) break
	}
	return best
}
negamax.nodes = 0

function searchRoot(b, side, depth, deadline) {
	const moves = orderMoves(b, legalMoves(b, side))
	if (!moves.length) return { move: 0, score: -99999, aborted: false }
	let best = moves[0]
	let bestScore = -Infinity
	let alpha = -Infinity
	for (let i = 0; i < moves.length; i++) {
		const mv = moves[i]
		const cap = applyMove(b, mv)
		const val = -negamax(b, -side, depth - 1, -Infinity, -alpha, deadline)
		undoMove(b, mv, cap)
		if (stopFlag) return { move: best, score: bestScore, aborted: true }
		if (val > bestScore) {
			bestScore = val
			best = mv
		}
		if (val > alpha) alpha = val
	}
	return { move: best, score: bestScore, aborted: false }
}

/**
 * 迭代加深 + 时间上限，返回最佳走法（mv 编码）
 * @param {number[]} b 棋盘
 * @param {number} side 走子方
 * @param {{depth?:number, time?:number}} opts
 */
export function searchBest(b, side, opts) {
	const maxDepth = (opts && opts.depth) || 4
	const time = (opts && opts.time) || 900
	const deadline = Date.now() + time
	stopFlag = 0
	negamax.nodes = 0
	let best = 0
	for (let d = 2; d <= maxDepth; d++) {
		const res = searchRoot(b, side, d, deadline)
		if (res.move) best = res.move
		if (res.aborted) break
		if (res.score >= 99999 || res.score <= -99999) break
	}
	return best
}

/* ---------- 渲染辅助 ---------- */
export function listPieces(b) {
	const out = []
	for (let i = 0; i < 90; i++) {
		const p = b[i]
		if (!p) continue
		const s = p > 0 ? RED : BLACK
		out.push({
			idx: i,
			r: (i / COLS) | 0,
			c: i % COLS,
			side: s,
			ch: NAMES[s][Math.abs(p)]
		})
	}
	return out
}
