<template>
	<view class="game">
		<!-- 渐变头部 -->
		<view class="duck-head game-head">
			<view :style="{ height: statusBar + 'px' }"></view>

			<view class="nav-row">
				<view class="nav-back" hover-class="nav-back-hover" @tap="goBack">
					<view class="duck-ic-back"></view>
				</view>
				<text class="nav-title">五子棋</text>
				<text class="nav-act" @tap="restart">重开</text>
			</view>
		</view>

		<!-- 状态卡 -->
		<view class="status-card">
			<view class="side">
				<view class="side-dot is-black"></view>
				<text class="side-label">我方</text>
			</view>
			<view class="status-main">
				<text class="status-txt" :class="statusClass">{{ statusText }}</text>
				<text class="status-sub">{{ subText }}</text>
			</view>
			<view class="side">
				<view class="side-dot is-white"></view>
				<text class="side-label">电脑</text>
			</view>
		</view>

		<!-- 棋盘 -->
		<view class="board-wrap">
			<view class="board">
				<view class="frame"></view>

				<view class="line-v" v-for="n in 15" :key="'v' + n" :style="{ left: 22 + (n - 1) * 44 + 'rpx' }"></view>
				<view class="line-h" v-for="n in 15" :key="'h' + n" :style="{ top: 22 + (n - 1) * 44 + 'rpx' }"></view>

				<view class="star" v-for="(s, i) in stars" :key="'s' + i" :style="starStyle(s)"></view>

				<view class="cells">
					<view class="cell" v-for="(v, i) in board" :key="i" @tap="tapCell(i)">
						<view v-if="v" class="stone" :class="stoneClass(v, i)">
							<view v-if="i === lastMove" class="last-dot"></view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 操作 -->
		<view class="actions">
			<view class="act ghost" hover-class="act-hover" :class="{ 'is-off': !canUndo }" @tap="undo">悔棋</view>
			<view class="act primary" hover-class="act-hover" @tap="restart">重新开始</view>
		</view>

		<text class="tip">你执黑先行，五子连珠即胜 · 战绩 {{ record.win }} 胜 {{ record.lose }} 负 {{ record.draw }} 平</text>

		<!-- 结算弹窗 -->
		<view class="result-mask" v-if="showResult" @tap="hideResult">
			<view class="result-card" @tap.stop>
				<view class="result-badge" :class="statusClass">
					<text class="result-badge-txt">{{ resultBadge }}</text>
				</view>
				<text class="result-title" :class="statusClass">{{ statusText }}</text>
				<text class="result-sub">{{ resultSub }}</text>
				<view class="result-record">
					<text class="record-txt">{{ record.win }} 胜 · {{ record.lose }} 负 · {{ record.draw }} 平</text>
				</view>
				<view class="result-btns">
					<view class="rbtn ghost" hover-class="act-hover" @tap="hideResult">看看棋盘</view>
					<view class="rbtn primary" hover-class="act-hover" @tap="playAgain">再来一局</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	const SIZE = 15
	const TOTAL = SIZE * SIZE
	// 四个方向：横、竖、正斜、反斜
	const DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]]

	export default {
		data() {
			return {
				statusBar: 0,
				board: new Array(TOTAL).fill(0),
				turn: 1, // 1 我方（黑） / 2 电脑（白）
				status: 'playing', // playing / win / lose / draw
				thinking: false,
				gen: 0,
				history: [],
				lastMove: -1,
				winLine: [],
				showResult: false,
				record: { win: 0, lose: 0, draw: 0 },
				stars: [[3, 3], [3, 11], [11, 3], [11, 11], [7, 7]]
			}
		},
		computed: {
			statusText() {
				if (this.status === 'win') return '你赢了'
				if (this.status === 'lose') return '电脑赢了'
				if (this.status === 'draw') return '平局'
				return this.thinking ? '电脑思考中' : '轮到你落子'
			},
			subText() {
				if (this.status === 'win') return '五子连珠，漂亮'
				if (this.status === 'lose') return '再来一局，找回场子'
				if (this.status === 'draw') return '棋盘满了，握个手'
				return '点击棋盘交叉点落子'
			},
			statusClass() {
				return 'is-' + this.status
			},
			resultBadge() {
				if (this.status === 'win') return '胜'
				if (this.status === 'lose') return '负'
				return '和'
			},
			resultSub() {
				if (this.status === 'win') return '五子连珠，这一局是你的'
				if (this.status === 'lose') return '差一点，再来一局找回场子'
				return '棋盘下满了，握手言和'
			},
			canUndo() {
				return !this.thinking && this.history.length > 0
			}
		},
		onLoad() {
			try {
				const info = uni.getSystemInfoSync()
				this.statusBar = info.statusBarHeight || 0
			} catch (e) {
				this.statusBar = 0
			}
			this.reset()
		},
		methods: {
			goBack() {
				uni.navigateBack({
					fail: () => {
						uni.switchTab({ url: '/pages/interview/mine/mine' })
					}
				})
			},
			starStyle(s) {
				return {
					left: 22 + s[0] * 44 - 3 + 'rpx',
					top: 22 + s[1] * 44 - 3 + 'rpx'
				}
			},
			stoneClass(v, i) {
				const cls = [v === 1 ? 'is-black' : 'is-white']
				if (this.winLine.indexOf(i) > -1) cls.push('is-win')
				return cls
			},
			reset() {
				this.gen += 1
				this.board = new Array(TOTAL).fill(0)
				this.turn = 1
				this.status = 'playing'
				this.thinking = false
				this.history = []
				this.lastMove = -1
				this.winLine = []
				this.showResult = false
			},
			restart() {
				this.reset()
			},
			tapCell(idx) {
				if (this.status !== 'playing' || this.thinking) return
				if (this.turn !== 1 || this.board[idx]) return
				this.place(idx, 1)
				if (this.status !== 'playing') return
				this.turn = 2
				this.thinking = true
				const gen = this.gen
				setTimeout(() => {
					if (gen !== this.gen) return
					this.aiMove()
				}, 260)
			},
			place(idx, color) {
				this.board[idx] = color
				this.history.push(idx)
				this.lastMove = idx
				const line = this.checkWin(idx, color)
				if (line) {
					this.winLine = line
					this.status = color === 1 ? 'win' : 'lose'
					this.record[color === 1 ? 'win' : 'lose'] += 1
					this.popResult()
					return
				}
				if (this.history.length >= TOTAL) {
					this.status = 'draw'
					this.record.draw += 1
					this.popResult()
				}
			},
			// 等胜子高亮画出来再弹窗
			popResult() {
				const gen = this.gen
				if (typeof uni.vibrateShort === 'function') {
					uni.vibrateShort({ type: 'medium', fail: () => {} })
				}
				setTimeout(() => {
					if (gen !== this.gen) return
					if (this.status === 'playing') return
					this.showResult = true
				}, 320)
			},
			hideResult() {
				this.showResult = false
			},
			playAgain() {
				this.showResult = false
				this.reset()
			},
			aiMove() {
				const idx = this.pickMove()
				if (idx >= 0) this.place(idx, 2)
				this.thinking = false
				if (this.status === 'playing') this.turn = 1
			},
			undo() {
				if (!this.canUndo) return
				// 回退到最近一次我方落子之前（我方 + 电脑各一手）
				while (this.history.length) {
					const idx = this.history.pop()
					const who = this.board[idx]
					this.board[idx] = 0
					if (who === 1) break
				}
				this.status = 'playing'
				this.winLine = []
				this.turn = 1
				this.lastMove = this.history.length ? this.history[this.history.length - 1] : -1
			},
			/* ---------- 胜负判定 ---------- */
			checkWin(idx, color) {
				const x = Math.floor(idx / SIZE)
				const y = idx % SIZE
				for (let d = 0; d < DIRS.length; d++) {
					const dx = DIRS[d][0]
					const dy = DIRS[d][1]
					const line = [idx]
					for (let s = -1; s <= 1; s += 2) {
						let i = x + dx * s
						let j = y + dy * s
						while (i >= 0 && i < SIZE && j >= 0 && j < SIZE && this.board[i * SIZE + j] === color) {
							line.push(i * SIZE + j)
							i += dx * s
							j += dy * s
						}
					}
					if (line.length >= 5) {
						line.sort((a, b) => a - b)
						return line
					}
				}
				return null
			},
			/* ---------- 电脑走子 ---------- */
			pickMove() {
				const empty = this.history.length === 0
				if (empty) return Math.floor(TOTAL / 2)
				const cand = this.candidates()
				for (let i = 0; i < cand.length; i++) {
					if (this.scoreAt(cand[i], 2) >= 1000000) return cand[i]
				}
				for (let i = 0; i < cand.length; i++) {
					if (this.scoreAt(cand[i], 1) >= 1000000) return cand[i]
				}
				let best = cand[0]
				let bestScore = -1
				for (let i = 0; i < cand.length; i++) {
					const idx = cand[i]
					const score = this.scoreAt(idx, 2) * 1.15 + this.scoreAt(idx, 1)
					if (score > bestScore) {
						bestScore = score
						best = idx
					}
				}
				return best
			},
			candidates() {
				const list = []
				for (let i = 0; i < SIZE; i++) {
					for (let j = 0; j < SIZE; j++) {
						if (this.board[i * SIZE + j]) continue
						let near = false
						for (let dx = -2; dx <= 2 && !near; dx++) {
							for (let dy = -2; dy <= 2; dy++) {
								const x = i + dx
								const y = j + dy
								if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) continue
								if (this.board[x * SIZE + y]) {
									near = true
									break
								}
							}
						}
						if (near) list.push(i * SIZE + j)
					}
				}
				return list.length ? list : [Math.floor(TOTAL / 2)]
			},
			scoreAt(idx, color) {
				const x = Math.floor(idx / SIZE)
				const y = idx % SIZE
				let total = 0
				for (let d = 0; d < DIRS.length; d++) {
					total += this.lineScore(x, y, DIRS[d][0], DIRS[d][1], color)
				}
				return total
			},
			lineScore(x, y, dx, dy, color) {
				let count = 1
				let open = 0
				for (let s = -1; s <= 1; s += 2) {
					let i = x + dx * s
					let j = y + dy * s
					while (i >= 0 && i < SIZE && j >= 0 && j < SIZE && this.board[i * SIZE + j] === color) {
						count++
						i += dx * s
						j += dy * s
					}
					if (i >= 0 && i < SIZE && j >= 0 && j < SIZE && this.board[i * SIZE + j] === 0) open++
				}
				if (count >= 5) return 1000000
				if (count === 4) return open === 2 ? 100000 : open === 1 ? 12000 : 0
				if (count === 3) return open === 2 ? 8000 : open === 1 ? 800 : 0
				if (count === 2) return open === 2 ? 600 : open === 1 ? 80 : 0
				if (count === 1) return open === 2 ? 30 : 8
				return 0
			}
		}
	}
</script>

<style lang="scss" scoped>
	.game {
		min-height: 100vh;
		background-color: $duck-bg;
		padding-bottom: 60rpx;
		box-sizing: border-box;
	}

	/* ---------- 头部 ---------- */
	.game-head {
		padding-bottom: 80rpx;
	}

	.nav-row {
		height: 88rpx;
		display: flex;
		align-items: center;
		padding: 0 24rpx;
	}

	.nav-back {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.18);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.nav-back-hover {
		background-color: rgba(255, 255, 255, 0.3);
	}

	.nav-title {
		flex: 1;
		text-align: center;
		font-size: 34rpx;
		font-weight: 600;
		color: #ffffff;
		letter-spacing: 1rpx;
	}

	.nav-act {
		width: 60rpx;
		text-align: right;
		font-size: 27rpx;
		color: rgba(255, 255, 255, 0.92);
	}

	/* ---------- 状态卡 ---------- */
	.status-card {
		display: flex;
		align-items: center;
		margin: -56rpx 24rpx 0;
		padding: 26rpx 24rpx;
		background-color: #ffffff;
		border-radius: 24rpx;
		box-shadow: 0 6rpx 22rpx rgba(20, 32, 26, 0.07);
		position: relative;
		z-index: 2;
	}

	.side {
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.side-dot {
		width: 30rpx;
		height: 30rpx;
		border-radius: 50%;
		margin-right: 10rpx;
	}

	.side-dot.is-black {
		background: radial-gradient(circle at 32% 30%, #5c5c5c, #141414 74%);
	}

	.side-dot.is-white {
		background: radial-gradient(circle at 32% 30%, #ffffff, #dfe3e4 74%);
		border: 1rpx solid #d3d8d9;
	}

	.side-label {
		font-size: 23rpx;
		color: $duck-text-muted;
	}

	.status-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 0;
	}

	.status-txt {
		font-size: 30rpx;
		font-weight: 700;
		color: $duck-text;
	}

	.status-txt.is-win {
		color: $duck-primary;
	}

	.status-txt.is-lose {
		color: $duck-danger;
	}

	.status-sub {
		margin-top: 6rpx;
		font-size: 21rpx;
		color: $duck-text-muted;
	}

	/* ---------- 棋盘 ---------- */
	.board-wrap {
		margin: 22rpx 24rpx 0;
		padding: 18rpx;
		background-color: #ffffff;
		border-radius: 24rpx;
		box-shadow: 0 4rpx 18rpx rgba(20, 32, 26, 0.06);
	}

	.board {
		position: relative;
		width: 660rpx;
		height: 660rpx;
		background: linear-gradient(160deg, #f0d3a8 0%, #e8c69a 100%);
		border-radius: 12rpx;
		overflow: hidden;
	}

	.frame {
		position: absolute;
		left: 21rpx;
		top: 21rpx;
		width: 618rpx;
		height: 618rpx;
		border: 2rpx solid #b1895f;
		border-radius: 4rpx;
		box-sizing: border-box;
	}

	.line-v {
		position: absolute;
		top: 22rpx;
		width: 2rpx;
		height: 616rpx;
		background-color: #c19a70;
	}

	.line-h {
		position: absolute;
		left: 22rpx;
		width: 616rpx;
		height: 2rpx;
		background-color: #c19a70;
	}

	.star {
		position: absolute;
		width: 6rpx;
		height: 6rpx;
		border-radius: 50%;
		background-color: #8f6a45;
	}

	.cells {
		position: absolute;
		left: 0;
		top: 0;
		width: 660rpx;
		height: 660rpx;
		display: flex;
		flex-wrap: wrap;
	}

	.cell {
		width: 44rpx;
		height: 44rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.stone {
		width: 36rpx;
		height: 36rpx;
		border-radius: 50%;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.stone.is-black {
		background: radial-gradient(circle at 32% 30%, #5c5c5c, #121212 74%);
		box-shadow: 0 2rpx 4rpx rgba(60, 40, 20, 0.35);
	}

	.stone.is-white {
		background: radial-gradient(circle at 32% 30%, #ffffff, #dfe3e4 78%);
		border: 1rpx solid #cdd2d3;
		box-shadow: 0 2rpx 4rpx rgba(60, 40, 20, 0.2);
	}

	.stone.is-win {
		box-shadow: 0 0 0 4rpx rgba(0, 181, 120, 0.85), 0 0 12rpx rgba(0, 181, 120, 0.5);
	}

	.last-dot {
		width: 10rpx;
		height: 10rpx;
		border-radius: 50%;
		background-color: $duck-primary;
	}

	/* ---------- 操作 ---------- */
	.actions {
		display: flex;
		margin: 26rpx 24rpx 0;
	}

	.act {
		flex: 1;
		height: 84rpx;
		line-height: 84rpx;
		text-align: center;
		border-radius: 999rpx;
		font-size: 28rpx;
		font-weight: 600;
	}

	.act + .act {
		margin-left: 20rpx;
	}

	.act.ghost {
		background-color: #ffffff;
		color: $duck-text-sub;
		border: 2rpx solid $duck-border;
		height: 80rpx;
		line-height: 76rpx;
	}

	.act.primary {
		background: $duck-grad-btn;
		color: #ffffff;
		box-shadow: 0 8rpx 18rpx rgba(0, 181, 120, 0.24);
	}

	.act-hover {
		opacity: 0.86;
	}

	.act.is-off {
		opacity: 0.45;
	}

	.tip {
		display: block;
		margin-top: 24rpx;
		text-align: center;
		font-size: 21rpx;
		color: #b3beb8;
		padding: 0 40rpx;
	}

	/* ---------- 结算弹窗 ---------- */
	.result-mask {
		position: fixed;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(12, 26, 20, 0.46);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 99;
		animation: mask-in 0.2s ease both;
	}

	.result-card {
		width: 560rpx;
		padding: 46rpx 36rpx 34rpx;
		background-color: #ffffff;
		border-radius: 32rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		box-sizing: border-box;
		animation: card-pop 0.42s cubic-bezier(0.18, 1.5, 0.42, 1) both;
	}

	.result-badge {
		width: 116rpx;
		height: 116rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 26rpx;
		animation: badge-pop 0.5s cubic-bezier(0.2, 1.6, 0.4, 1) 0.1s both;
	}

	.result-badge.is-win {
		background: linear-gradient(135deg, #56cf9b, #00b578);
		box-shadow: 0 10rpx 26rpx rgba(0, 181, 120, 0.32);
	}

	.result-badge.is-lose {
		background: linear-gradient(135deg, #ff9f9f, #ff4d4f);
		box-shadow: 0 10rpx 26rpx rgba(255, 77, 79, 0.28);
	}

	.result-badge.is-draw {
		background: linear-gradient(135deg, #c7d2cd, #9aa8a3);
		box-shadow: 0 10rpx 26rpx rgba(120, 140, 132, 0.26);
	}

	.result-badge-txt {
		font-size: 56rpx;
		font-weight: 700;
		color: #ffffff;
		letter-spacing: 2rpx;
	}

	.result-title {
		font-size: 42rpx;
		font-weight: 700;
		color: $duck-text;
	}

	.result-title.is-win {
		color: $duck-primary-dark;
	}

	.result-title.is-lose {
		color: $duck-danger;
	}

	.result-sub {
		margin-top: 12rpx;
		font-size: 24rpx;
		color: $duck-text-muted;
		text-align: center;
	}

	.result-record {
		margin-top: 20rpx;
		padding: 8rpx 22rpx;
		border-radius: 999rpx;
		background-color: $duck-primary-soft;
	}

	.record-txt {
		font-size: 21rpx;
		color: $duck-primary-dark;
	}

	.result-btns {
		display: flex;
		width: 100%;
		margin-top: 34rpx;
	}

	.rbtn {
		flex: 1;
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		border-radius: 999rpx;
		font-size: 27rpx;
		font-weight: 600;
	}

	.rbtn + .rbtn {
		margin-left: 18rpx;
	}

	.rbtn.ghost {
		background-color: #f4f6f5;
		color: $duck-text-sub;
	}

	.rbtn.primary {
		background: $duck-grad-btn;
		color: #ffffff;
		box-shadow: 0 8rpx 18rpx rgba(0, 181, 120, 0.22);
	}

	@keyframes mask-in {
		from {
			opacity: 0;
		}

		to {
			opacity: 1;
		}
	}

	@keyframes card-pop {
		0% {
			transform: scale(0.68);
			opacity: 0;
		}

		55% {
			transform: scale(1.06);
			opacity: 1;
		}

		78% {
			transform: scale(0.98);
		}

		100% {
			transform: scale(1);
		}
	}

	@keyframes badge-pop {
		0% {
			transform: scale(0.4);
			opacity: 0;
		}

		70% {
			transform: scale(1.12);
			opacity: 1;
		}

		100% {
			transform: scale(1);
		}
	}
</style>
