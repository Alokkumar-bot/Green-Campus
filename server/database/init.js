import { query } from './db.js';

export async function initDatabase() {
  console.log('Initializing Green Campus database tables...');

  await query.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      department TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      zone TEXT
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_code TEXT UNIQUE NOT NULL,
      user_id INTEGER,
      category TEXT NOT NULL,
      location TEXT NOT NULL,
      specific_area TEXT,
      description TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'Medium',
      image_url TEXT,
      status TEXT NOT NULL DEFAULT 'Pending',
      assigned_to TEXT,
      anonymous INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS report_updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      note TEXT NOT NULL,
      updated_by TEXT NOT NULL DEFAULT 'Admin Staff',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
    CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category);
    CREATE INDEX IF NOT EXISTS idx_reports_location ON reports(location);
    CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at);
  `);

  console.log('Database tables successfully initialized.');
}

if (process.argv[1] && process.argv[1].endsWith('init.js')) {
  initDatabase().catch(err => {
    console.error('Initialization error:', err);
    process.exit(1);
  });
}
