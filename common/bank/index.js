/**
 * 题库汇总（问答详解）
 *
 * 全部分类统一为「问答详解」形态：不给选项，直接给
 *   一句话回答 short / 回答重点 points / 详细答案 detail / 扩展知识 extend
 *
 * 题目清单与解析参考自「面试鸭」各个技术方向的题库：
 *   https://www.mianshiya.com
 * 各分类数据按方向拆分在 qa/ 下，新增分类只需在这里补一行 import。
 */

import { qaQuestions as jsQa } from './qa/js.js'
import { qaQuestions as tsQa } from './qa/ts.js'
import { qaQuestions as cssQa } from './qa/css.js'
import { qaQuestions as htmlQa } from './qa/html.js'
import { qaQuestions as vueQa } from './qa/vue.js'
import { qaQuestions as reactQa } from './qa/react.js'
import { qaQuestions as nodeQa } from './qa/node.js'
import { qaQuestions as browserQa } from './qa/browser.js'
import { qaQuestions as buildQa } from './qa/build.js'
import { qaQuestions as algoQa } from './qa/algo.js'
import { qaQuestions as pyQa } from './python.js'

/** 分类顺序，决定题库页 / 首页列表的排列 */
export const qaOrder = ['js', 'ts', 'css', 'html', 'vue', 'react', 'node', 'browser', 'build', 'algo', 'py']

export const qaQuestions = [].concat(
	jsQa,
	tsQa,
	cssQa,
	htmlQa,
	vueQa,
	reactQa,
	nodeQa,
	browserQa,
	buildQa,
	algoQa,
	pyQa
)
