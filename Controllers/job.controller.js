import Model from "../Models/job.model.js";

import mongoose from "mongoose";
const postJob = async (req, res) => {
  try {
    const job = await Model.create(req.body);
    // Respond with the created job
    res.status(201).json({ message: "Job created successfully", job });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }}
  const getAllJob = async (req, res) => {
    try {
      const jobs = await Model.find({});
      
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
    const { key } = req.params; // Get the search key from route parameters

    // Validate that 'key' is provided
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
                wildcard: "*"
              }
            }
          }
        }
      ]);

    if (result.length === 0) {
      return res.status(404).json({ message: "No matching jobs found" });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  postJob,
  getAllJob,
  getJobById,
  updateJobById,
  deleteJobById,
  searchResult,
};
