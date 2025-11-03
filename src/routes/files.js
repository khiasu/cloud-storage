import { Router } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import { getDb } from '../config/db.js';
import { authRequired, signDownloadToken, verifyDownloadToken } from '../middleware/auth.js';
import { saveStream, getStream, removeObject } from '../services/storage.js';
import mime from 'mime-types';
import { Readable } from 'stream';

// Helper function to convert buffer to readable stream
const ReadableFromBuffer = (buffer) => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
const router = Router();

router.post('/upload', authRequired, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'file is required' });
    
    const ext = path.extname(file.originalname);
    const key = `${req.user.id}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    
    // Save file to storage
    const saved = await saveStream({ 
      stream: ReadableFromBuffer(file.buffer), 
      key, 
      contentType: file.mimetype 
    });
    
    // Save file metadata to database
    const db = await getDb();
    const result = await db.run(
      'INSERT INTO files (user_id, original_name, storage_key, mime, size) VALUES (?,?,?,?,?)',
      [req.user.id, file.originalname, key, file.mimetype, file.size]
    );
    
    return res.json({ id: result.lastID });
    
  } catch (e) {
    console.error('Upload error:', e);
    return res.status(500).json({ error: 'Upload failed', details: e.message });
  }
});

router.get('/list', authRequired, async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all(
      'SELECT id, original_name, size, created_at FROM files WHERE user_id=? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (e) {
    console.error('List files error:', e);
    res.status(500).json({ error: 'Failed to list files', details: e.message });
  }
});

router.get('/download/:id', authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    
    const f = await db.get(
      'SELECT * FROM files WHERE id=? AND user_id=?',
      [id, req.user.id]
    );
    
    if (!f) return res.status(404).json({ error: 'File not found' });
    
    const stream = await getStream(f.storage_key);
    const type = f.mime || mime.lookup(f.original_name) || 'application/octet-stream';
    
    res.setHeader('Content-Type', type);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(f.original_name)}"`);
    
    stream.pipe(res);
    
  } catch (e) {
    console.error('Download error:', e);
    res.status(500).json({ error: 'Download failed', details: e.message });
  }
});

router.delete('/:id', authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    
    // Start transaction
    await db.run('BEGIN');
    
    try {
      // Get file info
      const f = await db.get(
        'SELECT * FROM files WHERE id=? AND user_id=?',
        [id, req.user.id]
      );
      
      if (!f) {
        await db.run('ROLLBACK');
        return res.status(404).json({ error: 'File not found' });
      }
      
      // Delete from storage
      await removeObject(f.storage_key);
      
      // Delete from database
      await db.run('DELETE FROM files WHERE id=?', [id]);
      
      // Commit transaction
      await db.run('COMMIT');
      
      res.json({ ok: true });
      
    } catch (e) {
      await db.run('ROLLBACK');
      throw e;
    }
    
  } catch (e) {
    console.error('Delete error:', e);
    res.status(500).json({ error: 'Delete failed', details: e.message });
  }
});

router.post('/share/:id', authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    const ttl = Math.min(Number(req.body.ttl || 600), 86400);
    const token = signDownloadToken(`${id}`, ttl);
    res.json({ url: `/api/files/shared?token=${token}` });
  } catch (e) {
    console.error('Share error:', e);
    res.status(500).json({ error: 'Failed to create share link', details: e.message });
  }
});

router.get('/shared', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Token is required' });
    
    const payload = verifyDownloadToken(token);
    const id = payload.fid;
    
    const db = await getDb();
    const f = await db.get('SELECT * FROM files WHERE id=?', [id]);
    
    if (!f) return res.status(404).json({ error: 'File not found' });
    
    const stream = await getStream(f.storage_key);
    const type = f.mime || mime.lookup(f.original_name) || 'application/octet-stream';
    
    res.setHeader('Content-Type', type);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(f.original_name)}"`);
    
    stream.pipe(res);
    
  } catch (e) {
    console.error('Shared file error:', e);
    if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired link' });
    }
    res.status(500).json({ error: 'Failed to download file', details: e.message });
  }
});

export default router;
