import { createFirebaseStore } from './firebase-store.js'
import { seedFromMarkdown } from './seed.js'
import { CABINETS } from './config.js'
import { FIREBASE_CONFIG, EDIT_SECRET } from '../firebase-config.js'

const store = createFirebaseStore(FIREBASE_CONFIG)
const isEditMode = new URLSearchParams(window.location.search).get('edit') === EDIT_SECRET

let allMedicines = []
let searchQuery = ''
let activeTab = 0

// DOM refs
const searchInput = document.getElementById('search-input')
const tabsEl = document.getElementById('tabs')
const cabinetContent = document.getElementById('cabinet-content')
const searchResults = document.getElementById('search-results')
const addModal = document.getElementById('add-modal')
const seedBtn = document.getElementById('seed-btn')

// ── Rendering ──────────────────────────────────────────────────────────────

function render() {
  if (searchQuery) {
    renderSearchResults()
  } else {
    renderCabinet()
  }
}

function renderSearchResults() {
  cabinetContent.classList.add('hidden')
  searchResults.classList.remove('hidden')

  const q = searchQuery.toLowerCase()
  const results = allMedicines.filter(m =>
    m.name.toLowerCase().includes(q) ||
    (m.notes && m.notes.toLowerCase().includes(q))
  )

  if (results.length === 0) {
    searchResults.innerHTML = `<p class="empty">找不到「${searchQuery}」</p>`
    return
  }

  searchResults.innerHTML = results.map(m => `
    <div class="search-result-item">
      <span class="medicine-name">${m.name}</span>
      ${m.notes ? `<span class="medicine-notes">${m.notes}</span>` : ''}
      <span class="medicine-location">${m.cabinet} · ${m.layer}</span>
      ${isEditMode ? `<button class="delete-btn" data-id="${m.id}" aria-label="刪除">✕</button>` : ''}
    </div>
  `).join('')
}

function renderCabinet() {
  cabinetContent.classList.remove('hidden')
  searchResults.classList.add('hidden')

  const cabinet = CABINETS[activeTab]

  cabinetContent.innerHTML = cabinet.layers.map(layer => {
    const medicines = allMedicines.filter(m => m.cabinet === cabinet.name && m.layer === layer)
    return `
      <section class="layer">
        <div class="layer-header">
          <h2>${layer}</h2>
          ${isEditMode ? `<button class="add-btn" data-cabinet="${cabinet.name}" data-layer="${layer}">＋ 新增</button>` : ''}
        </div>
        <div class="medicines">
          ${medicines.length === 0 ? '<span class="empty-layer">（空）</span>' : ''}
          ${medicines.map(m => `
            <span class="medicine-chip">
              ${m.name}${m.notes ? ` <em>${m.notes}</em>` : ''}
              ${isEditMode ? `<button class="delete-chip-btn" data-id="${m.id}" aria-label="刪除">✕</button>` : ''}
            </span>
          `).join('')}
        </div>
      </section>
    `
  }).join('')
}

function renderTabs() {
  tabsEl.innerHTML = CABINETS.map((cab, i) => `
    <button class="tab ${i === activeTab ? 'active' : ''}" data-index="${i}">
      ${cab.name}
    </button>
  `).join('')
}

// ── Event listeners ────────────────────────────────────────────────────────

searchInput.addEventListener('input', e => {
  searchQuery = e.target.value.trim()
  render()
})

tabsEl.addEventListener('click', e => {
  const btn = e.target.closest('.tab')
  if (!btn) return
  activeTab = parseInt(btn.dataset.index)
  renderTabs()
  render()
})

cabinetContent.addEventListener('click', e => {
  const addBtn = e.target.closest('.add-btn')
  if (addBtn) {
    openAddModal(addBtn.dataset.cabinet, addBtn.dataset.layer)
    return
  }
  const deleteBtn = e.target.closest('.delete-chip-btn')
  if (deleteBtn) store.remove(deleteBtn.dataset.id)
})

searchResults.addEventListener('click', e => {
  const deleteBtn = e.target.closest('.delete-btn')
  if (deleteBtn) store.remove(deleteBtn.dataset.id)
})

// ── Add modal ──────────────────────────────────────────────────────────────

function openAddModal(cabinet, layer) {
  document.getElementById('modal-location').textContent = `${cabinet} · ${layer}`
  document.getElementById('modal-cabinet-val').value = cabinet
  document.getElementById('modal-layer-val').value = layer
  document.getElementById('add-name').value = ''
  document.getElementById('add-notes').value = ''
  addModal.classList.remove('hidden')
  document.getElementById('add-name').focus()
}

document.getElementById('add-confirm').addEventListener('click', async () => {
  const cabinet = document.getElementById('modal-cabinet-val').value
  const layer = document.getElementById('modal-layer-val').value
  const name = document.getElementById('add-name').value.trim()
  const notes = document.getElementById('add-notes').value.trim()
  if (!name) return
  await store.add({ cabinet, layer, name, notes })
  addModal.classList.add('hidden')
})

document.getElementById('add-cancel').addEventListener('click', () => {
  addModal.classList.add('hidden')
})

addModal.addEventListener('click', e => {
  if (e.target === addModal) addModal.classList.add('hidden')
})

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') addModal.classList.add('hidden')
  if (e.key === 'Enter' && !addModal.classList.contains('hidden')) {
    document.getElementById('add-confirm').click()
  }
})

// ── Seed ───────────────────────────────────────────────────────────────────

if (isEditMode && seedBtn) {
  store.isSeeded().then(seeded => {
    if (!seeded) seedBtn.classList.remove('hidden')
  })

  seedBtn.addEventListener('click', async () => {
    seedBtn.disabled = true
    seedBtn.textContent = '匯入中...'
    try {
      await seedFromMarkdown(store)
      seedBtn.classList.add('hidden')
    } catch (err) {
      seedBtn.textContent = '匯入失敗，請重試'
      seedBtn.disabled = false
      console.error(err)
    }
  })
}

// ── Init ───────────────────────────────────────────────────────────────────

if (isEditMode) document.body.classList.add('edit-mode')

store.subscribe(medicines => {
  allMedicines = medicines
  render()
})

renderTabs()
render()
