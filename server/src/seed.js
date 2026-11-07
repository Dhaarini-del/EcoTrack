import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Project from './models/Project.js';
import Activity from './models/Activity.js';
async function run(){
 await connectDB();
 await User.deleteMany({email:/@ecotrack\.demo$/});
 const passwordHash=await bcrypt.hash('EcoTrack@123',12);
 const [admin,manager,field]=await User.create([
  {name:'EcoTrack Admin',email:'admin@ecotrack.demo',passwordHash,role:'admin'},
  {name:'Project Manager',email:'manager@ecotrack.demo',passwordHash,role:'manager'},
  {name:'Field Officer',email:'field@ecotrack.demo',passwordHash,role:'field_officer'}
 ]);
 await Project.deleteMany({});
 const p=await Project.create({name:'Bengaluru Green Initiative',description:'Urban tree planting and native species restoration.',category:'reforestation',location:'Bengaluru, Karnataka',target:1000,unit:'trees',startDate:new Date('2026-01-01'),endDate:new Date('2026-12-31'),status:'active',manager:manager._id,createdBy:admin._id});
 await Activity.deleteMany({project:p._id});
 await Activity.create([
  {project:p._id,user:field._id,activityDate:new Date('2026-09-02'),quantity:200,description:'Native saplings planted in phase one'},
  {project:p._id,user:field._id,activityDate:new Date('2026-09-15'),quantity:250,description:'Community planting drive'},
  {project:p._id,user:manager._id,activityDate:new Date('2026-10-01'),quantity:150,description:'School campus plantation'},
  {project:p._id,user:field._id,activityDate:new Date('2026-10-18'),quantity:250,description:'Phase four planting activity'}
 ]);
 console.log('Seed complete. Demo password: EcoTrack@123');
 await mongoose.disconnect();
}
run().catch(e=>{console.error(e);process.exit(1)});
