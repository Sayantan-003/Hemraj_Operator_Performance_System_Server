// import express from 'express';
// import { 
//     createSolventLog, 
//     getSolventDataByOperator, 
//     getSolventDashboardData,
//     getSolventPerformanceHistory,
//     getAvailableOperators,
//     getOperatorDetails,
//     getShiftDetails
// } from '../controllers/solvent.controller.js';
// import validateSolvent from '../middleware/validateSolvent.js';

// const router = express.Router();

// router.post('/create', validateSolvent, createSolventLog);
// router.get('/operator', getSolventDataByOperator);
// router.get('/dashboard', getSolventDashboardData);
// router.get('/performance-history', getSolventPerformanceHistory);
// // router.get('/export', exportSolventDashboard);
// router.get('/available-operators', getAvailableOperators);
// router.get('/operator-details', getOperatorDetails);

// export default router;



// import express from "express";
// import {
//   createDailyLog,
//   getLogs,
//   getLogByDate,
//   getOperatorSummaries,
//   getOperatorPerformance,
//   getOperatorPerformanceInRange,
//   getOperatorSummariesInRange
// } from "../controllers/solvent.controller.js";
// import validateSolvent from "../middleware/validateSolvent.js";

// const router = express.Router();

// // Create a new daily solvent log
// router.post("/create",validateSolvent, createDailyLog);

// // Fetch logs (optionally filter by date range ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD)
// router.get("/", getLogs);

// // Step 1 & 2: Get operator summaries for a specific date
// router.get("/operators", getOperatorSummaries);

// // Step 4: Get performance parameters for a specific operator
// router.get("/operator-performance", getOperatorPerformance);

// // Fetch a single log by date (example: /api/solvent/2025-08-13)
// router.get("/:date", getLogByDate);



// // routes/solvent.routes.js
// // router.get("/operators-range", getOperatorSummariesInRange);


// // router.get("/operator-performance-range", getOperatorPerformanceInRange);




// import express from "express";
// import {
//   createDailyLog,
//   getLogs,
//   getLogByDate,
//   getOperatorSummaries,
//   getOperatorPerformance,
//   getOperatorPerformanceInRange,
//   getOperatorSummariesInRange
// } from "../controllers/solvent.controller.js";
// import validateSolvent from "../middleware/validateSolvent.js";
// import { verifyToken, allowSection } from '../middleware/auth.js';

// const router = express.Router();

// // Create a new daily solvent log
// router.post("/create", verifyToken, allowSection('solvent'), validateSolvent, createDailyLog);

// // Fetch logs (optionally filter by date range ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD)
// router.get("/", verifyToken, allowSection('solvent'), getLogs);

// // Step 1 & 2: Get operator summaries for a specific date
// router.get("/operators", verifyToken, allowSection('solvent'), getOperatorSummaries);

// // Date range routes - UNCOMMENTED
// router.get("/operators-range", verifyToken, allowSection('solvent'), getOperatorSummariesInRange);
// router.get("/operator-performance-range", verifyToken, allowSection('solvent'), getOperatorPerformanceInRange);

// // Step 4: Get performance parameters for a specific operator
// router.get("/operator-performance", verifyToken, allowSection('solvent'), getOperatorPerformance);

// // Fetch a single log by date (example: /api/solvent/2025-08-13)
// router.get("/:date", verifyToken, allowSection('solvent'), getLogByDate);


// export default router;



import express from "express";
import {
  createDailyLog,
  getLogs,
  getLogByDate,
  getOperatorSummaries,
  getOperatorPerformance,
  getOperatorPerformanceInRange,
  getOperatorSummariesInRange,
  getDashboardData,           
  getOperatorSummaryForDate   
} from "../controllers/solvent.controller.js";
import validateSolvent from "../middleware/validateSolvent.js";
import { verifyToken, allowSection } from '../middleware/auth.js';

const router = express.Router();

// Create a new daily solvent log
router.post("/create", verifyToken, allowSection('solvent'), validateSolvent, createDailyLog);

// NEW: Dashboard endpoint - handles both single date and date range
router.get("/dashboard", verifyToken, allowSection('solvent'), getDashboardData);

// NEW: Get operator summary data for a specific date (for frontend table population)
router.get("/operator-summary", verifyToken, allowSection('solvent'), getOperatorSummaryForDate);

// Fetch logs (optionally filter by date range ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD)
router.get("/", verifyToken, allowSection('solvent'), getLogs);

// Step 1 & 2: Get operator summaries for a specific date
router.get("/operators", verifyToken, allowSection('solvent'), getOperatorSummaries);

// Date range routes
router.get("/operators-range", verifyToken, allowSection('solvent'), getOperatorSummariesInRange);
router.get("/operator-performance-range", verifyToken, allowSection('solvent'), getOperatorPerformanceInRange);

// Step 4: Get performance parameters for a specific operator
router.get("/operator-performance", verifyToken, allowSection('solvent'), getOperatorPerformance);

// Fetch a single log by date (example: /api/solvent/2025-08-13)
router.get("/:date", verifyToken, allowSection('solvent'), getLogByDate);

export default router;