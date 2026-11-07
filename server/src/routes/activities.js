import { Router } from 'express';
import { z } from 'zod';
import Activity from '../models/Activity.js';
import Project from '../models/Project.js';
import { protect } from '../middleware/auth.js';
import { audit } from '../utils/audit.js';
const router=Router(); router.use(protect);
const schema=z.object({project:z.string(),activityDate:z.coerce.date(),quantity:z.coerce.number().positive(),description:z.string().trim().min(3).max(1000),evidenceUrl:z.string().url().or(z.literal('')).optional()});
router.get('/',async(req,res,next)=>{try{
 const filter={}; if(req.query.project)filter.project=req.query.project;
 if(req.user.role==='field_officer')filter.user=req.user._id;
 const activities=await Activity.find(filter).populate('project','name unit target').populate('user','name role').sort({activityDate:-1});
 res.json({activities});
}catch(e){next(e)}});
router.post('/',async(req,res,next)=>{try{
 const parsed=schema.safeParse(req.body); if(!parsed.success)return res.status(400).json({message:parsed.error.issues[0].message});
 const project=await Project.findById(parsed.data.project); if(!project)return res.status(404).json({message:'Project not found'});
 if(project.status==='completed')return res.status(400).json({message:'Cannot add activity to a completed project'});
 const a=await Activity.create({...parsed.data,user:req.user._id});
 await audit({actor:req.user._id,entityType:'activity',entityId:a._id,action:'created',after:a.toObject()});
 res.status(201).json({activity:a});
}catch(e){next(e)}});
router.patch('/:id',async(req,res,next)=>{try{
 const a=await Activity.findById(req.params.id); if(!a)return res.status(404).json({message:'Activity not found'});
 if(req.user.role==='field_officer' && String(a.user)!==String(req.user._id))return res.status(403).json({message:'You can only correct your own activity records'});
 const parsed=schema.partial().safeParse(req.body); if(!parsed.success)return res.status(400).json({message:parsed.error.issues[0].message});
 const before=a.toObject(); Object.assign(a,parsed.data); await a.save();
 await audit({actor:req.user._id,entityType:'activity',entityId:a._id,action:'updated',before,after:a.toObject(),note:'Activity corrected; dashboard totals are recalculated from activity records'});
 res.json({activity:a});
}catch(e){next(e)}});
router.delete('/:id',async(req,res,next)=>{try{
 const a=await Activity.findById(req.params.id); if(!a)return res.status(404).json({message:'Activity not found'});
 if(req.user.role==='field_officer' && String(a.user)!==String(req.user._id))return res.status(403).json({message:'You can only delete your own activity records'});
 const before=a.toObject(); await a.deleteOne();
 await audit({actor:req.user._id,entityType:'activity',entityId:a._id,action:'deleted',before,note:'Activity deleted'});
 res.json({message:'Activity deleted'});
}catch(e){next(e)}});
export default router;
