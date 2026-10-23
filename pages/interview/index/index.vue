<template>
	<view class="home">
		<!-- 渐变头部 -->
		<view class="duck-head">
			<view :style="{ height: statusBar + 'px' }"></view>

			<view class="head-top">
				<view class="brand">
					<text class="brand-name">面试鸭</text>
					<text class="brand-sub">{{ greeting }}，今天也刷两题吧</text>
				</view>
				<text class="head-date">{{ dateLabel }}</text>
			</view>

			<view class="head-search" hover-class="duck-search-hover" @tap="goSearch">
				<view class="duck-ic-search"></view>
				<text class="head-search-ph">搜索问答、知识点</text>
				<text class="head-search-btn">搜索</text>
			</view>

			<view class="head-space"></view>
		</view>

		<!-- 金刚区 -->
		<view class="grid-wrap">
			<view class="duck-grid">
				<view
					class="grid-item"
					v-for="g in grid"
					:key="g.key"
					hover-class="grid-hover"
					@tap="onGrid(g)"
				>
					<view class="grid-tile" :style="{ background: g.bg }">
						<image class="grid-icon" :src="g.icon" mode="aspectFit" />
					</view>
					<text class="grid-label">{{ g.label }}</text>
				</view>
			</view>
		</view>

		<!-- 今日进度 -->
		<view class="duck-panel hero">
			<view class="hero-top">
				<view class="hero-left">
					<text class="hero-label">今日已读</text>
					<view class="hero-num-row">
						<text class="hero-num duck-num">{{ stats.today }}</text>
						<text class="hero-unit">/ {{ dailyGoal }} 题</text>
					</view>
				</view>
				<view class="hero-badge">
					<text class="hero-badge-num duck-num">{{ stats.streak }}</text>
					<text class="hero-badge-txt">天连续</text>
				</view>
			</view>

			<view class="hero-bar">
				<view class="hero-bar-in" :style="{ width: goalPercent + '%' }"></view>
			</view>

			<view class="hero-foot">
				<text class="hero-tip">{{ goalDesc }}</text>
				<view class="hero-cta" hover-class="duck-btn-hover" @tap="startQuiz">
					<text class="hero-cta-txt">{{ goalPercent >= 100 ? '再抽一题' : '继续看看' }}</text>
					<view class="duck-ic-arrow is-white"></view>
				</view>
			</view>
		</view>

		<!-- 每日一题 -->
		<view class="duck-sec-head">
			<text class="duck-sec-title">每日一题</text>
			<view class="sec-more" @tap="goBank">
				<text class="sec-more-txt">全部问答</text>
				<view class="duck-ic-arrow"></view>
			</view>
		</view>

		<view class="daily" v-if="daily" hover-class="daily-hover" @tap="openQuestion(daily)">
			<view class="daily-head">
				<text class="daily-badge">TODAY</text>
				<text class="daily-date">{{ todayLabel }}</text>
			</view>
			<text class="daily-title duck-ellipsis-2">{{ daily.title }}</text>
			<view class="daily-foot">
				<view class="daily-tags">
					<text class="duck-chip">{{ catName(daily.cat) }}</text>
					<text class="duck-chip duck-chip-plain">{{ levelText[daily.level] }}</text>
				</view>
				<view class="daily-go">
					<text class="daily-go-txt">看答案</text>
					<view class="duck-ic-arrow is-green"></view>
				</view>
			</view>
		</view>
		<view class="duck-empty" v-else>
			<text class="duck-empty-title">今天还没有题目</text>
			<text class="duck-empty-desc">题库为空，补充问答后这里会出现每日一题</text>
		</view>

		<!-- 题库分类 -->
		<view class="duck-sec-head">
			<text class="duck-sec-title">问答分类</text>
			<view class="sec-acts">
				<view class="sec-more" @tap="goKnowledge">
					<text class="sec-more-txt">知识点</text>
				</view>
				<view class="sec-more" @tap="goBank">
					<text class="sec-more-txt">全部题库</text>
					<view class="duck-ic-arrow"></view>
				</view>
			</view>
		</view>

		<view class="duck-panel cats-panel" v-if="categories.length">
			<view
				class="duck-row cat-row"
				v-for="(c, ci) in categories"
				:key="c.id"
				hover-class="duck-row-hover"
				@tap="openCat(c)"
			>
				<view class="cat-tile" :style="{ background: catGrad(ci) }">
					<text class="cat-tile-txt">{{ c.short }}</text>
				</view>
				<view class="cat-info">
					<text class="cat-name">{{ c.name }}</text>
					<text class="cat-desc duck-ellipsis">{{ c.desc }}</text>
				</view>
				<text class="cat-count duck-num">{{ countOf(c.id) }} 题</text>
				<view class="duck-ic-arrow"></view>
			</view>
		</view>
		<view class="duck-empty" v-else>
			<text class="duck-empty-title">题库还是空的</text>
			<text class="duck-empty-desc">题库正在从服务器同步，稍后自动展示</text>
		</view>
		<!-- 高频榜 -->
		<view class="duck-sec-head">
			<text class="duck-sec-title">高频面试题</text>
			<text class="sec-more-txt">按热度排序</text>
		</view>

		<view class="duck-panel hot-panel" v-if="hotList.length">
			<view
				class="duck-row hot-row"
				v-for="(q, i) in hotList"
				:key="q.id"
				hover-class="duck-row-hover"
				@tap="openQuestion(q)"
			>
				<view class="hot-no" :class="rankClass(i)">
					<text class="hot-no-txt duck-num">{{ i + 1 }}</text>
				</view>
				<view class="hot-body">
					<text class="hot-title duck-ellipsis">{{ q.title }}</text>
					<view class="hot-meta">
						<text class="hot-meta-txt">{{ catName(q.cat) }}</text>
						<text class="hot-sep">·</text>
						<text class="hot-meta-txt">{{ levelText[q.level] }}</text>
						<text class="hot-sep">·</text>
						<text class="hot-meta-txt">热度 {{ q.hot }}</text>
					</view>
				</view>
				<view class="duck-ic-arrow"></view>
			</view>
		</view>
		<view class="duck-empty" v-else>
			<text class="duck-empty-title">暂无高频题</text>
			<text class="duck-empty-desc">有题目后按热度自动排序</text>
		</view>

		<view class="foot-tip">
			<text>题目与解析参考自面试鸭 mianshiya.com</text>
		</view>
	</view>
</template>

<script>
	import { getCategories, allQuestions, levelText, dailyQa, hotQa, qaOfCat, randomQa } from '@/common/question-source.js'
	import { getStats, syncUserData } from '@/common/user-store.js'
	import { ensureReady } from '@/common/bootstrap.js'
	import { showPageLoading, hidePageLoading } from '@/common/loading.js'

	const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

	export default {
		data() {
			return {
				statusBar: 0,
				greeting: '你好',
				dateLabel: '',
				categories: getCategories(),
				levelText: levelText,
				dailyGoal: 5,
				stats: { done: 0, right: 0, wrong: 0, favorite: 0, rate: 0, progress: 0, streak: 0, today: 0 },
				daily: dailyQa(),
				grid: [
					{ key: 'daily', label: '每日一题', icon: '/static/icons/ic-calendar.png', bg: 'linear-gradient(135deg,#FFC24D,#FFA31A)' },
					{ key: 'bank', label: '全部题库', icon: '/static/icons/ic-book.png', bg: 'linear-gradient(135deg,#4CB8FF,#1E90FF)' },
					{ key: 'fav', label: '我的收藏', icon: '/static/icons/ic-star.png', bg: 'linear-gradient(135deg,#FFCE5C,#FFB000)' },
					{ key: 'read', label: '已读记录', icon: '/static/icons/ic-check.png', bg: 'linear-gradient(135deg,#FF8A80,#FF5252)' },
					{ key: 'hot', label: '高频榜', icon: '/static/icons/ic-chart.png', bg: 'linear-gradient(135deg,#FF9C6E,#FF7A45)' },
					{ key: 'random', label: '随机一题', icon: '/static/icons/ic-bolt.png', bg: 'linear-gradient(135deg,#52D9B0,#00B578)' },
					{ key: 'search', label: '搜一搜', icon: '/static/icons/ic-search.png', bg: 'linear-gradient(135deg,#8EA6FF,#5B6EF5)' },
					{ key: 'mine', label: '学习数据', icon: '/static/icons/ic-user.png', bg: 'linear-gradient(135deg,#5FD3E8,#12B7D8)' }
				]
			}
		},
		computed: {
			goalPercent() {
				const p = (this.stats.today / this.dailyGoal) * 100
				return Math.min(100, Math.round(p))
			},
			goalDesc() {
				if (this.stats.today >= this.dailyGoal) return '今日目标已完成，手感正好'
				return '再看 ' + (this.dailyGoal - this.stats.today) + ' 题即可达标'
			},
			todayLabel() {
				const d = new Date()
				return d.getMonth() + 1 + ' 月 ' + d.getDate() + ' 日'
			},
			hotList() {
				return hotQa(5)
			}
		},
		onLoad() {
			try {
				const info = uni.getSystemInfoSync()
				this.statusBar = info.statusBarHeight || 0
			} catch (e) {
				this.statusBar = 0
			}
			this.updateHead()
		},
		onShow() {
			// 进入 / 切回本页时转一下，关闭动作由最短展示时长接管
			showPageLoading()
			this.refresh()
			this.daily = dailyQa()
			this.updateHead()
			hidePageLoading()
			this.syncFromCloud()
		},
		methods: {
			// 先用缓存渲染出首屏，云端数据回来后再刷一次视图
			async syncFromCloud() {
				const ok = await ensureReady()
				if (!ok && !getCategories().length) {
					uni.showToast({ title: '网络不给力，先看缓存', icon: 'none' })
				}
				await syncUserData({ silent: true })
				this.categories = getCategories()
				this.daily = dailyQa()
				this.refresh()
			},
			updateHead() {
				const d = new Date()
				const h = d.getHours()
				if (h >= 5 && h < 11) this.greeting = '早上好'
				else if (h >= 11 && h < 13) this.greeting = '中午好'
				else if (h >= 13 && h < 18) this.greeting = '下午好'
				else this.greeting = '晚上好'
				this.dateLabel = d.getMonth() + 1 + ' 月 ' + d.getDate() + ' 日 · ' + WEEK[d.getDay()]
			},
			refresh() {
				this.stats = getStats(allQuestions().length)
			},
			countOf(cat) {
				return qaOfCat(cat).length
			},
			catName(cat) {
				const c = this.categories.find((x) => x.id === cat)
				return c ? c.name : ''
			},
			rankClass(i) {
				if (i === 0) return 'is-gold'
				if (i === 1) return 'is-silver'
				if (i === 2) return 'is-bronze'
				return 'is-normal'
			},
			catGrad(i) {
				const grads = [
					'linear-gradient(135deg,#FFC24D,#FFA31A)',
					'linear-gradient(135deg,#4CB8FF,#1E90FF)',
					'linear-gradient(135deg,#52D9B0,#00B578)',
					'linear-gradient(135deg,#8EA6FF,#5B6EF5)',
					'linear-gradient(135deg,#FF9C6E,#FF7A45)',
					'linear-gradient(135deg,#5FD3E8,#12B7D8)'
				]
				return grads[i % grads.length]
			},
			goSearch() {
				uni.navigateTo({ url: '/pages/interview/search/search' })
			},
			goBank() {
				uni.switchTab({ url: '/pages/interview/bank/bank' })
			},
			goKnowledge() {
				// 题库是 tabBar 页，先把「知识点」分段记下来再 switchTab
				try {
					uni.setStorageSync('duck:bank-mode', 'know')
				} catch (e) {
					// ignore
				}
				uni.switchTab({ url: '/pages/interview/bank/bank' })
			},
			goCollect(tab) {
				try {
					uni.setStorageSync('duck:collect-tab', tab)
				} catch (e) {
					// ignore
				}
				uni.switchTab({ url: '/pages/interview/collect/collect' })
			},
			goMine() {
				uni.switchTab({ url: '/pages/interview/mine/mine' })
			},
			openCat(c) {
				// 题库是 tabBar 页，navigateTo 会失败；先存下目标分类再 switchTab
				try {
					uni.setStorageSync('duck:bank-cat', c.id)
				} catch (e) {
					// ignore
				}
				uni.switchTab({ url: '/pages/interview/bank/bank' })
			},
			startQuiz() {
				// 随机开一条问答，每次进入都不一样
				const q = randomQa('', this.daily ? this.daily.id : '')
				if (q) this.openQuestion(q)
				else this.goBank()
			},
			openQuestion(q) {
				uni.navigateTo({ url: '/pages/interview/qa/qa?id=' + q.id + '&cat=' + q.cat })
			},
			randomOne() {
				// 排除掉今日一题，避免连着抽到同一道
				const q = randomQa('', this.daily ? this.daily.id : '')
				if (!q) {
					uni.showToast({ title: '题库还没有数据', icon: 'none' })
					return
				}
				this.openQuestion(q)
			},
			onGrid(g) {
				if (g.key === 'daily') {
					if (this.daily) this.openQuestion(this.daily)
					else this.randomOne()
				} else if (g.key === 'bank' || g.key === 'hot') {
					this.goBank()
				} else if (g.key === 'fav' || g.key === 'read') {
					this.goCollect(g.key)
				} else if (g.key === 'random') {
					this.randomOne()
				} else if (g.key === 'search') {
					this.goSearch()
				} else if (g.key === 'mine') {
					this.goMine()
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.home {
		min-height: 100vh;
		background-color: $duck-bg;
		padding-bottom: 60rpx;
		box-sizing: border-box;
	}

	/* ---------- 头部 ---------- */
	.head-top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: 24rpx 32rpx 0;
	}

	.brand {
		flex: 1;
		min-width: 0;
	}

	.brand-name {
		display: block;
		font-size: 46rpx;
		font-weight: 700;
		color: #ffffff;
		letter-spacing: 1rpx;
		line-height: 1.2;
	}

	.brand-sub {
		display: block;
		margin-top: 8rpx;
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.84);
	}

	.head-date {
		flex-shrink: 0;
		margin-top: 10rpx;
		height: 44rpx;
		line-height: 44rpx;
		padding: 0 18rpx;
		border-radius: 999rpx;
		background-color: rgba(255, 255, 255, 0.22);
		font-size: 21rpx;
		color: #ffffff;
	}

	.head-search {
		display: flex;
		align-items: center;
		height: 84rpx;
		margin: 28rpx 32rpx 0;
		padding: 0 10rpx 0 26rpx;
		background-color: #ffffff;
		border-radius: 999rpx;
		box-sizing: border-box;
		box-shadow: 0 6rpx 18rpx rgba(0, 90, 60, 0.12);
	}

	.head-search-ph {
		flex: 1;
		margin-left: 14rpx;
		font-size: 26rpx;
		color: #9aa5a0;
	}

	.head-search-btn {
		flex-shrink: 0;
		height: 62rpx;
		line-height: 62rpx;
		padding: 0 30rpx;
		border-radius: 999rpx;
		background: linear-gradient(135deg, #22c98c 0%, #00b578 100%);
		color: #ffffff;
		font-size: 25rpx;
		font-weight: 600;
	}

	.head-space {
		height: 76rpx;
	}

	/* ---------- 金刚区 ---------- */
	.grid-wrap {
		margin: -52rpx 24rpx 0;
		position: relative;
		z-index: 3;
	}

	.grid-wrap .duck-grid {
		padding-top: 34rpx;
	}

	/* ---------- 今日进度 ---------- */
	.hero {
		margin: 20rpx 24rpx 0;
		padding: 30rpx 28rpx 26rpx;
	}

	.hero-top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
	}

	.hero-label {
		display: block;
		font-size: 24rpx;
		color: $duck-text-muted;
	}

	.hero-num-row {
		display: flex;
		align-items: baseline;
		margin-top: 6rpx;
	}

	.hero-num {
		font-size: 62rpx;
		font-weight: 700;
		color: $duck-text;
		line-height: 1;
		letter-spacing: -2rpx;
	}

	.hero-unit {
		margin-left: 10rpx;
		font-size: 25rpx;
		color: $duck-text-muted;
	}

	.hero-badge {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 118rpx;
		height: 118rpx;
		border-radius: 24rpx;
		background: linear-gradient(150deg, #e8f9f2 0%, #d6f4e7 100%);
	}

	.hero-badge-num {
		font-size: 40rpx;
		font-weight: 700;
		color: $duck-primary-dark;
		line-height: 1;
	}

	.hero-badge-txt {
		margin-top: 6rpx;
		font-size: 20rpx;
		color: #4fa384;
	}

	.hero-bar {
		margin-top: 26rpx;
		height: 12rpx;
		border-radius: 999rpx;
		background-color: #f0f3f1;
		overflow: hidden;
	}

	.hero-bar-in {
		height: 100%;
		border-radius: 999rpx;
		background: linear-gradient(90deg, #5be0ac 0%, #00b578 100%);
		transition: width 0.45s ease;
	}

	.hero-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 22rpx;
	}

	.hero-tip {
		flex: 1;
		min-width: 0;
		margin-right: 16rpx;
		font-size: 23rpx;
		color: $duck-text-sub;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.hero-cta {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		height: 66rpx;
		padding: 0 24rpx;
		border-radius: 999rpx;
		background: linear-gradient(135deg, #22c98c 0%, #00b578 100%);
		box-shadow: 0 6rpx 16rpx rgba(0, 181, 120, 0.26);
	}

	.hero-cta-txt {
		margin-right: 6rpx;
		font-size: 25rpx;
		font-weight: 600;
		color: #ffffff;
	}

	/* ---------- 区块更多 ---------- */
	.sec-more {
		display: flex;
		align-items: center;
	}

	.sec-acts {
		display: flex;
		align-items: center;
	}

	.sec-acts .sec-more + .sec-more {
		margin-left: 20rpx;
	}

	.sec-more-txt {
		margin-right: 4rpx;
		font-size: 24rpx;
		color: $duck-text-muted;
	}

	/* ---------- 每日一题 ---------- */
	.daily {
		margin: 0 24rpx;
		padding: 28rpx;
		background-color: $duck-card;
		border-radius: 24rpx;
		box-shadow: 0 4rpx 18rpx rgba(20, 32, 26, 0.04);
	}

	.daily-hover {
		background-color: #fafbfa;
	}

	.daily-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.daily-badge {
		height: 36rpx;
		line-height: 36rpx;
		padding: 0 12rpx;
		border-radius: 8rpx;
		background-color: #fff4e6;
		color: #c56a05;
		font-size: 19rpx;
		font-weight: 700;
		letter-spacing: 1rpx;
	}

	.daily-date {
		font-size: 21rpx;
		color: $duck-text-muted;
	}

	.daily-title {
		display: block;
		margin-top: 18rpx;
		font-size: 30rpx;
		font-weight: 600;
		color: $duck-text;
		line-height: 1.5;
	}

	.daily-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 24rpx;
	}

	.daily-tags {
		display: flex;
		align-items: center;
	}

	.daily-tags .duck-chip {
		margin-right: 10rpx;
	}

	.daily-go {
		display: flex;
		align-items: center;
	}

	.daily-go-txt {
		margin-right: 4rpx;
		font-size: 24rpx;
		font-weight: 600;
		color: $duck-primary-dark;
	}

	/* ---------- 分类 ---------- */
	.cat-row {
		padding: 24rpx 26rpx;
	}

	.cat-tile {
		width: 78rpx;
		height: 78rpx;
		border-radius: 22rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		margin-right: 22rpx;
	}

	.cat-tile-txt {
		font-size: 26rpx;
		font-weight: 700;
		color: #ffffff;
		letter-spacing: 0.5rpx;
	}

	.cat-info {
		flex: 1;
		min-width: 0;
		margin-right: 16rpx;
	}

	.cat-name {
		display: block;
		font-size: 29rpx;
		font-weight: 600;
		color: $duck-text;
	}

	.cat-desc {
		display: block;
		margin-top: 4rpx;
		font-size: 22rpx;
		color: $duck-text-muted;
	}

	.cat-count {
		margin-right: 8rpx;
		font-size: 23rpx;
		color: $duck-text-muted;
	}

	/* ---------- 高频榜 ---------- */
	.hot-panel {
		margin: 0 24rpx;
	}

	/* ---------- 分类列表 ---------- */
	.cats-panel {
		margin: 0 24rpx;
	}

	.hot-row {
		padding: 24rpx 26rpx;
	}

	.hot-no {
		width: 44rpx;
		height: 44rpx;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		margin-right: 20rpx;
	}

	.hot-no-txt {
		font-size: 22rpx;
		font-weight: 700;
		line-height: 1;
	}

	.hot-no.is-gold {
		background: linear-gradient(135deg, #ffd666, #ffb000);
	}

	.hot-no.is-gold .hot-no-txt {
		color: #ffffff;
	}

	.hot-no.is-silver {
		background: linear-gradient(135deg, #dfe6ea, #b8c4cb);
	}

	.hot-no.is-silver .hot-no-txt {
		color: #ffffff;
	}

	.hot-no.is-bronze {
		background: linear-gradient(135deg, #f3c79a, #d99a63);
	}

	.hot-no.is-bronze .hot-no-txt {
		color: #ffffff;
	}

	.hot-no.is-normal {
		background-color: #f4f5f5;
	}

	.hot-no.is-normal .hot-no-txt {
		color: #b0b8b4;
	}

	.hot-body {
		flex: 1;
		min-width: 0;
		margin-right: 12rpx;
	}

	.hot-title {
		display: block;
		font-size: 28rpx;
		color: $duck-text;
		line-height: 1.45;
	}

	.hot-meta {
		display: flex;
		align-items: center;
		margin-top: 8rpx;
	}

	.hot-meta-txt {
		font-size: 21rpx;
		color: $duck-text-muted;
	}

	.hot-sep {
		margin: 0 8rpx;
		font-size: 18rpx;
		color: #d5ddd8;
	}

	/* ---------- 底部 ---------- */
	.foot-tip {
		margin-top: 48rpx;
		text-align: center;
		font-size: 21rpx;
		color: #b3beb8;
		letter-spacing: 0.5rpx;
	}
</style>
