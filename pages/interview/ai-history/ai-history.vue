<template>
	<view class="hist">
		<!-- 渐变头部 -->
		<view class="duck-head hist-head">
			<view :style="{ height: statusBar + 'px' }"></view>
			<view class="nav-row" :style="menuRight ? { paddingRight: menuRight + 'px' } : ''">
				<view class="nav-back" hover-class="nav-back-hover" @tap="goBack">
					<view class="duck-ic-back"></view>
				</view>
				<text class="nav-title">AI 解析</text>
				<view class="head-clear" v-if="list.length" hover-class="head-clear-hover" @tap="clearAll">
					<text class="head-clear-txt">清空</text>
				</view>
			</view>

			<text class="head-sub-white">{{ list.length ? '看过 ' + list.length + ' 道题的解析' : '看看 AI 怎么答这些题' }}</text>
		</view>

		<scroll-view class="content" scroll-y :show-scrollbar="false">
			<view class="tip" v-if="list.length">
				<text>按最近查看排序，点进去能看到当时的解析</text>
			</view>

			<view class="duck-panel" v-if="list.length">
				<view
					class="duck-row q-row"
					v-for="q in list"
					:key="q.id"
					hover-class="duck-row-hover"
					@tap="open(q)"
				>
					<view class="q-tile" :style="{ backgroundColor: catBg(q.cat) }">
						<text class="q-tile-txt">{{ catName(q.cat) }}</text>
					</view>
					<view class="q-body">
						<text class="q-title duck-ellipsis-2">{{ q.title }}</text>
						<view class="q-meta">
							<text class="q-meta-txt">{{ levelText[q.level] }}</text>
							<text class="q-sep">·</text>
							<text class="q-meta-txt">{{ timeText(q.viewed_at) }}</text>
							<text class="q-count" v-if="q.view_count > 1">看过 {{ q.view_count }} 次</text>
						</view>
					</view>
					<view class="q-del" hover-class="q-del-hover" @tap.stop="remove(q)">
						<view class="duck-ic-close"></view>
					</view>
				</view>
			</view>

			<!-- 空态 -->
			<view class="duck-empty" v-else>
				<text class="duck-empty-title">还没有解析记录</text>
				<text class="duck-empty-desc">在题目详情页点一下「AI 解析」，看过的题就会出现在这里</text>
				<view class="duck-empty-btn" hover-class="duck-empty-btn-hover" @tap="goBank">去题库看看</view>
			</view>

			<view class="bottom-space"></view>
		</scroll-view>
	</view>
</template>

<script>
	import { getCategories, levelText } from '@/common/question-source.js'
	import { showPageLoading, hidePageLoading } from '@/common/loading.js'
	import { ensureReady } from '@/common/bootstrap.js'
	import { navBack, menuSafeRight } from '@/common/nav.js'
	import { api } from '@/common/api.js'

	/**
	 * 后端返回的 viewed_at 是 UTC 但没带时区后缀（SQLite 存的是 naive 时间），
	 * 直接 new Date() 会被当成本地时间，白白差 8 小时。这里手动按 UTC 组装。
	 * 只取到秒，避开 iOS 对 6 位微秒不兼容的问题。
	 */
	function parseUtc(value) {
		if (!value) return null
		const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})/)
		if (!m) return new Date(value)
		return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]))
	}

	function pad(n) {
		return n < 10 ? '0' + n : '' + n
	}

	export default {
		data() {
			return {
				statusBar: 0,
				menuRight: 0,
				levelText: levelText,
				list: [],
				categories: getCategories()
			}
		},
		onLoad() {
			try {
				const info = uni.getSystemInfoSync()
				this.statusBar = info.statusBarHeight || 0
			} catch (e) {
				this.statusBar = 0
			}
			this.menuRight = menuSafeRight()
		},
		onShow() {
			this.load()
		},
		methods: {
			goBack() {
				navBack('/pages/interview/mine/mine')
			},
			async load() {
				showPageLoading()
				try {
					await ensureReady()
					const cats = getCategories()
					if (cats.length) this.categories = cats
					const rows = await api.aiHistory(1, 100)
					this.list = Array.isArray(rows) ? rows : []
				} catch (e) {
					this.list = []
					uni.showToast({ title: '加载失败，请稍后重试', icon: 'none' })
				} finally {
					hidePageLoading()
				}
			},
			catName(cat) {
				const c = this.categories.find((x) => x.id === cat)
				return c ? c.short : ''
			},
			catBg(cat) {
				const c = this.categories.find((x) => x.id === cat)
				return c ? c.bg : '#f4f6f5'
			},
			timeText(value) {
				const d = parseUtc(value)
				if (!d) return ''
				const now = new Date()
				const diff = now.getTime() - d.getTime()
				if (diff >= 0 && diff < 60 * 1000) return '刚刚'
				if (diff >= 0 && diff < 60 * 60 * 1000) return Math.floor(diff / 60000) + ' 分钟前'
				if (d.toDateString() === now.toDateString()) {
					return '今天 ' + pad(d.getHours()) + ':' + pad(d.getMinutes())
				}
				const yesterday = new Date(now.getTime() - 86400000)
				if (d.toDateString() === yesterday.toDateString()) {
					return '昨天 ' + pad(d.getHours()) + ':' + pad(d.getMinutes())
				}
				if (d.getFullYear() === now.getFullYear()) {
					return pad(d.getMonth() + 1) + '-' + pad(d.getDate())
				}
				return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
			},
			open(q) {
				uni.navigateTo({
					url: '/pages/interview/qa/qa?id=' + q.id + '&cat=' + q.cat
				})
			},
			async remove(q) {
				try {
					await api.removeAiHistory(q.id)
					this.list = this.list.filter((x) => x.id !== q.id)
				} catch (e) {
					uni.showToast({ title: '删除失败，请重试', icon: 'none' })
				}
			},
			clearAll() {
				uni.showModal({
					title: '清空解析历史',
					content: '只清记录，收藏和答题数据不受影响',
					confirmText: '清空',
					confirmColor: '#e5533d',
					success: async (res) => {
						if (!res.confirm) return
						try {
							await api.clearAiHistory()
							this.list = []
							uni.showToast({ title: '已清空', icon: 'none' })
						} catch (e) {
							uni.showToast({ title: '清空失败，请重试', icon: 'none' })
						}
					}
				})
			},
			goBank() {
				uni.switchTab({ url: '/pages/interview/bank/bank' })
			}
		}
	}
</script>

<style lang="scss" scoped>
	.hist {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: $duck-bg;
	}

	/* ---------- 头部 ---------- */
	.hist-head {
		padding-bottom: 40rpx;
		flex-shrink: 0;
	}

	.nav-row {
		display: flex;
		align-items: center;
		padding: 10rpx 24rpx 0;
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

	.nav-title {
		margin-left: 8rpx;
		font-size: 32rpx;
		font-weight: 600;
		color: #ffffff;
	}

	.head-sub-white {
		display: block;
		margin-top: 10rpx;
		padding-left: 88rpx;
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.84);
	}

	.head-clear {
		margin-left: auto;
		height: 52rpx;
		padding: 0 22rpx;
		border-radius: 999rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: rgba(255, 255, 255, 0.18);
		flex-shrink: 0;
	}

	.head-clear-hover {
		background-color: rgba(255, 255, 255, 0.3);
	}

	.head-clear-txt {
		font-size: 23rpx;
		color: #ffffff;
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

	.q-count {
		margin-left: 12rpx;
		height: 30rpx;
		line-height: 30rpx;
		padding: 0 10rpx;
		border-radius: 999rpx;
		background-color: $duck-primary-soft;
		font-size: 19rpx;
		color: $duck-primary-dark;
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
		height: 40rpx;
	}
</style>
