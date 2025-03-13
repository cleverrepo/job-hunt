import mongoose from "mongoose";
const ApplicationSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resume: { type: String, required: true },
    coverLetter: { type: String },
    status: { type: String, enum: ['pending', 'reviewed', 'accepted', 'rejected'], default: 'pending' },
    appliedDate: { type: Date, default: Date.now },
  });
  
  const Application = mongoose.model('Application', ApplicationSchema);
  export default Application;