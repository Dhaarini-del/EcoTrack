import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
const router = Router();
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
router.post('/login', async (req,res,next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({message:'Enter a valid email and password (minimum 8 characters)'});
    const email = parsed.data.email.toLowerCase();
    const user = await User.findOne({email}).select('+passwordHash');
    if (!user || !user.active || !(await bcrypt.compare(parsed.data.password,user.passwordHash)))
      return res.status(401).json({message:'Incorrect email or password'});
    const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN || '1d'});
    res.json({token,user:{id:user._id,name:user.name,email:user.email,role:user.role}});
  } catch(e) { next(e); }
});
router.get('/me',protect,(req,res)=>res.json({user:{id:req.user._id,name:req.user.name,email:req.user.email,role:req.user.role}}));
export default router;
