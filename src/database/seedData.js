async function createInitialRecords(db) {
	// Insert initial records into the 'recipes' table
	const recipesCount = await db.get(`SELECT COUNT(*) as count FROM recipes`)
		if (recipesCount.count === 0) {
				await db.run(`INSERT INTO recipes (title, description, ingredients, method, tags, is_favorite) VALUES 
			('Spaghetti Carbonara', 'Classic Italian pasta dish', '1 lb spaghetti\n4 oz pancetta\n3 eggs\n1 cup parmesan cheese', 'Cook spaghetti according to package directions\nFry pancetta until crispy\nMix eggs and cheese in a bowl\nCombine hot pasta with pancetta\nAdd egg mixture and toss quickly\nServe immediately', 'italian,pasta', 0),
			('Chocolate Chip Cookies', 'Classic homemade cookies', '2.25 cups flour\n1 cup butter\n0.75 cup brown sugar\n0.25 cup white sugar\n2 eggs\n2 cups chocolate chips', 'Preheat oven to 375°F\nMix dry ingredients in a bowl\nCream butter and sugars\nAdd eggs one at a time\nCombine wet and dry ingredients\nFold in chocolate chips\nBake 9-11 minutes', 'dessert,baking', 1),
			('Caesar Salad', 'Fresh salad with homemade dressing', '2 heads romaine lettuce\n4 anchovy fillets\n2 garlic cloves\n0.25 cup lemon juice\n0.5 cup parmesan cheese', 'Wash and chop romaine lettuce\nMince anchovies and garlic\nWhisk together lemon juice, anchovies, and garlic\nAdd parmesan cheese to dressing\nToss lettuce with dressing\nServe immediately', 'salad,healthy', 0)`)
		} else {
		// Update existing records to add newlines if they don't have them
		const recipes = await db.all('SELECT * FROM recipes')
		for (const recipe of recipes) {
			// Check if method contains newlines
			if (recipe.method && !recipe.method.includes('\n')) {
				// Update method with newlines by splitting on periods and joining with newlines
				const updatedMethod = recipe.method
					.split('. ')
					.map(step => step.trim())
					.filter(step => step.length > 0)
					.map(step => step.endsWith('.') ? step : step + '.')
					.join('\n')
				
				// Update ingredients with newlines by splitting on commas
				const updatedIngredients = recipe.ingredients
					.split(', ')
					.map(ingredient => ingredient.trim())
					.filter(ingredient => ingredient.length > 0)
					.join('\n')
				
				await db.run(
					'UPDATE recipes SET ingredients = ?, method = ? WHERE id = ?',
					[updatedIngredients, updatedMethod, recipe.id]
				)
			}
			// Ensure tags and is_favorite columns exist and are populated
			const needsTag = recipe.tags === undefined || recipe.tags === null
			const needsFav = recipe.is_favorite === undefined || recipe.is_favorite === null
			if (needsTag || needsFav) {
				await db.run(
					"UPDATE recipes SET tags = COALESCE(tags, ''), is_favorite = COALESCE(is_favorite, 0) WHERE id = ?",
					[recipe.id]
				)
			}
		}
	}
}

module.exports = { createInitialRecords }
