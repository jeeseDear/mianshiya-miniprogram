<template>
	<view class="bubble">
		<!-- 泡泡龙全部画在 canvas 上：小程序的 canvas 是原生组件，
		     普通 view 盖不上去，界面只能自己画 -->
		<canvas
			:id="canvasId"
			:canvas-id="canvasId"
			type="2d"
			class="stage"
			@touchstart.stop="onTouchStart"
			@touchmove.stop="onTouchMove"
			@touchend.stop="onTouchEnd"
			@touchcancel.stop="onTouchEnd"
		></canvas>

		<!-- cover-view 才能压在小程序原生画布之上 -->
		<cover-view class="back-btn" :style="{ top: statusBar + 8 + 'px' }" @tap="goBack">←</cover-view>
	</view>
</template>

<script>
	import { navBack } from '@/common/nav.js'

	const BEST_KEY = 'bubble_best'
	// 单帧特效上限，防止连锁大爆时粒子把帧率拖垮
	const MAX_FX = 140

	// 六色泡泡：fill 主色 / dark 底部暗边 / light 高光
	// 顺序即解锁顺序（前 N 种 = 该关用到的颜色），前四种刻意拉开色相：
	// 红 / 黄 / 绿 / 蓝，不像红橙黄那样挨着难分。
	const PALETTE = [
		{ fill: '#ff5d6c', dark: '#c4324a', light: '#ffb3bb' },
		{ fill: '#ffd93d', dark: '#bf9d18', light: '#fff1ae' },
		{ fill: '#3ddc84', dark: '#199a52', light: '#abf4cb' },
		{ fill: '#4aa8ff', dark: '#166bbd', light: '#a9d6ff' },
		{ fill: '#ffa63d', dark: '#c47316', light: '#ffd4a6' },
		{ fill: '#a06bff', dark: '#6738bf', light: '#d2b8ff' }
	]

	// 每关：初始行数 / 颜色数量 / 打几发补一行
	const LEVELS = [
		{ rows: 5, colors: 4, push: 10 },
		{ rows: 5, colors: 5, push: 9 },
		{ rows: 6, colors: 5, push: 9 },
		{ rows: 6, colors: 6, push: 8 },
		{ rows: 7, colors: 6, push: 8 }
	]

	function clamp(v, a, b) {
		return v < a ? a : v > b ? b : v
	}

	export default {
		data() {
			return {
				canvasId: 'bubbleCanvas',
				statusBar: 0,
				state: 'ready' // ready / playing / paused / over / win
			}
		},
		created() {
			// 棋盘、泡泡、粒子都挂在实例上而不是 data：
			// 每帧要改上百个数字，进了响应式会被 Proxy 拖到掉帧。
			this.ctx = null
			this.legacy = false
			this.running = false
			this.lastTs = 0
			this.raf = null
			this.loopToken = 0

			this.W = 0
			this.H = 0
			this.sysW = 375
			this.sysH = 667
			this.dpr = 1
			this.u = 1

			// 棋盘几何
			this.COLS = 9
			this.D = 40
			this.R = 20
			this.ROW_H = 34.6
			this.left = 0
			this.right = 375
			this.gridTop = 48
			this.hudY = 24
			this.shooterX = 187
			this.shooterY = 585
			this.deathY = 545
			this.nextX = 340
			this.nextY = 590
			this.nextR = 14

			this.bgGrad = null
			this.g = null
			this.fly = null
			this.cur = 0
			this.next = 0
			this.aim = -Math.PI / 2
			this.aimOn = false
			this.noFire = false
			this.endT = 0
			this.best = 0
			this.level = 1
		},
		onLoad() {
			this.readSystem()
			try {
				this.best = Number(uni.getStorageSync(BEST_KEY)) || 0
			} catch (e) {
				this.best = 0
			}
		},
		onReady() {
			this.initCanvas()
		},
		onHide() {
			if (this.state === 'playing') this.state = 'paused'
		},
		onUnload() {
			this.running = false
			this.loopToken += 1
			this.saveBest()
		},
		methods: {
			goBack() {
				this.saveBest()
				navBack('/pages/interview/mine/mine')
			},

			readSystem() {
				try {
					const info = uni.getSystemInfoSync()
					this.statusBar = info.statusBarHeight || 0
					this.sysW = info.windowWidth || 375
					this.sysH = info.windowHeight || 667
					this.dpr = Math.min(info.pixelRatio || 1, 2)
				} catch (e) {
					this.statusBar = 0
					this.sysW = 375
					this.sysH = 667
					this.dpr = 1
				}
			},

			saveBest() {
				if (!this.g) return
				if (this.g.score > this.best) this.best = this.g.score
				try {
					uni.setStorageSync(BEST_KEY, this.best)
				} catch (e) {
					// 存储满了就算了，不影响玩
				}
			},

			/* ---------------- 画布 ---------------- */
			initCanvas() {
				// #ifdef H5
				this.initByDom()
				// #endif
				// #ifndef H5
				this.initByQuery()
				// #endif
			},

			pickDomCanvas() {
				try {
					const host = document.getElementById(this.canvasId)
					if (host && String(host.tagName).toUpperCase() === 'CANVAS') return host
					if (host && host.querySelector) {
						const inner = host.querySelector('canvas')
						if (inner) return inner
					}
					return document.querySelector('uni-canvas canvas') || document.querySelector('canvas') || null
				} catch (e) {
					return null
				}
			},

			initByDom() {
				const el = this.pickDomCanvas()
				if (!el) {
					this.initLegacy()
					return
				}
				let w = 0
				let h = 0
				try {
					const parent = el.parentNode
					if (parent && parent.getBoundingClientRect) {
						const pr = parent.getBoundingClientRect()
						if (pr.width > 80 && pr.height > 200) {
							w = pr.width
							h = pr.height
						}
					}
					if (!w) {
						const rect = el.getBoundingClientRect()
						if (rect.width > 80 && rect.height > 200) {
							w = rect.width
							h = rect.height
						}
					}
				} catch (e) {
					w = 0
					h = 0
				}
				if (!w) {
					w = this.sysW
					h = this.sysH
				}
				this.bindCanvas(el, w, h)
			},

			initByQuery() {
				const query = uni.createSelectorQuery().in(this)
				query
					.select('#' + this.canvasId)
					.fields({ node: true, size: true })
					.exec((res) => {
						const info = res && res[0]
						if (!info || !info.node) {
							this.initLegacy()
							return
						}
						const node = info.node
						const canvas = typeof node.getContext === 'function' ? node : this.pickDomCanvas()
						if (!canvas) {
							this.initLegacy()
							return
						}
						this.bindCanvas(canvas, info.width || this.sysW, info.height || this.sysH)
					})
			},

			bindCanvas(canvas, w, h) {
				const dpr = this.dpr || 1
				let W = Math.round(w || 0)
				let H = Math.round(h || 0)
				// 内层 canvas 可能还是 300x150 默认值，尺寸不对就用窗口兜底
				if (!(W > 80) || !(H > 200)) {
					W = Math.round(this.sysW)
					H = Math.round(this.sysH)
				}
				this.W = W
				this.H = H

				try {
					if (canvas.style) {
						canvas.style.width = W + 'px'
						canvas.style.height = H + 'px'
					}
				} catch (e) {
					// 小程序 node 没有 style
				}
				try {
					canvas.width = Math.round(W * dpr)
					canvas.height = Math.round(H * dpr)
				} catch (e) {
					// 个别环境尺寸只读
				}

				let ctx = null
				try {
					ctx = canvas.getContext('2d')
				} catch (e) {
					ctx = null
				}
				if (!ctx) {
					this.initLegacy()
					return
				}
				if (ctx.setTransform) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
				else ctx.scale(dpr, dpr)
				this.ctx = ctx
				this.legacy = false
				this.bgGrad = null
				this.layout()
				this.raf =
					typeof canvas.requestAnimationFrame === 'function'
						? canvas.requestAnimationFrame.bind(canvas)
						: this.globalRaf()
				this.startLoop()
			},

			initLegacy() {
				let ctx = null
				try {
					ctx = uni.createCanvasContext(this.canvasId, this)
				} catch (e) {
					ctx = null
				}
				if (!ctx) return
				this.ctx = ctx
				this.legacy = true
				this.W = this.sysW
				this.H = this.sysH
				this.bgGrad = null
				this.layout()
				this.raf = (cb) => setTimeout(() => cb(Date.now()), 16)
				this.startLoop()
			},

			globalRaf() {
				if (typeof requestAnimationFrame === 'function') return (cb) => requestAnimationFrame(cb)
				return (cb) => setTimeout(() => cb(Date.now()), 16)
			},

			/* ---------------- 尺寸 / 棋盘几何 ---------------- */
			layout() {
				const W = this.W
				const H = this.H
				let COLS = 9
				if (W < 340) COLS = 8
				else if (W >= 430) COLS = 10

				// 交错行右侧多占半颗，所以宽度按 COLS + 0.5 算
				let D = (W - 14) / (COLS + 0.5)
				D = Math.min(D, 46)

				this.COLS = COLS
				this.D = D
				this.R = D / 2
				this.ROW_H = D * 0.866
				this.fieldW = COLS * D + D / 2
				this.left = (W - this.fieldW) / 2
				this.right = this.left + this.fieldW
				this.u = clamp(W / 375, 0.9, 1.15)

				this.hudY = this.statusBar + 24
				this.gridTop = this.statusBar + 48
				this.shooterX = W / 2
				this.shooterY = H - 82
				if (this.shooterY < H * 0.62) this.shooterY = H * 0.62
				this.deathY = this.shooterY - this.R * 2.1

				this.nextR = this.R * 0.7
				this.nextX = W - 24 - this.nextR
				this.nextY = this.shooterY + 8
			},

			// 视觉上的行偏移：0 或半颗直径，shift 在有新行插入时 +1，
			// 这样插入新行后老泡泡的横坐标不会跳。
			rowOffset(r) {
				const p = (((r + this.g.shift) % 2) + 2) % 2
				return p ? this.D / 2 : 0
			},

			cellX(r, c) {
				return this.left + this.R + c * this.D + this.rowOffset(r)
			},

			cellY(r) {
				return this.gridTop + this.R + r * this.ROW_H
			},

			cellPos(r, c) {
				return { x: this.cellX(r, c), y: this.cellY(r) }
			},

			rowOf(y) {
				return Math.round((y - this.gridTop - this.R) / this.ROW_H)
			},

			cellAt(r, c) {
				const g = this.g
				if (!g || r < 0 || r >= g.rows.length) return null
				const row = g.rows[r]
				if (!row || c < 0 || c >= row.length) return null
				const v = row[c]
				return v == null ? null : v
			},

			// 六邻接：同排左右 + 上下排各两个
			neighbors(r, c) {
				const odd = (((r + this.g.shift) % 2) + 2) % 2
				const out = [[r, c - 1], [r, c + 1]]
				if (odd) {
					out.push([r - 1, c], [r - 1, c + 1], [r + 1, c], [r + 1, c + 1])
				} else {
					out.push([r - 1, c - 1], [r - 1, c], [r + 1, c - 1], [r + 1, c])
				}
				return out
			},

			hasNeighborBubble(r, c) {
				const nb = this.neighbors(r, c)
				for (let i = 0; i < nb.length; i++) {
					if (this.cellAt(nb[i][0], nb[i][1]) != null) return true
				}
				return false
			},

			ensureRows(r) {
				const g = this.g
				while (g.rows.length <= r) {
					const row = []
					for (let c = 0; c < this.COLS; c++) row.push(null)
					g.rows.push(row)
				}
			},

			/* ---------------- 开局 ---------------- */
			levelCfg(level) {
				if (level <= LEVELS.length) return LEVELS[level - 1]
				return { rows: 7, colors: 6, push: Math.max(6, 8 - (level - LEVELS.length)) }
			},

			newGame(level, score) {
				const cfg = this.levelCfg(level)
				this.level = level
				this.g = {
					rows: [],
					shift: 0,
					colors: cfg.colors,
					shots: 0,
					pushEvery: cfg.push,
					score: score || 0,
					time: 0,
					shake: 0,
					flash: 0,
					pops: [],
					parts: [],
					falls: [],
					texts: []
				}
				this.fly = null
				this.aimOn = false
				this.aim = -Math.PI / 2
				this.endT = 0
				this.buildGrid(cfg.rows)
				this.cur = this.pickColor()
				this.next = this.pickColor()
			},

			buildGrid(rows) {
				const g = this.g
				const n = rows
				const list = []
				for (let r = 0; r < n; r++) {
					const row = []
					for (let c = 0; c < this.COLS; c++) {
						// 最后一行随机留空，别一开局就是块规整的砖
						const hole = r === n - 1 && Math.random() < 0.22
						row.push(hole ? null : Math.floor(Math.random() * g.colors))
					}
					list.push(row)
				}
				g.rows = list
			},

			// 发射的球优先取场上还存在的颜色，避免手里一直拿着清不掉的颜色；
			// 但场上颜色少于三种时混一点随机，不然最后几颗会变得太顺。
			pickColor() {
				const g = this.g
				const seen = {}
				const pool = []
				for (let r = 0; r < g.rows.length; r++) {
					const row = g.rows[r]
					for (let c = 0; c < row.length; c++) {
						const v = row[c]
						if (v != null && !seen[v]) {
							seen[v] = 1
							pool.push(v)
						}
					}
				}
				while (pool.length < 3) {
					const v = Math.floor(Math.random() * g.colors)
					if (pool.indexOf(v) < 0) pool.push(v)
					else if (pool.length >= g.colors) break
				}
				if (!pool.length) return 0
				return pool[Math.floor(Math.random() * pool.length)]
			},

			startGame() {
				this.newGame(1, 0)
				this.state = 'playing'
			},

			nextLevel() {
				const score = this.g ? this.g.score : 0
				this.newGame(this.level + 1, score)
				this.state = 'playing'
			},

			gameOver() {
				if (this.state === 'over') return
				this.state = 'over'
				this.endT = 0
				this.fly = null
				this.aimOn = false
				this.shake(9)
				this.saveBest()
			},

			clearLevel() {
				this.state = 'win'
				this.endT = 0
				this.fly = null
				this.aimOn = false
				this.g.score += 200 + this.level * 100
				this.shake(6)
				this.saveBest()
			},

			/* ---------------- 主循环 ---------------- */
			startLoop() {
				this.loopToken += 1
				const token = this.loopToken
				if (!this.g) this.newGame(1, 0)
				this.running = true
				this.lastTs = 0
				const step = (ts) => {
					if (!this.running || token !== this.loopToken) return
					const now = typeof ts === 'number' ? ts : Date.now()
					if (!this.lastTs) this.lastTs = now
					let dt = (now - this.lastTs) / 1000
					this.lastTs = now
					if (dt > 0.05) dt = 0.05
					if (dt < 0) dt = 0
					this.tick(dt)
					this.render()
					if (this.legacy && this.ctx && this.ctx.draw) this.ctx.draw()
					if (this.running && token === this.loopToken) this.raf(step)
				}
				if (this.raf) this.raf(step)
			},

			tick(dt) {
				const g = this.g
				if (!g) return
				g.time += dt
				// 暂停时飞行中的球也要冻住
				if (this.state === 'playing') this.stepFly(dt)
				this.stepFx(dt)
				if (g.shake > 0) g.shake = Math.max(0, g.shake - dt * 40)
				if (g.flash > 0) g.flash = Math.max(0, g.flash - dt * 2.2)
				if (this.state === 'over' || this.state === 'win') this.endT += dt
			},

			/* ---------------- 飞行 ---------------- */
			fire() {
				if (this.fly || this.state !== 'playing') return
				const sp = 1180 * clamp(this.H / 700, 0.9, 1.25)
				this.fly = {
					x: this.shooterX,
					y: this.shooterY,
					dx: Math.cos(this.aim),
					dy: Math.sin(this.aim),
					ci: this.cur,
					speed: sp
				}
				this.cur = this.next
				this.next = this.pickColor()
			},

			stepFly(dt) {
				const f = this.fly
				if (!f) return
				const R = this.R
				let travel = f.speed * dt
				const maxStep = this.D * 0.35
				let guard = 0
				while (travel > 0 && this.fly && guard++ < 40) {
					const s = Math.min(maxStep, travel)
					travel -= s
					f.x += f.dx * s
					f.y += f.dy * s

					if (f.x - R < this.left) {
						f.x = this.left + R
						f.dx = -f.dx
						this.shake(1)
					} else if (f.x + R > this.right) {
						f.x = this.right - R
						f.dx = -f.dx
						this.shake(1)
					}

					if (f.y <= this.gridTop + R) {
						f.y = this.gridTop + R
						this.land()
						return
					}
					if (this.hitBubbleAt(f.x, f.y)) {
						this.land()
						return
					}
				}
			},

			hitBubbleAt(x, y) {
				const R = this.R
				const rr = R * 1.74
				const r0 = this.rowOf(y)
				for (let r = Math.max(0, r0 - 1); r <= r0 + 1; r++) {
					for (let c = -1; c <= this.COLS; c++) {
						if (c < 0 || c >= this.COLS) continue
						if (this.cellAt(r, c) == null) continue
						const px = this.cellX(r, c)
						const py = this.cellY(r)
						const dx = px - x
						const dy = py - y
						if (dx * dx + dy * dy < rr * rr) return true
					}
				}
				return false
			},

			// 找离落点最近的空位：必须贴顶或者在已有泡泡旁边
			findCell(x, y) {
				let best = null
				let bestD = Infinity
				const r0 = this.rowOf(y)
				for (let r = Math.max(0, r0 - 2); r <= r0 + 2; r++) {
					for (let c = -1; c <= this.COLS; c++) {
						if (c < 0 || c >= this.COLS) continue
						if (this.cellAt(r, c) != null) continue
						if (r > 0 && !this.hasNeighborBubble(r, c)) continue
						const px = this.cellX(r, c)
						const py = this.cellY(r)
						const d = (px - x) * (px - x) + (py - y) * (py - y)
						if (d < bestD) {
							bestD = d
							best = { r, c }
						}
					}
				}
				return best
			},

			land() {
				const f = this.fly
				if (!f) return
				this.fly = null
				let cell = this.findCell(f.x, f.y)
				if (!cell) {
					// 极端情况兜底：忽略「必须相邻」，放到最近的一个空位
					let bestD = Infinity
					const r0 = this.rowOf(f.y)
					for (let r = Math.max(0, r0 - 2); r <= r0 + 2; r++) {
						for (let c = 0; c < this.COLS; c++) {
							if (this.cellAt(r, c) != null) continue
							const px = this.cellX(r, c)
							const py = this.cellY(r)
							const d = (px - f.x) * (px - f.x) + (py - f.y) * (py - f.y)
							if (d < bestD) {
								bestD = d
								cell = { r, c }
							}
						}
					}
				}
				if (!cell) return

				this.ensureRows(cell.r)
				this.g.rows[cell.r][cell.c] = f.ci
				this.shake(1.5)

				const cluster = this.sameCluster(cell.r, cell.c)
				if (cluster.length >= 3) {
					this.popCluster(cluster)
					this.checkClear()
				}
				if (this.state !== 'playing') return

				this.g.shots += 1
				if (this.g.shots % this.g.pushEvery === 0) this.pushRow()
				this.checkOver()
			},

			sameCluster(r, c) {
				const ci = this.cellAt(r, c)
				if (ci == null) return []
				const seen = {}
				const out = []
				const stack = [[r, c]]
				seen[r * 64 + c] = 1
				while (stack.length) {
					const cur = stack.pop()
					out.push({ r: cur[0], c: cur[1] })
					const nb = this.neighbors(cur[0], cur[1])
					for (let i = 0; i < nb.length; i++) {
						const nr = nb[i][0]
						const nc = nb[i][1]
						if (nr < 0 || nc < 0 || nc >= this.COLS) continue
						const key = nr * 64 + nc
						if (seen[key]) continue
						if (this.cellAt(nr, nc) !== ci) continue
						seen[key] = 1
						stack.push([nr, nc])
					}
				}
				return out
			},

			popCluster(list) {
				const g = this.g
				let sx = 0
				let sy = 0
				for (let i = 0; i < list.length; i++) {
					const cell = list[i]
					const ci = this.cellAt(cell.r, cell.c)
					if (ci == null) continue
					const px = this.cellX(cell.r, cell.c)
					const py = this.cellY(cell.r)
					g.pops.push({ x: px, y: py, r: this.R, ci, t: 0 })
					this.spray(px, py, ci, 5)
					g.rows[cell.r][cell.c] = null
					sx += px
					sy += py
				}
				const bonus = Math.max(0, list.length - 3) * 8
				const gain = list.length * 10 + bonus
				this.addScore(gain, sx / list.length, sy / list.length - 10)
				this.shake(2 + Math.min(6, list.length * 0.6))
				this.dropFloating()
			},

			// 从顶行做一次连通性搜索，搜不到的整片掉落
			dropFloating() {
				const g = this.g
				const seen = {}
				const stack = []
				const row0 = g.rows[0] || []
				for (let c = 0; c < row0.length; c++) {
					if (row0[c] != null) {
						seen[c] = 1
						stack.push([0, c])
					}
				}
				while (stack.length) {
					const cur = stack.pop()
					const nb = this.neighbors(cur[0], cur[1])
					for (let i = 0; i < nb.length; i++) {
						const nr = nb[i][0]
						const nc = nb[i][1]
						if (nr < 0 || nc < 0 || nc >= this.COLS) continue
						if (this.cellAt(nr, nc) == null) continue
						const key = nr * 64 + nc
						if (seen[key]) continue
						seen[key] = 1
						stack.push([nr, nc])
					}
				}

				let n = 0
				for (let r = 0; r < g.rows.length; r++) {
					for (let c = 0; c < this.COLS; c++) {
						if (g.rows[r][c] == null) continue
						if (seen[r * 64 + c]) continue
						g.falls.push({
							x: this.cellX(r, c),
							y: this.cellY(r),
							vx: (Math.random() - 0.5) * 70,
							vy: -60 - Math.random() * 90,
							ci: g.rows[r][c]
						})
						g.rows[r][c] = null
						n += 1
					}
				}
				if (n) {
					this.addScore(n * 20, this.shooterX, this.deathY - 60)
					this.shake(3 + Math.min(6, n))
				}
				this.trimRows()
			},

			trimRows() {
				const g = this.g
				while (g.rows.length > 2) {
					const last = g.rows[g.rows.length - 1]
					let empty = true
					for (let c = 0; c < last.length; c++) {
						if (last[c] != null) {
							empty = false
							break
						}
					}
					if (!empty) break
					g.rows.pop()
				}
			},

			// 补一行：插到最上面，老泡泡整体下移一行（横坐标靠 shift 保持不变）
			pushRow() {
				const g = this.g
				const row = []
				for (let c = 0; c < this.COLS; c++) row.push(Math.floor(Math.random() * g.colors))
				g.rows.unshift(row)
				g.shift += 1
				g.flash = 0.55
				this.shake(4)
				this.trimRows()
			},

			checkOver() {
				const g = this.g
				for (let r = g.rows.length - 1; r >= 0; r--) {
					for (let c = 0; c < this.COLS; c++) {
						if (g.rows[r][c] == null) continue
						if (this.cellY(r) + this.R * 0.75 > this.deathY) {
							this.gameOver()
							return
						}
					}
				}
			},

			checkClear() {
				const g = this.g
				for (let r = 0; r < g.rows.length; r++) {
					for (let c = 0; c < this.COLS; c++) {
						if (g.rows[r][c] != null) return
					}
				}
				this.clearLevel()
			},

			/* ---------------- 特效 ---------------- */
			shake(v) {
				if (!this.g) return
				this.g.shake = Math.min(12, this.g.shake + v)
			},

			addScore(v, x, y) {
				const g = this.g
				if (!g) return
				g.score += v
				g.texts.push({ x, y, vy: -34, txt: '+' + v, life: 0.85, max: 0.85 })
			},

			spray(x, y, ci, n) {
				const g = this.g
				const room = MAX_FX - g.parts.length
				const count = Math.min(n, Math.max(0, room))
				for (let i = 0; i < count; i++) {
					const a = Math.random() * Math.PI * 2
					const sp = 60 + Math.random() * 190
					g.parts.push({
						x,
						y,
						vx: Math.cos(a) * sp,
						vy: Math.sin(a) * sp - 40,
						g: 720,
						r: 1.6 + Math.random() * 2.6,
						ci,
						life: 0.35 + Math.random() * 0.35,
						max: 0.7
					})
				}
			},

			stepFx(dt) {
				const g = this.g
				if (!g) return
				for (let i = g.pops.length - 1; i >= 0; i--) {
					const p = g.pops[i]
					p.t += dt
					if (p.t > 0.3) g.pops.splice(i, 1)
				}
				for (let i = g.parts.length - 1; i >= 0; i--) {
					const p = g.parts[i]
					p.vy += p.g * dt
					p.x += p.vx * dt
					p.y += p.vy * dt
					p.vx *= 1 - dt * 1.6
					p.life -= dt
					if (p.life <= 0) g.parts.splice(i, 1)
				}
				for (let i = g.falls.length - 1; i >= 0; i--) {
					const f = g.falls[i]
					f.vy += 1500 * dt
					f.x += f.vx * dt
					f.y += f.vy * dt
					if (f.y - this.R > this.H + 60) g.falls.splice(i, 1)
				}
				for (let i = g.texts.length - 1; i >= 0; i--) {
					const t = g.texts[i]
					t.y += t.vy * dt
					t.life -= dt
					if (t.life <= 0) g.texts.splice(i, 1)
				}
			},

			/* ---------------- 绘制 ---------------- */
			paintBg(ctx) {
				const W = this.W
				const H = this.H
				if (!this.bgGrad) {
					try {
						const grad = ctx.createLinearGradient(0, 0, 0, H)
						grad.addColorStop(0, '#1b1338')
						grad.addColorStop(0.52, '#120e2b')
						grad.addColorStop(1, '#07060f')
						this.bgGrad = grad
					} catch (e) {
						this.bgGrad = '#120e2b'
					}
				}
				ctx.fillStyle = this.bgGrad
				ctx.fillRect(0, 0, W, H)

				// 左右墙的淡淡高光，让场地边界看得出来
				ctx.fillStyle = 'rgba(140, 130, 255, 0.07)'
				ctx.fillRect(this.left - 1, this.gridTop, 2, this.deathY - this.gridTop)
				ctx.fillRect(this.right - 1, this.gridTop, 2, this.deathY - this.gridTop)
			},

			paintCeiling(ctx) {
				const x = this.left
				const w = this.fieldW
				const y = this.gridTop - 7
				ctx.fillStyle = 'rgba(126, 108, 220, 0.32)'
				ctx.fillRect(x, y, w, 7)
				ctx.fillStyle = 'rgba(180, 168, 255, 0.5)'
				ctx.fillRect(x, y, w, 1.5)
			},

			drawBubble(ctx, x, y, r, ci) {
				const p = PALETTE[ci % PALETTE.length]
				ctx.beginPath()
				ctx.arc(x, y, r, 0, Math.PI * 2)
				ctx.fillStyle = p.fill
				ctx.fill()

				// 底部暗弧，做出球的下沿
				ctx.beginPath()
				ctx.arc(x, y + r * 0.1, r * 0.84, Math.PI * 0.12, Math.PI * 0.88)
				ctx.strokeStyle = p.dark
				ctx.lineWidth = Math.max(1.4, r * 0.16)
				ctx.stroke()

				// 高光
				ctx.beginPath()
				ctx.arc(x - r * 0.3, y - r * 0.33, r * 0.3, 0, Math.PI * 2)
				ctx.fillStyle = p.light
				ctx.globalAlpha = 0.85
				ctx.fill()
				ctx.beginPath()
				ctx.arc(x - r * 0.42, y - r * 0.44, r * 0.11, 0, Math.PI * 2)
				ctx.fillStyle = '#ffffff'
				ctx.fill()
				ctx.globalAlpha = 1
			},

			paintGrid(ctx) {
				const g = this.g
				if (!g) return
				for (let r = 0; r < g.rows.length; r++) {
					const row = g.rows[r]
					const y = this.cellY(r)
					if (y - this.R > this.H) continue
					for (let c = 0; c < row.length; c++) {
						if (row[c] == null) continue
						this.drawBubble(ctx, this.cellX(r, c), y, this.R, row[c])
					}
				}
			},

			paintDeath(ctx) {
				const y = this.deathY
				ctx.save()
				if (ctx.setLineDash) ctx.setLineDash([7, 7])
				ctx.beginPath()
				ctx.moveTo(this.left, y)
				ctx.lineTo(this.right, y)
				ctx.strokeStyle = 'rgba(255, 92, 108, 0.45)'
				ctx.lineWidth = 1.5
				ctx.stroke()
				if (ctx.setLineDash) ctx.setLineDash([])
				ctx.restore()
			},

			paintFalling(ctx) {
				const g = this.g
				for (let i = 0; i < g.falls.length; i++) {
					const f = g.falls[i]
					if (f.y < -this.R || f.y > this.H + this.R) continue
					this.drawBubble(ctx, f.x, f.y, this.R, f.ci)
				}
			},

			// 瞄准虚线（最多反弹三次，靠步进模拟）
			aimTrace() {
				const R = this.R
				const pts = []
				let x = this.shooterX
				let y = this.shooterY
				let dx = Math.cos(this.aim)
				let dy = Math.sin(this.aim)
				const step = Math.max(6, R * 0.52)
				let guard = 0
				while (guard++ < 420) {
					x += dx * step
					y += dy * step
					if (x - R < this.left) {
						x = this.left + R
						dx = -dx
						pts.push({ x, y, b: 1 })
					} else if (x + R > this.right) {
						x = this.right - R
						dx = -dx
						pts.push({ x, y, b: 1 })
					} else {
						pts.push({ x, y })
					}
					if (y <= this.gridTop + R) break
					if (this.hitBubbleAt(x, y)) break
				}
				return pts
			},

			paintAim(ctx) {
				if (this.state !== 'playing' || !this.aimOn || this.fly) return
				const pts = this.aimTrace()
				if (!pts.length) return
				const p = PALETTE[this.cur % PALETTE.length]
				const rr = this.R * 0.16
				for (let i = 2; i < pts.length; i += 3) {
					const t = i / pts.length
					ctx.globalAlpha = 0.62 * (1 - t * 0.72)
					ctx.beginPath()
					ctx.arc(pts[i].x, pts[i].y, rr, 0, Math.PI * 2)
					ctx.fillStyle = p.fill
					ctx.fill()
				}
				ctx.globalAlpha = 1
				// 落点提示圈
				const last = pts[pts.length - 1]
				ctx.beginPath()
				ctx.arc(last.x, last.y, this.R * 0.92, 0, Math.PI * 2)
				ctx.strokeStyle = p.light
				ctx.globalAlpha = 0.55
				ctx.lineWidth = 2
				ctx.stroke()
				ctx.globalAlpha = 1
			},

			paintFly(ctx) {
				const f = this.fly
				if (!f) return
				this.drawBubble(ctx, f.x, f.y, this.R, f.ci)
			},

			paintShooter(ctx) {
				const x = this.shooterX
				const y = this.shooterY
				const R = this.R

				// 底座
				ctx.beginPath()
				ctx.arc(x, y, R * 1.5, 0, Math.PI * 2)
				ctx.fillStyle = 'rgba(120, 100, 220, 0.16)'
				ctx.fill()

				// 炮管
				const bx = Math.cos(this.aim)
				const by = Math.sin(this.aim)
				ctx.save()
				ctx.translate(x, y)
				ctx.rotate(Math.atan2(by, bx) + Math.PI / 2)
				ctx.fillStyle = 'rgba(146, 126, 240, 0.72)'
				ctx.fillRect(-R * 0.34, -R * 1.85, R * 0.68, R * 1.5)
				ctx.restore()

				// 待发射的球
				if (!this.fly) this.drawBubble(ctx, x, y, R, this.cur)
				else this.drawBubble(ctx, x, y, R * 0.6, this.cur)

				// 下一颗
				ctx.globalAlpha = 0.9
				this.drawBubble(ctx, this.nextX, this.nextY, this.nextR, this.next)
				ctx.globalAlpha = 1
				ctx.textAlign = 'center'
				ctx.textBaseline = 'middle'
				ctx.font = Math.round(9 * this.u) + 'px sans-serif'
				ctx.fillStyle = 'rgba(255, 255, 255, 0.42)'
				ctx.fillText('下一个', this.nextX, this.nextY - this.nextR - 9)

				// 还要几发补一行
				const g = this.g
				const left = g.pushEvery - (g.shots % g.pushEvery)
				const dx = this.left + 4
				const dy = this.shooterY + 12
				for (let i = 0; i < g.pushEvery; i++) {
					ctx.beginPath()
					ctx.arc(dx + i * 7, dy, 2.2, 0, Math.PI * 2)
					ctx.fillStyle = i < left ? 'rgba(255, 217, 61, 0.85)' : 'rgba(255, 255, 255, 0.16)'
					ctx.fill()
				}
			},

			paintFx(ctx) {
				const g = this.g
				// 爆开：外扩的色环
				for (let i = 0; i < g.pops.length; i++) {
					const p = g.pops[i]
					const k = p.t / 0.3
					const col = PALETTE[p.ci % PALETTE.length]
					ctx.globalAlpha = 1 - k
					ctx.beginPath()
					ctx.arc(p.x, p.y, p.r * (1 + k * 0.9), 0, Math.PI * 2)
					ctx.strokeStyle = col.light
					ctx.lineWidth = Math.max(1, 4 * (1 - k))
					ctx.stroke()
				}
				ctx.globalAlpha = 1

				for (let i = 0; i < g.parts.length; i++) {
					const p = g.parts[i]
					const col = PALETTE[p.ci % PALETTE.length]
					ctx.globalAlpha = Math.max(0, p.life / p.max)
					ctx.beginPath()
					ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
					ctx.fillStyle = col.fill
					ctx.fill()
				}
				ctx.globalAlpha = 1

				ctx.textAlign = 'center'
				ctx.textBaseline = 'middle'
				for (let i = 0; i < g.texts.length; i++) {
					const t = g.texts[i]
					ctx.globalAlpha = Math.max(0, t.life / t.max)
					ctx.font = 'bold ' + Math.round(14 * this.u) + 'px sans-serif'
					ctx.fillStyle = '#ffe066'
					ctx.fillText(t.txt, t.x, t.y)
				}
				ctx.globalAlpha = 1
			},

			paintHud(ctx) {
				const g = this.g
				const u = this.u
				const y = this.hudY

				// 关卡胶囊（左边让开返回键）
				const px = 48
				const pw = 56
				const ph = 24
				ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
				this.roundRect(ctx, px, y - ph / 2, pw, ph, ph / 2)
				ctx.fill()
				ctx.textAlign = 'center'
				ctx.textBaseline = 'middle'
				ctx.font = 'bold ' + Math.round(11 * u) + 'px sans-serif'
				ctx.fillStyle = 'rgba(255, 255, 255, 0.88)'
				ctx.fillText('第 ' + this.level + ' 关', px + pw / 2, y + 0.5)

				// 分数
				ctx.textAlign = 'center'
				ctx.font = 'bold ' + Math.round(22 * u) + 'px sans-serif'
				ctx.fillStyle = '#ffffff'
				ctx.fillText(String(g.score), this.W / 2, y + 1)
			},

			roundRect(ctx, x, y, w, h, r) {
				const rad = Math.min(r, w / 2, h / 2)
				ctx.beginPath()
				ctx.moveTo(x + rad, y)
				ctx.lineTo(x + w - rad, y)
				ctx.arcTo(x + w, y, x + w, y + rad, rad)
				ctx.lineTo(x + w, y + h - rad)
				ctx.arcTo(x + w, y + h, x + w - rad, y + h, rad)
				ctx.lineTo(x + rad, y + h)
				ctx.arcTo(x, y + h, x, y + h - rad, rad)
				ctx.lineTo(x, y + rad)
				ctx.arcTo(x, y, x + rad, y, rad)
				ctx.closePath()
			},

			// 统一的遮罩板：标题 + 若干行文字 + 呼吸提示
			paintOverlay(ctx, opt) {
				const W = this.W
				const H = this.H
				const u = this.u
				ctx.fillStyle = 'rgba(7, 5, 18, 0.74)'
				ctx.fillRect(0, 0, W, H)

				const cx = W / 2
				let y = H * 0.33
				ctx.textAlign = 'center'
				ctx.textBaseline = 'middle'

				ctx.font = 'bold ' + Math.round(34 * u) + 'px sans-serif'
				ctx.fillStyle = opt.accent || '#ffffff'
				ctx.fillText(opt.title, cx, y)

				y += 44 * u
				const lines = opt.lines || []
				for (let i = 0; i < lines.length; i++) {
					const line = lines[i]
					ctx.font = (line.bold ? 'bold ' : '') + Math.round((line.size || 14) * u) + 'px sans-serif'
					ctx.fillStyle = line.color || 'rgba(255, 255, 255, 0.82)'
					ctx.fillText(line.text, cx, y)
					y += (line.gap || 27) * u
				}

				if (opt.hint) {
					const pulse = 0.55 + 0.45 * Math.sin((this.g ? this.g.time : 0) * 3.4)
					ctx.globalAlpha = pulse
					ctx.font = Math.round(13 * u) + 'px sans-serif'
					ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
					ctx.fillText(opt.hint, cx, H * 0.7)
					ctx.globalAlpha = 1
				}
			},

			paintReady(ctx) {
				this.paintOverlay(ctx, {
					title: '泡泡龙',
					accent: '#ffd93d',
					lines: [
						{ text: '拖动瞄准 · 松手发射', size: 14, color: 'rgba(255,255,255,0.82)' },
						{ text: '三个同色连一起就能消', size: 13, color: 'rgba(255,255,255,0.6)', gap: 30 },
						{ text: '最高分 ' + this.best, size: 13, color: '#8ee6b8', gap: 34 }
					],
					hint: '点击屏幕开始'
				})
			},

			paintPaused(ctx) {
				this.paintOverlay(ctx, {
					title: '已暂停',
					lines: [{ text: '回来啦，点一下继续', size: 14 }],
					hint: '点击屏幕继续'
				})
			},

			paintOver(ctx) {
				this.paintOverlay(ctx, {
					title: '泡泡顶到底啦',
					accent: '#ff7a8c',
					lines: [
						{ text: String(this.g.score), size: 38, bold: true, color: '#ffd93d', gap: 24 },
						{ text: '本局得分', size: 12, color: 'rgba(255,255,255,0.55)', gap: 28 },
						{ text: '历史最高 ' + this.best, size: 13, color: '#8ee6b8', gap: 18 },
						{ text: '打到第 ' + this.level + ' 关', size: 13, color: 'rgba(255,255,255,0.7)' }
					],
					hint: this.endT > 0.7 ? '点击屏幕再来一局' : ''
				})
			},

			paintWin(ctx) {
				this.paintOverlay(ctx, {
					title: '第 ' + this.level + ' 关通过',
					accent: '#8ee6b8',
					lines: [
						{ text: String(this.g.score), size: 38, bold: true, color: '#ffd93d', gap: 24 },
						{ text: '累计得分', size: 12, color: 'rgba(255,255,255,0.55)', gap: 30 },
						{ text: '下一关：' + this.levelCfg(this.level + 1).colors + ' 种颜色', size: 13, color: 'rgba(255,255,255,0.72)' }
					],
					hint: this.endT > 0.6 ? '点击进入第 ' + (this.level + 1) + ' 关' : ''
				})
			},

			render() {
				const ctx = this.ctx
				const g = this.g
				if (!ctx || !g) return

				this.paintBg(ctx)

				ctx.save()
				if (g.shake > 0.2) {
					ctx.translate((Math.random() - 0.5) * g.shake, (Math.random() - 0.5) * g.shake)
				}
				this.paintCeiling(ctx)
				this.paintGrid(ctx)
				this.paintDeath(ctx)
				this.paintFalling(ctx)
				this.paintAim(ctx)
				this.paintFly(ctx)
				this.paintShooter(ctx)
				this.paintFx(ctx)
				ctx.restore()

				this.paintHud(ctx)

				if (g.flash > 0) {
					ctx.fillStyle = 'rgba(255, 255, 255, ' + (g.flash * 0.1).toFixed(3) + ')'
					ctx.fillRect(0, 0, this.W, this.H)
				}

				if (this.state === 'ready') this.paintReady(ctx)
				else if (this.state === 'paused') this.paintPaused(ctx)
				else if (this.state === 'over') this.paintOver(ctx)
				else if (this.state === 'win') this.paintWin(ctx)
			},

			/* ---------------- 触摸 ---------------- */
			pickPoint(e) {
				const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || {}
				let x
				let y
				if (typeof t.x === 'number' && typeof t.y === 'number') {
					// 小程序 canvas 给的是相对画布的坐标
					x = t.x
					y = t.y
				} else {
					x = typeof t.clientX === 'number' ? t.clientX : 0
					y = typeof t.clientY === 'number' ? t.clientY : 0
					try {
						const host = document.getElementById(this.canvasId)
						const el = host && String(host.tagName).toUpperCase() === 'CANVAS' ? host : this.pickDomCanvas()
						if (el && el.getBoundingClientRect) {
							const rect = el.getBoundingClientRect()
							x -= rect.left
							y -= rect.top
						}
					} catch (err) {
						// 小程序里没有 document
					}
				}
				return { x, y }
			},

			updateAim(pt) {
				const dx = pt.x - this.shooterX
				const dy = pt.y - this.shooterY
				// 手指跑到发射口下方时不改角度，免得一抖就翻到另一侧
				if (dy > -8) return
				const ang = Math.atan2(dy, dx)
				this.aim = clamp(ang, -Math.PI + 0.18, -0.18)
			},

			onTouchStart(e) {
				if (!this.ctx || !this.g) return
				const pt = this.pickPoint(e)

				if (this.state === 'ready') {
					this.startGame()
					this.noFire = true
					return
				}
				if (this.state === 'paused') {
					this.state = 'playing'
					this.noFire = true
					return
				}
				if (this.state === 'over') {
					if (this.endT > 0.7) this.startGame()
					this.noFire = true
					return
				}
				if (this.state === 'win') {
					if (this.endT > 0.6) this.nextLevel()
					this.noFire = true
					return
				}

				this.noFire = false

				// 点「下一个」那颗球可以换
				const dx = pt.x - this.nextX
				const dy = pt.y - this.nextY
				const rr = this.nextR * 1.75
				if (dx * dx + dy * dy < rr * rr) {
					const t = this.cur
					this.cur = this.next
					this.next = t
					this.noFire = true
					this.aimOn = false
					return
				}

				this.aimOn = true
				this.updateAim(pt)
			},

			onTouchMove(e) {
				if (this.state !== 'playing' || this.noFire) return
				this.aimOn = true
				this.updateAim(this.pickPoint(e))
			},

			onTouchEnd() {
				if (this.noFire) {
					this.noFire = false
					return
				}
				if (this.state !== 'playing') return
				this.fire()
				this.aimOn = false
			}
		}
	}
</script>

<style lang="scss" scoped>
	.bubble {
		position: relative;
		width: 100%;
		height: 100vh;
		overflow: hidden;
		background-color: #07060f;
		touch-action: none;
	}

	.stage {
		position: absolute;
		left: 0;
		top: 0;
		width: 100% !important;
		height: 100% !important;
		display: block;
	}

	/* cover-view 才能压在小程序原生 canvas 之上 */
	.back-btn {
		position: absolute;
		left: 20rpx;
		width: 64rpx;
		height: 64rpx;
		line-height: 62rpx;
		text-align: center;
		font-size: 34rpx;
		color: #ffffff;
		background-color: rgba(255, 255, 255, 0.14);
		border-radius: 32rpx;
		z-index: 99;
	}
</style>
