import mongoose from 'mongoose';
const activitySchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  activityDate: { type: Date, required: true },
  quantity: { type: Number, required: true, min: 0.01 },
  description: { type: String, required: true, trim: true, maxlength: 1000 },
  evidenceUrl: { type: String, default: '' }
}, { timestamps: true });
export default mongoose.model('Activity', activitySchema);
