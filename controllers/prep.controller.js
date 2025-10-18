import PrepModel from "../models/prep.model.js"; // ✅ Importing the model


// CREATE PREP ENTRY - Save Data to DB
export const createPrepEntry = async (req, res) => {
  try {
    console.log("📩 Incoming Prep Data:", req.body); // 🟢 Log input data to console

    // Send success response to frontend
    res.status(200).json({
      success: true,
      message: "Form data received successfully",
      data: req.body, // Optional: send back received data
    });
    const {
      date,
      operatorDetails,
      steamEntries,
      ampereLoadEntries,
      feedingEntries,
    } = req.body;

    // ✅ Validation
    if (
      !date ||
      !operatorDetails ||
      !steamEntries ||
      !ampereLoadEntries ||
      !feedingEntries
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided.",
      });
    }

    // ✅ Create new document
    const newPrep = new PrepModel({
      date,
      operatorDetails,
      steamEntries,
      ampereLoadEntries,
      feedingEntries,
    });

    // ✅ Save to database
    const savedPrep = await newPrep.save();

    res.status(201).json({
      success: true,
      message: "Prep data saved successfully ✅",
      data: savedPrep,
    });
  } catch (error) {
    console.error("❌ Error saving prep entry:", error);
    // ✅ Check if response already sent before sending error
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to save prep data",
        error: error.message,
      });
    }
    // res.status(500).json({
    //   success: false,
    //   message: "Failed to save prep data",
    //   error: error.message,
    // });
  }
};

// ✅ GET DASHBOARD DATA (Fetch All Data)
export const getPrepDashboard = async (req, res) => {
  try {
  
  console.log("📩 Received in Backend:", req.body);

    const { date, operator } = req.body;

    console.log("📌 Date from Frontend:", date);
    console.log("📌 Operator from Frontend:", operator);

    // Your existing logic...
    res.status(200).json({ message: "Data received successfully" });
  } catch (error) {
    console.error("❌ Backend Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET SHIFT DATA
export const getPrepShift = async (req, res) => {
  try {
    const { date, shiftId } = req.query;

    if (!date || !shiftId) {
      return res.status(400).json({
        success: false,
        message: "Please provide both date and shiftId",
      });
    }

    const shiftData = await PrepModel.findOne({
      date,
      "operatorDetails.shiftName": shiftId,
    });

    if (!shiftData) {
      return res.status(404).json({
        success: false,
        message: "No data found for the given shift",
      });
    }

    res.status(200).json({ success: true, data: shiftData });
  } catch (error) {
    console.error("❌ Error fetching shift data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch shift data",
      error: error.message,
    });
  }
};

// GET REPORT DATA (Date Range)
export const getPrepReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide startDate and endDate",
      });
    }

    const reportData = await PrepModel.find({
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: reportData.length,
      data: reportData,
    });
  } catch (error) {
    console.error("❌ Error fetching report data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch report data",
      error: error.message,
    });
  }
};

//  GET OPERATOR-WISE DATA
export const getPrepOperator = async (req, res) => {
  try {
    const { operatorName } = req.query;

    if (!operatorName) {
      return res.status(400).json({
        success: false,
        message: "Please provide an operator name",
      });
    }

    const operatorData = await PrepModel.find({
      "operatorDetails.name": operatorName,
    }).sort({ date: -1 });

    if (operatorData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No data found for this operator",
      });
    }

    res.status(200).json({
      success: true,
      count: operatorData.length,
      data: operatorData,
    });
  } catch (error) {
    console.error("❌ Error fetching operator data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch operator data",
      error: error.message,
    });
  }
};



//?????????????????????????????????????????????????????????????????????

export const getDashboardData = async (req, res) => {
  try {
    const { date } = req.body;

    console.log("📌 [prep.controller.js] Dashboard Request Received:", date);

    let startDate = null;
    let endDate = null;
    let isRange = false;

    if (date.includes(" ")) {
      const dateParts = date.split(" ").map((d) => d.trim());
      startDate = new Date(dateParts[0]);
      endDate = new Date(dateParts[1]);
      isRange = true;
    }

    const formatDate = (d) => d.toISOString().split("T")[0];

    // Fixed operator list (always return these 3)
    const fixedOperators = [
      "Prasanta Santra",
      "Raghav Roy",
      "Srimanta Pramanik",
    ];

    // Initialize storage
    const rows = {
      steamConsumed: {},
      electricConsumed: {},
      production: {},
      totalWorkingHours: {},
      daysPresent: {},
    };

    // Helper to initialize an operator
    const initOperator = (operator) => {
      if (!rows.steamConsumed[operator]) {
        rows.steamConsumed[operator] = 0;
        rows.electricConsumed[operator] = 0;
        rows.production[operator] = 0;
        rows.totalWorkingHours[operator] = 0;
        rows.daysPresent[operator] = 0;
      }
    };

    // ---------------- RANGE CASE ----------------
    if (isRange) {
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const formattedDate = formatDate(currentDate);
        const prepData = await PrepModel.findOne({ date: formattedDate });

        if (prepData) {
          prepData.operatorDetails.forEach((op) => {
            const operator = op.name;

            // Only consider fixed operators
            if (!fixedOperators.includes(operator)) return;

            initOperator(operator);

            const shiftHour = Number(op?.shiftHour || 0);
            const shiftName = op?.shiftName || "";
            const shiftKeys = shiftName.split("+").map((s) => s.trim());

            let steam = 0;
            let electric = 0;

            shiftKeys.forEach((shift) => {
              let shiftKey = shift.replace(" ", "_");
              let isHalf = shift.includes("(1/2)");
              shiftKey = shiftKey.replace("(1/2)", "");

              const steamVal = Number(prepData.steamEntries.get(shiftKey) || 0);
              const electricVal = Number(
                prepData.ampereLoadEntries.get(shiftKey) || 0
              );

              if (isHalf) {
                steam += steamVal / 2;
                electric += electricVal / 2;
              } else {
                steam += steamVal;
                electric += electricVal;
              }
            });

            const feeding = prepData.feedingEntries;
            const totalFeeding =
              Number(feeding.get("Bran_21%_(Local)") || 0) +
              Number(feeding.get("Bran_20%_(Raw)") || 0) +
              Number(feeding.get("Bran_10%_(Mota)") || 0) +
              Number(feeding.get("Pora_DORB") || 0) +
              Number(feeding.get("Valo_DORB") || 0) +
              Number(feeding.get("Others") || 0);

            let effectiveShiftCount = 0;
            shiftKeys.forEach((shift) => {
              effectiveShiftCount += shift.includes("(1/2)") ? 0.5 : 1;
            });

            const production = (totalFeeding / 3) * effectiveShiftCount;

            //  accumulate per operator
            rows.steamConsumed[operator] += steam;
            rows.electricConsumed[operator] += electric;
            rows.production[operator] += production;
            rows.totalWorkingHours[operator] += shiftHour;
            rows.daysPresent[operator] += 1;
          });
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // ---------------- SINGLE DATE CASE ----------------
    else {
      const prepData = await PrepModel.findOne({ date: date });

      if (prepData) {
        prepData.operatorDetails.forEach((op) => {
          const operator = op.name;

          // Only consider fixed operators
          if (!fixedOperators.includes(operator)) return;

          initOperator(operator);

          const shiftHour = Number(op?.shiftHour || 0);
          const shiftName = op?.shiftName || "";
          const shiftKeys = shiftName.split("+").map((s) => s.trim());

          let steam = 0;
          let electric = 0;

          shiftKeys.forEach((shift) => {
            let shiftKey = shift.replace(" ", "_");
            let isHalf = shift.includes("(1/2)");
            shiftKey = shiftKey.replace("(1/2)", "");

            const steamVal = Number(prepData.steamEntries.get(shiftKey) || 0);
            const electricVal = Number(
              prepData.ampereLoadEntries.get(shiftKey) || 0
            );

            if (isHalf) {
              steam += steamVal / 2;
              electric += electricVal / 2;
            } else {
              steam += steamVal;
              electric += electricVal;
            }
          });

          const feeding = prepData.feedingEntries;
          const totalFeeding =
            Number(feeding.get("Bran_21%_(Local)") || 0) +
            Number(feeding.get("Bran_20%_(Raw)") || 0) +
            Number(feeding.get("Bran_10%_(Mota)") || 0) +
            Number(feeding.get("Pora_DORB") || 0) +
            Number(feeding.get("Valo_DORB") || 0) +
            Number(feeding.get("Others") || 0);

          let effectiveShiftCount = 0;
          shiftKeys.forEach((shift) => {
            effectiveShiftCount += shift.includes("(1/2)") ? 0.5 : 1;
          });

          const production = (totalFeeding / 3) * effectiveShiftCount;

          //  accumulate per operator
          rows.steamConsumed[operator] += steam;
          rows.electricConsumed[operator] += electric;
          rows.production[operator] += production;
          rows.totalWorkingHours[operator] += shiftHour;
          rows.daysPresent[operator] += 1;
        });
      }
    }

    //  Ensure all fixed operators exist in rows (even if absent → 0)
    fixedOperators.forEach((op) => initOperator(op));

    // Prepare final response
    const totals = {
      steamConsumed: 0,
      electricConsumed: 0,
      production: 0,
      totalWorkingHours: 0,
      daysPresent: 0,
    };

    const rowsFinal = {};
    Object.keys(rows).forEach((key) => {
      rowsFinal[key] = fixedOperators.map((op) => {
        const val = rows[key][op] || 0;
        totals[key] += val;
        return val;
      });
    });

    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: {
        detailedReportTable: {
          operators: fixedOperators,
          rows: rowsFinal,
          totals,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error in getDashboardData:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};








