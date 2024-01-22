import express from "express";
import {
  dashboradStats,
  productsStats,
  salesReports,
  yearlyReports,
} from "../controllers/stats.js";
const app = express.Router();

// Getting admin dashboard stats
app.get("/stats", dashboradStats);
// Getting Products stats
app.get("/productStats", productsStats);
// Getting Sales Reports
app.get("/salesRepots", salesReports);
// Getting Yearly Reports
app.get("/yearlyReports", yearlyReports);

export default app;
