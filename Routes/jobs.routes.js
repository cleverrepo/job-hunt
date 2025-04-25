import express from "express";
import {
  postJob,
  getAllJob,
  getJobById,
  updateJobById,
  deleteJobById,
  searchResult,
  filterJobs,
  applyJob,
  getApplicationsByUserId,
  updateJobById,
  verifyToken,
} from "../Controllers/job.controller.js";
const routes = express.Router();
routes.post("/", postJob);
routes.post("/:id/apply", verifyToken, applyJob);
routes.put("/:id", updateJobById);
routes.put("/:id/status", updateJobById);
routes.get("/:id/applications", getApplicationsByUserId);
routes.get("/filter", filterJobs);
routes.get("/", getAllJob);
routes.get("/:id", getJobById);
routes.get("/search/:key", searchResult);
routes.delete("/:id", deleteJobById);
export default routes;
