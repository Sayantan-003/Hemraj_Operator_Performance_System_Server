// // controllers/solvent.controller.js
// import DailyLog from "../models/solvent/FormSchema.js";
// import SolventOperatorSummary from "../models/solvent/OperatorSummary.js";
// import SolventService from "../service/solvent.service.js";
// import { generateOperatorSummary } from "../service/solventSummary.service.js";

// /* ------------------ Helpers ------------------ */

// // Keep date as "YYYY-MM-DD" string
// const normalizeDateOnly = (dateStr) => {
//   if (!dateStr) return null;
//   return dateStr.trim();
// };

// /* ------------------ Controllers ------------------ */

// /**
//  * Step 0: Create a new Daily Log (and generate summaries)
//  */
// // export const createDailyLog = async (req, res) => {
// //   try {
// //     const formData = req.body;
// //     if (!formData || !formData.date || !formData.operators?.length) {
// //       return res.status(400).json({ error: "Invalid request payload" });
// //     }

// //     // Normalize date string
// //     formData.date = normalizeDateOnly(formData.date);

// //     // Save raw daily log
// //     const log = await SolventService.createDailyLog(formData);

// //     // Generate summaries for that date
// //     await generateOperatorSummary(formData.date);

// //     res.status(201).json({
// //       message: "Daily log and operator summaries saved successfully",
// //       log,
// //     });
// //   } catch (err) {
// //     console.error("Error creating daily log:", err);
// //     res.status(500).json({ error: "Failed to create daily log" });
// //   }
// // };
// export const createDailyLog = async (req, res) => {
//   try {
//     const formData = req.body;
//     if (!formData || !formData.date || !formData.operators?.length) {
//       return res.status(400).json({ error: "Invalid request payload" });
//     }

//     // Normalize date string
//     formData.date = normalizeDateOnly(formData.date);

//     // Save raw daily log
//     const log = await SolventService.createDailyLog(formData);

//     // Generate summaries for that date
//     await generateOperatorSummary(formData.date);

//     // use return so nothing runs after sending response
//     return res.status(201).json({
//       message: "Daily log and operator summaries saved successfully",
//       log,
//     });
//   } catch (err) {
//     console.error("Error creating daily log:", err);

//     //  return here too
//     return res.status(500).json({ error: "Failed to create daily log" });
//   }
// };


// /**
//  * Get all logs (optionally filter by date range)
//  * Example: GET /api/solvent?startDate=2025-08-01&endDate=2025-08-05
//  */
// export const getLogs = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;
//     const logs = await SolventService.getLogs(startDate, endDate);
//     res.json(logs);
//   } catch (err) {
//     console.error("Error fetching logs:", err);
//     res.status(500).json({ error: "Failed to fetch logs" });
//   }
// };

// /**
//  * Step 1 & 2: Get operator summaries for a specific date
//  * Example: GET /api/solvent/operators?date=2025-08-22
//  */
// export const getOperatorSummaries = async (req, res) => {
//   try {
//     const { date } = req.query;
//     if (!date) {
//       return res.status(400).json({ error: "Date query is required" });
//     }

//     const summaries = await SolventOperatorSummary.find({ date }).select(
//       "operatorName shiftName totalHours"
//     );

//     if (!summaries || summaries.length === 0) {
//       return res
//         .status(404)
//         .json({ error: "No operator summaries found for this date" });
//     }

//     // Deduplicate operators
//     const seen = new Set();
//     const unique = summaries.filter((s) => {
//       if (seen.has(s.operatorName)) return false;
//       seen.add(s.operatorName);
//       return true;
//     });

//     res.json(unique);
//   } catch (err) {
//     console.error("Error fetching operator summaries:", err);
//     res.status(500).json({ error: "Failed to fetch operator summaries" });
//   }
// };

// /**
//  * Step 3 & 4: Get performance details for one operator on a date
//  * Example: GET /api/solvent/operator-performance?date=2025-08-22&operatorName=Sivjee%20Patel
//  */
// export const getOperatorPerformance = async (req, res) => {
//   try {
//     const { date, operatorName } = req.query;
//     if (!date || !operatorName) {
//       return res
//         .status(400)
//         .json({ error: "Missing date or operatorName" });
//     }

//     const summary = await SolventOperatorSummary.findOne({ date, operatorName });

//     if (!summary) {
//       return res.status(404).json({
//         error: "No performance data found for this operator on this date",
//       });
//     }

//     res.json(summary);
//   } catch (err) {
//     console.error("Error fetching operator performance:", err);
//     res.status(500).json({ error: "Server error fetching performance data" });
//   }
// };


// // export const getOperatorSummariesInRange = async (req, res) => {
// //   try {
// //   console.log("[API] /operators-range called", req.query);
// //   const { startDate, endDate } = req.query;
// //     if (!startDate || !endDate) {
// //       return res.status(400).json({ error: "Start and End date are required" });
// //     }

// //     const operators = await SolventService.getOperatorSummariesInRange(startDate, endDate);
// //     // Always return an array, even if empty
// //     res.json(operators || []);
// //   } catch (err) {
// //     console.error("Error fetching operator summaries in range:", err);
// //     res.status(500).json({ error: "Failed to fetch operator summaries in range" });
// //   }
// // };

// // export const getOperatorPerformanceInRange = async (req, res) => {
// //   try {
// //     const { startDate, endDate, operatorName } = req.query;
// //     if (!startDate || !endDate || !operatorName) {
// //       return res.status(400).json({ error: "Missing startDate, endDate, or operatorName" });
// //     }

// //     const result = await SolventService.getOperatorPerformanceInRange(startDate, endDate, operatorName);

// //     if (!result) {
// //       return res.status(404).json({ error: "No performance data for this operator in range" });
// //     }

// //     res.json(result);
// //   } catch (err) {
// //     console.error("Error fetching operator performance in range:", err);
// //     res.status(500).json({ error: "Server error fetching performance range data" });
// //   }
// // };




// /**
//  * Debug / fallback: Get raw log by date
//  * Example: GET /api/solvent/2025-08-22
//  */
// export const getLogByDate = async (req, res) => {
//   try {
//     const { date } = req.params;
//     if (!date) {
//       return res.status(400).json({ error: "Date parameter is required" });
//     }

//     const log = await DailyLog.findOne({ date });

//     if (!log) {
//       return res.status(404).json({ error: "No raw log found for this date" });
//     }

//     res.json(log);
//   } catch (err) {
//     console.error("Error fetching log by date:", err);
//     res.status(500).json({ error: "Failed to fetch log by date" });
//   }
// };



// // export const getOperatorSummariesInRange = async (req, res) => {
// //   const { startDate, endDate } = req.query;
// //   try {
// //     const operators = await SolventService.getOperatorSummariesInRange(startDate, endDate);
// //     res.json(operators || []);
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // };



// // export const getOperatorPerformanceInRange = async (req, res) => {
// //   const { startDate, endDate, operatorName } = req.query;
// //   try {
// //     const performance = await SolventService.getOperatorPerformanceInRange(
// //       startDate,
// //       endDate,
// //       operatorName
// //     );
// //     res.json(performance || {});
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // };



// // Add these functions to your solvent.controller.js

// export const getOperatorSummariesInRange = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;
    
//     if (!startDate || !endDate) {
//       return res.status(400).json({ 
//         error: "Both startDate and endDate are required" 
//       });
//     }

//     const summaries = await SolventService.getOperatorSummariesInRange(startDate, endDate);
    
//     if (!summaries) {
//       return res.status(404).json({ 
//         message: "No operator data found for the specified date range" 
//       });
//     }

//     res.status(200).json(summaries);
//   } catch (error) {
//     console.error("Error fetching operator summaries in range:", error);
//     res.status(500).json({ 
//       error: "Failed to fetch operator summaries", 
//       details: error.message 
//     });
//   }
// };

// export const getOperatorPerformanceInRange = async (req, res) => {
//   try {
//     const { startDate, endDate, operatorName } = req.query;
    
//     if (!startDate || !endDate || !operatorName) {
//       return res.status(400).json({ 
//         error: "startDate, endDate, and operatorName are all required" 
//       });
//     }

//     const performance = await SolventService.getOperatorPerformanceInRange(
//       startDate, 
//       endDate, 
//       operatorName
//     );
    
//     if (!performance) {
//       return res.status(404).json({ 
//         message: "No performance data found for the specified operator and date range" 
//       });
//     }

//     res.status(200).json(performance);
//   } catch (error) {
//     console.error("Error fetching operator performance in range:", error);
//     res.status(500).json({ 
//       error: "Failed to fetch operator performance", 
//       details: error.message 
//     });
//   }
// };




// controllers/solvent.controller.js
import DailyLog from "../models/solvent/FormSchema.js";
import SolventOperatorSummary from "../models/solvent/OperatorSummary.js";
import SolventService from "../service/solvent.service.js";
import { generateOperatorSummary } from "../service/solventSummary.service.js";

// Helper function to normalize date
const normalizeDateOnly = (dateInput) => {
  if (!dateInput) return null;
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return null;
  return date.toISOString().split('T')[0];
};

export const getOperatorSummariesInRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: "Both startDate and endDate are required" 
      });
    }

    const summaries = await SolventService.getOperatorSummariesInRange(startDate, endDate);
    
    if (!summaries) {
      return res.status(404).json({ 
        message: "No operator data found for the specified date range" 
      });
    }

    res.status(200).json(summaries);
  } catch (error) {
    console.error("Error fetching operator summaries in range:", error);
    res.status(500).json({ 
      error: "Failed to fetch operator summaries", 
      details: error.message 
    });
  }
};

export const getOperatorPerformanceInRange = async (req, res) => {
  try {
    const { startDate, endDate, operatorName } = req.query;
    
    if (!startDate || !endDate || !operatorName) {
      return res.status(400).json({ 
        error: "startDate, endDate, and operatorName are all required" 
      });
    }

    const performance = await SolventService.getOperatorPerformanceInRange(
      startDate, 
      endDate, 
      operatorName
    );
    
    if (!performance) {
      return res.status(404).json({ 
        message: "No performance data found for the specified operator and date range" 
      });
    }

    res.status(200).json(performance);
  } catch (error) {
    console.error("Error fetching operator performance in range:", error);
    res.status(500).json({ 
      error: "Failed to fetch operator performance", 
      details: error.message 
    });
  }
};

// export const getDashboardData = async (req, res) => {
//   try {
//     const { date, startDate, endDate } = req.query;
    
//     if (date) {
//       // Single date request
//       console.log("Dashboard request for single date:", date);
      
//       const summaries = await SolventOperatorSummary.find({ date });
      
//       if (!summaries || summaries.length === 0) {
//         // Try to regenerate from daily logs
//         const dailyLog = await DailyLog.findOne({ date });
//         if (dailyLog) {
//           await generateOperatorSummary(date);
//           const newSummaries = await SolventOperatorSummary.find({ date });
//           return res.json({
//             data: {
//               steam: newSummaries.reduce((sum, s) => sum + (s.steamConsumed || 0), 0),
//               electric: newSummaries.reduce((sum, s) => sum + (s.electricConsumed || 0), 0),
//               production: newSummaries.reduce((sum, s) => sum + (s.totalCrudeOilProduction || 0) + (s.totalDORBProduction || 0), 0),
//               detailedReportTable: null // Will be handled by separate endpoint
//             },
//             charts: []
//           });
//         }
        
//         return res.json({
//           data: { steam: 0, electric: 0, production: 0 },
//           charts: []
//         });
//       }

//       // Calculate totals
//       const totals = summaries.reduce((acc, summary) => {
//         acc.steam += summary.steamConsumed || 0;
//         acc.electric += summary.electricConsumed || 0;
//         acc.production += (summary.totalCrudeOilProduction || 0) + (summary.totalDORBProduction || 0);
//         return acc;
//       }, { steam: 0, electric: 0, production: 0 });

//       res.json({
//         data: totals,
//         charts: [] // Add chart data if needed
//       });

//     } else if (startDate && endDate) {
//       // Date range request - implement aggregation logic here
//       const summaries = await SolventOperatorSummary.find({
//         date: { $gte: startDate, $lte: endDate }
//       });

//       const totals = summaries.reduce((acc, summary) => {
//         acc.steam += summary.steamConsumed || 0;
//         acc.electric += summary.electricConsumed || 0;
//         acc.production += (summary.totalCrudeOilProduction || 0) + (summary.totalDORBProduction || 0);
//         return acc;
//       }, { steam: 0, electric: 0, production: 0 });

//       res.json({
//         data: totals,
//         charts: []
//       });

//     } else {
//       return res.status(400).json({ 
//         error: "Either 'date' or both 'startDate' and 'endDate' are required" 
//       });
//     }

//   } catch (error) {
//     console.error("Error fetching dashboard data:", error);
//     res.status(500).json({ 
//       error: "Failed to fetch dashboard data", 
//       details: error.message 
//     });
//   }
// };



//Get operator summary data for a specific date (for frontend table)
export const getOperatorSummaryForDate = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: "Date query parameter is required" });
    }

    console.log("Fetching operator summary for date:", date);

    let summaries = await SolventOperatorSummary.find({ date });
    
    // If no summaries found, try to generate them from daily logs
    if (!summaries || summaries.length === 0) {
      console.log("No summaries found, checking daily logs...");
      
      const dailyLog = await DailyLog.findOne({ date });
      if (dailyLog) {
        console.log("Daily log found, generating summaries...");
        await generateOperatorSummary(date);
        summaries = await SolventOperatorSummary.find({ date });
      }
    }

    if (!summaries || summaries.length === 0) {
      return res.status(404).json({ 
        message: "No operator data found for this date",
        data: []
      });
    }

    console.log(`Found ${summaries.length} operator summaries`);
    res.json(summaries);

  } catch (error) {
    console.error("Error fetching operator summary:", error);
    res.status(500).json({ 
      error: "Failed to fetch operator summary", 
      details: error.message 
    });
  }
};

export const createDailyLog = async (req, res) => {
  try {
    const formData = req.body;
    if (!formData || !formData.date || !formData.operators?.length) {
      return res.status(400).json({ error: "Invalid request payload" });
    }

    // Normalize date string
    formData.date = normalizeDateOnly(formData.date);

    // Save raw daily log
    const log = await SolventService.createDailyLog(formData);

    // Generate summaries for that date
    await generateOperatorSummary(formData.date);

    // use return so nothing runs after sending response
    return res.status(201).json({
      message: "Daily log and operator summaries saved successfully",
      log,
    });
  } catch (err) {
    console.error("Error creating daily log:", err);

    //  return here too
    return res.status(500).json({ error: "Failed to create daily log" });
  }
};

/**
 * Get all logs (optionally filter by date range)
 * Example: GET /api/solvent?startDate=2025-08-01&endDate=2025-08-05
 */
export const getLogs = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const logs = await SolventService.getLogs(startDate, endDate);
    res.json(logs);
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
};

/**
 * Get log by date
 */
export const getLogByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const log = await SolventService.getLogByDate(date);
    
    if (!log) {
      return res.status(404).json({ error: "No log found for this date" });
    }
    
    res.json(log);
  } catch (err) {
    console.error("Error fetching log by date:", err);
    res.status(500).json({ error: "Failed to fetch log" });
  }
};

/**
 * Step 1 & 2: Get operator summaries for a specific date
 * Example: GET /api/solvent/operators?date=2025-08-22
 */
export const getOperatorSummaries = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: "Date query is required" });
    }

    const summaries = await SolventOperatorSummary.find({ date }).select(
      "operatorName shiftName totalHours"
    );

    if (!summaries || summaries.length === 0) {
      return res
        .status(404)
        .json({ error: "No operator summaries found for this date" });
    }

    // Deduplicate operators
    const seen = new Set();
    const unique = summaries.filter((s) => {
      if (seen.has(s.operatorName)) return false;
      seen.add(s.operatorName);
      return true;
    });

    res.json(unique);
  } catch (err) {
    console.error("Error fetching operator summaries:", err);
    res.status(500).json({ error: "Failed to fetch operator summaries" });
  }
};

/**
 * Step 3 & 4: Get performance details for one operator on a date
 * Example: GET /api/solvent/operator-performance?date=2025-08-22&operatorName=Sivjee%20Patel
 */
export const getOperatorPerformance = async (req, res) => {
  try {
    const { date, operatorName } = req.query;
    if (!date || !operatorName) {
      return res
        .status(400)
        .json({ error: "Missing date or operatorName" });
    }

    const summary = await SolventOperatorSummary.findOne({ date, operatorName });

    if (!summary) {
      return res.status(404).json({
        error: "No performance data found for this operator on this date",
      });
    }

    res.json(summary);
  } catch (err) {
    console.error("Error fetching operator performance:", err);
    res.status(500).json({ error: "Server error fetching performance data" });
  }
};



// controllers/solvent.controller.js - Updated getDashboardData function

export const getDashboardData = async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;
    
    if (date) {
      // Single date request - existing logic is fine
      console.log("Dashboard request for single date:", date);
      
      const summaries = await SolventOperatorSummary.find({ date });
      
      if (!summaries || summaries.length === 0) {
        const dailyLog = await DailyLog.findOne({ date });
        if (dailyLog) {
          await generateOperatorSummary(date);
          const newSummaries = await SolventOperatorSummary.find({ date });
          return res.json({
            data: {
              steam: newSummaries.reduce((sum, s) => sum + (s.steamConsumed || 0), 0),
              electric: newSummaries.reduce((sum, s) => sum + (s.electricConsumed || 0), 0),
              production: newSummaries.reduce((sum, s) => sum + (s.totalCrudeOilProduction || 0) + (s.totalDORBProduction || 0), 0),
            },
            charts: []
          });
        }
        
        return res.json({
          data: { steam: 0, electric: 0, production: 0 },
          charts: []
        });
      }

      const totals = summaries.reduce((acc, summary) => {
        acc.steam += summary.steamConsumed || 0;
        acc.electric += summary.electricConsumed || 0;
        acc.production += (summary.totalCrudeOilProduction || 0) + (summary.totalDORBProduction || 0);
        return acc;
      }, { steam: 0, electric: 0, production: 0 });

      res.json({
        data: totals,
        charts: []
      });

    } else if (startDate && endDate) {
      // Date range request - FIX: Add detailed report processing
      console.log("Dashboard request for date range:", startDate, "to", endDate);
      
      const summaries = await SolventOperatorSummary.find({
        date: { $gte: startDate, $lte: endDate }
      });

      if (!summaries || summaries.length === 0) {
        return res.json({
          data: { steam: 0, electric: 0, production: 0 },
          detailedReportTable: {
            operators: ["No Data Available"],
            rows: {
              CrudeOilColor: [0],
              CrudeOilMoisture: [0],
              DORBOilPercent: [0],
              steamConsumed: [0],
              electricConsumed: [0],
              production: [0],
              totalWorkingHours: [0],
              daysPresent: [0],
            },
          },
          charts: []
        });
      }

      // Group summaries by operator and aggregate
      const operatorData = {};
      
      summaries.forEach(summary => {
        const opName = summary.operatorName;
        
        if (!operatorData[opName]) {
          operatorData[opName] = {
            totalHours: 0,
            steamConsumed: 0,
            electricConsumed: 0,
            totalCrudeOilProduction: 0,
            totalDORBProduction: 0,
            crudeOilColor: 0,
            crudeOilMoisture: 0,
            dorbOilMoisture: 0,
            daysPresent: new Set(),
            totalEntries: 0
          };
        }

        // Aggregate the data
        operatorData[opName].totalHours += summary.totalHours || 0;
        operatorData[opName].steamConsumed += summary.steamConsumed || 0;
        operatorData[opName].electricConsumed += summary.electricConsumed || 0;
        operatorData[opName].totalCrudeOilProduction += summary.totalCrudeOilProduction || 0;
        operatorData[opName].totalDORBProduction += summary.totalDORBProduction || 0;
        operatorData[opName].crudeOilColor += summary.crudeOilColor || 0;
        operatorData[opName].crudeOilMoisture += summary.crudeOilMoisture || 0;
        operatorData[opName].dorbOilMoisture += summary.dorbOilMoisture || 0;
        operatorData[opName].daysPresent.add(summary.date);
        operatorData[opName].totalEntries++;
      });

      // Convert to frontend expected format
      const operators = Object.keys(operatorData);
      const rows = {
        CrudeOilColor: [],
        CrudeOilMoisture: [],
        DORBOilPercent: [],
        steamConsumed: [],
        electricConsumed: [],
        production: [],
        totalWorkingHours: [],
        daysPresent: [],
      };

      operators.forEach(opName => {
        const data = operatorData[opName];
        const entries = data.totalEntries;
        
        rows.CrudeOilColor.push(entries > 0 ? data.crudeOilColor / entries : 0);
        rows.CrudeOilMoisture.push(entries > 0 ? data.crudeOilMoisture / entries : 0);
        rows.DORBOilPercent.push(entries > 0 ? data.dorbOilMoisture / entries : 0);
        rows.steamConsumed.push(data.steamConsumed);
        rows.electricConsumed.push(data.electricConsumed);
        rows.production.push(data.totalCrudeOilProduction + data.totalDORBProduction);
        rows.totalWorkingHours.push(data.totalHours);
        rows.daysPresent.push(data.daysPresent.size);
      });

      // Calculate overall totals
      const totals = summaries.reduce((acc, summary) => {
        acc.steam += summary.steamConsumed || 0;
        acc.electric += summary.electricConsumed || 0;
        acc.production += (summary.totalCrudeOilProduction || 0) + (summary.totalDORBProduction || 0);
        return acc;
      }, { steam: 0, electric: 0, production: 0 });

      res.json({
        data: totals,
        detailedReportTable: {
          operators,
          rows
        },
        charts: []
      });

    } else {
      return res.status(400).json({ 
        error: "Either 'date' or both 'startDate' and 'endDate' are required" 
      });
    }

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ 
      error: "Failed to fetch dashboard data", 
      details: error.message 
    });
  }
};