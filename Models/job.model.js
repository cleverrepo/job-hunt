import mongoose from 'mongoose'
const Model = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: { type: [String], required: true },
    responsibilities: { type: [String], required: true },
    logo: { type: [String], required: true },
    salary: {
      min: { type: Number },
      max: { type: Number },
    },
    employmentType: { type: String, required: true },
    company: {
      name: { type: String, required: true },
      website: { type: String },
      location: { type: String, required: true },
    },
    createdAt: { type: Date, default: Date.now },
    posting: {
      postedDate: { type: Date, default: Date.now },
      expiryDate: { type: Date },
    },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    application: {
      url: { type: String },
      contactEmail: { type: String, required: true },
      instructions: { type: String },
    },
    category: { type: String },
    tags: { type: [String] },
    isRemote: { type: Boolean, default: false },
    experienceLevel: { type: String },
    status: { type: String, enum: ["pending", "reviewed", "accepted", "rejected"], default: "pending" }, // Add this line
  },
  
  {
    timestamps: true, // Fix typo: timeStamp -> timestamps
  }
);
    export default mongoose.model("Model", Model, "Jobs")
    
