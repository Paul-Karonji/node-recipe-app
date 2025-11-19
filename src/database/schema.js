async function createTables(db) {
	// Create the 'recipes' table to store recipe information
  await db.exec(`CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      ingredients TEXT,
      method TEXT,
      tags TEXT,
      is_favorite INTEGER DEFAULT 0
    )`)

  // Ensure columns exist for older DBs (add if missing)
  const cols = await db.all("PRAGMA table_info('recipes')")
  const colNames = cols.map(c => c.name)
  if (!colNames.includes('tags')) {
    await db.exec("ALTER TABLE recipes ADD COLUMN tags TEXT")
  }
  if (!colNames.includes('is_favorite')) {
    await db.exec("ALTER TABLE recipes ADD COLUMN is_favorite INTEGER DEFAULT 0")
  }
}

module.exports = { createTables }
