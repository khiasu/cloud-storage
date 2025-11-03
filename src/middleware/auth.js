import jwt from 'jsonwebtoken';

export function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function issueToken(user) {
  const payload = { sub: user.id, email: user.email };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });
}

export function signDownloadToken(fileId, ttlSeconds = 600) {
  return jwt.sign({ fid: fileId }, process.env.JWT_SECRET, { expiresIn: ttlSeconds });
}

export function verifyDownloadToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
