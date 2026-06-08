import { describe, it, expect } from 'vitest'
import { parseMarkdown } from './parser.js'

describe('markdown 解析', () => {
  it('從 markdown 表格解析出藥品清單', () => {
    const markdown = `
| 第一層 |
| :---- |
| 白芷   黃芩   白术 |
| 第二層 |
| 骨碎補   百部 |
`
    const result = parseMarkdown(markdown, '橱櫃一')

    expect(result).toContainEqual(
      expect.objectContaining({ name: '白芷', cabinet: '橱櫃一', layer: '第一層' })
    )
    expect(result).toContainEqual(
      expect.objectContaining({ name: '骨碎補', cabinet: '橱櫃一', layer: '第二層' })
    )
  })

  it('藥名後的括號內容放進備註', () => {
    const markdown = `
| 第一層 |
| :---- |
| 加味逍遙散(3瓶)   補中益氣湯(未) |
`
    const result = parseMarkdown(markdown, '橱櫃一')

    expect(result).toContainEqual(
      expect.objectContaining({ name: '加味逍遙散', notes: '3瓶' })
    )
    expect(result).toContainEqual(
      expect.objectContaining({ name: '補中益氣湯', notes: '未' })
    )
  })
})
