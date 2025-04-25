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
  updateJobStatusById,
} from "../Controllers/job.controller.js";

const routes = express.Router();

routes.post("/", postJob); //done
routes.post("/:id/apply", applyJob);
routes.put("/:id", UpdateJobById); //done
routes.put("/:id/status", updateJobStatusById);//done
routes.get("/:id/applications", getApplicationsByUserId);
routes.get("/filter", filterJobs);
routes.get("/", getAllJob); //done
routes.get("/:id", getJobById); //done
routes.get("/search/:key", searchResult); //done
routes.delete("/:id", deleteJobById); //done

export default routes;
