<template>
	<view class="qa">
		<!-- 渐变头部 -->
		<view class="duck-head qa-head">
			<view :style="{ height: statusBar + 'px' }"></view>

			<view class="nav-row" :style="menuRight ? { paddingRight: menuRight + 'px' } : ''">
				<view class="nav-back" hover-class="nav-back-hover" @tap="goBack">
					<view class="duck-ic-back"></view>
				</view>
				<text class="nav-title">问答详解</text>
				<view class="nav-fav" hover-class="nav-fav-hover" @tap="toggleFav">
					<text class="nav-fav-txt" :class="{ 'is-on': fav }">{{ fav ? '★' : '☆' }}</text>
				</view>
				<text class="nav-cat" v-if="catName">{{ catName }}</text>
			</view>
		</view>

		<template v-if="item">
			<scroll-view class="content" scroll-y :show-scrollbar="false">
				<!-- 标题卡 -->
				<view class="hero">
					<view class="hero-tags">
						<text class="hero-tag">NO.{{ no }}</text>
						<text class="hero-tag is-level" :class="{ 'is-hard': item.level === 3 }">{{ levelText[item.level] }}</text>
						<text class="hero-tag is-plain">热度 {{ item.hot }}</text>
					</view>
					<text class="hero-title">{{ item.title }}</text>
					<view class="hero-short">
						<text class="hero-short-mark">答</text>
						<text class="hero-short-txt">{{ item.short }}</text>
					</view>
				</view>

				<!-- 解析加载中：标题已渲染，这里只占位说明 -->
				<view class="sec" v-if="detailLoading">
					<view class="sec-head">
						<text class="sec-title">回答重点</text>
						<text class="sec-tag">加载中…</text>
					</view>
					<view class="pt">
						<text class="pt-txt">正在从服务器获取解析内容</text>
					</view>
				</view>

				<!-- 回答重点 -->
				<view class="sec" v-else>
					<view class="sec-head">
						<text class="sec-title">回答重点</text>
						<text class="sec-tag">{{ item.points.length }} 条</text>
					</view>
					<view class="pt" v-for="(p, i) in item.points" :key="i">
						<view class="pt-no">
							<text class="pt-no-txt duck-num">{{ i + 1 }}</text>
						</view>
						<text class="pt-txt">{{ p }}</text>
					</view>
				</view>

				<!-- 详细答案 -->
				<view class="sec" v-if="!detailLoading">
					<view class="sec-head">
						<text class="sec-title">详细答案</text>
					</view>
					<view class="para" v-for="(d, i) in item.detail" :key="i">
						<view class="para-head">
							<view class="para-bar"></view>
							<text class="para-h">{{ d.h }}</text>
						</view>
						<text class="para-p">{{ d.p }}</text>
					</view>
				</view>

				<!-- AI 解析入口 -->
				<view
					class="ai-entry"
					hover-class="ai-entry-hover"
					v-if="!detailLoading"
					@tap="openAi"
				>
					<view class="ai-entry-badge">
						<text class="ai-entry-badge-txt">AI</text>
					</view>
					<view class="ai-entry-body">
						<text class="ai-entry-title">AI 解析</text>
						<text class="ai-entry-desc">面试官视角拆解 · 怎么答 · 加分项 · 追问</text>
					</view>
					<view class="duck-ic-arrow is-green"></view>
				</view>

				<!-- 代码示例 -->
				<view class="sec" v-if="item.code">
					<view class="sec-head">
						<text class="sec-title">代码示例</text>
					</view>
					<view class="code">
						<view class="code-head">
							<view class="code-dot"></view>
							<view class="code-dot"></view>
							<view class="code-dot"></view>
							<text class="code-lang">{{ codeLang }}</text>
						</view>
						<text class="code-text">{{ item.code }}</text>
					</view>
				</view>

				<!-- 扩展知识 -->
				<view class="sec sec-ext" v-if="item.extend && item.extend.length">
					<view class="sec-head">
						<text class="sec-title">扩展知识</text>
						<text class="sec-tag">追问备用</text>
					</view>
					<view class="ext-row" v-for="(e, i) in item.extend" :key="i">
						<view class="ext-dot"></view>
						<text class="ext-txt">{{ e }}</text>
					</view>
				</view>

				<!-- 上一题 / 下一题 -->
				<view class="switch-card">
					<view class="switch-item" :class="{ 'is-off': !prev }" hover-class="switch-hover" @tap="goPrev">
						<text class="switch-label">上一题</text>
						<text class="switch-title duck-ellipsis">{{ prev ? prev.title : '已经是第一题' }}</text>
					</view>
					<view class="switch-line"></view>
					<view class="switch-item is-right" :class="{ 'is-off': !next }" hover-class="switch-hover" @tap="goNext">
						<text class="switch-label">下一题</text>
						<text class="switch-title duck-ellipsis">{{ next ? next.title : '已经是最后一题' }}</text>
					</view>
				</view>

				<view class="foot-tip">
					<text class="foot-tip-txt">{{ sourceTip }}</text>
				</view>

				<view class="bottom-space"></view>
			</scroll-view>

			<!-- 底部操作 -->
			<view class="foot">
				<view class="foot-btn" hover-class="foot-btn-hover" @tap="goRand">
					<text class="foot-btn-txt">随机看一题</text>
					<view class="duck-ic-arrow is-white"></view>
				</view>
			</view>
		</template>

		<view class="duck-empty qa-empty" v-else>
			<text class="duck-empty-title">没有找到这道题</text>
			<text class="duck-empty-desc">它可能已经被移除，回题库看看其他题目</text>
		</view>

		<!-- ============ AI 解析弹窗 ============ -->
		<view class="ai-mask" v-if="aiVisible" @tap="closeAi">
			<view class="ai-sheet" :class="{ 'is-auto': !aiHasContent }" @tap.stop>
				<view class="ai-sheet-bar"></view>

				<view class="ai-sheet-head">
					<view class="ai-sheet-titles">
						<view class="ai-sheet-title-row">
							<view class="ai-entry-badge is-sm">
								<text class="ai-entry-badge-txt">AI</text>
							</view>
							<text class="ai-sheet-title">AI 解析</text>
							<text class="ai-sheet-live" v-if="aiLoading">生成中</text>
							<text class="ai-sheet-live is-done" v-else-if="aiHasContent">已完成</text>
						</view>
						<text class="ai-sheet-sub">{{ item ? item.title : '' }}</text>
					</view>
					<view class="ai-sheet-close" hover-class="ai-sheet-close-hover" @tap="closeAi">
						<text class="ai-sheet-close-txt">×</text>
					</view>
				</view>

				<!-- 外层普通 view 承接 flex 高度，scroll-view 再用 100% 取到确定高度。
				     直接把 flex 写在 scroll-view 上不行：H5 端它内部还有一层滚动容器，
				     靠父级 height:100% 取值，flex 撑出来的高度传不进去，会退化成内容高度。 -->
				<view class="ai-sheet-body">
				<scroll-view class="ai-sheet-scroll" scroll-y :show-scrollbar="false">
					<!-- 首包还没到：等模型开口 -->
					<view class="ai-loading" v-if="aiLoading && !aiHasContent">
						<view class="ai-dots">
							<view class="ai-dot"></view>
							<view class="ai-dot"></view>
							<view class="ai-dot"></view>
						</view>
						<text class="ai-loading-txt">正在结合标准答案生成解析</text>
						<text class="ai-loading-tip">首次生成约 5~20 秒，同一道题之后秒开</text>
					</view>

					<!-- 一个字都没生成出来 -->
					<view class="ai-error" v-if="aiError && !aiHasContent">
						<text class="ai-error-title">生成失败</text>
						<text class="ai-error-txt">{{ aiError }}</text>
						<view class="ai-retry" hover-class="ai-retry-hover" @tap="startAi">
							<text class="ai-retry-txt">重试</text>
						</view>
					</view>

					<!-- 内容：流式过程中不断长出来 -->
					<view class="ai-content" v-if="aiHasContent">
						<view class="ai-core" v-if="aiBlocks.core">
							<text class="ai-core-mark">这道题在考什么</text>
							<text class="ai-core-txt">{{ aiBlocks.core }}</text>
						</view>

						<view class="ai-block" v-if="aiBlocks.answer.length">
							<view class="ai-block-head">
								<view class="ai-block-bar"></view>
								<text class="ai-block-title">面试这样答</text>
							</view>
							<view class="ai-step" v-for="(s, i) in aiBlocks.answer" :key="'a' + i">
								<view class="ai-step-no">
									<text class="ai-step-no-txt duck-num">{{ i + 1 }}</text>
								</view>
								<text class="ai-step-txt">{{ s }}</text>
							</view>
						</view>

						<view class="ai-block" v-if="aiBlocks.bonus.length">
							<view class="ai-block-head">
								<view class="ai-block-bar is-bonus"></view>
								<text class="ai-block-title">能加分的地方</text>
							</view>
							<view class="ai-li" v-for="(s, i) in aiBlocks.bonus" :key="'b' + i">
								<text class="ai-li-mark is-bonus">+</text>
								<text class="ai-li-txt">{{ s }}</text>
							</view>
						</view>

						<view class="ai-block" v-if="aiBlocks.trap.length">
							<view class="ai-block-head">
								<view class="ai-block-bar is-trap"></view>
								<text class="ai-block-title">容易踩的坑</text>
							</view>
							<view class="ai-li" v-for="(s, i) in aiBlocks.trap" :key="'t' + i">
								<text class="ai-li-mark is-trap">!</text>
								<text class="ai-li-txt">{{ s }}</text>
							</view>
						</view>

						<view class="ai-block" v-if="aiBlocks.followup.length">
							<view class="ai-block-head">
								<view class="ai-block-bar is-follow"></view>
								<text class="ai-block-title">可能的追问</text>
							</view>
							<view class="ai-li" v-for="(s, i) in aiBlocks.followup" :key="'f' + i">
								<text class="ai-li-mark is-follow">?</text>
								<text class="ai-li-txt">{{ s }}</text>
							</view>
						</view>

						<!-- 还在生成：底部呼吸点，告诉用户没卡住 -->
						<view class="ai-typing" v-if="aiLoading">
							<view class="ai-typing-dot"></view>
							<view class="ai-typing-dot"></view>
							<view class="ai-typing-dot"></view>
						</view>

						<!-- 中途断了：保留已生成的部分 -->
						<view class="ai-inline-error" v-if="aiError">
							<text class="ai-inline-error-txt">{{ aiError }}</text>
							<text class="ai-inline-retry" @tap="startAi">重新生成</text>
						</view>

						<view class="ai-foot" v-if="!aiLoading && !aiError">
							<text class="ai-foot-txt">AI 生成 · 仅供参考，以标准答案为准</text>
						</view>
					</view>

					<view class="ai-bottom-space"></view>
				</scroll-view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { getCategories, levelText, findQa, qaOfCat, randomQa, fetchQaDetail, getCachedDetail } from '@/common/question-source.js'
	import { isFavorite, toggleFavorite, recordAnswer } from '@/common/user-store.js'
	import { menuSafeRight, navBack } from '@/common/nav.js'
	import { aiExplainStream, api } from '@/common/api.js'

	export default {
		data() {
			return {
				statusBar: 0,
				menuRight: 0,
				id: '',
				catId: 'js',
				item: null,
				fav: false,
				detailLoading: false,
				levelText: levelText,
				// ---- AI 解析 ----
				aiVisible: false,
				aiLoading: false,
				aiError: '',
				// 累计收到的原始文本，每次重解析都基于它，避免增量拼接出错
				aiRaw: '',
				aiBlocks: { core: '', answer: [], bonus: [], trap: [], followup: [] },
				aiAbort: null,
				aiTimer: null
			}
		},
		computed: {
			aiHasContent() {
				const b = this.aiBlocks
				return !!(
					b.core ||
					b.answer.length ||
					b.bonus.length ||
					b.trap.length ||
					b.followup.length
				)
			},
			catName() {
				const c = getCategories().find((x) => x.id === this.catId)
				return c ? c.name : ''
			},
			list() {
				return qaOfCat(this.catId)
			},
			index() {
				return this.list.findIndex((q) => q.id === this.id)
			},
			prev() {
				return this.index > 0 ? this.list[this.index - 1] : null
			},
			next() {
				return this.index > -1 && this.index < this.list.length - 1 ? this.list[this.index + 1] : null
			},
			no() {
				const i = this.index
				const n = i > -1 ? i + 1 : 0
				return n < 10 ? '0' + n : '' + n
			},
			sourceTip() {
				return '共 ' + this.list.length + ' 道 ' + this.catName + ' 问答 · 题目与解析参考自面试鸭'
			},
			codeLang() {
				const map = { js: 'javascript', ts: 'typescript', css: 'css', html: 'html', vue: 'vue', react: 'jsx', node: 'javascript', browser: 'javascript', build: 'javascript', algo: 'javascript', py: 'python' }
				return map[this.catId] || 'javascript'
			}
		},
		onLoad(options) {
			try {
				const info = uni.getSystemInfoSync()
				this.statusBar = info.statusBarHeight || 0
			} catch (e) {
				this.statusBar = 0
			}
			this.menuRight = menuSafeRight()
			this.id = (options && options.id) || ''

			// 1. 先用镜像里的摘要渲染标题，避免白屏
			const brief = findQa(this.id)
			this.catId = (options && options.cat) || (brief && brief.cat) || 'js'
			if (brief) {
				this.item = {
					id: brief.id,
					cat: brief.cat,
					level: brief.level,
					hot: brief.hot,
					title: brief.title,
					short: brief.short,
					points: [],
					detail: [],
					extend: []
				}
				this.fav = isFavorite(brief.id)
			}

			// 2. 再拉完整解析（命中内存缓存则同步返回）
			this.loadDetail()
		},
		onUnload() {
			// 离开页面就断开流，别让请求在后台空跑
			this.stopAi()
		},
		methods: {
			async loadDetail() {
				if (!this.id) {
					this.detailLoading = false
					return
				}
				// 命中内存缓存（上一题/下一题来回切）就直接用，不闪加载态
				const cachedDetail = getCachedDetail(this.id)
				if (cachedDetail) {
					this.item = cachedDetail
					this.catId = cachedDetail.cat || this.catId
					this.fav = isFavorite(cachedDetail.id)
					this.detailLoading = false
					await recordAnswer(cachedDetail.id, true)
					return
				}
				this.detailLoading = true
				try {
					const detail = await fetchQaDetail(this.id)
					this.item = detail
					this.catId = detail.cat || this.catId
					this.fav = isFavorite(detail.id)
					// 打开即记为已读：用于阅读进度、今日打卡与「已读记录」
					await recordAnswer(detail.id, true)
				} catch (e) {
					if (!this.item) {
						uni.showToast({ title: '题目加载失败', icon: 'none' })
					} else {
						uni.showToast({ title: '解析加载失败，请检查网络', icon: 'none' })
					}
				} finally {
					this.detailLoading = false
				}
			},
			goBack() {
				navBack('/pages/interview/index/index')
			},
			async toggleFav() {
				if (!this.item) return
				try {
					this.fav = await toggleFavorite(this.item.id)
					uni.showToast({ title: this.fav ? '已收藏' : '已取消收藏', icon: 'none' })
				} catch (e) {
					uni.showToast({ title: '操作失败，请重试', icon: 'none' })
				}
			},
			open(target) {
				if (!target) return
				// target 可能来自镜像（带 cat）或详情接口的 prev/next（只有 id），统一兜底
				uni.redirectTo({
					url: '/pages/interview/qa/qa?id=' + target.id + '&cat=' + (target.cat || this.catId)
				})
			},
			goPrev() {
				this.open(this.prev)
			},
			goNext() {
				this.open(this.next)
			},
			goRand() {
				const q = randomQa(this.catId, this.id)
				if (!q) {
					uni.showToast({ title: '暂时没有更多题目', icon: 'none' })
					return
				}
				this.open(q)
			},

			/* ---------------- AI 解析 ---------------- */

			openAi() {
				if (!this.item) return
				this.aiVisible = true
				// 已经生成过（哪怕是在关闭面板时跑完的）就直接复用，不重复花钱
				if (this.aiHasContent || this.aiLoading) return
				this.startAi()
			},
			closeAi() {
				// 只关面板，不中断生成：再次打开能直接看到完整结果
				this.aiVisible = false
			},
			startAi() {
				if (!this.item || this.aiLoading) return
				this.stopAi()

				const qid = this.item.id
				this.aiLoading = true
				this.aiError = ''
				this.aiRaw = ''
				this.aiBlocks = { core: '', answer: [], bonus: [], trap: [], followup: [] }

				// 回调里判断 qid 是否还是当前题：用户可能在生成期间换了题
				const stale = () => qid !== (this.item && this.item.id)

				this.aiAbort = aiExplainStream(qid, {
					onChunk: (text) => {
						if (stale()) return
						this.aiRaw += text
						this.queueAiRender()
					},
					onDone: () => {
						if (stale()) return
						this.flushAiRender()
						this.aiLoading = false
						// 真正拿到内容才记历史，点开又立刻关掉不会留下记录
						this.markAiHistory(qid)
					},
					onError: (msg) => {
						if (stale()) return
						this.flushAiRender()
						this.aiLoading = false
						this.aiError = msg || '生成失败，请重试'
					}
				})
			},
			// 历史记录是附属功能：失败就静默跳过，不能影响阅读，也不弹 toast
			markAiHistory(qid) {
				try {
					const p = api.saveAiHistory(qid)
					if (p && typeof p.catch === 'function') p.catch(() => {})
				} catch (e) {
					/* ignore */
				}
			},
			stopAi() {
				if (this.aiTimer) {
					clearTimeout(this.aiTimer)
					this.aiTimer = null
				}
				if (this.aiAbort) {
					try {
						this.aiAbort()
					} catch (e) {
						/* 已经结束 */
					}
					this.aiAbort = null
				}
			},
			queueAiRender() {
				// 模型每秒能吐几十个分片，逐个 setData 会让小程序发烫。
				// 攒 60ms 合一次，视觉上仍是逐字冒出来。
				if (this.aiTimer) return
				this.aiTimer = setTimeout(() => {
					this.aiTimer = null
					this.applyAiRender()
				}, 60)
			},
			flushAiRender() {
				if (this.aiTimer) {
					clearTimeout(this.aiTimer)
					this.aiTimer = null
				}
				this.applyAiRender()
			},
			applyAiRender() {
				const raw = this.aiRaw || ''
				const errAt = raw.indexOf('@@ERROR@@')
				if (errAt > -1) {
					const msg = raw.slice(errAt + 10).trim()
					if (msg) this.aiError = msg
				}
				this.aiBlocks = this.parseAiBlocks(errAt > -1 ? raw.slice(0, errAt) : raw)
			},
			parseAiBlocks(text) {
				const out = { core: '', answer: [], bonus: [], trap: [], followup: [] }
				const marks = {
					'@@CORE@@': 'core',
					'@@ANSWER@@': 'answer',
					'@@BONUS@@': 'bonus',
					'@@TRAP@@': 'trap',
					'@@FOLLOW@@': 'followup'
				}
				let cur = null

				// 每次都从完整文本重新切，而不是拼增量：
				// 半截的行会在下一次重算时变成完整句子，天然就是打字机效果
				const lines = String(text || '').split('\n')
				for (let i = 0; i < lines.length; i++) {
					const line = lines[i].trim()
					if (!line) continue
					if (marks[line]) {
						cur = marks[line]
						continue
					}
					if (!cur) continue
					// 模型偶尔还是加 "- " 或 "1. "，剥掉，编号由前端统一渲染
					const clean = line.replace(/^(?:[-*·]\s*|\d+[.、)]\s*)+/, '').trim()
					if (!clean) continue
					if (cur === 'core') {
						if (!out.core) out.core = clean
					} else if (out[cur].length < 6) {
						out[cur].push(clean)
					}
				}
				return out
			}
		}
	}
</script>

<style lang="scss" scoped>
	.qa {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: $duck-bg;
	}

	/* ---------- 头部 ---------- */
	.qa-head {
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

	.nav-fav {
		margin-left: auto;
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.nav-fav-hover {
		opacity: 0.7;
	}

	.nav-fav-txt {
		font-size: 36rpx;
		line-height: 1;
		color: rgba(255, 255, 255, 0.82);
	}

	.nav-fav-txt.is-on {
		color: #ffd34d;
	}

	.nav-cat {
		margin-left: 12rpx;
		height: 44rpx;
		line-height: 44rpx;
		padding: 0 18rpx;
		border-radius: 999rpx;
		background-color: rgba(255, 255, 255, 0.22);
		font-size: 21rpx;
		color: #ffffff;
	}

	/* ---------- 内容 ---------- */
	.content {
		flex: 1;
		height: 0;
		padding: 0 24rpx;
		box-sizing: border-box;
	}

	.hero {
		margin-top: 24rpx;
		padding: 30rpx 28rpx 28rpx;
		background-color: #ffffff;
		border-radius: 24rpx;
		box-shadow: 0 6rpx 22rpx rgba(20, 32, 26, 0.07);
	}

	.hero-tags {
		display: flex;
		align-items: center;
	}

	.hero-tag {
		height: 36rpx;
		line-height: 36rpx;
		padding: 0 14rpx;
		margin-right: 10rpx;
		border-radius: 8rpx;
		background-color: $duck-primary-soft;
		color: $duck-primary-dark;
		font-size: 20rpx;
		font-weight: 600;
	}

	.hero-tag.is-level {
		background-color: #eef4ff;
		color: #3b6fe0;
	}

	.hero-tag.is-level.is-hard {
		background-color: #fff2e8;
		color: #d97706;
	}

	.hero-tag.is-plain {
		background-color: #f4f6f5;
		color: $duck-text-muted;
		font-weight: 500;
	}

	.hero-title {
		display: block;
		margin-top: 18rpx;
		font-size: 38rpx;
		font-weight: 700;
		line-height: 1.4;
		color: $duck-text;
	}

	.hero-short {
		display: flex;
		align-items: flex-start;
		margin-top: 20rpx;
		padding: 20rpx 22rpx;
		border-radius: 14rpx;
		background-color: #f4fbf7;
	}

	.hero-short-mark {
		width: 36rpx;
		height: 36rpx;
		line-height: 36rpx;
		text-align: center;
		border-radius: 8rpx;
		background-color: $duck-primary;
		color: #ffffff;
		font-size: 20rpx;
		font-weight: 700;
		flex-shrink: 0;
		margin-right: 14rpx;
		margin-top: 4rpx;
	}

	.hero-short-txt {
		flex: 1;
		font-size: 25rpx;
		line-height: 1.68;
		color: $duck-primary-dark;
	}

	.sec {
		margin-top: 24rpx;
		padding: 28rpx 26rpx;
		background-color: #ffffff;
		border-radius: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(20, 32, 26, 0.05);
	}

	.sec-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20rpx;
	}

	.sec-title {
		font-size: 30rpx;
		font-weight: 700;
		color: $duck-text;
	}

	.sec-tag {
		font-size: 21rpx;
		color: $duck-text-muted;
	}

	/* 要点 */
	.pt {
		display: flex;
		align-items: flex-start;
		margin-top: 16rpx;
	}

	.pt:first-of-type {
		margin-top: 0;
	}

	.pt-no {
		width: 36rpx;
		height: 36rpx;
		border-radius: 50%;
		background-color: $duck-primary-soft;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		margin-top: 4rpx;
		margin-right: 14rpx;
	}

	.pt-no-txt {
		font-size: 20rpx;
		font-weight: 700;
		color: $duck-primary-dark;
	}

	.pt-txt {
		flex: 1;
		font-size: 26rpx;
		line-height: 1.72;
		color: $duck-text-sub;
	}

	/* 详细答案 */
	.para + .para {
		margin-top: 26rpx;
		padding-top: 24rpx;
		border-top: 1rpx solid #f0f3f1;
	}

	.para-head {
		display: flex;
		align-items: center;
		margin-bottom: 10rpx;
	}

	.para-bar {
		width: 6rpx;
		height: 26rpx;
		border-radius: 4rpx;
		background: linear-gradient(180deg, #5be0ac 0%, #00b578 100%);
		margin-right: 12rpx;
	}

	.para-h {
		font-size: 26rpx;
		font-weight: 600;
		color: $duck-text;
	}

	.para-p {
		display: block;
		font-size: 26rpx;
		line-height: 1.78;
		color: $duck-text-sub;
	}

	/* 代码块 */
	.code {
		padding: 20rpx 22rpx 24rpx;
		background-color: #0f1a14;
		border-radius: 16rpx;
	}

	.code-head {
		display: flex;
		align-items: center;
		margin-bottom: 14rpx;
	}

	.code-dot {
		width: 12rpx;
		height: 12rpx;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.28);
		margin-right: 10rpx;
	}

	.code-lang {
		margin-left: auto;
		font-size: 20rpx;
		color: rgba(255, 255, 255, 0.42);
	}

	.code-text {
		font-size: 23rpx;
		line-height: 1.68;
		color: #d6f5e5;
		font-family: Menlo, Consolas, monospace;
		white-space: pre-wrap;
		word-break: break-all;
	}

	/* 扩展知识 */
	.sec-ext {
		background-color: #f6fbf8;
		box-shadow: none;
	}

	.ext-row {
		display: flex;
		align-items: flex-start;
		margin-top: 14rpx;
	}

	.ext-row:first-of-type {
		margin-top: 0;
	}

	.ext-dot {
		width: 10rpx;
		height: 10rpx;
		border-radius: 50%;
		background-color: $duck-primary;
		flex-shrink: 0;
		margin-top: 14rpx;
		margin-right: 14rpx;
	}

	.ext-txt {
		flex: 1;
		font-size: 25rpx;
		line-height: 1.7;
		color: $duck-text-sub;
	}

	/* 上一题 / 下一题 */
	.switch-card {
		display: flex;
		align-items: stretch;
		margin-top: 24rpx;
		padding: 22rpx 20rpx;
		background-color: #ffffff;
		border-radius: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(20, 32, 26, 0.05);
	}

	.switch-item {
		flex: 1;
		min-width: 0;
		padding: 0 8rpx;
	}

	.switch-item.is-right {
		text-align: right;
	}

	.switch-item.is-off {
		opacity: 0.42;
	}

	.switch-hover {
		opacity: 0.6;
	}

	.switch-label {
		display: block;
		font-size: 21rpx;
		color: $duck-text-muted;
	}

	.switch-title {
		display: block;
		margin-top: 6rpx;
		font-size: 25rpx;
		font-weight: 600;
		color: $duck-text;
	}

	.switch-line {
		width: 1rpx;
		background-color: #eef1ef;
		margin: 4rpx 6rpx;
	}

	.foot-tip {
		margin-top: 20rpx;
		text-align: center;
	}

	.foot-tip-txt {
		font-size: 20rpx;
		color: #b3beb8;
	}

	.bottom-space {
		height: 40rpx;
	}

	/* ---------- 底部操作 ---------- */
	.foot {
		flex-shrink: 0;
		padding: 16rpx 24rpx;
		padding-bottom: calc(16rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
		background-color: #ffffff;
		box-shadow: 0 -4rpx 18rpx rgba(20, 32, 26, 0.06);
	}

	.foot-btn {
		height: 88rpx;
		border-radius: 999rpx;
		background: linear-gradient(135deg, #22c98c 0%, #00b578 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 20rpx rgba(0, 181, 120, 0.24);
	}

	.foot-btn-hover {
		opacity: 0.86;
	}

	.foot-btn-txt {
		font-size: 28rpx;
		font-weight: 600;
		color: #ffffff;
		margin-right: 6rpx;
	}

	.qa-empty {
		margin-top: 120rpx;
	}

	/* ---------- AI 解析入口 ---------- */
	.ai-entry {
		margin-top: 20rpx;
		padding: 24rpx 26rpx;
		display: flex;
		align-items: center;
		background-color: #ffffff;
		border: 1rpx solid $duck-primary-line;
		border-radius: $duck-radius;
		box-shadow: $duck-shadow;
	}

	.ai-entry-hover {
		background-color: $duck-primary-soft;
	}

	.ai-entry-badge {
		width: 60rpx;
		height: 60rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-image: $duck-grad-btn;
		flex-shrink: 0;
	}

	.ai-entry-badge.is-sm {
		width: 40rpx;
		height: 40rpx;
		border-radius: 12rpx;
	}

	.ai-entry-badge-txt {
		font-size: 22rpx;
		font-weight: 600;
		line-height: 1;
		letter-spacing: 0.5rpx;
		color: #ffffff;
	}

	.ai-entry-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		margin-left: 20rpx;
	}

	.ai-entry-title {
		font-size: 28rpx;
		font-weight: 600;
		color: $duck-text;
	}

	.ai-entry-desc {
		margin-top: 6rpx;
		font-size: 21rpx;
		color: $duck-text-muted;
	}

	/* ---------- AI 解析弹窗 ---------- */
	.ai-mask {
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		z-index: 900;
		display: flex;
		align-items: flex-end;
		background-color: rgba(10, 22, 17, 0.46);
	}

	.ai-sheet {
		width: 100%;
		/* 有内容时给「确定高度」，而不是 max-height：
		   小程序的 scroll-view 是原生组件，父级拿不到明确高度就一直按内容撑开，永远滚不动。
		   固定 80vh 后，下面那层 flex 分配出来的就是具体数值，scroll-view 才认。 */
		height: 80vh;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		background-color: #ffffff;
		border-radius: 32rpx 32rpx 0 0;
		padding-bottom: env(safe-area-inset-bottom);
		animation: aiSheetUp 0.24s ease-out;
	}

	/* 还没有内容（加载中 / 出错）：让弹窗贴合内容，不要一上来就占满 80vh */
	.ai-sheet.is-auto {
		height: auto;
		max-height: 80vh;
	}

	@keyframes aiSheetUp {
		from {
			transform: translateY(48rpx);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.ai-sheet-bar {
		width: 72rpx;
		height: 8rpx;
		margin: 16rpx auto 0;
		border-radius: 4rpx;
		background-color: #e9edeb;
	}

	.ai-sheet-head {
		display: flex;
		align-items: flex-start;
		padding: 18rpx 30rpx 16rpx;
	}

	.ai-sheet-titles {
		flex: 1;
		min-width: 0;
	}

	.ai-sheet-title-row {
		display: flex;
		align-items: center;
	}

	.ai-sheet-title {
		margin-left: 12rpx;
		font-size: 32rpx;
		font-weight: 600;
		color: $duck-text;
	}

	.ai-sheet-live {
		margin-left: 12rpx;
		height: 34rpx;
		line-height: 34rpx;
		padding: 0 12rpx;
		border-radius: 999rpx;
		background-color: $duck-primary-soft;
		font-size: 19rpx;
		color: $duck-primary-dark;
	}

	.ai-sheet-live.is-done {
		background-color: #f2f4f3;
		color: $duck-text-muted;
	}

	.ai-sheet-sub {
		margin-top: 10rpx;
		font-size: 22rpx;
		line-height: 1.5;
		color: $duck-text-muted;
	}

	.ai-sheet-close {
		width: 56rpx;
		height: 56rpx;
		margin-left: 16rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: $duck-fill;
		flex-shrink: 0;
	}

	.ai-sheet-close-hover {
		background-color: #eaeeec;
	}

	.ai-sheet-close-txt {
		font-size: 38rpx;
		line-height: 1;
		color: $duck-text-muted;
	}

	.ai-sheet-body {
		/* 承接剩余高度：父级 .ai-sheet 是 flex column + height: 80vh，
		   这里靠 flex:1 + min-height:0 拿到确定高度，再交给 scroll-view 的 100%。
		   min-height:0 是关键，默认 auto 会让它不肯收缩，进而撑破弹窗。 */
		flex: 1 1 auto;
		min-height: 0;
		padding: 0 30rpx;
		box-sizing: border-box;
		overflow: hidden;
	}

	.ai-sheet-scroll {
		height: 100%;
	}

	.ai-loading {
		padding: 90rpx 0 60rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.ai-dots {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.ai-dot {
		width: 14rpx;
		height: 14rpx;
		margin: 0 6rpx;
		border-radius: 50%;
		background-color: $duck-primary;
		animation: aiBounce 1s infinite ease-in-out;
	}

	.ai-dot:nth-child(2) {
		animation-delay: 0.15s;
	}

	.ai-dot:nth-child(3) {
		animation-delay: 0.3s;
	}

	@keyframes aiBounce {
		0%,
		80%,
		100% {
			transform: scale(0.55);
			opacity: 0.4;
		}
		40% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.ai-loading-txt {
		margin-top: 28rpx;
		font-size: 26rpx;
		color: $duck-text;
	}

	.ai-loading-tip {
		margin-top: 12rpx;
		font-size: 21rpx;
		color: $duck-text-light;
	}

	.ai-content {
		padding-top: 8rpx;
	}

	.ai-core {
		padding: 22rpx 24rpx;
		display: flex;
		flex-direction: column;
		background-color: $duck-primary-soft;
		border-left: 6rpx solid $duck-primary;
		border-radius: 0 16rpx 16rpx 0;
	}

	.ai-core-mark {
		font-size: 19rpx;
		letter-spacing: 2rpx;
		color: $duck-primary-dark;
	}

	.ai-core-txt {
		margin-top: 10rpx;
		font-size: 28rpx;
		line-height: 1.6;
		color: $duck-ink;
	}

	.ai-block {
		margin-top: 34rpx;
	}

	.ai-block-head {
		display: flex;
		align-items: center;
	}

	.ai-block-bar {
		width: 6rpx;
		height: 26rpx;
		margin-right: 14rpx;
		border-radius: 3rpx;
		background-color: $duck-primary;
	}

	.ai-block-bar.is-bonus {
		background-color: $duck-gold;
	}

	.ai-block-bar.is-trap {
		background-color: $duck-warn;
	}

	.ai-block-bar.is-follow {
		background-color: $duck-blue;
	}

	.ai-block-title {
		font-size: 27rpx;
		font-weight: 600;
		color: $duck-text;
	}

	.ai-step {
		display: flex;
		align-items: flex-start;
		margin-top: 18rpx;
	}

	.ai-step-no {
		width: 36rpx;
		height: 36rpx;
		margin-top: 4rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: $duck-primary-soft;
		flex-shrink: 0;
	}

	.ai-step-no-txt {
		font-size: 21rpx;
		font-weight: 600;
		color: $duck-primary-dark;
	}

	.ai-step-txt {
		flex: 1;
		margin-left: 16rpx;
		font-size: 26rpx;
		line-height: 1.68;
		color: #3a3f3d;
	}

	.ai-li {
		display: flex;
		align-items: flex-start;
		margin-top: 16rpx;
	}

	.ai-li-mark {
		width: 32rpx;
		flex-shrink: 0;
		font-size: 27rpx;
		font-weight: 600;
		line-height: 1.6;
		text-align: center;
	}

	.ai-li-mark.is-bonus {
		color: $duck-gold;
	}

	.ai-li-mark.is-trap {
		color: $duck-warn;
	}

	.ai-li-mark.is-follow {
		color: $duck-blue;
	}

	.ai-li-txt {
		flex: 1;
		margin-left: 10rpx;
		font-size: 26rpx;
		line-height: 1.68;
		color: #3a3f3d;
	}

	.ai-typing {
		display: flex;
		align-items: center;
		margin-top: 26rpx;
	}

	.ai-typing-dot {
		width: 10rpx;
		height: 10rpx;
		margin-right: 8rpx;
		border-radius: 50%;
		background-color: $duck-primary-line;
		animation: aiBounce 1s infinite ease-in-out;
	}

	.ai-typing-dot:nth-child(2) {
		animation-delay: 0.15s;
	}

	.ai-typing-dot:nth-child(3) {
		animation-delay: 0.3s;
	}

	.ai-inline-error {
		margin-top: 26rpx;
		padding: 18rpx 20rpx;
		display: flex;
		align-items: center;
		border-radius: 16rpx;
		background-color: #fff7f0;
	}

	.ai-inline-error-txt {
		flex: 1;
		font-size: 22rpx;
		line-height: 1.5;
		color: #a35a1c;
	}

	.ai-inline-retry {
		margin-left: 16rpx;
		font-size: 22rpx;
		color: $duck-primary-dark;
		flex-shrink: 0;
	}

	.ai-error {
		padding: 80rpx 20rpx 60rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.ai-error-title {
		font-size: 28rpx;
		font-weight: 600;
		color: $duck-text;
	}

	.ai-error-txt {
		margin-top: 14rpx;
		font-size: 23rpx;
		line-height: 1.6;
		text-align: center;
		color: $duck-text-muted;
	}

	.ai-retry {
		margin-top: 30rpx;
		height: 64rpx;
		padding: 0 46rpx;
		border-radius: 999rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-image: $duck-grad-btn;
	}

	.ai-retry-hover {
		opacity: 0.86;
	}

	.ai-retry-txt {
		font-size: 26rpx;
		font-weight: 600;
		color: #ffffff;
	}

	.ai-foot {
		margin-top: 40rpx;
		padding-top: 20rpx;
		border-top: 1rpx solid $duck-line;
		text-align: center;
	}

	.ai-foot-txt {
		font-size: 20rpx;
		color: $duck-text-light;
	}

	.ai-bottom-space {
		height: 60rpx;
	}
</style>
