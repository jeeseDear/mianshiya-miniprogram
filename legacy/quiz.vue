<template>
	<view class="quiz">
		<!-- 渐变导航 -->
		<view class="duck-head quiz-head">
			<view :style="{ height: statusBar + 'px' }"></view>

			<view class="nav-row">
				<view class="nav-back" hover-class="nav-back-hover" @tap="goBack">
					<view class="duck-ic-back"></view>
				</view>
				<view class="nav-mid" v-if="list.length">
					<text class="nav-num duck-num">{{ index + 1 }}</text>
					<text class="nav-total duck-num">/ {{ list.length }}</text>
				</view>
				<text class="nav-title" v-else>答题</text>
				<text class="nav-type" v-if="list.length">{{ typeTip }}</text>
			</view>

			<view class="nav-bar" v-if="list.length">
				<view class="nav-bar-in" :style="{ width: progressPercent + '%' }"></view>
			</view>
		</view>

		<!-- 空态 -->
		<view class="empty-wrap" v-if="!list.length">
			<view class="duck-empty">
				<text class="duck-empty-title">这里还没有题目</text>
				<text class="duck-empty-desc">先去题库练几道，顺手收藏一下</text>
			</view>
			<view class="empty-btn" hover-class="btn-hover" @tap="goBank">去题库</view>
		</view>

		<template v-else>
			<scroll-view class="content" scroll-y :scroll-top="scrollTop" :show-scrollbar="false">
				<!-- 题目卡 -->
				<view class="q-card">
					<view class="q-meta">
						<text class="duck-chip">{{ catName(current.cat) }}</text>
						<text class="duck-chip" :class="current.level === 3 ? 'duck-chip-warn' : 'duck-chip-plain'">
							{{ levelText[current.level] }}
						</text>
						<text class="q-source">{{ current.source }}</text>
					</view>
					<text class="q-title">{{ current.title }}</text>
					<view class="code" v-if="current.code">
						<view class="code-head">
							<view class="code-dot"></view>
							<view class="code-dot"></view>
							<view class="code-dot"></view>
							<text class="code-lang">javascript</text>
						</view>
						<text class="code-text">{{ current.code }}</text>
					</view>
				</view>

				<!-- 选项 -->
				<view class="options">
					<view
						v-for="o in current.options"
						:key="o.key"
						class="opt"
						:class="optClass(o)"
						hover-class="opt-hover"
						@tap="choose(o)"
					>
						<text class="opt-key">{{ o.key }}</text>
						<text class="opt-text">{{ o.text }}</text>
						<text class="opt-mark">{{ optMark(o) }}</text>
					</view>
				</view>

				<!-- 解析 -->
				<view class="analysis" v-if="submitted" :class="isRight ? 'is-ok' : 'is-no'">
					<view class="an-head">
						<text class="an-badge" :class="isRight ? 'is-ok' : 'is-no'">{{ isRight ? '回答正确' : '回答错误' }}</text>
						<text class="an-answer duck-num">答案 {{ current.answer.join(' / ') }}</text>
					</view>
					<text class="an-title">解析</text>
					<text class="an-text">{{ current.analysis }}</text>
				</view>

				<view class="bottom-space"></view>
			</scroll-view>

			<!-- 底部操作 -->
			<view class="footer">
				<view class="fav" hover-class="fav-hover" @tap="toggleFav">
					<text class="fav-ic" :class="{ on: isFav }">{{ isFav ? '★' : '☆' }}</text>
				</view>
				<view class="prev-btn" v-if="index > 0" hover-class="btn-hover" @tap="prev">上一题</view>
				<view
					class="main-btn"
					:class="{ 'is-disabled': !submitted && !selected.length }"
					hover-class="btn-hover"
					@tap="onMainTap"
				>
					{{ mainText }}
				</view>
			</view>
		</template>
	</view>
</template>

<script>
	import { categories, questions, questionsOfCat, findQuestion, levelText, randomQuestions } from '@/common/interview-data.js'
	import {
		getFavorites,
		getWrongs,
		isFavorite,
		toggleFavorite,
		recordAnswer
	} from '@/common/interview-store.js'
	import { showLoading, hideLoading, sleep, showPageLoading, hidePageLoading } from '@/common/loading.js'

	export default {
		data() {
			return {
				statusBar: 0,
				list: [],
				index: 0,
				selected: [],
				submitted: false,
				submitting: false,
				isRight: false,
				isFav: false,
				levelText: levelText,
				scrollTop: 0,
				sessionRight: 0,
				sessionDone: 0
			}
		},
		computed: {
			current() {
				return this.list[this.index] || {}
			},
			progressPercent() {
				if (!this.list.length) return 0
				return Math.round(((this.index + 1) / this.list.length) * 100)
			},
			typeTip() {
				const t = this.current.type
				if (t === 'multiple') return '多选题'
				if (t === 'judge') return '判断题'
				return '单选题'
			},
			mainText() {
				if (this.submitting) return '判题中…'
				if (!this.submitted) return '提交答案'
				if (this.index >= this.list.length - 1) return '完成本组'
				return '下一题'
			}
		},
		onLoad(options) {
			showPageLoading('加载题目')
			try {
				const info = uni.getSystemInfoSync()
				this.statusBar = info.statusBarHeight || 0
			} catch (e) {
				this.statusBar = 0
			}
			this.buildList(options || {})
			this.syncFav()
			this.setTitle()
		},
		onReady() {
			hidePageLoading()
		},
		onShareAppMessage() {
			return {
				title: '这道前端面试题你会吗？' + (this.current.title || ''),
				path: '/pages/interview/index/index'
			}
		},
		methods: {
			buildList(options) {
				let list = []
				const scope = options.scope
				if (scope === 'fav') {
					list = getFavorites()
						.map((id) => findQuestion(id))
						.filter(Boolean)
				} else if (scope === 'wrong') {
					list = getWrongs()
						.map((id) => findQuestion(id))
						.filter(Boolean)
				} else if (scope === 'random') {
					// 随机抽题：count 为数量，cat 存在时只在该分类内抽
					list = randomQuestions(Number(options.count) || 15, options.cat || '')
				} else if (options.cat) {
					list = questionsOfCat(options.cat)
				} else {
					list = questions.slice()
				}
				this.list = list

				let idx = 0
				if (options.id) {
					const i = list.findIndex((q) => q.id === options.id)
					if (i > -1) idx = i
				}
				this.index = idx
				this.resetState()
			},
			setTitle() {
				const c = categories.find((x) => x.id === this.current.cat)
				uni.setNavigationBarTitle({ title: c ? c.name : '答题' })
			},
			resetState() {
				this.selected = []
				this.submitted = false
				this.submitting = false
				this.isRight = false
				this.scrollTop = this.scrollTop === 0 ? 1 : 0
				this.syncFav()
			},
			syncFav() {
				this.isFav = this.current.id ? isFavorite(this.current.id) : false
			},
			catName(cat) {
				const c = categories.find((x) => x.id === cat)
				return c ? c.name : ''
			},
			choose(o) {
				if (this.submitted) return
				if (this.current.type === 'multiple') {
					const i = this.selected.indexOf(o.key)
					if (i > -1) {
						this.selected.splice(i, 1)
					} else {
						this.selected.push(o.key)
					}
				} else {
					this.selected = [o.key]
				}
			},
			optClass(o) {
				const picked = this.selected.indexOf(o.key) > -1
				const isAns = (this.current.answer || []).indexOf(o.key) > -1
				return {
					'is-picked': picked && !this.submitted,
					'is-right': this.submitted && isAns,
					'is-wrong': this.submitted && picked && !isAns
				}
			},
			optMark(o) {
				if (!this.submitted) return ''
				const isAns = (this.current.answer || []).indexOf(o.key) > -1
				const picked = this.selected.indexOf(o.key) > -1
				if (isAns) return '✓'
				if (picked) return '✕'
				return ''
			},
			async submit() {
				if (!this.selected.length) {
					uni.showToast({ title: '先选一个答案吧', icon: 'none' })
					return
				}
				if (this.submitting) return
				this.submitting = true
				showLoading('判题中')
				await sleep(320)
				const a = this.selected.slice().sort().join('')
				const b = (this.current.answer || []).slice().sort().join('')
				const right = a === b
				this.isRight = right
				this.submitted = true
				this.sessionDone += 1
				if (right) this.sessionRight += 1
				recordAnswer(this.current.id, right)
				this.submitting = false
				hideLoading()
			},
			onMainTap() {
				if (this.submitting) return
				if (!this.submitted) {
					this.submit()
					return
				}
				if (this.index >= this.list.length - 1) {
					this.finish()
					return
				}
				this.index += 1
				this.resetState()
				this.setTitle()
			},
			prev() {
				if (this.index <= 0) return
				this.index -= 1
				this.resetState()
				this.setTitle()
			},
			finish() {
				const rate = this.sessionDone ? Math.round((this.sessionRight / this.sessionDone) * 100) : 0
				uni.showModal({
					title: '本组完成',
					content: '本次作答 ' + this.sessionDone + ' 题，答对 ' + this.sessionRight + ' 题，正确率 ' + rate + '%',
					confirmText: '继续练',
					cancelText: '回题库',
					success: (res) => {
						if (res.confirm) {
							this.sessionDone = 0
							this.sessionRight = 0
							this.index = 0
							this.resetState()
							this.setTitle()
						} else {
							this.goBack()
						}
					}
				})
			},
			toggleFav() {
				if (!this.current.id) return
				const added = toggleFavorite(this.current.id)
				this.isFav = added
				uni.showToast({ title: added ? '已加入收藏' : '已取消收藏', icon: 'none' })
			},
			goBack() {
				if (getCurrentPages().length > 1) {
					uni.navigateBack({ delta: 1 })
				} else {
					uni.switchTab({ url: '/pages/interview/bank/bank' })
				}
			},
			goBank() {
				uni.switchTab({ url: '/pages/interview/bank/bank' })
			}
		}
	}
</script>

<style lang="scss" scoped>
	.quiz {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: $duck-bg;
	}

	/* ---------- 导航 ---------- */
	.quiz-head {
		padding-bottom: 22rpx;
	}

	.nav-row {
		display: flex;
		align-items: center;
		height: 88rpx;
		padding: 0 28rpx 0 18rpx;
	}

	.nav-back {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.nav-back-hover {
		opacity: 0.55;
	}

	.nav-mid {
		flex: 1;
		display: flex;
		align-items: baseline;
		justify-content: center;
	}

	.nav-num {
		font-size: 36rpx;
		font-weight: 700;
		color: #ffffff;
		line-height: 1;
	}

	.nav-total {
		margin-left: 6rpx;
		font-size: 22rpx;
		color: rgba(255, 255, 255, 0.72);
	}

	.nav-title {
		flex: 1;
		font-size: 32rpx;
		font-weight: 600;
		color: #ffffff;
	}

	.nav-type {
		flex-shrink: 0;
		width: 108rpx;
		height: 44rpx;
		line-height: 44rpx;
		text-align: center;
		border-radius: 999rpx;
		background-color: rgba(255, 255, 255, 0.22);
		color: #ffffff;
		font-size: 21rpx;
	}

	.nav-bar {
		margin: 6rpx 32rpx 0;
		height: 8rpx;
		border-radius: 999rpx;
		background-color: rgba(255, 255, 255, 0.26);
		overflow: hidden;
	}

	.nav-bar-in {
		height: 100%;
		border-radius: 999rpx;
		background-color: #ffffff;
		transition: width 0.35s ease;
	}

	/* ---------- 内容 ---------- */
	.content {
		flex: 1;
		height: 0;
		padding: 24rpx 24rpx 0;
		box-sizing: border-box;
	}

	.bottom-space {
		height: 40rpx;
	}

	.q-card {
		padding: 30rpx 28rpx;
		background-color: $duck-card;
		border-radius: 24rpx;
		box-shadow: 0 4rpx 18rpx rgba(20, 32, 26, 0.04);
	}

	.q-meta {
		display: flex;
		align-items: center;
		margin-bottom: 18rpx;
	}

	.q-meta .duck-chip {
		margin-right: 10rpx;
	}

	.q-source {
		margin-left: auto;
		font-size: 20rpx;
		color: #b6c1bb;
	}

	.q-title {
		display: block;
		font-size: 33rpx;
		font-weight: 600;
		color: $duck-text;
		line-height: 1.55;
	}

	/* 代码块 */
	.code {
		margin-top: 24rpx;
		padding: 0 0 22rpx;
		background-color: #0e2a20;
		border-radius: 20rpx;
		overflow: hidden;
	}

	.code-head {
		display: flex;
		align-items: center;
		height: 54rpx;
		padding: 0 20rpx;
		background-color: rgba(255, 255, 255, 0.05);
	}

	.code-dot {
		width: 12rpx;
		height: 12rpx;
		margin-right: 8rpx;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.2);
	}

	.code-lang {
		margin-left: auto;
		font-family: 'SFMono-Regular', Menlo, Consolas, monospace;
		font-size: 19rpx;
		color: rgba(255, 255, 255, 0.35);
	}

	.code-text {
		display: block;
		padding: 20rpx 22rpx 0;
		font-family: 'SFMono-Regular', Menlo, Consolas, 'Courier New', monospace;
		font-size: 23rpx;
		color: #a8e6c4;
		line-height: 1.75;
		white-space: pre-wrap;
		word-break: break-all;
	}

	/* ---------- 选项 ---------- */
	.options {
		margin-top: 24rpx;
	}

	.opt {
		display: flex;
		align-items: flex-start;
		padding: 26rpx 24rpx;
		margin-bottom: 16rpx;
		background-color: $duck-card;
		border: 2rpx solid transparent;
		border-radius: 24rpx;
		box-shadow: 0 4rpx 18rpx rgba(20, 32, 26, 0.04);
		transition: all 0.16s ease;
	}

	.opt-hover {
		background-color: #fafbfa;
	}

	.opt-key {
		width: 46rpx;
		height: 46rpx;
		border-radius: 14rpx;
		background-color: #f4f6f5;
		color: $duck-text-sub;
		font-size: 23rpx;
		font-weight: 600;
		text-align: center;
		line-height: 46rpx;
		margin-right: 18rpx;
		flex-shrink: 0;
	}

	.opt-text {
		flex: 1;
		padding-top: 4rpx;
		font-size: 28rpx;
		color: $duck-text;
		line-height: 1.6;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.opt-mark {
		margin-left: 12rpx;
		padding-top: 6rpx;
		font-size: 26rpx;
		font-weight: 700;
	}

	.opt.is-picked {
		border-color: $duck-primary;
		background-color: #f4fdf9;
	}

	.opt.is-picked .opt-key {
		background: linear-gradient(135deg, #22c98c 0%, #00b578 100%);
		color: #ffffff;
	}

	.opt.is-right {
		border-color: $duck-primary;
		background-color: #f4fdf9;
	}

	.opt.is-right .opt-key {
		background: linear-gradient(135deg, #22c98c 0%, #00b578 100%);
		color: #ffffff;
	}

	.opt.is-right .opt-mark {
		color: $duck-primary;
	}

	.opt.is-wrong {
		border-color: #ffc9c7;
		background-color: #fff6f5;
	}

	.opt.is-wrong .opt-key {
		background: linear-gradient(135deg, #ff7875 0%, #ff4d4f 100%);
		color: #ffffff;
	}

	.opt.is-wrong .opt-mark {
		color: $duck-danger;
	}

	/* ---------- 解析 ---------- */
	.analysis {
		margin-top: 8rpx;
		padding: 28rpx;
		border-radius: 24rpx;
	}

	.analysis.is-ok {
		background-color: #f2fcf7;
		border: 1rpx solid #d5f2e2;
	}

	.analysis.is-no {
		background-color: #fff8f2;
		border: 1rpx solid #f8e4d2;
	}

	.an-head {
		display: flex;
		align-items: center;
	}

	.an-badge {
		height: 42rpx;
		line-height: 42rpx;
		padding: 0 16rpx;
		border-radius: 8rpx;
		font-size: 21rpx;
		font-weight: 600;
		color: #ffffff;
	}

	.an-badge.is-ok {
		background: linear-gradient(135deg, #22c98c 0%, #00b578 100%);
	}

	.an-badge.is-no {
		background: linear-gradient(135deg, #ffb04d 0%, #ff8f1f 100%);
	}

	.an-answer {
		margin-left: auto;
		font-size: 21rpx;
		color: $duck-text-sub;
	}

	.an-title {
		display: block;
		margin-top: 22rpx;
		font-size: 24rpx;
		font-weight: 700;
		color: $duck-text;
		letter-spacing: 1rpx;
	}

	.an-text {
		display: block;
		margin-top: 8rpx;
		font-size: 26rpx;
		color: #3e4c45;
		line-height: 1.8;
		white-space: pre-wrap;
		word-break: break-word;
	}

	/* ---------- 底部 ---------- */
	.footer {
		display: flex;
		align-items: center;
		padding: 16rpx 24rpx;
		padding-bottom: calc(16rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
		background-color: #ffffff;
		box-shadow: 0 -4rpx 20rpx rgba(20, 32, 26, 0.05);
		flex-shrink: 0;
	}

	.fav {
		width: 88rpx;
		height: 88rpx;
		margin-right: 14rpx;
		border-radius: 50%;
		background-color: #f4f6f5;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.fav-hover {
		opacity: 0.7;
	}

	.fav-ic {
		font-size: 34rpx;
		line-height: 1;
		color: #b3beb8;
	}

	.fav-ic.on {
		color: $duck-gold;
	}

	.prev-btn {
		height: 88rpx;
		line-height: 88rpx;
		padding: 0 28rpx;
		margin-right: 14rpx;
		border-radius: 999rpx;
		background-color: #f4f6f5;
		color: $duck-text-sub;
		font-size: 25rpx;
		flex-shrink: 0;
	}

	.main-btn {
		flex: 1;
		height: 88rpx;
		line-height: 88rpx;
		text-align: center;
		border-radius: 999rpx;
		background: linear-gradient(135deg, #22c98c 0%, #00b578 100%);
		box-shadow: 0 8rpx 20rpx rgba(0, 181, 120, 0.28);
		color: #ffffff;
		font-size: 30rpx;
		font-weight: 600;
	}

	.main-btn.is-disabled {
		background: #eef1ef;
		color: #b9c2bd;
		box-shadow: none;
	}

	.btn-hover {
		opacity: 0.86;
	}

	/* ---------- 空态 ---------- */
	.empty-wrap {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 0 24rpx;
	}

	.empty-btn {
		align-self: center;
		margin-top: 10rpx;
		height: 82rpx;
		line-height: 82rpx;
		padding: 0 56rpx;
		border-radius: 999rpx;
		background: linear-gradient(135deg, #22c98c 0%, #00b578 100%);
		box-shadow: 0 8rpx 20rpx rgba(0, 181, 120, 0.28);
		color: #ffffff;
		font-size: 28rpx;
		font-weight: 600;
	}
</style>
