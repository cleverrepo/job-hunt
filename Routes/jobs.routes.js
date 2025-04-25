import express from "express";
import {
  postJob,
  getAllJob,
  getJobById,
  UpdateJobById,
  deleteJobById,
  searchResult,
  filterJobs,
  applyJob,
  getApplicationsByUserId,
  
  verifyToken,
  updateJobStatusById
} from "../Controllers/job.controller.js";
const routes = express.Router();
routes.post("/", postJob);
routes.post("/:id/apply", verifyToken, applyJob);
routes.put("/:id", UpdateJobById);
routes.put("/:id/status", updateJobStatusById);
routes.get("/:id/applications", getApplicationsByUserId);
routes.get("/filter", filterJobs);
routes.get("/", getAllJob);
routes.get("/:id", getJobById);
routes.get("/search/:key", searchResult);
routes.delete("/:id", deleteJobById);
export default routes;
