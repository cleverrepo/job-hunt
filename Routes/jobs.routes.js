import express from "express";
import {
  postJob,
  getAllJob,
  getJobById,
  updateJobById,
    deleteJobById,
    searchResult
} from "../Controllers/job.controller.js";
const routes = express.Router();
routes.post("/", postJob);
routes.get("/", getAllJob);
routes.put("/:id", updateJobById);
routes.get("/:id", getJobById);
routes.get("/search/:key", searchResult)

routes.delete("/:id", deleteJobById)
export default routes;
