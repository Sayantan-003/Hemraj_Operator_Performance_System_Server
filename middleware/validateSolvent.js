import DailyLog from '../models/solvent/FormSchema.js';

/**
 * Helper function to calculate hours from "HH:MM-HH:MM" format
 * Example: "08:00-16:00" => 8 hours
 */
const parseShiftHour = (shiftHourStr) => {
  if (!shiftHourStr || typeof shiftHourStr !== "string") return 0;
  const [start, end] = shiftHourStr.split("-");
  if (!start || !end) return 0;
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  let hours = endH + (endM || 0) / 60 - (startH + (startM || 0) / 60);
  if (hours < 0) hours += 24; // handle overnight shifts
  return hours;
};

/**
 * Given a shift item (string id or object or range) and the global shifts list,
 * return its duration in hours (number). Returns null if it cannot determine.
 */
const getHoursFromShiftItem = (shiftItem, globalShifts = []) => {
  // Case: shiftItem is a string that looks like HH:MM-HH:MM or a numeric string
  if (typeof shiftItem === "string") {
    // If "HH:MM-HH:MM"
    if (shiftItem.includes("-") && shiftItem.includes(":")) {
      const h = parseShiftHour(shiftItem);
      return h > 0 ? h : null;
    }
    // If numeric string like "8" or "16"
    const num = Number(shiftItem);
    if (!isNaN(num) && num >= 0) return num;
    // Otherwise treat the string as a shiftId -> try lookup in globalShifts
    if (Array.isArray(globalShifts)) {
      const found = globalShifts.find(s => s.id === shiftItem || s.shiftId === shiftItem);
      if (found) {
        // found.duration (preferred) or parse shiftHour if present
        if (found.duration !== undefined) return Number(found.duration);
        if (found.shiftHour) {
          const hh = typeof found.shiftHour === 'number' ? found.shiftHour : parseShiftHour(found.shiftHour);
          return hh > 0 ? hh : null;
        }
      }
    }
    return null;
  }

  // Case: shiftItem is an object { shiftId, shiftHour, duration, ... }
  if (typeof shiftItem === "object" && shiftItem !== null) {
    if (shiftItem.duration !== undefined) {
      const d = Number(shiftItem.duration);
      if (!isNaN(d)) return d;
    }
    if (shiftItem.shiftHour) {
      // shiftHour could be "HH:MM-HH:MM" or numeric
      if (typeof shiftItem.shiftHour === 'number') return shiftItem.shiftHour;
      const hh = parseShiftHour(shiftItem.shiftHour);
      if (hh > 0) return hh;
      const num = Number(shiftItem.shiftHour);
      if (!isNaN(num)) return num;
    }
  }

  return null;
};


const validateSolvent = async (req, res, next) => {
  try {
    const {
      date,
      operators,
      labReports,
      steamReadings,
      totalProduction,
      batches,
      ampereLoad,
      shifts: globalShifts // optional array of shift defs { id, duration, shiftHour }
    } = req.body;

    // 1️. equired date
    if (!date) {
      return res.status(400).json({ error: "🚫 Date is required" });
    }

    // 2. Validate operators presence
    if (!operators || !Array.isArray(operators) || operators.length === 0) {
      return res.status(400).json({ error: "🚫 At least one operator is required" });
    }

    const operatorNames = new Set();
    let totalShiftHours = 0;

    for (const op of operators) {
      if (!op.name) return res.status(400).json({ error: "🚫 Operator name is required" });

      // Normalize shifts: accept either op.shiftName (string) or op.shifts (array)
      let operatorShifts = [];
      if (Array.isArray(op.shifts) && op.shifts.length > 0) {
        operatorShifts = op.shifts;
      } else if (op.shiftName) {
        operatorShifts = [op.shiftName];
      } else {
        // No shifts provided for operator
        return res.status(400).json({ error: `🚫 Operator '${op.name}' is missing shiftName or shifts` });
      }

      // Determine operator total hours:
      // - If op.shiftHour is a direct total (e.g., "16" or number or "HH:MM-HH:MM"), prefer it.
      // - Otherwise, sum per-shift durations using operatorShifts and optional globalShifts info.
      let hoursForOperator = 0;
      let parsedFromOpShiftHour = false;

      if (op.shiftHour) {
        // shiftHour might be "HH:MM-HH:MM", numeric string, or number
        if (typeof op.shiftHour === "number") {
          hoursForOperator = op.shiftHour;
          parsedFromOpShiftHour = true;
        } else if (typeof op.shiftHour === "string") {
          // numeric string?
          const numeric = Number(op.shiftHour);
          if (!isNaN(numeric) && op.shiftHour.trim().length <= 3) { // "8", "16"
            hoursForOperator = numeric;
            parsedFromOpShiftHour = true;
          } else if (op.shiftHour.includes("-") && op.shiftHour.includes(":")) {
            const ph = parseShiftHour(op.shiftHour);
            if (ph > 0) {
              hoursForOperator = ph;
              parsedFromOpShiftHour = true;
            }
          }
        }
      }

      if (!parsedFromOpShiftHour) {
        // Sum durations of individual shifts
        for (const shiftItem of operatorShifts) {
          const h = getHoursFromShiftItem(shiftItem, globalShifts);
          if (h === null) {
            return res.status(400).json({
              error: `🚫 Cannot determine hours for operator '${op.name}' for shift '${JSON.stringify(shiftItem)}'. Provide shiftHour or supply shifts array with durations (or provide global shifts).`
            });
          }
          hoursForOperator += h;
        }
      }

      if (hoursForOperator <= 0) {
        return res.status(400).json({ error: `🚫 Invalid computed hours for operator '${op.name}'` });
      }

      totalShiftHours += hoursForOperator;

      // Duplicate operator in request
      if (operatorNames.has(op.name)) {
        return res.status(400).json({ error: `🚫 Operator '${op.name}' is duplicated in the request` });
      }
      operatorNames.add(op.name);

      // Check if operator already exists for this date (UTC)
      const normalizedDate = new Date(date);
      normalizedDate.setUTCHours(0, 0, 0, 0);
      const nextDay = new Date(normalizedDate.getTime() + 24 * 60 * 60 * 1000);

      const existing = await DailyLog.findOne({
        date: {
          $gte: normalizedDate,
          $lt: nextDay
        },
        "operators.name": op.name,
      });

      if (existing) {
        return res.status(400).json({
          error: `🚫 Record already exists for operator ${op.name} on date ${date}`,
        });
      }
    }

    // 3️⃣ Validate sub-document arrays (labReports, steamReadings, totalProduction, ampereLoad)
    const validateArray = (arr, arrName, requiredFields) => {
      if (!arr) return;
      if (!Array.isArray(arr)) {
        return res.status(400).json({ error: `🚫 ${arrName} must be an array` });
      }
      for (const item of arr) {
        if (!item.shiftId) {
          return res.status(400).json({ error: `🚫 Missing shiftId in ${arrName}` });
        }
        for (const field of requiredFields) {
          if (item[field] === undefined || item[field] === null) {
            return res.status(400).json({
              error: `Missing required field '${field}' in ${arrName} for shift '${item.shiftId}'`,
            });
          }
          if (typeof item[field] === "number" && item[field] < 0) {
            return res.status(400).json({
              error: `🚫 Negative value not allowed for '${field}' in ${arrName} for shift '${item.shiftId}'`,
            });
          }
        }
      }
    };

    validateArray(labReports, "labReports", ["colour", "moisture", "dorb"]);
    validateArray(steamReadings, "steamReadings", ["consumed"]);
    validateArray(batches, "batches", ["value"]);
    validateArray(ampereLoad, "ampereLoad", ["value"]);

    // Passed all validations
    next();
  } catch (error) {
    console.error("Validation error:", error);
    return res.status(500).json({
      error: "🚫 Validation failed due to server error",
    });
  }
};

export default validateSolvent;
