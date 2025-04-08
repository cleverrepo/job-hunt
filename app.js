import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import router from"./Routes/user.routs.js"
import cors from "cors";
import routes from "./Routes/jobs.routes.js";
import scheduler from "./Utils/scheduler.js";
const app = express();
app.use(cors({ credentials: true, origin: 'http://localhost:8000' }));
scheduler.start()
const port = process.env.PORT || 5000;

// Middleware
dotenv.config();
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Routes

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
