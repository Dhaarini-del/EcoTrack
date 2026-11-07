import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import Project from '../models/Project.js';
import Activity from '../models/Activity.js';
const router=Router(); router.use(protect);
router.get('/summary',async(req,res,next)=>{try{
 const [projects,activityTotals,categoryTotals,monthly]=await Promise.all([
  Project.aggregate([{$group:{_id:'$status',count:{$sum:1}}}]),
  Activity.aggregate([{$group:{_id:null,totalRecords:{$sum:1},totalQuantity:{$sum:'$quantity'}}}]),
  Activity.aggregate([{$lookup:{from:'projects',localField:'project',foreignField:'_id',as:'p'}},{$unwind:'$p'},{$group:{_id:'$p.category',total:{$sum:'$quantity'}}},{$sort:{total:-1}}]),
  Activity.aggregate([{$group:{_id:{$dateToString:{format:'%Y-%m',date:'$activityDate'}},quantity:{$sum:'$quantity'}}},{$sort:{_id:1}},{$limit:12}])
 ]);
 const totalProjects=projects.reduce((n,x)=>n+x.count,0);
 const activeProjects=projects.find(x=>x._id==='active')?.count||0;
 const totalImpact=activityTotals[0]?.totalQuantity||0;
 const projectDocs=await Project.find({},'target').lean();
 const totalTarget=projectDocs.reduce((n,p)=>n+p.target,0);
 res.json({summary:{totalProjects,activeProjects,totalImpact,totalActivities:activityTotals[0]?.totalRecords||0,overallProgress:totalTarget?Math.min(100,Math.round(totalImpact/totalTarget*100)):0},statusBreakdown:projects,categoryImpact:categoryTotals,monthlyTrend:monthly});
}catch(e){next(e)}});
export default router;
