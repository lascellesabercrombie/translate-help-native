import { type SQLiteDatabase } from 'expo-sqlite';


export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const DATABASE_VERSION = 1;
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentDbVersion = result?.user_version || 0;
  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }
  if (currentDbVersion === 0) {
    await db.execAsync('PRAGMA journal_mode = "wal";');
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS authors (
      id INTEGER PRIMARY KEY,
      family_name TEXT NOT NULL,
      personal_name TEXT NOT NULL,
      family_name_transliterated TEXT,
      personal_name_transliterated TEXT
    );`);
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS texts (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      author_id INTEGER NOT NULL,
      language TEXT NOT NULL,
      text TEXT NOT NULL,
      is_translation INTEGER NOT NULL,
      original_text_id INTEGER,
      FOREIGN KEY (author_id) REFERENCES authors (id),
      FOREIGN KEY (original_text_id) REFERENCES texts (id),
      CHECK (
        (is_translation = 0 AND original_text_id IS NULL) OR
        (is_translation = 1 AND original_text_id IS NOT NULL)
      )
    );`);

await db.runAsync(`
  INSERT OR IGNORE INTO authors 
  (family_name, personal_name, family_name_transliterated, personal_name_transliterated)
  VALUES (?, ?, ?, ?)`, 
  ['李', '白', 'Li', 'Bai']
);

await db.runAsync(`
  INSERT OR IGNORE INTO authors 
  (family_name, personal_name, family_name_transliterated, personal_name_transliterated)
  VALUES (?, ?, ?, ?)`,
  ['李', '绅', 'Li', 'Shen']
);

await db.runAsync(`
  INSERT OR IGNORE INTO authors 
  (family_name, personal_name, family_name_transliterated, personal_name_transliterated)
  VALUES (?, ?, ?, ?)`,
  ['骆', '宾王', 'Luo', 'Binwang']
);

await db.runAsync(`
  INSERT OR IGNORE INTO texts
  (id, title, author_id, language, text, is_translation, original_text_id)
  VALUES (?, ?, ?, ?, ?, ?, ?)`, 
  [1, '静夜思', 1, 'zh', '床前明月光，\n疑是地上霜。\n举头望明月，\n低头思故乡。', 0, null]
);

await db.runAsync(`
  INSERT OR IGNORE INTO texts
  (id, title, author_id, language, text, is_translation, original_text_id)
  VALUES (?, ?, ?, ?, ?, ?, ?)`, 
  [2, '悯农', 2, 'zh', '锄禾日当午，\n汗滴禾下土。\n谁知盘中餐，\n粒粒皆辛苦。', 0, null]
);

await db.runAsync(`
  INSERT OR IGNORE INTO texts
  (id, title, author_id, language, text, is_translation, original_text_id)
  VALUES (?, ?, ?, ?, ?, ?, ?)`, 
  [3, '咏鹅', 3, 'zh', '鹅、鹅、鹅，\n曲项向天歌。\n白毛浮绿水，\n红掌拨清波', 0, null]
);

    currentDbVersion = 1;
  }
  // if (currentDbVersion === 1) {
  //   Add more migrations
  // }
  console.log(
    await db.getAllAsync(
      "SELECT * FROM sqlite_schema WHERE type='table' ORDER BY name"
    )
  );
  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}