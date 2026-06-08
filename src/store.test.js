import { describe, it, expect } from 'vitest'
import { createMedicineStore } from './store.js'

describe('藥品庫存', () => {
  it('新增一筆藥品後可以取回', () => {
    const store = createMedicineStore()

    store.add({ cabinet: '橱櫃一', layer: '第一層', name: '白芷', notes: '' })

    const all = store.getAll()
    expect(all).toHaveLength(1)
    expect(all[0].name).toBe('白芷')
    expect(all[0].cabinet).toBe('橱櫃一')
    expect(all[0].layer).toBe('第一層')
  })

  it('刪除藥品後不再出現', () => {
    const store = createMedicineStore()
    store.add({ cabinet: '橱櫃一', layer: '第一層', name: '白芷', notes: '' })

    const [medicine] = store.getAll()
    store.remove(medicine.id)

    expect(store.getAll()).toHaveLength(0)
  })

  it('搜尋關鍵字可過濾藥名', () => {
    const store = createMedicineStore()
    store.add({ cabinet: '橱櫃一', layer: '第一層', name: '白芷', notes: '' })
    store.add({ cabinet: '橱櫃一', layer: '第二層', name: '黃芩', notes: '' })
    store.add({ cabinet: '橱櫃二', layer: '第三層', name: '白术', notes: '' })

    const result = store.search('白')

    expect(result).toHaveLength(2)
    expect(result.map(m => m.name)).toContain('白芷')
    expect(result.map(m => m.name)).toContain('白术')
  })

  it('搜尋同時比對備註', () => {
    const store = createMedicineStore()
    store.add({ cabinet: '橱櫃一', layer: '第一層', name: '加味逍遙散', notes: '3瓶' })
    store.add({ cabinet: '橱櫃一', layer: '第二層', name: '補中益氣湯', notes: '未' })

    const result = store.search('未')

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('補中益氣湯')
  })
})
