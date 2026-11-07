import { Router } from 'express';
import { z } from 'zod';
import Project from '../models/Project.js';
import Activity from '../models/Activity.js';
import { protect, allow } from '../middleware/auth.js';
import { audit } from '../utils/audit.js';
const router = Router(); router.use(protect);
const schema = z.object({
 name:z.string().trim().min(3).max(120), description:z.string().max(2000).optional().default(''),
 category:z.enum(['reforestation','water','waste','biodiversity','renewable_energy','other']),
 location:z.string().trim().min(2), target:z.coerce.number().positive(),
 unit:z.string().trim().min(1).max(40), startDate:z.coerce.date(), endDate:z.coerce.date(),
 status:z.enum(['planning','active','on_hold','completed']).default('planning'),
 manager:z.string().optional()
}).refine(d=>d.endDate>=d.startDate,{message:'End date must be on or after start date'});
router.get('/',async(req,res,next)=>{try{
 const filter = req.user.role==='field_officer' ? {} : {};
 const projects=await Project.find(filter).populate('manager','name email').sort({createdAt:-1});
 const ids=projects.map(p=>p._id);
 const sums=await Activity.aggregate([{$match:{project:{$in:ids}}},{$group:{_id:'$project',total:{$sum:'$quantity'}}}]);
 const map=new Map(sums.map(x=>[String(x._id),x.total]));
 res.json({projects:projects.map(p=>({...p.toObject(),progress:map.get(String(p._id))||0}))});
}catch(e){next(e)}});
router.post('/',allow('admin','manager'),async(req,res,next)=>{try{
 const parsed=schema.safeParse(req.body); if(!parsed.success)return res.status(400).json({message:parsed.error.issues[0].message});
 const data=parsed.data; const project=await Project.create({...data,manager:data.manager||req.user._id,createdBy:req.user._id});
 await audit({actor:req.user._id,entityType:'project',entityId:project._id,action:'created',after:project.toObject()});
 res.status(201).json({project});
}catch(e){next(e)}});
router.get('/:id',async(req,res,next)=>{try{
 const p=await Project.findById(req.params.id).populate('manager','name email'); if(!p)return res.status(404).json({message:'Project not found'});
 const agg=await Activity.aggregate([{$match:{project:p._id}},{$group:{_id:null,total:{$sum:'$quantity'}}}]);
 res.json({project:{...p.toObject(),progress:agg[0]?.total||0}});
}catch(e){next(e)}});
router.patch('/:id',allow('admin','manager'),async(req,res,next)=>{try{
 const parsed=schema.partial().safeParse(req.body); if(!parsed.success)return res.status(400).json({message:parsed.error.issues[0].message});
 const p=await Project.findById(req.params.id); if(!p)return res.status(404).json({message:'Project not found'});
 const before=p.toObject(); Object.assign(p,parsed.data); await p.save();
 await audit({actor:req.user._id,entityType:'project',entityId:p._id,action:'updated',before,after:p.toObject(),note:'Project details updated'});
 res.json({project:p});
}catch(e){next(e)}});
router.delete('/:id',allow('admin'),async(req,res,next)=>{try{
 const p=await Project.findById(req.params.id); if(!p)return res.status(404).json({message:'Project not found'});
 const before=p.toObject(); await Activity.deleteMany({project:p._id}); await p.deleteOne();
 await audit({actor:req.user._id,entityType:'project',entityId:p._id,action:'deleted',before,note:'Project and associated activities deleted'});
 res.json({message:'Project deleted'});
}catch(e){next(e)}});
export default router;
