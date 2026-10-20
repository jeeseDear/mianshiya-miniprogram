<template>
	<view class="match">
		<!-- 渐变头部 -->
		<view class="duck-head match-head">
			<view :style="{ height: statusBar + 'px' }"></view>

			<view class="nav-row">
				<view class="nav-back" hover-class="nav-back-hover" @tap="goBack">
					<view class="duck-ic-back"></view>
				</view>
				<text class="nav-title">消消乐</text>
				<text class="nav-act" @tap="restart">重开</text>
			</view>
		</view>

		<!-- 分数卡 -->
		<view class="hud">
			<view class="hud-item">
				<text class="hud-num duck-num">{{ score }}</text>
				<text class="hud-label">得分</text>
			</view>
			<view class="hud-line"></view>
			<view class="hud-item">
				<text class="hud-num duck-num">{{ movesLeft }}</text>
				<text class="hud-label">剩余步数</text>
			</view>
			<view class="hud-line"></view>
			<view class="hud-item">
				<text class="hud-num duck-num">{{ bestCombo }}</text>
				<text class="hud-label">最高连击</text>
			</view>
		</view>

		<!-- 棋盘 -->
		<view class="board-wrap">
			<view class="grid" :class="{ 'is-settling': settling, 'no-anim': noAnim }">
				<view class="cell" v-for="(t, i) in board" :key="i" @tap="tap(i)">
					<view class="tile" :class="tileClass(t, i)" :style="swapMap[i] ? { transform: swapMap[i] } : ''"></view>
				</view>

				<view class="combo-tip" v-if="comboTip">
					<text class="combo-txt">{{ comboTip }}</text>
				</view>
			</view>
		</view>

		<!-- 操作 -->
		<view class="actions">
			<view class="act ghost" hover-class="act-hover" @tap="restart">重新开始</view>
		</view>

		<text class="tip">点两个相邻方块交换位置 · 三个及以上同色连成一线即消除 · 共 {{ totalMoves }} 步</text>

		<!-- 结算弹窗 -->
		<view class="result-mask" v-if="showResult" @tap="hideResult">
			<view class="result-card" @tap.stop>
				<view class="result-badge" :class="'lv' + stars">
					<text class="result-badge-txt">★</text>
				</view>
				<text class="result-title">{{ resultTitle }}</text>
				<text class="result-sub">{{ resultSub }}</text>
				<view class="score-row">
					<view class="score-item">
						<text class="score-num">{{ score }}</text>
						<text class="score-label">总得分</text>
					</view>
					<view class="score-line"></view>
					<view class="score-item">
						<text class="score-num">{{ bestCombo }}</text>
						<text class="score-label">最高连击</text>
					</view>
				</view>
				<view class="result-btns">
					<view class="rbtn ghost" hover-class="act-hover" @tap="goBack">返回</view>
					<view class="rbtn primary" hover-class="act-hover" @tap="playAgain">再来一局</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		SIZE,
		COLORS,
		MOVES,
		createBoard,
		findMatches,
		swap,
		areAdjacent,
		collapse,
		findMove,
		shuffle,
		scoreOf
	} from '@/common/match3.js'

	const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

	export default {
		data() {
			return {
				statusBar: 0,
				totalMoves: MOVES,
				board: createBoard(SIZE, COLORS),
				score: 0,
				movesLeft: MOVES,
				bestCombo: 0,
				comboTip: '',
				selected: -1,
				clearMap: {},
				freshMap: {},
				shakeMap: {},
				swapMap: {},
				noAnim: false,
				settling: false,
				busy: false,
				status: 'playing', // playing / over
				stars: 0,
				gen: 0,
				showResult: false
			}
		},
		computed: {
			resultTitle() {
				if (this.stars >= 3) return '三星通关'
				if (this.stars === 2) return '二星通关'
				return '完成一局'
			},
			resultSub() {
				if (this.stars >= 3) return '手感在线，这局很漂亮'
				if (this.stars === 2) return '差一点点就满星'
				return '再来一局，试试连锁消除'
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
			tileClass(t, i) {
				const out = ['c' + t]
				if (this.clearMap[i]) out.push('is-clear')
				if (this.freshMap[i]) out.push('is-fresh')
				if (this.shakeMap[i]) out.push('is-shake')
				if (this.selected === i) out.push('is-sel')
				return out
			},
			reset() {
				this.gen += 1
				let fresh = createBoard(SIZE, COLORS)
				if (!findMove(fresh, SIZE)) fresh = shuffle(fresh, SIZE, COLORS)
				this.board = fresh
				this.score = 0
				this.movesLeft = MOVES
				this.bestCombo = 0
				this.comboTip = ''
				this.selected = -1
				this.clearMap = {}
				this.freshMap = {}
				this.shakeMap = {}
				this.swapMap = {}
				this.noAnim = false
				this.settling = false
				this.busy = false
				this.status = 'playing'
				this.stars = 0
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
			tap(i) {
				if (this.busy || this.status !== 'playing') return
				if (this.selected < 0) {
					this.selected = i
					return
				}
				if (this.selected === i) {
					this.selected = -1
					return
				}
				const from = this.selected
				this.selected = -1
				if (!areAdjacent(from, i, SIZE)) {
					this.selected = i
					return
				}
				this.doSwap(from, i)
			},
			// 位移补间：两块沿交换方向平移后，再关闭过渡并交换数据，视觉上是连贯的
			async animateSwap(a, b) {
				const dc = (b % SIZE) - (a % SIZE)
				const dr = ((b / SIZE) | 0) - ((a / SIZE) | 0)
				const dx = dc * 80
				const dy = dr * 80
				const map = {}
				map[a] = 'translate(' + dx + 'rpx, ' + dy + 'rpx)'
				map[b] = 'translate(' + -dx + 'rpx, ' + -dy + 'rpx)'
				this.swapMap = map
				await wait(150)
				this.noAnim = true
				this.swapMap = {}
				this.board = swap(this.board, a, b)
				await wait(30)
				this.noAnim = false
			},
			async doSwap(a, b) {
				const gen = this.gen
				this.busy = true
				await this.animateSwap(a, b)
				if (gen !== this.gen) return

				// 换完不产生三连 → 换回去并抖一下
				if (!findMatches(this.board, SIZE).length) {
					await this.animateSwap(a, b)
					if (gen !== this.gen) return
					const shake = {}
					shake[a] = 1
					shake[b] = 1
					this.shakeMap = shake
					await wait(230)
					if (gen !== this.gen) return
					this.shakeMap = {}
					this.busy = false
					return
				}

				this.movesLeft -= 1
				await this.resolve(1, gen)
				if (gen !== this.gen) return
				this.busy = false
				if (this.movesLeft <= 0) this.endGame()
			},
			async resolve(startCombo, gen) {
				let combo = startCombo
				let m = findMatches(this.board, SIZE)
				while (m.length) {
					const clear = {}
					for (let i = 0; i < m.length; i++) clear[m[i]] = 1
					this.clearMap = clear
					await wait(190)
					if (gen !== this.gen) return

					this.score += scoreOf(m.length, combo)
					if (combo > this.bestCombo) this.bestCombo = combo
					if (combo >= 2) this.showCombo(combo)

					const res = collapse(this.board, SIZE, COLORS, m)
					const fresh = {}
					for (let i = 0; i < res.fresh.length; i++) fresh[res.fresh[i]] = 1
					this.clearMap = {}
					this.board = res.board
					this.freshMap = fresh
					this.settling = true
					await wait(170)
					if (gen !== this.gen) return

					this.freshMap = {}
					this.settling = false
					combo += 1
					m = findMatches(this.board, SIZE)
				}

				// 死局自动洗牌
				if (!findMove(this.board, SIZE)) {
					this.board = shuffle(this.board, SIZE, COLORS)
					uni.showToast({ title: '没有可消的了，已自动洗牌', icon: 'none' })
				}
			},
			showCombo(combo) {
				this.comboTip = '连击 ×' + combo
				setTimeout(() => {
					this.comboTip = ''
				}, 620)
			},
			endGame() {
				this.status = 'over'
				if (this.score >= 2400) this.stars = 3
				else if (this.score >= 1500) this.stars = 2
				else this.stars = 1
				this.popResult()
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
			}
		}
	}
</script>

<style lang="scss" scoped>
	.match {
		min-height: 100vh;
		background-color: $duck-bg;
		padding-bottom: 60rpx;
		box-sizing: border-box;
	}

	/* ---------- 头部 ---------- */
	.match-head {
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

	/* ---------- 分数卡 ---------- */
	.hud {
		display: flex;
		align-items: center;
		margin: -56rpx 24rpx 0;
		padding: 24rpx 0;
		background-color: #ffffff;
		border-radius: 24rpx;
		box-shadow: 0 6rpx 22rpx rgba(20, 32, 26, 0.07);
		position: relative;
		z-index: 2;
	}

	.hud-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.hud-num {
		font-size: 40rpx;
		font-weight: 700;
		color: $duck-text;
		line-height: 1.1;
	}

	.hud-label {
		margin-top: 6rpx;
		font-size: 20rpx;
		color: $duck-text-muted;
	}

	.hud-line {
		width: 2rpx;
		height: 48rpx;
		background-color: #eef1ef;
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

	.grid {
		position: relative;
		width: 656rpx;
		height: 656rpx;
		padding: 8rpx;
		box-sizing: border-box;
		display: flex;
		flex-wrap: wrap;
		border-radius: 20rpx;
		background: linear-gradient(160deg, #fbf6ee 0%, #f2e9db 100%);
	}

	.cell {
		width: 12.5%;
		height: 12.5%;
		padding: 4rpx;
		box-sizing: border-box;
	}

	.grid.is-settling .cell {
		animation: settle 0.17s ease;
	}

	.grid.no-anim .tile {
		transition: none;
	}

	.tile {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: 18rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: inset 0 -5rpx 0 rgba(0, 0, 0, 0.11), 0 2rpx 6rpx rgba(90, 60, 30, 0.1);
		transition: transform 0.16s ease, opacity 0.16s ease;
	}

	.tile::after {
		content: '';
		position: absolute;
		background-color: rgba(255, 255, 255, 0.62);
	}

	.tile.c1 {
		background: linear-gradient(160deg, #ff9a9a, #e0433f);
	}

	.tile.c1::after {
		width: 26rpx;
		height: 26rpx;
		border-radius: 50%;
	}

	.tile.c2 {
		background: linear-gradient(160deg, #ffc177, #ef8a1c);
	}

	.tile.c2::after {
		width: 24rpx;
		height: 24rpx;
		border-radius: 6rpx;
	}

	.tile.c3 {
		background: linear-gradient(160deg, #ffe08a, #f2b705);
	}

	.tile.c3::after {
		width: 22rpx;
		height: 22rpx;
		transform: rotate(45deg);
	}

	.tile.c4 {
		background: linear-gradient(160deg, #7fe0b4, #00a86b);
	}

	.tile.c4::after {
		width: 30rpx;
		height: 30rpx;
		border-radius: 50%;
		background-color: transparent;
		border: 4rpx solid rgba(255, 255, 255, 0.66);
	}

	.tile.c5 {
		background: linear-gradient(160deg, #7fb6ff, #2b6fe0);
	}

	.tile.c5::after {
		width: 26rpx;
		height: 7rpx;
		border-radius: 4rpx;
	}

	.tile.c6 {
		background: linear-gradient(160deg, #c5a4ff, #7a4de0);
	}

	.tile.c6::after {
		width: 0;
		height: 0;
		background-color: transparent;
		border-left: 12rpx solid transparent;
		border-right: 12rpx solid transparent;
		border-bottom: 20rpx solid rgba(255, 255, 255, 0.66);
	}

	.tile.is-sel {
		transform: scale(1.1);
		box-shadow: 0 0 0 4rpx rgba(0, 181, 120, 0.92), 0 6rpx 14rpx rgba(0, 0, 0, 0.16);
	}

	.tile.is-clear {
		transform: scale(0.2);
		opacity: 0;
	}

	.tile.is-fresh {
		animation: pop-in 0.2s ease;
	}

	.tile.is-shake {
		animation: shake 0.22s ease;
	}

	.combo-tip {
		position: absolute;
		left: 0;
		right: 0;
		top: 44%;
		display: flex;
		justify-content: center;
		z-index: 6;
		pointer-events: none;
	}

	.combo-txt {
		font-size: 44rpx;
		font-weight: 700;
		color: #ffffff;
		letter-spacing: 2rpx;
		text-shadow: 0 4rpx 12rpx rgba(0, 181, 120, 0.55), 0 0 2rpx rgba(0, 0, 0, 0.3);
		animation: combo-pop 0.62s ease both;
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

	.act.ghost {
		background-color: #ffffff;
		color: $duck-text-sub;
		border: 2rpx solid $duck-border;
		height: 80rpx;
		line-height: 76rpx;
	}

	.act-hover {
		opacity: 0.86;
	}

	.tip {
		display: block;
		margin-top: 24rpx;
		text-align: center;
		font-size: 21rpx;
		color: #b3beb8;
		padding: 0 40rpx;
		line-height: 1.6;
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
		width: 580rpx;
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

	.result-badge.lv3 {
		background: linear-gradient(135deg, #56cf9b, #00b578);
		box-shadow: 0 10rpx 26rpx rgba(0, 181, 120, 0.32);
	}

	.result-badge.lv2 {
		background: linear-gradient(135deg, #ffd166, #f0a020);
		box-shadow: 0 10rpx 26rpx rgba(240, 160, 32, 0.3);
	}

	.result-badge.lv1 {
		background: linear-gradient(135deg, #cfd8d3, #9aa8a3);
	}

	.result-badge-txt {
		font-size: 56rpx;
		font-weight: 700;
		color: #ffffff;
		line-height: 1;
	}

	.result-title {
		font-size: 42rpx;
		font-weight: 700;
		color: $duck-text;
	}

	.result-sub {
		margin-top: 12rpx;
		font-size: 24rpx;
		color: $duck-text-muted;
		text-align: center;
	}

	.score-row {
		display: flex;
		align-items: center;
		width: 100%;
		margin-top: 26rpx;
		padding: 20rpx 0;
		background-color: #f7f9f8;
		border-radius: 20rpx;
	}

	.score-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.score-num {
		font-size: 36rpx;
		font-weight: 700;
		color: $duck-text;
	}

	.score-label {
		margin-top: 4rpx;
		font-size: 19rpx;
		color: $duck-text-muted;
	}

	.score-line {
		width: 2rpx;
		height: 44rpx;
		background-color: #e8ecea;
	}

	.result-btns {
		display: flex;
		width: 100%;
		margin-top: 30rpx;
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

	@keyframes pop-in {
		0% {
			transform: scale(0.55);
			opacity: 0.4;
		}

		70% {
			transform: scale(1.06);
			opacity: 1;
		}

		100% {
			transform: scale(1);
		}
	}

	@keyframes settle {
		from {
			transform: translateY(-6rpx);
		}

		to {
			transform: translateY(0);
		}
	}

	@keyframes shake {
		0%,
		100% {
			transform: translateX(0);
		}

		25% {
			transform: translateX(-8rpx);
		}

		75% {
			transform: translateX(8rpx);
		}
	}

	@keyframes combo-pop {
		0% {
			transform: scale(0.6) translateY(10rpx);
			opacity: 0;
		}

		30% {
			transform: scale(1.12) translateY(0);
			opacity: 1;
		}

		70% {
			transform: scale(1);
			opacity: 1;
		}

		100% {
			transform: scale(1.02) translateY(-16rpx);
			opacity: 0;
		}
	}
</style>
