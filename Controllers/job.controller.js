import Application from "../Models/application.model.js";
import Model from "../Models/job.model.js";

import mongoose from "mongoose";
const postJob = async (req, res) => {
  try {
    const job = await Model.create(req.body);

    res.status(201).json({ message: "Job created successfully", job });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getAllJob = async (req, res) => {
  try {
    const jobs = await Model.find({}).sort([
      ["createdAt", -1],
      ["title", 1],
    ]);

    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error Fetching Jobs:", error);
    res.status(500).json({ error: error.message });
  }
};

const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Model.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const updateJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json({ message: "Job updated successfully", job });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Model.findByIdAndDelete(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(201).json({ massage: "job deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const searchResult = async (req, res) => {
  try {
    const { key } = req.params;  

     
    if (!key) {
      return res.status(400).json({ error: "'key' parameter is required" });
    }

    const result = await Model.aggregate([
      {
        $search: {
          index: "default",
          text: {
            query: key,
            path: {
              wildcard: "*",
            },
          },
        },
      },
    ]);

    if (result.length === 0) {
      return res.status(404).json({ message: "No matching jobs found" });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const filterJobs = async (req, res) => {
  const { location, category } = req.body;
  try {
    const filter = {};
    if (location) {
      filter["company.location"] = location;
    }
    if (category) {
      filter.category = category;
    }
    const job = await Model.find({ filter });
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const applyJob = async (req, res) => {
  const { resume, jobId, userId, coverLetter } = req.body;

  
  if (!resume || !jobId || !userId || !coverLetter) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
   
    const alreadyApplied = await Application.findOne({ jobId, userId });

    if (alreadyApplied) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }

   
    const apply = await Application.create({
      resume,
      jobId,
      userId,
      coverLetter,
    });

    
    res.status(201).json({ message: "Application submitted successfully", apply });
  } catch (error) {
    console.error("Error applying for job:", error); 
    res.status(500).json({ error: "Failed to submit application", details: error.message });
  }
};

const getApplicationsByUserId = async (req, res) => {
  try {
    const { jobId } = req.params;
    const applications = await Application.find({ jobId });
    if (!applications) {
      return res
        .status(404)
        .json({ message: "No applications found for this user" });
    }
    res
      .status(200)
      .json({ message: "Applications fetched successfully", applications });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch applications", error: error.message });
  }
};
const UpdateJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const existingJob = await Model.findById(id);
    if (!existingJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Update only the status field
    const updatedJob = await Model.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    // Send success response
    res
      .status(200)
      .json({ message: "Job status updated successfully", job: updatedJob });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update job status", error: error.message });
  }
};
export {
  postJob,
  getAllJob,
  getJobById,
  updateJobById,
  deleteJobById,
  searchResult,
  filterJobs,
  applyJob,
  getApplicationsByUserId,
  UpdateJobById,
};
