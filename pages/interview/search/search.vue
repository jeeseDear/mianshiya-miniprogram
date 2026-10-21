<template>
	<view class="search-page">
		<!-- 搜索头部 -->
		<view class="duck-head search-head">
			<view :style="{ height: statusBar + 'px' }"></view>
			<view class="bar" :style="menuRight ? { paddingRight: menuRight + 'px' } : ''">
				<view class="nav-back" hover-class="nav-back-hover" @tap="back">
					<view class="duck-ic-back"></view>
				</view>
				<view class="field">
					<view class="duck-ic-search"></view>
					<input
						class="input"
						v-model="keyword"
						placeholder="搜索题目、知识点"
						placeholder-class="input-ph"
						confirm-type="search"
						:focus="autoFocus"
						@input="onInput"
						@confirm="doSearch"
					/>
					<view class="clear" v-if="keyword" @tap="clear">
						<view class="duck-ic-close"></view>
					</view>
				</view>
			</view>
		</view>

		<scroll-view class="content" scroll-y :show-scrollbar="false">
			<!-- 未搜索 -->
			<view v-if="!searched">
				<view class="block-head">
					<text class="block-title">大家都在搜</text>
				</view>
				<view class="duck-card hot-words">
					<view
						v-for="w in hotWords"
						:key="w"
						class="word"
						hover-class="word-hover"
						@tap="pickWord(w)"
					>
						<text class="word-txt">{{ w }}</text>
					</view>
				</view>

				<view v-if="categories.length">
					<view class="block-head">
						<text class="block-title">按分类浏览</text>
					</view>
					<view class="duck-panel">
						<view
							class="duck-row cat-row"
							v-for="c in categories"
							:key="c.id"
							hover-class="duck-row-hover"
							@tap="pickCat(c)"
						>
							<view class="cat-tile" :style="{ backgroundColor: c.bg }">
								<text class="cat-tile-txt">{{ c.short }}</text>
							</view>
							<view class="cat-main">
								<text class="cat-name">{{ c.name }}</text>
								<text class="cat-desc duck-ellipsis">{{ c.desc }}</text>
							</view>
							<view class="duck-ic-arrow"></view>
						</view>
					</view>
				</view>
			</view>

			<!-- 搜索结果 -->
			<template v-else>
				<view class="result-head" v-if="qaResults.length || knowResults.length">
					<text class="result-count">找到 {{ qaResults.length }} 条问答 · {{ knowResults.length }} 条知识点</text>
				</view>

				<view v-if="qaResults.length">
					<view class="block-head">
						<text class="block-title">相关问答</text>
					</view>
					<view class="duck-panel">
						<view
							class="duck-row k-row"
							v-for="q in qaResults"
							:key="q.id"
							hover-class="duck-row-hover"
							@tap="openQa(q)"
						>
							<view class="k-tag">
								<text class="k-tag-txt">问答</text>
							</view>
							<view class="k-info">
								<text class="k-title">{{ q.title }}</text>
								<text class="k-summary duck-ellipsis">{{ q.short }}</text>
							</view>
							<view class="duck-ic-arrow"></view>
						</view>
					</view>
				</view>

				<view v-if="knowResults.length">
					<view class="block-head">
						<text class="block-title">相关知识点</text>
					</view>
					<view class="duck-panel">
						<view
							class="duck-row k-row"
							v-for="k in knowResults"
							:key="k.id"
							hover-class="duck-row-hover"
							@tap="openKnow(k)"
						>
							<view class="k-tag">
								<text class="k-tag-txt">{{ catName(k.cat) }}</text>
							</view>
							<view class="k-info">
								<text class="k-title">{{ k.title }}</text>
								<text class="k-summary duck-ellipsis">{{ k.summary }}</text>
							</view>
							<view class="duck-ic-arrow"></view>
						</view>
					</view>
				</view>

				<view class="duck-empty" v-if="!knowResults.length && !qaResults.length">
					<text class="duck-empty-title">没有找到相关内容</text>
					<text class="duck-empty-desc">换个关键词试试，比如「原型」「缓存」</text>
				</view>
			</template>

			<view class="bottom-space"></view>
		</scroll-view>
	</view>
</template>

<script>
	import { categories, levelText, searchQa, qaOfCat } from '@/common/interview-data.js'
	import { searchKnowledge, knowledgeOfCat } from '@/common/knowledge.js'
	import { showPageLoading, hidePageLoading } from '@/common/loading.js'
	import { menuSafeRight, navBack } from '@/common/nav.js'

	export default {
		data() {
			return {
				statusBar: 0,
				menuRight: 0,
				keyword: '',
				searched: false,
				knowResults: [],
				qaResults: [],
				levelText: levelText,
				categories: categories,
				autoFocus: true,
				hotWords: ['闭包', 'Promise', '原型', 'HTTP', 'Vue', 'React', '事件循环', 'Tree Shaking']
			}
		},
		onLoad() {
			showPageLoading()
			try {
				const info = uni.getSystemInfoSync()
				this.statusBar = info.statusBarHeight || 0
			} catch (e) {
				this.statusBar = 0
			}
			this.menuRight = menuSafeRight()
			this.autoFocus = true
		},
		onReady() {
			hidePageLoading()
		},
		methods: {
			catName(cat) {
				const c = categories.find((x) => x.id === cat)
				return c ? c.short : ''
			},
			onInput() {
				if (!this.keyword.trim()) {
					this.searched = false
					this.knowResults = []
					this.qaResults = []
					return
				}
				this.doSearch()
			},
			doSearch() {
				const kw = this.keyword.trim()
				if (!kw) {
					uni.showToast({ title: '输入点内容吧', icon: 'none' })
					return
				}
				this.searched = true
				this.knowResults = searchKnowledge(kw)
				this.qaResults = searchQa(kw)
			},
			pickWord(w) {
				this.keyword = w
				this.doSearch()
			},
			pickCat(c) {
				this.searched = true
				this.keyword = c.name
				this.knowResults = knowledgeOfCat(c.id)
				this.qaResults = qaOfCat(c.id)
			},
			openKnow(k) {
				uni.navigateTo({
					url: '/pages/interview/knowledge/knowledge?id=' + k.id + '&cat=' + k.cat
				})
			},
			openQa(q) {
				uni.navigateTo({
					url: '/pages/interview/qa/qa?id=' + q.id + '&cat=' + q.cat
				})
			},
			clear() {
				this.keyword = ''
				this.searched = false
				this.knowResults = []
				this.qaResults = []
			},
			back() {
				navBack('/pages/interview/index/index')
			}
		}
	}
</script>

<style lang="scss" scoped>
	.search-page {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: $duck-bg;
	}

	/* ---------- 搜索栏 ---------- */
	.search-head {
		padding-bottom: 28rpx;
	}

	.bar {
		display: flex;
		align-items: center;
		padding: 12rpx 28rpx 0;
	}

	.field {
		flex: 1;
		display: flex;
		align-items: center;
		height: 76rpx;
		padding: 0 22rpx;
		margin-left: 8rpx;
		border-radius: 999rpx;
		background-color: #ffffff;
		box-sizing: border-box;
	}

	.input {
		flex: 1;
		height: 76rpx;
		margin-left: 12rpx;
		font-size: 27rpx;
		color: $duck-text;
	}

	.input-ph {
		color: #9aa5a0;
	}

	.clear {
		width: 38rpx;
		height: 38rpx;
		margin-left: 8rpx;
		border-radius: 50%;
		background-color: #f0f2f1;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.clear .duck-ic-close {
		transform: scale(0.75);
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

	/* ---------- 内容 ---------- */
	.content {
		flex: 1;
		height: 0;
		padding: 4rpx 24rpx 0;
		box-sizing: border-box;
	}

	.block-head {
		display: flex;
		align-items: center;
		padding: 0;
		margin: 32rpx 0 16rpx;
	}

	.block-title {
		font-size: 28rpx;
		font-weight: 700;
		color: $duck-text;
	}

	/* ---------- 热词 ---------- */
	.hot-words {
		display: flex;
		flex-wrap: wrap;
		padding: 8rpx 20rpx 20rpx;
		box-shadow: 0 4rpx 18rpx rgba(20, 32, 26, 0.04);
	}

	.word {
		height: 62rpx;
		padding: 0 26rpx;
		margin: 12rpx 14rpx 0 0;
		border-radius: 999rpx;
		background-color: #f6f8f7;
		display: flex;
		align-items: center;
	}

	.word-hover {
		background-color: $duck-primary-soft;
	}

	.word-txt {
		font-size: 25rpx;
		color: $duck-text-sub;
	}

	/* ---------- 分类 ---------- */
	.cat-row {
		padding: 24rpx 26rpx;
	}

	.cat-tile {
		width: 72rpx;
		height: 72rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		margin-right: 20rpx;
	}

	.cat-tile-txt {
		font-size: 22rpx;
		font-weight: 700;
		color: #8a6d1f;
	}

	.cat-main {
		flex: 1;
		min-width: 0;
		margin-right: 16rpx;
	}

	.cat-name {
		display: block;
		font-size: 28rpx;
		font-weight: 600;
		color: $duck-text;
	}

	.cat-desc {
		display: block;
		margin-top: 4rpx;
		font-size: 21rpx;
		color: $duck-text-muted;
	}

	/* ---------- 结果 ---------- */
	.result-head {
		padding: 28rpx 6rpx 16rpx;
	}

	.result-count {
		font-size: 23rpx;
		color: $duck-text-muted;
	}

	.q-row {
		padding: 26rpx 26rpx;
	}

	/* ---------- 知识点结果 ---------- */
	.k-row {
		padding: 24rpx 26rpx;
	}

	.k-tag {
		height: 40rpx;
		line-height: 40rpx;
		padding: 0 14rpx;
		border-radius: 8rpx;
		background-color: $duck-primary-soft;
		flex-shrink: 0;
		margin-right: 18rpx;
	}

	.k-tag-txt {
		font-size: 20rpx;
		font-weight: 600;
		color: $duck-primary-dark;
	}

	.k-info {
		flex: 1;
		min-width: 0;
		margin-right: 16rpx;
	}

	.k-title {
		display: block;
		font-size: 28rpx;
		font-weight: 600;
		color: $duck-text;
	}

	.k-summary {
		display: block;
		margin-top: 6rpx;
		font-size: 22rpx;
		color: $duck-text-muted;
	}

	.q-body {
		flex: 1;
		min-width: 0;
		margin-right: 16rpx;
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
		margin-top: 12rpx;
	}

	.q-meta .duck-chip {
		margin-right: 10rpx;
	}

	.bottom-space {
		height: 60rpx;
	}
</style>
