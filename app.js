import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import router from"./Routes/user.routs.js"
import cors from "cors";

const app = express();
app.use(cors({ credentials: true, origin: 'http://localhost:8000' }));

const port = process.env.PORT || 5000;

// Middleware
dotenv.config();
app.use(express.json());

// Routes
import routes from "./Routes/jobs.routes.js";
app.use("/api/jobs", routes);
app.use("/api/user", router);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Start Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
