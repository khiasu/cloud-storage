import fs from 'fs';
import { getDb } from '../config/db.js';

export function exportMetadataBackup(filePath){
  const db = getDb();
  const users = db.prepare('SELECT * FROM users').all();
  const files = db.prepare('SELECT * FROM files').all();
  const dump = { users, files, exportedAt: new Date().toISOString() };
  fs.writeFileSync(filePath, JSON.stringify(dump, null, 2));
}

export function importMetadataBackup(filePath){
  const db = getDb();
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  db.prepare('DELETE FROM files').run();
  db.prepare('DELETE FROM users').run();
  const insertUser = db.prepare('INSERT INTO users (id,email,password_hash,created_at) VALUES (?,?,?,?)');
  const insertFile = db.prepare('INSERT INTO files (id,user_id,original_name,storage_key,mime,size,created_at) VALUES (?,?,?,?,?,?,?)');
  for (const u of content.users){
    insertUser.run(u.id, u.email, u.password_hash, u.created_at);
  }
  for (const f of content.files){
    insertFile.run(f.id, f.user_id, f.original_name, f.storage_key, f.mime, f.size, f.created_at);
  }
}
