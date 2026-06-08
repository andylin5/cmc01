export function createMedicineStore() {
  const medicines = []

  return {
    add(medicine) {
      medicines.push({ ...medicine, id: crypto.randomUUID() })
    },

    remove(id) {
      const index = medicines.findIndex(m => m.id === id)
      if (index !== -1) medicines.splice(index, 1)
    },

    getAll() {
      return [...medicines]
    },

    search(query) {
      const q = query.toLowerCase()
      return medicines.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.notes.toLowerCase().includes(q)
      )
    },
  }
}
