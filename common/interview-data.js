/**
 * 前端面试鸭 · 题库数据（问答详解）
 *
 * @deprecated 页面已全部改用 common/question-source.js（数据从后端接口拉取，
 *             本地只缓存摘要）。本文件仅保留给 legacy/ 下的旧页面引用与
 *             极端离线兜底，新代码请勿再直接 import。
 *
 * 全站内容统一为「问答详解」：每道题给出一句话回答、回答重点、详细答案与扩展追问，
 * 不再提供 ABCD 选项，打开即读。
 *
 * 题目清单与解析参考自「面试鸭」（https://www.mianshiya.com）各技术方向的题库，
 * 分类数据拆分在 common/bank/ 下维护，本文件只做聚合与查询。
 *
 * 约定：本文件只放纯数据与纯函数，不要出现 uni.* / wx.* 调用
 */

import { qaQuestions } from './bank/index.js'

export { qaQuestions }

/** 分类定义：id / 名称 / 角标 / 图标底色 / 描述 */
export const categories = [
	{
		id: 'js',
		name: 'JavaScript',
		short: 'JS',
		icon: '🟨',
		bg: '#fff8e1',
		desc: '数据类型、作用域、原型链、this、事件循环与异步'
	},
	{
		id: 'ts',
		name: 'TypeScript',
		short: 'TS',
		icon: '🔷',
		bg: '#e8f1fd',
		desc: '类型系统、泛型、类型体操与工程配置'
	},
	{
		id: 'css',
		name: 'CSS',
		short: 'CSS',
		icon: '🎨',
		bg: '#fdeef0',
		desc: '盒模型、BFC、Flex/Grid、层叠上下文与响应式'
	},
	{
		id: 'html',
		name: 'HTML',
		short: 'HTML',
		icon: '📄',
		bg: '#fff2e8',
		desc: '语义化、标签差异、资源加载、表单与可访问性'
	},
	{
		id: 'vue',
		name: 'Vue',
		short: 'Vue',
		icon: '💚',
		bg: '#e8f8ef',
		desc: '响应式原理、组件通信、生命周期与 Vue3 组合式 API'
	},
	{
		id: 'react',
		name: 'React',
		short: 'React',
		icon: '⚛️',
		bg: '#e6f4fb',
		desc: 'Hooks、渲染机制、状态管理与并发特性'
	},
	{
		id: 'node',
		name: 'Node.js',
		short: 'Node',
		icon: '🟩',
		bg: '#eaf7ea',
		desc: '事件循环、模块机制、Stream/Buffer 与进程模型'
	},
	{
		id: 'browser',
		name: '浏览器与网络',
		short: '网络',
		icon: '🌐',
		bg: '#e9f3fd',
		desc: '渲染流程、HTTP 缓存、跨域与性能排查'
	},
	{
		id: 'build',
		name: '工程化',
		short: '构建',
		icon: '🧱',
		bg: '#f2eefc',
		desc: 'Webpack/Vite、构建优化、模块化与 CI'
	},
	{
		id: 'algo',
		name: '算法与数据结构',
		short: '算法',
		icon: '🧠',
		bg: '#fdf0e6',
		desc: '大厂高频算法题与前端手写实现'
	},
	{
		id: 'py',
		name: 'Python',
		short: 'PY',
		icon: '🐍',
		bg: '#e8f6ee',
		desc: '基础语法、面向对象、标准库、性能与并发'
	}
]

export const levelText = {
	1: '简单',
	2: '中等',
	3: '困难'
}

/** 分类题量；不传分类则返回总题量 */
export function countQa(cat) {
	if (!cat) return qaQuestions.length
	return qaQuestions.filter((q) => q.cat === cat).length
}

/** 某个分类下的全部问答 */
export function qaOfCat(cat) {
	return qaQuestions.filter((q) => q.cat === cat)
}

/** 按 id 查询 */
export function findQa(id) {
	return qaQuestions.find((q) => q.id === id) || null
}

/** 在分类内的序号（从 0 开始），用于上一题 / 下一题 */
export function indexOfQa(id, cat) {
	const list = cat ? qaOfCat(cat) : qaQuestions
	return list.findIndex((q) => q.id === id)
}

/** 搜索：题干 + 一句话回答 + 重点 + 详细答案 + 扩展追问 */
export function searchQa(keyword) {
	const kw = String(keyword || '').trim().toLowerCase()
	if (!kw) return []
	return qaQuestions.filter((q) => {
		const parts = [q.title, q.short || '', (q.points || []).join(' '), (q.extend || []).join(' ')]
		;(q.detail || []).forEach((d) => {
			parts.push(d.h || '', d.p || '')
		})
		return parts.join(' ').toLowerCase().indexOf(kw) > -1
	})
}

/** 随机一条问答，可限定分类、排除当前题 */
export function randomQa(cat = '', excludeId = '') {
	const pool = cat ? qaOfCat(cat) : qaQuestions
	if (!pool.length) return null
	const candidates = pool.length > 1 && excludeId ? pool.filter((q) => q.id !== excludeId) : pool
	return candidates[Math.floor(Math.random() * candidates.length)] || pool[0]
}

/** 每日一题：用日期做种子，同一天始终是同一条 */
export function dailyQa() {
	if (!qaQuestions.length) return null
	const d = new Date()
	const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
	return qaQuestions[seed % qaQuestions.length]
}

/** 高频问答，按 hot 倒序 */
export function hotQa(n = 5) {
	return qaQuestions
		.slice()
		.sort((a, b) => (b.hot || 0) - (a.hot || 0))
		.slice(0, n)
}
