import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js'
import { getDatabase, ref, push, remove, onValue, get, set } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js'

export function createFirebaseStore(firebaseConfig) {
  const app = initializeApp(firebaseConfig)
  const db = getDatabase(app)
  const medicinesRef = ref(db, 'medicines')

  return {
    async add(medicine) {
      await push(medicinesRef, medicine)
    },

    async remove(id) {
      await remove(ref(db, `medicines/${id}`))
    },

    subscribe(callback) {
      return onValue(medicinesRef, snapshot => {
        const data = snapshot.val() || {}
        const list = Object.entries(data).map(([id, m]) => ({ ...m, id }))
        callback(list)
      })
    },

    async isSeeded() {
      const snap = await get(ref(db, 'config/seeded'))
      return snap.val() === true
    },

    async markSeeded() {
      await set(ref(db, 'config/seeded'), true)
    }
  }
}
