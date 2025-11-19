const express = require('express')
const { getDbConnection } = require('./database')

const router = express.Router()

router.get('/', (req, res) => {
	res.render('home', { title: 'Recipe App' })
})

router.get('/recipes', async (req, res) => {
	const db = await getDbConnection()
	const { search, tag, favorites } = req.query
	// Build dynamic WHERE clauses
	const where = []
	const params = []
	if (search) {
		where.push("(title LIKE ? OR description LIKE ? OR ingredients LIKE ?)")
		const like = `%${search}%`
		params.push(like, like, like)
	}
	if (tag) {
		where.push("tags LIKE ?")
		params.push(`%${tag}%`)
	}
	// Support favorites being either a string or an array (when multiple inputs share the same name)
	const favoritesFlag = Array.isArray(favorites) ? favorites.includes('1') : favorites === '1'
	if (favoritesFlag) {
		where.push('is_favorite = 1')
	}

	const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
	const recipes = await db.all(`SELECT * FROM recipes ${whereSql} ORDER BY is_favorite DESC, title ASC`, params)

	// Collect distinct tags for filter UI
	const rows = await db.all('SELECT tags FROM recipes')
	const tagSet = new Set()
	for (const r of rows) {
		if (r.tags) {
			r.tags.split(',').map(t => t.trim()).filter(Boolean).forEach(t => tagSet.add(t))
		}
	}
	const tags = Array.from(tagSet).sort()

	res.render('recipes', { recipes, tags, search, selectedTag: tag, favorites: !!favoritesFlag })
})

router.get('/recipes/:id', async (req, res) => {
	const db = await getDbConnection()
	const recipeId = req.params.id
	const recipe = await db.get('SELECT * FROM recipes WHERE id = ?', [recipeId])
	res.render('recipe', { recipe })
})

router.post('/recipes', async (req, res) => {
	const db = await getDbConnection()
	const { title, ingredients, method, tags } = req.body
	// normalize tags: comma separated, remove extra spaces
	const normalizedTags = tags ? tags.split(',').map(t => t.trim()).filter(Boolean).join(',') : ''
	await db.run('INSERT INTO recipes (title, ingredients, method, tags, is_favorite) VALUES (?, ?, ?, ?, 0)', [title, ingredients, method, normalizedTags])
	res.redirect('/recipes')
})

router.post('/recipes/:id/edit', async (req, res) => {
	const db = await getDbConnection()
	const recipeId = req.params.id
	const { title, ingredients, method, tags } = req.body
	const normalizedTags = tags ? tags.split(',').map(t => t.trim()).filter(Boolean).join(',') : ''
	await db.run('UPDATE recipes SET title = ?, ingredients = ?, method = ?, tags = ? WHERE id = ?', [
		title,
		ingredients,
		method,
		normalizedTags,
		recipeId,
	])
	res.redirect(`/recipes/${recipeId}`)
})

// Toggle favorite for a recipe (AJAX)
router.post('/recipes/:id/favorite', async (req, res) => {
	const db = await getDbConnection()
	const id = req.params.id
	const row = await db.get('SELECT is_favorite FROM recipes WHERE id = ?', [id])
	if (!row) return res.status(404).json({ error: 'Not found' })
	const newVal = row.is_favorite ? 0 : 1
	await db.run('UPDATE recipes SET is_favorite = ? WHERE id = ?', [newVal, id])
	res.json({ id, is_favorite: newVal })
})

// get a random recipe and redirect to its page
router.get('/random', async (req, res) => {
	const db = await getDbConnection()
	// SQLite supports ORDER BY RANDOM()
	const recipe = await db.get('SELECT * FROM recipes ORDER BY RANDOM() LIMIT 1')
	if (recipe && recipe.id) {
		return res.redirect(`/recipes/${recipe.id}`)
	}
	// fallback to recipes list if none
	res.redirect('/recipes')
})


module.exports = router
