document.addEventListener('DOMContentLoaded', () => {
  // Favorite toggles
  document.querySelectorAll('.btn-fav').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = btn.dataset.id || btn.getAttribute('data-id')
      if (!id) return
      try {
        const resp = await fetch(`/recipes/${id}/favorite`, { method: 'POST' })
        if (!resp.ok) throw new Error('Network error')
        const json = await resp.json()
        if (json.is_favorite) {
          btn.textContent = '★ Favorite'
        } else {
          btn.textContent = '☆ Favorite'
        }
        // Optionally visually mark the card
        const card = document.querySelector(`.recipe-card[data-id='${id}']`)
        if (card) {
          if (json.is_favorite) card.classList.add('favorite')
          else card.classList.remove('favorite')
        }
      } catch (err) {
        console.error('Failed to toggle favorite', err)
      }
    })
  })

  // If search form present, focus input
  const searchInput = document.querySelector('input[type="search"][name="search"]')
  if (searchInput) searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') searchInput.value = ''
  })
})
