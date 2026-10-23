<template>
	<view class="bank">
		<!-- 渐变头部 -->
		<view class="duck-head bank-head">
			<view :style="{ height: statusBar + 'px' }"></view>
			<view class="head-main">
				<view class="head-text">
					<text class="duck-head-title">{{ current ? current.name : '题库' }}</text>
					<text class="head-sub-white">{{ headSub }}</text>
				</view>
				<view class="head-acts">
					<view class="head-act" v-if="mode === 'qa'" hover-class="head-act-hover" @tap="randomPractice">
						<image class="head-act-ic" src="/static/icons/ic-bolt.png" mode="aspectFit" />
					</view>
					<view class="head-act" hover-class="head-act-hover" @tap="goSearch">
						<image class="head-act-ic" src="/static/icons/ic-search.png" mode="aspectFit" />
					</view>
				</view>
			</view>

			<!-- 问答详解 / 知识点 切换 -->
			<view class="head-seg">
				<view class="seg-item" :class="{ active: mode === 'qa' }" @tap="switchMode('qa')">
					<text class="seg-txt">问答详解</text>
					<text class="seg-num duck-num">{{ total }}</text>
				</view>
				<view class="seg-item" :class="{ active: mode === 'know' }" @tap="switchMode('know')">
					<text class="seg-txt">知识点</text>
					<text class="seg-num duck-num">{{ knowTotal }}</text>
				</view>
			</view>
		</view>

		<!-- 当前分类进度卡（上浮） -->
		<view class="cat-card" v-if="current">
			<template v-if="mode === 'qa'">
				<view class="cat-card-top">
					<view class="cat-card-left">
						<text class="cat-card-name">{{ current.name }}</text>
						<text class="cat-card-desc duck-ellipsis">{{ current.desc }}</text>
					</view>
					<view class="cat-card-pct">
						<text class="cat-card-pct-num duck-num">{{ catPercent }}</text>
						<text class="cat-card-pct-unit">%</text>
					</view>
				</view>
				<view class="cat-bar">
					<view class="cat-bar-in" :style="{ width: catPercent + '%' }"></view>
				</view>
				<view class="cat-card-foot">
					<text class="cat-card-foot-txt">已读 {{ doneOf(activeCat) }} 题，还剩 {{ qaList.length - doneOf(activeCat) }} 题</text>
					<text class="cat-card-foot-tag">{{ qaList.length }} 题</text>
				</view>
			</template>
			<template v-else>
				<view class="cat-card-top">
					<view class="cat-card-left">
						<text class="cat-card-name">{{ current.name }}</text>
						<text class="cat-card-desc duck-ellipsis">{{ current.desc }}</text>
					</view>
					<text class="cat-card-foot-tag">{{ knowCountOf(activeCat) }} 条</text>
				</view>
				<text class="know-hint">先过一遍要点建立框架，再去看问答对照答案</text>
			</template>
		</view>

		<!-- 分类切换 -->
		<scroll-view class="tabs" scroll-x :show-scrollbar="false">
			<view
				class="tab"
				:class="{ active: activeCat === c.id }"
				v-for="c in categories"
				:key="c.id"
				@tap="selectCat(c.id)"
			>
				<text class="tab-txt">{{ c.name }}</text>
			</view>
		</scroll-view>

		<!-- 列表：问答详解 / 知识点 -->
		<scroll-view class="list" scroll-y :scroll-top="scrollTop" :show-scrollbar="false">
			<template v-if="mode === 'qa'">
				<view class="duck-panel" v-if="qaList.length">
					<view
						class="duck-row k-row"
						v-for="(q, i) in qaList"
						:key="q.id"
						hover-class="duck-row-hover"
						@tap="openQa(q)"
					>
						<view class="k-index" :class="{ 'is-read': isRead(q.id) }">
							<text class="k-index-txt duck-num">{{ pad(i + 1) }}</text>
						</view>
						<view class="k-body">
							<text class="k-title">{{ q.title }}</text>
							<text class="k-summary duck-ellipsis-2">{{ q.short }}</text>
							<view class="k-foot">
								<text class="k-dot"></text>
								<text class="k-count">{{ q.points.length }} 条重点 · {{ levelText[q.level] }}</text>
								<text class="k-read" v-if="isRead(q.id)">已读</text>
							</view>
						</view>
						<view class="duck-ic-arrow"></view>
					</view>
				</view>

				<view class="duck-empty" v-else>
					<text class="duck-empty-title">{{ emptyTitle }}</text>
					<text class="duck-empty-desc">{{ syncError || emptyDesc }}</text>
					<view class="duck-empty-btn" hover-class="duck-empty-btn-hover" @tap="retrySync">
						{{ retrying ? '加载中…' : '重新加载' }}
					</view>
				</view>

				<view class="list-tail" v-if="qaList.length">
					<text>共 {{ qaList.length }} 题 · 已到底</text>
				</view>
			</template>

			<template v-else>
				<view class="duck-panel" v-if="knowList.length">
					<view
						class="duck-row k-row"
						v-for="(k, i) in knowList"
						:key="k.id"
						hover-class="duck-row-hover"
						@tap="openKnowledge(k)"
					>
						<view class="k-index">
							<text class="k-index-txt duck-num">{{ pad(i + 1) }}</text>
						</view>
						<view class="k-body">
							<text class="k-title">{{ k.title }}</text>
							<text class="k-summary duck-ellipsis-2">{{ k.summary }}</text>
							<view class="k-foot">
								<text class="k-dot"></text>
								<text class="k-count">{{ k.points.length }} 条要点</text>
							</view>
						</view>
						<view class="duck-ic-arrow"></view>
					</view>
				</view>

				<view class="duck-empty" v-else>
					<text class="duck-empty-title">这个分类还没有知识点</text>
					<text class="duck-empty-desc">题库正在从服务器同步，稍后自动展示</text>
				</view>

				<view class="list-tail" v-if="knowList.length">
					<text>共 {{ knowList.length }} 条 · 已到底</text>
				</view>
			</template>

			<view class="list-bottom"></view>
		</scroll-view>
	</view>
</template>

<script>
	import { getCategories, allQuestions, levelText, qaOfCat, randomQa, knowledgeOfCat, countKnowledge, getKnowledgeList, getCatalogError } from '@/common/question-source.js'
	import { getRecords, syncUserData } from '@/common/user-store.js'
	import { ensureReady, refreshAll } from '@/common/bootstrap.js'
	import { showPageLoading, hidePageLoading } from '@/common/loading.js'

	export default {
		data() {
			return {
				statusBar: 0,
				mode: 'qa', // qa 问答详解 / know 知识点
				categories: getCategories(),
				levelText: levelText,
				activeCat: getCategories().length ? getCategories()[0].id : '',
				scrollTop: 0,
				records: {},
				total: allQuestions().length,
				knowTotal: getKnowledgeList().length,
				syncError: getCatalogError(),
				retrying: false
			}
		},
		computed: {
			current() {
				return this.categories.find((c) => c.id === this.activeCat) || this.categories[0]
			},
			qaList() {
				return qaOfCat(this.activeCat)
			},
			knowList() {
				return knowledgeOfCat(this.activeCat)
			},
			headSub() {
				if (this.mode === 'know') return '基础知识点 · 共 ' + this.knowTotal + ' 条'
				return '共 ' + this.qaList.length + ' 题 · 回答重点 + 详细答案 + 扩展知识'
			},
			catPercent() {
				const t = this.qaList.length
				if (!t) return 0
				return Math.round((this.doneOf(this.activeCat) / t) * 100)
			},
			/** 空状态标题：同步失败和「分类真的没题」要区分开 */
			emptyTitle() {
				if (this.syncError) return '题库加载失败'
				return this.categories.length ? '这个分类还没有问答' : '题库还没有数据'
			},
			emptyDesc() {
				if (this.syncError) return ''
				return this.categories.length ? '换个分类看看' : '题库正在从服务器同步，稍后自动展示'
			}
		},
		onLoad(options) {
			try {
				const info = uni.getSystemInfoSync()
				this.statusBar = info.statusBarHeight || 0
			} catch (e) {
				this.statusBar = 0
			}
			if (options && options.cat && this.hasCat(options.cat)) {
				this.activeCat = options.cat
			}
			if (options && options.mode === 'know') {
				this.mode = 'know'
			}
		},
		onShow() {
			showPageLoading()
			try {
				const cat = uni.getStorageSync('duck:bank-cat')
				if (cat && this.hasCat(cat)) {
					this.activeCat = cat
					uni.removeStorageSync('duck:bank-cat')
				}
				const mode = uni.getStorageSync('duck:bank-mode')
				if (mode === 'qa' || mode === 'know') {
					this.mode = mode
					uni.removeStorageSync('duck:bank-mode')
				}
			} catch (e) {
				// ignore
			}
			this.records = getRecords()
			hidePageLoading()
			this.syncFromCloud()
		},
		methods: {
			// 题库与已读状态都从云端校准一遍，页面先展示缓存
			async syncFromCloud() {
				await ensureReady()
				this.syncError = getCatalogError()
				await syncUserData({ silent: true })
				const cats = getCategories()
				if (cats.length) {
					this.categories = cats
					if (!this.categories.some((c) => c.id === this.activeCat)) {
						this.activeCat = this.categories[0].id
					}
				}
				this.total = allQuestions().length
				this.knowTotal = getKnowledgeList().length
				this.records = getRecords()
			},
			/** 空状态里的「重新加载」 */
			async retrySync() {
				if (this.retrying) return
				this.retrying = true
				showPageLoading()
				try {
					await refreshAll()
					this.syncError = getCatalogError()
					const cats = getCategories()
					if (cats.length) {
						this.categories = cats
						if (!this.categories.some((c) => c.id === this.activeCat)) {
							this.activeCat = this.categories[0].id
						}
					}
					this.total = allQuestions().length
					this.knowTotal = getKnowledgeList().length
					this.records = getRecords()
				} finally {
					hidePageLoading()
					this.retrying = false
				}
			},
			pad(n) {
				return n < 10 ? '0' + n : '' + n
			},
			hasCat(id) {
				return this.categories.some((c) => c.id === id)
			},
			isRead(id) {
				return Object.prototype.hasOwnProperty.call(this.records, id)
			},
			openQa(q) {
				uni.navigateTo({
					url: '/pages/interview/qa/qa?id=' + q.id + '&cat=' + q.cat
				})
			},
			knowCountOf(cat) {
				return countKnowledge(cat)
			},
			switchMode(mode) {
				if (this.mode === mode) return
				this.mode = mode
				this.scrollTop = this.scrollTop === 0 ? 1 : 0
			},
			openKnowledge(k) {
				uni.navigateTo({
					url: '/pages/interview/knowledge/knowledge?id=' + k.id + '&cat=' + k.cat
				})
			},
			doneOf(cat) {
				const r = this.records
				let n = 0
				qaOfCat(cat).forEach((q) => {
					if (Object.prototype.hasOwnProperty.call(r, q.id)) n++
				})
				return n
			},
			selectCat(id) {
				if (this.activeCat === id) return
				this.activeCat = id
				this.scrollTop = this.scrollTop === 0 ? 1 : 0
			},
			goSearch() {
				uni.navigateTo({ url: '/pages/interview/search/search' })
			},
			randomPractice() {
				const q = randomQa(this.activeCat)
				if (!q) {
					uni.showToast({ title: '暂时没有可看的题目', icon: 'none' })
					return
				}
				this.openQa(q)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.bank {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: $duck-bg;
		box-sizing: border-box;
	}

	/* ---------- 头部 ---------- */
	.bank-head {
		padding-bottom: 68rpx;
	}

	.head-main {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 32rpx 0;
	}

	.head-text {
		flex: 1;
		min-width: 0;
	}

	.head-sub-white {
		display: block;
		margin-top: 8rpx;
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.84);
	}

	.head-acts {
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.head-acts .head-act + .head-act {
		margin-left: 16rpx;
	}

	.head-act {
		width: 76rpx;
		height: 76rpx;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.22);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.head-act-hover {
		background-color: rgba(255, 255, 255, 0.34);
	}

	.head-act-ic {
		width: 36rpx;
		height: 36rpx;
	}

	/* ---------- 测试题 / 知识点 分段 ---------- */
	.head-seg {
		display: flex;
		align-items: center;
		margin: 24rpx 32rpx 0;
		padding: 6rpx;
		border-radius: 999rpx;
		background-color: rgba(255, 255, 255, 0.2);
	}

	.seg-item {
		flex: 1;
		height: 64rpx;
		border-radius: 999rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.seg-item.active {
		background-color: #ffffff;
		box-shadow: 0 4rpx 14rpx rgba(9, 60, 40, 0.1);
	}

	.seg-txt {
		font-size: 26rpx;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.9);
	}

	.seg-item.active .seg-txt {
		color: $duck-primary-dark;
		font-weight: 600;
	}

	.seg-num {
		margin-left: 8rpx;
		font-size: 21rpx;
		color: rgba(255, 255, 255, 0.72);
	}

	.seg-item.active .seg-num {
		color: $duck-primary;
	}

	.know-hint {
		display: block;
		margin-top: 16rpx;
		font-size: 22rpx;
		color: $duck-text-muted;
	}

	/* ---------- 知识点卡片 ---------- */
	.k-row {
		padding: 26rpx 24rpx;
	}

	.k-index {
		width: 58rpx;
		height: 58rpx;
		border-radius: 18rpx;
		background-color: $duck-primary-soft;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		margin-right: 20rpx;
	}

	.k-index-txt {
		font-size: 24rpx;
		font-weight: 700;
		color: $duck-primary-dark;
	}

	.k-body {
		flex: 1;
		min-width: 0;
		margin-right: 16rpx;
	}

	.k-title {
		display: block;
		font-size: 29rpx;
		font-weight: 600;
		color: $duck-text;
	}

	.k-summary {
		display: block;
		margin-top: 8rpx;
		font-size: 23rpx;
		line-height: 1.5;
		color: $duck-text-muted;
	}

	.k-foot {
		display: flex;
		align-items: center;
		margin-top: 10rpx;
	}

	.k-dot {
		width: 8rpx;
		height: 8rpx;
		border-radius: 50%;
		background-color: $duck-primary;
		margin-right: 8rpx;
	}

	.k-count {
		font-size: 21rpx;
		color: $duck-text-muted;
	}

	.k-read {
		margin-left: 12rpx;
		padding: 2rpx 10rpx;
		border-radius: 999rpx;
		background-color: rgba(0, 181, 120, 0.1);
		font-size: 19rpx;
		color: $duck-primary-dark;
	}

	.k-index.is-read {
		background-color: $duck-primary;

		.k-index-txt {
			color: #ffffff;
		}
	}

	/* ---------- 分类进度卡 ---------- */
	.cat-card {
		margin: -48rpx 24rpx 0;
		padding: 28rpx 26rpx 24rpx;
		background-color: #ffffff;
		border-radius: 24rpx;
		box-shadow: 0 6rpx 22rpx rgba(20, 32, 26, 0.07);
		flex-shrink: 0;
		position: relative;
		z-index: 2;
	}

	.cat-card-top {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
	}

	.cat-card-left {
		flex: 1;
		min-width: 0;
		margin-right: 20rpx;
	}

	.cat-card-name {
		display: block;
		font-size: 32rpx;
		font-weight: 700;
		color: $duck-text;
		line-height: 1.3;
	}

	.cat-card-desc {
		display: block;
		margin-top: 6rpx;
		font-size: 22rpx;
		color: $duck-text-muted;
	}

	.cat-card-pct {
		display: flex;
		align-items: baseline;
		flex-shrink: 0;
	}

	.cat-card-pct-num {
		font-size: 46rpx;
		font-weight: 700;
		color: $duck-primary;
		line-height: 1;
		letter-spacing: -1rpx;
	}

	.cat-card-pct-unit {
		margin-left: 2rpx;
		font-size: 22rpx;
		font-weight: 600;
		color: $duck-primary;
	}

	.cat-bar {
		margin-top: 22rpx;
		height: 12rpx;
		border-radius: 999rpx;
		background-color: #f0f3f1;
		overflow: hidden;
	}

	.cat-bar-in {
		height: 100%;
		border-radius: 999rpx;
		background: linear-gradient(90deg, #5be0ac 0%, #00b578 100%);
		transition: width 0.4s ease;
	}

	.cat-card-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 16rpx;
	}

	.cat-card-foot-txt {
		font-size: 21rpx;
		color: $duck-text-muted;
	}

	.cat-card-foot-tag {
		height: 38rpx;
		line-height: 38rpx;
		padding: 0 16rpx;
		border-radius: 8rpx;
		background-color: $duck-primary-soft;
		color: $duck-primary-dark;
		font-size: 21rpx;
		font-weight: 600;
	}

	/* ---------- 分类胶囊 ---------- */
	.tabs {
		flex-shrink: 0;
		white-space: nowrap;
		margin-top: 28rpx;
		padding-left: 24rpx;
		box-sizing: border-box;
	}

	.tab {
		display: inline-flex;
		align-items: center;
		height: 68rpx;
		padding: 0 30rpx;
		margin-right: 14rpx;
		border-radius: 999rpx;
		background-color: #ffffff;
		box-shadow: 0 2rpx 8rpx rgba(20, 32, 26, 0.04);
	}

	.tab.active {
		background: linear-gradient(135deg, #22c98c 0%, #00b578 100%);
		box-shadow: 0 6rpx 16rpx rgba(0, 181, 120, 0.26);
	}

	.tab-txt {
		font-size: 26rpx;
		font-weight: 500;
		color: $duck-text-sub;
	}

	.tab.active .tab-txt {
		color: #ffffff;
		font-weight: 600;
	}

	/* ---------- 列表 ---------- */
	.list {
		flex: 1;
		height: 0;
		margin-top: 24rpx;
		padding: 0 24rpx;
		box-sizing: border-box;
	}

	.q-row {
		padding: 26rpx 24rpx;
	}

	.q-state {
		width: 46rpx;
		height: 46rpx;
		border-radius: 50%;
		border: 2rpx solid #e6eae8;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		margin-right: 22rpx;
		box-sizing: border-box;
	}

	.q-state-txt {
		font-size: 21rpx;
		font-weight: 700;
		line-height: 1;
	}

	.q-state.is-right {
		border-color: $duck-primary;
		background: linear-gradient(135deg, #22c98c 0%, #00b578 100%);
	}

	.q-state.is-right .q-state-txt {
		color: #ffffff;
	}

	.q-state.is-wrong {
		border-color: $duck-warn;
		background: linear-gradient(135deg, #ffb04d 0%, #ff8f1f 100%);
	}

	.q-state.is-wrong .q-state-txt {
		color: #ffffff;
	}

	.q-body {
		flex: 1;
		min-width: 0;
		margin-right: 14rpx;
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

	.q-no {
		font-size: 20rpx;
		font-weight: 600;
		color: #b6c1bb;
		letter-spacing: 0.5rpx;
	}

	.q-sep {
		margin: 0 8rpx;
		font-size: 18rpx;
		color: #d5ddd8;
	}

	.q-meta-txt {
		font-size: 21rpx;
		color: $duck-text-muted;
	}

	.q-meta-txt.is-hard {
		color: $duck-warn;
	}

	.list-tail {
		padding: 30rpx 0 12rpx;
		text-align: center;
		font-size: 21rpx;
		color: #b3beb8;
	}

	.list-bottom {
		height: 30rpx;
	}
</style>
