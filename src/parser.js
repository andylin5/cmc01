export function parseMarkdown(markdown, cabinet) {
  const medicines = []
  let currentLayer = null

  for (const line of markdown.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('|')) continue

    const cell = trimmed.replace(/^\|/, '').replace(/\|$/, '').trim()
    if (!cell || cell.startsWith(':')) continue

    const tokens = cell.split(/\s{2,}|\t/).map(s => s.trim()).filter(Boolean)
    if (/^(底下)?第[一二三四五六七八九十]+層$/.test(cell.trim())) {
      currentLayer = cell.trim()
      continue
    }

    if (!currentLayer) continue

    for (const token of tokens) {
      if (!token) continue
      const match = token.match(/^(.+?)[(（](.+?)[)）]$/)
      if (match) {
        medicines.push({ cabinet, layer: currentLayer, name: match[1].trim(), notes: match[2].trim() })
      } else {
        medicines.push({ cabinet, layer: currentLayer, name: token.trim(), notes: '' })
      }
    }
  }

  return medicines
}
