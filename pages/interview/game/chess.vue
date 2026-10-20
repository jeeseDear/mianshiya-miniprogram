<template>
	<view class="chess">
		<!-- 渐变头部 -->
		<view class="duck-head chess-head">
			<view :style="{ height: statusBar + 'px' }"></view>

			<view class="nav-row">
				<view class="nav-back" hover-class="nav-back-hover" @tap="goBack">
					<view class="duck-ic-back"></view>
				</view>
				<text class="nav-title">象棋</text>
				<text class="nav-act" @tap="restart">重开</text>
			</view>
		</view>

		<!-- 状态卡 -->
		<view class="status-card">
			<view class="side">
				<view class="side-dot is-red"></view>
				<text class="side-label">我方</text>
			</view>
			<view class="status-main">
				<text class="status-txt" :class="statusClass">{{ statusText }}</text>
				<text class="status-sub">{{ subText }}</text>
			</view>
			<view class="side">
				<view class="side-dot is-black"></view>
				<text class="side-label">电脑</text>
			</view>
		</view>

		<!-- 棋盘 -->
		<view class="board-wrap">
			<view class="board">
				<text class="river river-l">楚 河</text>
				<text class="river river-r">汉 界</text>

				<view class="hl" v-for="n in 10" :key="'h' + n" :style="{ top: 36 + (n - 1) * 66 + 'rpx' }"></view>

				<block v-for="n in 9" :key="'v' + n">
					<view v-if="n === 1 || n === 9" class="vl" :style="{ left: 36 + (n - 1) * 66 + 'rpx', top: '36rpx', height: '594rpx' }"></view>
					<block v-else>
						<view class="vl" :style="{ left: 36 + (n - 1) * 66 + 'rpx', top: '36rpx', height: '264rpx' }"></view>
						<view class="vl" :style="{ left: 36 + (n - 1) * 66 + 'rpx', top: '366rpx', height: '264rpx' }"></view>
					</block>
				</block>

				<view class="diag" v-for="(d, i) in diagonals" :key="'d' + i" :style="d"></view>

				<view class="board-edge"></view>

				<view class="mark" v-for="(m, i) in marks" :key="'m' + i" :style="m"></view>

				<view class="pc" v-for="p in pieces" :key="p.idx" :style="pieceStyle(p)" :class="[p.side === 1 ? 'is-red' : 'is-black', selected === p.idx ? 'is-sel' : '', targets.indexOf(p.idx) > -1 ? 'is-take' : '']">
					<text class="pc-ch">{{ p.ch }}</text>
				</view>

				<!-- 点击层 -->
				<view class="cells">
					<view class="cell" v-for="n in 90" :key="'c' + n" @tap="handleTap(n - 1)"></view>
				</view>
			</view>
		</view>

		<!-- 操作 -->
		<view class="actions">
			<view class="act ghost" hover-class="act-hover" :class="{ 'is-off': !canUndo }" @tap="undo">悔棋</view>
			<view class="act primary" hover-class="act-hover" @tap="restart">重新开始</view>
		</view>

		<text class="tip">你执红先行 · 吃掉对方将帅即胜 · 已走 {{ history.length }} 步</text>

		<!-- 结算弹窗 -->
		<view class="result-mask" v-if="showResult" @tap="hideResult">
			<view class="result-card" @tap.stop>
				<view class="result-badge" :class="statusClass">
					<text class="result-badge-txt">{{ resultBadge }}</text>
				</view>
				<text class="result-title" :class="statusClass">{{ statusText }}</text>
				<text class="result-sub">{{ resultSub }}</text>
				<view class="result-btns">
					<view class="rbtn ghost" hover-class="act-hover" @tap="hideResult">看看棋盘</view>
					<view class="rbtn primary" hover-class="act-hover" @tap="playAgain">再来一局</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		RED,
		BLACK,
		K,
		initBoard,
		listPieces,
		movesFrom,
		legalMoves,
		applyMove,
		undoMove,
		moveFrom,
		moveTo,
		searchBest,
		attacked,
		findKing
	} from '@/common/xiangqi.js'

	export default {
		data() {
			return {
				statusBar: 0,
				board: initBoard(),
				turn: RED,
				status: 'playing', // playing / win / lose
				thinking: false,
				gen: 0,
				history: [],
				selected: -1,
				targets: [],
				lastFrom: -1,
				lastTo: -1,
				showResult: false,
				diagonals: [
					'left:206rpx;top:101rpx;transform:rotate(45deg)',
					'left:206rpx;top:101rpx;transform:rotate(-45deg)',
					'left:206rpx;top:563rpx;transform:rotate(45deg)',
					'left:206rpx;top:563rpx;transform:rotate(-45deg)'
				]
			}
		},
		computed: {
			pieces() {
				return listPieces(this.board)
			},
			marks() {
				const out = []
				if (this.lastFrom >= 0) out.push(this.markStyle(this.lastFrom))
				if (this.lastTo >= 0) out.push(this.markStyle(this.lastTo))
				return out
			},
			statusText() {
				if (this.status === 'win') return '你赢了'
				if (this.status === 'lose') return '电脑赢了'
				if (this.thinking) return '电脑思考中'
				return '轮到你走棋'
			},
			subText() {
				if (this.status === 'win') return '将死了，这局漂亮'
				if (this.status === 'lose') return '再来一局，找回场子'
				if (this.isChecked(RED)) return '你被将军了，先解将'
				if (this.thinking) return '稍等一下'
				return '点棋子选中，再点目标位置'
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
				if (this.status === 'win') return '对方将帅已被吃，这一局是你的'
				if (this.status === 'lose') return '我方帅被吃了，再来一局'
				return '握手言和'
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
			pieceStyle(p) {
				return {
					left: 36 + p.c * 66 - 30 + 'rpx',
					top: 36 + p.r * 66 - 30 + 'rpx'
				}
			},
			markStyle(idx) {
				return {
					left: 36 + (idx % 9) * 66 - 33 + 'rpx',
					top: 36 + ((idx / 9) | 0) * 66 - 33 + 'rpx'
				}
			},
			isChecked(side) {
				const k = findKing(this.board, side)
				if (k < 0) return false
				return attacked(this.board, k, -side)
			},
			reset() {
				this.gen += 1
				this.board = initBoard()
				this.turn = RED
				this.status = 'playing'
				this.thinking = false
				this.history = []
				this.selected = -1
				this.targets = []
				this.lastFrom = -1
				this.lastTo = -1
				this.showResult = false
			},
			restart() {
				this.reset()
			},
			hideResult() {
				this.showResult = false
			},
			playAgain() {
				this.showResult = false
				this.reset()
			},
			handleTap(idx) {
				if (this.status !== 'playing' || this.thinking || this.turn !== RED) return
				if (this.selected >= 0 && this.targets.indexOf(idx) > -1) {
					this.humanMove(this.selected * 100 + idx)
					return
				}
				const p = this.board[idx]
				if (p && (p > 0 ? RED : BLACK) === RED) {
					this.selected = idx
					// 传普通数组副本：引擎内部会反复试走 / 撤销，不能让它改到响应式数组
					this.targets = movesFrom(this.board.slice(), RED, idx)
				} else {
					this.selected = -1
					this.targets = []
				}
			},
			humanMove(mv) {
				this.commit(mv, RED)
				this.selected = -1
				this.targets = []
				if (this.status !== 'playing') return
				// 电脑被将死 / 无棋可走
				if (!legalMoves(this.board.slice(), BLACK).length) {
					this.status = 'win'
					this.popResult()
					return
				}
				this.turn = BLACK
				this.thinking = true
				const gen = this.gen
				setTimeout(() => {
					if (gen !== this.gen) return
					this.aiMove()
				}, 240)
			},
			aiMove() {
				const legal = legalMoves(this.board.slice(), BLACK)
				if (!legal.length) {
					this.thinking = false
					this.status = 'win'
					this.popResult()
					return
				}
				let mv = searchBest(this.board.slice(), BLACK, { depth: 4, time: 800 })
				// 搜索超时 / 返回非法值时兜底随机走一步，不能误判胜负
				if (!mv || legal.indexOf(mv) < 0) mv = legal[(Math.random() * legal.length) | 0]
				this.commit(mv, BLACK)
				this.thinking = false
				if (this.status !== 'playing') return
				if (!legalMoves(this.board.slice(), RED).length) {
					this.status = 'lose'
					this.popResult()
					return
				}
				this.turn = RED
			},
			commit(mv, side) {
				const cap = applyMove(this.board, mv)
				this.history.push({ mv, cap, side })
				this.lastFrom = moveFrom(mv)
				this.lastTo = moveTo(mv)
				// 吃到将帅 → 直接分出胜负
				if (cap && Math.abs(cap) === K) {
					this.status = side === RED ? 'win' : 'lose'
					this.popResult()
				}
			},
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
			undo() {
				if (!this.canUndo) return
				// 回退到我方上一手之前（电脑 + 我方各一步）
				let steps = 0
				while (this.history.length && steps < 2) {
					const h = this.history.pop()
					undoMove(this.board, h.mv, h.cap)
					steps += 1
					if (h.side === RED) break
				}
				this.status = 'playing'
				this.showResult = false
				this.turn = RED
				this.selected = -1
				this.targets = []
				const last = this.history.length ? this.history[this.history.length - 1] : null
				this.lastFrom = last ? moveFrom(last.mv) : -1
				this.lastTo = last ? moveTo(last.mv) : -1
			}
		}
	}
</script>

<style lang="scss" scoped>
	.chess {
		min-height: 100vh;
		background-color: $duck-bg;
		padding-bottom: 60rpx;
		box-sizing: border-box;
	}

	/* ---------- 头部 ---------- */
	.chess-head {
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
		background: radial-gradient(circle at 34% 28%, #fffdf4, #f0e2c4 78%);
		border: 2rpx solid #c09a6b;
		box-sizing: border-box;
	}

	.side-dot.is-red {
		background: radial-gradient(circle at 34% 28%, #ff7a72, #c62828 80%);
		border-color: #a51f1f;
	}

	.side-dot.is-black {
		background: radial-gradient(circle at 34% 28%, #5c6266, #23282b 80%);
		border-color: #14181a;
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
		display: flex;
		justify-content: center;
	}

	.board {
		position: relative;
		width: 600rpx;
		height: 666rpx;
		background: linear-gradient(160deg, #f2d7ad 0%, #e9c99c 100%);
		border-radius: 12rpx;
		overflow: hidden;
	}

	.river {
		position: absolute;
		top: 320rpx;
		font-size: 26rpx;
		line-height: 1;
		letter-spacing: 10rpx;
		color: #9a7550;
		z-index: 2;
	}

	.river-l {
		left: 118rpx;
	}

	.river-r {
		right: 116rpx;
	}

	.hl {
		position: absolute;
		left: 36rpx;
		width: 528rpx;
		height: 2rpx;
		background-color: #b78e62;
	}

	.vl {
		position: absolute;
		width: 2rpx;
		background-color: #b78e62;
	}

	.diag {
		position: absolute;
		width: 188rpx;
		height: 2rpx;
		background-color: #b78e62;
		transform-origin: center center;
	}

	.board-edge {
		position: absolute;
		left: 33rpx;
		top: 33rpx;
		width: 534rpx;
		height: 600rpx;
		border: 2rpx solid #9a7550;
		border-radius: 6rpx;
		box-sizing: border-box;
	}

	.mark {
		position: absolute;
		width: 66rpx;
		height: 66rpx;
		border-radius: 8rpx;
		background-color: rgba(0, 181, 120, 0.14);
		z-index: 2;
	}

	.pc {
		position: absolute;
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		background: radial-gradient(circle at 34% 28%, #fffdf4, #f0e2c4 78%);
		border: 2rpx solid #c09a6b;
		box-shadow: 0 3rpx 6rpx rgba(90, 60, 30, 0.28);
		z-index: 3;
	}

	.pc-ch {
		font-size: 32rpx;
		font-weight: 700;
		line-height: 1;
	}

	.pc.is-red .pc-ch {
		color: #c62828;
	}

	.pc.is-black .pc-ch {
		color: #23282b;
	}

	.pc.is-sel {
		box-shadow: 0 0 0 4rpx rgba(0, 181, 120, 0.9), 0 4rpx 10rpx rgba(0, 0, 0, 0.22);
	}

	.pc.is-take {
		box-shadow: 0 0 0 4rpx rgba(255, 77, 79, 0.85), 0 4rpx 10rpx rgba(0, 0, 0, 0.22);
	}

	.cells {
		position: absolute;
		left: 3rpx;
		top: 3rpx;
		width: 594rpx;
		height: 660rpx;
		display: flex;
		flex-wrap: wrap;
		z-index: 5;
	}

	.cell {
		width: 11.1111%;
		height: 66rpx;
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
