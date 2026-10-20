<template>
	<view class="collect">
		<!-- 渐变头部 -->
		<view class="duck-head collect-head">
			<view :style="{ height: statusBar + 'px' }"></view>
			<view class="head-main">
				<text class="duck-head-title">我的题单</text>
				<text class="head-sub-white">收藏 {{ favIds.length }} 条 · 已读 {{ readIds.length }} 条</text>
			</view>
		</view>

		<!-- 分段切换卡（上浮） -->
		<view class="seg-card">
			<view class="seg-item" :class="{ active: tab === 'fav' }" @tap="switchTab('fav')">
				<text class="seg-txt">收藏夹</text>
				<text class="seg-n duck-num">{{ favIds.length }}</text>
			</view>
			<view class="seg-item" :class="{ active: tab === 'read' }" @tap="switchTab('read')">
				<text class="seg-txt">已读记录</text>
				<text class="seg-n duck-num">{{ readIds.length }}</text>
			</view>
		</view>

		<scroll-view class="content" scroll-y :show-scrollbar="false">
			<view class="tip" v-if="list.length">
				<text>{{ tab === 'fav' ? '收藏的问答随时回看，重点反复读' : '看过的问答都记在这里，方便二刷' }}</text>
			</view>

			<view class="duck-panel" v-if="list.length">
				<view
					class="duck-row q-row"
					v-for="(q, i) in list"
					:key="q.id"
					hover-class="duck-row-hover"
					@tap="open(q, i)"
				>
					<view class="q-tile" :style="{ backgroundColor: catBg(q.cat) }">
						<text class="q-tile-txt">{{ catName(q.cat) }}</text>
					</view>
					<view class="q-body">
						<text class="q-title duck-ellipsis-2">{{ q.title }}</text>
						<view class="q-meta">
							<text class="q-meta-txt">{{ levelText[q.level] }}</text>
							<text class="q-sep">·</text>
							<text class="q-meta-txt">{{ q.source }}</text>
						</view>
					</view>
					<view class="q-del" v-if="tab === 'fav'" hover-class="q-del-hover" @tap.stop="remove(q)">
						<view class="duck-ic-close"></view>
					</view>
				</view>
			</view>

			<!-- 空态 -->
			<view class="duck-empty" v-else>
				<text class="duck-empty-title">{{ tab === 'fav' ? '收藏夹还是空的' : '还没有阅读记录' }}</text>
				<text class="duck-empty-desc">{{ tab === 'fav' ? '看问答时点右上角的星标就能收藏' : '打开任意一条问答，这里就会记下来' }}</text>
				<view class="duck-empty-btn" hover-class="duck-empty-btn-hover" @tap="goBank">去题库逛逛</view>
			</view>

			<view class="bottom-space"></view>
		</scroll-view>

		<!-- 底部入口 -->
		<view class="footer" v-if="list.length">
			<view class="duck-btn duck-btn-primary" hover-class="duck-btn-hover" @tap="startPractice">
				继续看 · {{ list.length }} 题
			</view>
		</view>
	</view>
</template>

<script>
	import { categories, findQa, levelText } from '@/common/interview-data.js'
	import { showPageLoading, hidePageLoading } from '@/common/loading.js'
	import { getFavorites, getRecords, toggleFavorite } from '@/common/interview-store.js'

	export default {
		data() {
			return {
				statusBar: 0,
				levelText: levelText,
				tab: 'fav',
				favIds: [],
				readIds: [],
				categories: categories
			}
		},
		computed: {
			list() {
				const ids = this.tab === 'fav' ? this.favIds : this.readIds
				return ids
					.map((id) => findQa(id))
					.filter(Boolean)
			}
		},
		onLoad() {
			try {
				const info = uni.getSystemInfoSync()
				this.statusBar = info.statusBarHeight || 0
			} catch (e) {
				this.statusBar = 0
			}
		},
		onShow() {
			showPageLoading()
			try {
				const t = uni.getStorageSync('duck:collect-tab')
				if (t === 'fav' || t === 'read') {
					this.tab = t
					uni.removeStorageSync('duck:collect-tab')
				}
			} catch (e) {
				// ignore
			}
			this.refresh()
			hidePageLoading()
		},
		methods: {
			refresh() {
				this.favIds = getFavorites()
				// 阅读记录按最近一次打开的顺序展示
				this.readIds = Object.keys(getRecords()).reverse()
			},
			switchTab(tab) {
				this.tab = tab
			},
			catName(cat) {
				const c = this.categories.find((x) => x.id === cat)
				return c ? c.short : ''
			},
			catBg(cat) {
				const c = this.categories.find((x) => x.id === cat)
				return c ? c.bg : '#f4f6f5'
			},
			open(q) {
				uni.navigateTo({
					url: '/pages/interview/qa/qa?id=' + q.id + '&cat=' + q.cat
				})
			},
			remove(q) {
				toggleFavorite(q.id)
				uni.showToast({ title: '已取消收藏', icon: 'none' })
				this.refresh()
			},
			startPractice() {
				if (!this.list.length) return
				this.open(this.list[0])
			},
			goBank() {
				uni.switchTab({ url: '/pages/interview/bank/bank' })
			}
		}
	}
</script>

<style lang="scss" scoped>
	.collect {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: $duck-bg;
	}

	/* ---------- 头部 ---------- */
	.collect-head {
		padding-bottom: 72rpx;
	}

	.head-main {
		padding: 20rpx 32rpx 0;
	}

	.head-sub-white {
		display: block;
		margin-top: 8rpx;
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.84);
	}

	/* ---------- 分段卡 ---------- */
	.seg-card {
		display: flex;
		align-items: center;
		margin: -50rpx 24rpx 0;
		padding: 8rpx 8rpx;
		background-color: #ffffff;
		border-radius: 24rpx;
		box-shadow: 0 6rpx 22rpx rgba(20, 32, 26, 0.07);
		flex-shrink: 0;
		position: relative;
		z-index: 2;
	}

	.seg-item {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 80rpx;
		border-radius: 18rpx;
	}

	.seg-item.active {
		background: linear-gradient(135deg, #22c98c 0%, #00b578 100%);
		box-shadow: 0 6rpx 16rpx rgba(0, 181, 120, 0.24);
	}

	.seg-txt {
		font-size: 27rpx;
		color: $duck-text-sub;
	}

	.seg-item.active .seg-txt {
		color: #ffffff;
		font-weight: 600;
	}

	.seg-n {
		margin-left: 8rpx;
		font-size: 22rpx;
		color: $duck-text-muted;
	}

	.seg-item.active .seg-n {
		color: rgba(255, 255, 255, 0.85);
	}

	/* ---------- 列表 ---------- */
	.content {
		flex: 1;
		height: 0;
		margin-top: 24rpx;
		padding: 0 24rpx;
		box-sizing: border-box;
	}

	.tip {
		padding: 0 6rpx 16rpx;
		font-size: 22rpx;
		color: $duck-text-muted;
	}

	.q-row {
		padding: 26rpx 24rpx;
	}

	.q-tile {
		width: 70rpx;
		height: 70rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		margin-right: 20rpx;
	}

	.q-tile-txt {
		font-size: 22rpx;
		font-weight: 700;
		color: #8a6d1f;
		letter-spacing: 0.5rpx;
	}

	.q-body {
		flex: 1;
		min-width: 0;
	}

	.q-title {
		display: block;
		font-size: 28rpx;
		color: $duck-text;
		line-height: 1.5;
	}

	.q-meta {
		display: flex;
		align-items: center;
		margin-top: 10rpx;
	}

	.q-meta-txt {
		font-size: 21rpx;
		color: $duck-text-muted;
	}

	.q-sep {
		margin: 0 8rpx;
		font-size: 18rpx;
		color: #d5ddd8;
	}

	.q-del {
		width: 56rpx;
		height: 56rpx;
		margin-left: 8rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.q-del-hover {
		background-color: #f4f6f5;
	}

	.bottom-space {
		height: 24rpx;
	}

	/* ---------- 底部 ---------- */
	.footer {
		padding: 16rpx 24rpx;
		padding-bottom: calc(16rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
		background-color: #ffffff;
		box-shadow: 0 -4rpx 20rpx rgba(20, 32, 26, 0.05);
		flex-shrink: 0;
	}
</style>
