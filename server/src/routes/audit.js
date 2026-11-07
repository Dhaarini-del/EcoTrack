import { Router } from 'express';
import { protect, allow } from '../middleware/auth.js';
import AuditLog from '../models/AuditLog.js';
const router=Router(); router.use(protect,allow('admin','manager'));
router.get('/',async(req,res,next)=>{try{
 const logs=await AuditLog.find().populate('actor','name email role').sort({createdAt:-1}).limit(100);
 res.json({logs});
}catch(e){next(e)}});
export default router;
