// // services/solvent.service.js
// import SolventDailyLog from "../models/solvent/FormSchema.js";
// import shiftDuration from "../constants/shiftDuration.js";

// /* ------------------------- Helpers ------------------------- */

// // Parse shiftHour like "08:00-16:00" → number of hours
// const parseShiftHour = (shiftHourStr) => {
//   if (!shiftHourStr || typeof shiftHourStr !== "string") return 0;
//   const [start, end] = shiftHourStr.split("-");
//   if (!start || !end) return 0;

//   const [sH, sM] = start.split(":").map(Number);
//   const [eH, eM] = end.split(":").map(Number);

//   let startMinutes = sH * 60 + sM;
//   let endMinutes = eH * 60 + eM;

//   // handle wrap around midnight
//   if (endMinutes < startMinutes) endMinutes += 24 * 60;

//   return (endMinutes - startMinutes) / 60;
// };

// // Build shift → duration map from constants
// const buildShiftDurationMap = (fallbackDur = 8) => {
//   const map = {};
//   for (const [shiftName, shiftHour] of Object.entries(shiftDuration)) {
//     const shiftId = shiftName.toLowerCase().replace(/\s+/g, "");
//     map[shiftId] = parseShiftHour(shiftHour) || fallbackDur;
//   }
//   return map;
// };

// /* ------------------------- Core Service ------------------------- */

// const SolventService = {
//   // Calculate operator metrics for frontend preview or summary
//   calculateOperatorMetrics(formData) {
//     const fallbackDur = 8;
//     const shiftDurMap = buildShiftDurationMap(fallbackDur);

//     const operators = formData.operators || [];
//     return operators.map((op) => {
//       const shiftIds = op.shiftName
//         ? op.shiftName
//             .split("+")
//             .map((s) => s.trim().toLowerCase().replace(/\s+/g, ""))
//         : [];

//       let totalHours = 0;
//       shiftIds.forEach((id) => (totalHours += shiftDurMap[id] || fallbackDur));

//       return {
//         name: op.name,
//         shiftName: op.shiftName,
//         shiftIds,
//         totalHours,
//       };
//     });
//   },

//   // Create and save daily log
//   async createDailyLog(formData) {
//     const normalizedDate = formData.date; // already "YYYY-MM-DD" string

//     // Check if log already exists
//     const existingLog = await SolventDailyLog.findOne({ date: normalizedDate });
//     if (existingLog) {
//       throw new Error("A log already exists for this date");
//     }

//     const operatorSummaries = this.calculateOperatorMetrics(formData);

//     const dailyLog = new SolventDailyLog({
//       date: normalizedDate,
//       operators: operatorSummaries,
//       raw_labReports: formData.labReports || [],
//       raw_steamReadings: formData.steamReadings || [],
//       raw_batches: formData.batches || [],
//       raw_totalProduction: Number(formData.totalProduction) || 0,
//       raw_ampereLoad: formData.ampereLoad || [],
//     });

//     return await dailyLog.save();
//   },

//   // Fetch logs (optionally by date range)
//   async getLogs(startDate, endDate) {
//     const query = {};
//     if (startDate && endDate) {
//       query.date = { $gte: startDate, $lte: endDate };
//     } else if (startDate) {
//       query.date = startDate;
//     }
//     return await SolventDailyLog.find(query).sort({ date: 1 });
//   },

//   // Fetch single log by date
//   async getLogByDate(date) {
//     return await SolventDailyLog.findOne({ date });
//   },

//   // Fetch operator summaries via SolventOperatorSummary
//   async getOperatorSummaries(date) {
//     const { default: SolventOperatorSummary } = await import(
//       "../models/solvent/OperatorSummary.js"
//     );

//     const summaries = await SolventOperatorSummary.find({ date });

//     // If not found, regenerate from logs
//     if (!summaries || summaries.length === 0) {
//       const logs = await SolventDailyLog.find({ date });
//       if (logs.length > 0) {
//         const { generateOperatorSummary } = await import(
//           "../service/solventSummary.service.js"
//         );
//         await generateOperatorSummary(date);

//         return await SolventOperatorSummary.find({ date });
//       }
//     }

//     return summaries || [];
//   },

//   /** Get unique operators present in a date range */
//   async getOperatorSummariesInRange(startDate, endDate) {
//     const summaries = await SolventOperatorSummary.find({
//       date: { $gte: startDate, $lte: endDate },
//     }).select("operatorName shiftName date");

//     if (!summaries.length) return null;

//     const seen = new Set();
//     return summaries.filter((s) => {
//       if (seen.has(s.operatorName)) return false;
//       seen.add(s.operatorName);
//       return true;
//     });
//   },

//   /** Aggregate operator performance within a date range */
//   async getOperatorPerformanceInRange(startDate, endDate, operatorName) {
//     const summaries = await SolventOperatorSummary.find({
//       date: { $gte: startDate, $lte: endDate },
//       operatorName,
//     });

//     if (!summaries.length) return null;

//     const aggregate = summaries.reduce(
//       (acc, s) => {
//         acc.totalHours += s.totalHours;
//         acc.steamConsumed += s.steamConsumed;
//         acc.electricConsumed += s.electricConsumed;
//         acc.totalProduction += s.totalProduction;

//         acc.crudeOilColor += s.crudeOilColor;
//         acc.crudeOilMoisture += s.crudeOilMoisture;
//         acc.dorbOilMoisture += s.dorbOilMoisture;

//         acc.days.add(s.date);
//         return acc;
//       },
//       {
//         totalHours: 0,
//         steamConsumed: 0,
//         electricConsumed: 0,
//         batches: 0,
//         totalProduction: 0,
//         crudeOilColor: 0,
//         crudeOilMoisture: 0,
//         dorbOilMoisture: 0,
//         days: new Set(),
//       }
//     );

//     const numDays = aggregate.days.size;

//     return {
//       operatorName,
//       startDate,
//       endDate,
//       daysPresent: numDays,
//       totalHours: aggregate.totalHours,
//       steamConsumed: aggregate.steamConsumed,
//       electricConsumed: aggregate.electricConsumed,
//       totalProduction: aggregate.totalProduction,
//       avgCrudeOilColor: numDays ? aggregate.crudeOilColor / numDays : 0,
//       avgCrudeOilMoisture: numDays ? aggregate.crudeOilMoisture / numDays : 0,
//       avgDorbOilMoisture: numDays ? aggregate.dorbOilMoisture / numDays : 0,
//     };
//   },
// };

// export default SolventService;

// services/solvent.service.js
import SolventDailyLog from "../models/solvent/FormSchema.js";
import SolventOperatorSummary from "../models/solvent/OperatorSummary.js"; // ADD THIS IMPORT
import shiftDuration from "../constants/shiftDuration.js";

/* ------------------------- Helpers ------------------------- */

// Parse shiftHour like "08:00-16:00" → number of hours
const parseShiftHour = (shiftHourStr) => {
  if (!shiftHourStr || typeof shiftHourStr !== "string") return 0;
  const [start, end] = shiftHourStr.split("-");
  if (!start || !end) return 0;

  const [sH, sM] = start.split(":").map(Number);
  const [eH, eM] = end.split(":").map(Number);

  let startMinutes = sH * 60 + sM;
  let endMinutes = eH * 60 + eM;

  // handle wrap around midnight
  if (endMinutes < startMinutes) endMinutes += 24 * 60;

  return (endMinutes - startMinutes) / 60;
};

// Build shift → duration map from constants
const buildShiftDurationMap = (fallbackDur = 8) => {
  const map = {};
  for (const [shiftName, shiftHour] of Object.entries(shiftDuration)) {
    const shiftId = shiftName.toLowerCase().replace(/\s+/g, "");
    map[shiftId] = parseShiftHour(shiftHour) || fallbackDur;
  }
  return map;
};

/* ------------------------- Core Service ------------------------- */

const SolventService = {
  // Calculate operator metrics for frontend preview or summary
  calculateOperatorMetrics(formData) {
    const fallbackDur = 8;
    const shiftDurMap = buildShiftDurationMap(fallbackDur);

    const operators = formData.operators || [];
    return operators.map((op) => {
      const shiftIds = op.shiftName
        ? op.shiftName
            .split("+")
            .map((s) => s.trim().toLowerCase().replace(/\s+/g, ""))
        : [];

      let totalHours = 0;
      shiftIds.forEach((id) => (totalHours += shiftDurMap[id] || fallbackDur));

      return {
        name: op.name,
        shiftName: op.shiftName,
        shiftIds,
        totalHours,
      };
    });
  },

  // Create and save daily log
  async createDailyLog(formData) {
    const normalizedDate = formData.date; // already "YYYY-MM-DD" string

    // Check if log already exists
    const existingLog = await SolventDailyLog.findOne({ date: normalizedDate });
    if (existingLog) {
      throw new Error("A log already exists for this date");
    }

    const operatorSummaries = this.calculateOperatorMetrics(formData);

    const dailyLog = new SolventDailyLog({
      date: normalizedDate,
      operators: operatorSummaries,
      raw_labReports: formData.labReports || [],
      raw_steamReadings: formData.steamReadings || [],
      raw_batches: formData.batches || [],
      raw_totalCrudeOilProduction: formData.totalCrudeOilProduction ?? 0,
      raw_totalDORBProduction: formData.totalDORBProduction ?? 0,
      raw_ampereLoad: formData.ampereLoad || [],
      raw_totalFeeding: formData.totalFeeding ?? 0,
      raw_ampereLoad: formData.ampereLoad || [],
    });

    return await dailyLog.save();
  },

  // Fetch logs (optionally by date range)
  async getLogs(startDate, endDate) {
    const query = {};
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.date = startDate;
    }
    return await SolventDailyLog.find(query).sort({ date: 1 });
  },

  // Fetch single log by date
  async getLogByDate(date) {
    return await SolventDailyLog.findOne({ date });
  },

  // Fetch operator summaries via SolventOperatorSummary
  async getOperatorSummaries(date) {
    const summaries = await SolventOperatorSummary.find({ date });

    // If not found, regenerate from logs
    if (!summaries || summaries.length === 0) {
      const logs = await SolventDailyLog.find({ date });
      if (logs.length > 0) {
        // Try to regenerate summaries
        try {
          const { generateOperatorSummary } = await import(
            "../service/solventSummary.service.js"
          );
          await generateOperatorSummary(date);
          return await SolventOperatorSummary.find({ date });
        } catch (error) {
          console.warn("Could not regenerate summaries:", error.message);
          return [];
        }
      }
    }

    return summaries || [];
  },

  /** Get unique operators present in a date range */
  async getOperatorSummariesInRange(startDate, endDate) {
    try {
      console.log("Fetching operators in range:", startDate, "to", endDate);

      const summaries = await SolventOperatorSummary.find({
        date: { $gte: startDate, $lte: endDate },
      }).select("operatorName shiftName date");

      console.log("Found summaries:", summaries.length);

      if (!summaries.length) {
        // Fallback: try to get from daily logs
        const logs = await SolventDailyLog.find({
          date: { $gte: startDate, $lte: endDate },
        });

        if (logs.length > 0) {
          const operators = [];
          logs.forEach((log) => {
            if (log.operators && log.operators.length > 0) {
              log.operators.forEach((op) => {
                if (!operators.find((existing) => existing.name === op.name)) {
                  operators.push({
                    name: op.name,
                    shiftName: op.shiftName,
                    date: log.date,
                  });
                }
              });
            }
          });
          return operators;
        }

        return [];
      }

      const seen = new Set();
      return summaries.filter((s) => {
        if (seen.has(s.operatorName)) return false;
        seen.add(s.operatorName);
        return true;
      });
    } catch (error) {
      console.error("Error in getOperatorSummariesInRange:", error);
      throw error;
    }
  },

  /** Aggregate operator performance within a date range */
  async getOperatorPerformanceInRange(startDate, endDate, operatorName) {
    try {
      const summaries = await SolventOperatorSummary.find({
        date: { $gte: startDate, $lte: endDate },
        operatorName,
      });

      if (!summaries.length) {
        // Fallback: try to calculate from daily logs
        const logs = await SolventDailyLog.find({
          date: { $gte: startDate, $lte: endDate },
        });

        if (logs.length === 0) return null;

        // Basic aggregation from logs
        const operatorLogs = logs.filter(
          (log) =>
            log.operators &&
            log.operators.some((op) => op.name === operatorName)
        );

        if (operatorLogs.length === 0) return null;

        return {
          operatorName,
          startDate,
          endDate,
          daysPresent: operatorLogs.length,
          totalHours: operatorLogs.reduce((sum, log) => {
            const op = log.operators.find((o) => o.name === operatorName);
            return sum + (op ? op.totalHours : 0);
          }, 0),
          steamConsumed: 0, // Would need to calculate from raw data
          electricConsumed: 0,
          totalCrudeOilProduction: 0,
          totalDORBProduction: 0,
          avgCrudeOilColor: 0,
          avgCrudeOilMoisture: 0,
          avgDorbOilMoisture: 0,
        };
      }

      const aggregate = summaries.reduce(
        (acc, s) => {
          acc.totalHours += s.totalHours || 0;
          acc.steamConsumed += s.steamConsumed || 0;
          acc.electricConsumed += s.electricConsumed || 0;
          acc.totalCrudeOilProduction += s.totalCrudeOilProduction || 0;
          acc.crudeOilColor += s.crudeOilColor || 0;
          acc.crudeOilMoisture += s.crudeOilMoisture || 0;
          acc.dorbOilMoisture += s.dorbOilMoisture || 0;

          acc.days.add(s.date);
          return acc;
        },
        {
          totalHours: 0,
          steamConsumed: 0,
          electricConsumed: 0,
          totalCrudeOilProduction: 0,
          crudeOilColor: 0,
          crudeOilMoisture: 0,
          dorbOilMoisture: 0,
          days: new Set(),
        }
      );

      const numDays = aggregate.days.size;

      return {
        operatorName,
        startDate,
        endDate,
        daysPresent: numDays,
        totalHours: aggregate.totalHours,
        steamConsumed: aggregate.steamConsumed,
        electricConsumed: aggregate.electricConsumed,
        totalCrudeOilProduction: aggregate.totalProduction,
        avgCrudeOilColor: numDays ? aggregate.crudeOilColor / numDays : 0,
        avgCrudeOilMoisture: numDays ? aggregate.crudeOilMoisture / numDays : 0,
        avgDorbOilMoisture: numDays ? aggregate.dorbOilMoisture / numDays : 0,
      };
    } catch (error) {
      console.error("Error in getOperatorPerformanceInRange:", error);
      throw error;
    }
  },
};

export default SolventService;
