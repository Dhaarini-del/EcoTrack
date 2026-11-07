import mongoose from 'mongoose';
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, default: '', maxlength: 2000 },
  category: { type: String, enum: ['reforestation','water','waste','biodiversity','renewable_energy','other'], required: true },
  location: { type: String, required: true, trim: true },
  target: { type: Number, required: true, min: 1 },
  unit: { type: String, required: true, trim: true, maxlength: 40 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['planning','active','on_hold','completed'], default: 'planning' },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
projectSchema.index({ name: 1, location: 1 });
export default mongoose.model('Project', projectSchema);
