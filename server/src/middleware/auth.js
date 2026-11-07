import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export async function protect(req,res,next) {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Authentication required' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user || !user.active) return res.status(401).json({ message: 'Account unavailable' });
    req.user = user;
    next();
  } catch { return res.status(401).json({ message: 'Invalid or expired token' }); }
}
export const allow = (...roles) => (req,res,next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ message: 'You are not authorized to perform this action' });
