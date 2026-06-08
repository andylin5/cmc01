import { parseMarkdown } from './parser.js'
import { CABINETS } from './config.js'

export async function seedFromMarkdown(store) {
  for (const cabinet of CABINETS) {
    const response = await fetch(cabinet.markdownFile)
    const markdown = await response.text()
    const medicines = parseMarkdown(markdown, cabinet.name)
    for (const medicine of medicines) {
      await store.add(medicine)
    }
  }
  await store.markSeeded()
}
