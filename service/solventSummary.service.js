// import SolventDailyLog from "../models/solvent/FormSchema.js";
// import SolventOperatorSummary from "../models/solvent/OperatorSummary.js"; // Calculate total batches for the day
// /**
//  * Normalize Date → "YYYY-MM-DD"
//  */
// function toDateString(dateInput) {
//   if (!dateInput) return null;
//   if (typeof dateInput === "string") return dateInput; // already string
//   const d = new Date(dateInput);
//   const year = d.getFullYear();
//   const month = String(d.getMonth() + 1).padStart(2, "0");
//   const day = String(d.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// }

// /**
//  * Calculate DORB production for an operator based on their total hours and shift pattern
//  * @param {number} totalDORBProduction - Total DORB production for the day
//  * @param {number} operatorHours - Hours worked by this operator
//  * @param {number} totalOperatorHours - Total hours worked by all operators that day
//  * @returns {number} - Operator's share of DORB production
//  */
// function calculateOperatorDORBProduction(
//   totalDORBProduction,
//   operatorHours,
//   totalOperatorHours
// ) {
//   if (totalOperatorHours === 0) return 0;
//   return (operatorHours / totalOperatorHours) * totalDORBProduction;
// }

// /**
//  * Calculate Expected DORB Production
//  * Formula: TotalFeeding(in tons) * 1000 - CrudeOilProduction(in tons) * 1000 = kg
//  */
// function calculateExpectedDORBProduction(
//   totalFeeding,
//   totalCrudeOilProduction
// ) {
//   const feedingKg = (totalFeeding || 0) * 1000;
//   const crudeKg = (totalCrudeOilProduction || 0) * 1000;
//   return Math.max(0, feedingKg - crudeKg); // Ensure non-negative
// }

// /**
//  * Calculate Average Weight of DORB Bags
//  * Formula: ExpectedDORBProduction (kg) / TotalDORBProduction (bags)
//  */
// function calculateAvgWeightDORBBags(expectedDORBProduction, totalDORBBags) {
//   if (totalDORBBags === 0) return 0;
//   return expectedDORBProduction / totalDORBBags;
// }

// /**
//  * Generate summaries for all operators on a given date.
//  * @param {string|Date} dateInput - "YYYY-MM-DD" or Date object
//  */
// export async function generateOperatorSummary(dateInput) {
//   // 1. Normalize date to string
//   const dateStr = toDateString(dateInput);

//   // 2. Fetch all logs for that day
//   const logs = await SolventDailyLog.find({ date: dateStr });
//   if (!logs || logs.length === 0) return;

//   // 3. Flatten operator data across logs
//   const operatorMap = {};

//   logs.forEach((log) => {
//     const totalDORBProduction = log.raw_totalDORBProduction || 0;

//     const expectedDORBProductionDay = calculateExpectedDORBProduction(
//       totalFeeding,
//       totalCrudeOilProduction
//     );

//     const avgWeightDORBBagsDay = calculateAvgWeightDORBBags(
//       expectedDORBProductionDay,
//       totalDORBProduction
//     );

//     // Calculate total hours for all operators for this day
//     const totalOperatorHours = log.operators.reduce(
//       (sum, op) => sum + (op.totalHours || 0),
//       0
//     );
//     log.operators.forEach((op) => {
//       const key = `${op.name}_${op.shiftName}_${dateStr}`;

//       if (!operatorMap[key]) {
//         operatorMap[key] = {
//           date: dateStr,
//           operatorName: op.name,
//           shiftName: op.shiftName,
//           shiftIds: [],
//           batches: 0,
//           totalHours: 0,
//           crudeOilColor: 0,
//           crudeOilMoisture: 0,
//           dorbOilMoisture: 0,
//           steamConsumed: 0,
//           electricConsumed: 0,
//           totalCrudeOilProduction: 0,
//           totalDORBProduction: 0,
//           labCount: 0, // internal use only
//         };
//       }

//       const summary = operatorMap[key];

//       // Track shift IDs and hours
//       if (op.shiftIds?.length) summary.shiftIds.push(...op.shiftIds);
//       if (op.totalHours) summary.totalHours += Number(op.totalHours) || 0;

//       // Calculate DORB production for this operator based on their hours
//       summary.totalDORBProduction = calculateOperatorDORBProduction(
//         totalDORBProduction,
//         summary.totalHours,
//         totalOperatorHours
//       );

//       // Assign day-level calculations to each operator
//       // (Same values for all operators on that day)
//       summary.expectedDORBProduction = expectedDORBProductionDay;
//       summary.avgWeightDORBBags = avgWeightDORBBagsDay;

//       const shiftSet = new Set(
//         op.shiftIds?.map((id) => id.toLowerCase()) || []
//       );

//       // Lab Reports
//       log.raw_labReports?.forEach((lab) => {
//         if (shiftSet.has(lab.shiftId.toLowerCase())) {
//           // Convert values to numbers and handle zero values
//           summary.crudeOilColor += Number(lab.colour) || 0;
//           summary.crudeOilMoisture += Number(lab.moisture) || 0;
//           summary.dorbOilMoisture += Number(lab.dorb) || 0;
//           summary.labCount += 1;
//         }
//       });

//       // Steam readings
//       log.raw_steamReadings?.forEach((steam) => {
//         if (shiftSet.has(steam.shiftId.toLowerCase())) {
//           summary.steamConsumed += Number(steam.consumed) || 0;
//         }
//       });

//       // Electric readings
//       log.raw_ampereLoad?.forEach((ampere) => {
//         if (shiftSet.has(ampere.shiftId.toLowerCase())) {
//           summary.electricConsumed += Number(ampere.value) || 0;
//         }
//       });

//       //PRODUCTION:.

//       // Crude Oil Production calculation

//       const totalCrudeProd = Number(log.raw_totalCrudeOilProduction) || 0;
//       if (totalCrudeProd > 0 && log.raw_batches) {
//         let operatorBatches = 0;
//         let totalDayBatches = 0;

//         log.raw_batches.forEach((batch) => {
//           const batchValue = Number(batch.value) || 0;
//           totalDayBatches += batchValue;

//           if (
//             op.shiftIds
//               ?.map((id) => id.toLowerCase())
//               .includes(batch.shiftId.toLowerCase())
//           ) {
//             operatorBatches += batchValue;
//           }
//         });

//         if (totalDayBatches > 0 && operatorBatches > 0) {
//           const perBatchProd = totalCrudeProd / totalDayBatches;
//           summary.totalCrudeOilProduction += perBatchProd * operatorBatches;
//           summary.batches += operatorBatches;
//         }
//       }
//     });
//   });

//   // 4. Finalize averages and round to 2 decimals
//   Object.values(operatorMap).forEach((summary) => {
//     if (summary.labCount > 0) {
//       summary.crudeOilColor = Number(
//         (summary.crudeOilColor / summary.labCount).toFixed(2)
//       );
//       summary.crudeOilMoisture = Number(
//         (summary.crudeOilMoisture / summary.labCount).toFixed(2)
//       );
//       summary.dorbOilMoisture = Number(
//         (summary.dorbOilMoisture / summary.labCount).toFixed(2)
//       );
//     } else {
//       summary.crudeOilColor = Number(summary.crudeOilColor.toFixed(2));
//       summary.crudeOilMoisture = Number(summary.crudeOilMoisture.toFixed(2));
//       summary.dorbOilMoisture = Number(summary.dorbOilMoisture.toFixed(2));
//     }

//     summary.steamConsumed = Number(summary.steamConsumed.toFixed(2));
//     summary.electricConsumed = Number(summary.electricConsumed.toFixed(2));
//     summary.totalCrudeOilProduction = Number(
//       summary.totalCrudeOilProduction.toFixed(2)
//     );
//     summary.totalDORBProduction = Number(
//       summary.totalDORBProduction.toFixed(2)
//     );
//     summary.totalHours = Number(summary.totalHours.toFixed(2));
//     summary.expectedDORBProduction = Number(
//       summary.expectedDORBProduction.toFixed(2)
//     );
//     summary.avgWeightDORBBags = Number(summary.avgWeightDORBBags.toFixed(2));
//     summary.totalHours = Number(summary.totalHours.toFixed(2));

//     delete summary.labCount;
//   });

//   // 5. Upsert into SolventOperatorSummary
//   const summaries = Object.values(operatorMap);
//   for (const summary of summaries) {
//     await SolventOperatorSummary.findOneAndUpdate(
//       {
//         date: summary.date,
//         operatorName: summary.operatorName,
//         shiftName: summary.shiftName,
//       },
//       { $set: summary },
//       { upsert: true, new: true }
//     );
//   }

//   return summaries;
// }



import SolventDailyLog from "../models/solvent/FormSchema.js";
import SolventOperatorSummary from "../models/solvent/OperatorSummary.js";

/**
 * Normalize Date → "YYYY-MM-DD"
 */
function toDateString(dateInput) {
  if (!dateInput) return null;
  if (typeof dateInput === "string") return dateInput;
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calculate DORB production for an operator based on their total hours and shift pattern
 */
function calculateOperatorDORBProduction(
  totalDORBProduction,
  operatorHours,
  totalOperatorHours
) {
  if (totalOperatorHours === 0) return 0;
  return (operatorHours / totalOperatorHours) * totalDORBProduction;
}

/**
 * Calculate Expected DORB Production
 * Formula: TotalFeeding(in tons) * 1000 - CrudeOilProduction(in tons) * 1000 = kg
 */
function calculateExpectedDORBProduction(
  totalFeeding,
  totalCrudeOilProduction
) {
  const feedingKg = (totalFeeding || 0) * 1000;
  const crudeKg = (totalCrudeOilProduction || 0) * 1000;
  return Math.max(0, feedingKg - crudeKg);
}

/**
 * Calculate Average Weight of DORB Bags
 * Formula: ExpectedDORBProduction (kg) / TotalDORBProduction (bags)
 */
function calculateAvgWeightDORBBags(expectedDORBProduction, totalDORBBags) {
  if (totalDORBBags === 0) return 0;
  return expectedDORBProduction / totalDORBBags;
}

/**
 * Generate summaries for all operators on a given date.
 * @param {string|Date} dateInput - "YYYY-MM-DD" or Date object
 */
export async function generateOperatorSummary(dateInput) {
  const dateStr = toDateString(dateInput);

  const logs = await SolventDailyLog.find({ date: dateStr });
  if (!logs || logs.length === 0) return;

  const operatorMap = {};

  logs.forEach((log) => {
    // FIX: Get these values from the log object
    const totalDORBProduction = log.raw_totalDORBProduction || 0;
    const totalFeeding = log.raw_totalFeeding || 0;
    const totalCrudeOilProduction = log.raw_totalCrudeOilProduction || 0;

    // Calculate day-level metrics
    const expectedDORBProductionDay = calculateExpectedDORBProduction(
      totalFeeding,
      totalCrudeOilProduction
    );

    const avgWeightDORBBagsDay = calculateAvgWeightDORBBags(
      expectedDORBProductionDay,
      totalDORBProduction
    );

    // Calculate total hours for all operators for this day
    const totalOperatorHours = log.operators.reduce(
      (sum, op) => sum + (op.totalHours || 0),
      0
    );

    log.operators.forEach((op) => {
      const key = `${op.name}_${op.shiftName}_${dateStr}`;

      if (!operatorMap[key]) {
        operatorMap[key] = {
          date: dateStr,
          operatorName: op.name,
          shiftName: op.shiftName,
          shiftIds: [],
          batches: 0,
          totalHours: 0,
          crudeOilColor: 0,
          crudeOilMoisture: 0,
          dorbOilMoisture: 0,
          steamConsumed: 0,
          electricConsumed: 0,
          totalCrudeOilProduction: 0,
          totalDORBProduction: 0,
          expectedDORBProduction: 0,
          avgWeightDORBBags: 0,
          labCount: 0,
        };
      }

      const summary = operatorMap[key];

      // Track shift IDs and hours
      if (op.shiftIds?.length) summary.shiftIds.push(...op.shiftIds);
      if (op.totalHours) summary.totalHours += Number(op.totalHours) || 0;

      // Calculate DORB production for this operator based on their hours
      summary.totalDORBProduction = calculateOperatorDORBProduction(
        totalDORBProduction,
        summary.totalHours,
        totalOperatorHours
      );

      // Assign day-level calculations to each operator
      summary.expectedDORBProduction = expectedDORBProductionDay;
      summary.avgWeightDORBBags = avgWeightDORBBagsDay;

      const shiftSet = new Set(
        op.shiftIds?.map((id) => id.toLowerCase()) || []
      );

      // Lab Reports
      log.raw_labReports?.forEach((lab) => {
        if (shiftSet.has(lab.shiftId.toLowerCase())) {
          summary.crudeOilColor += Number(lab.colour) || 0;
          summary.crudeOilMoisture += Number(lab.moisture) || 0;
          summary.dorbOilMoisture += Number(lab.dorb) || 0;
          summary.labCount += 1;
        }
      });

      // Steam readings
      log.raw_steamReadings?.forEach((steam) => {
        if (shiftSet.has(steam.shiftId.toLowerCase())) {
          summary.steamConsumed += Number(steam.consumed) || 0;
        }
      });

      // Electric readings
      log.raw_ampereLoad?.forEach((ampere) => {
        if (shiftSet.has(ampere.shiftId.toLowerCase())) {
          summary.electricConsumed += Number(ampere.value) || 0;
        }
      });

      // Crude Oil Production calculation
      const totalCrudeProd = Number(log.raw_totalCrudeOilProduction) || 0;
      if (totalCrudeProd > 0 && log.raw_batches) {
        let operatorBatches = 0;
        let totalDayBatches = 0;

        log.raw_batches.forEach((batch) => {
          const batchValue = Number(batch.value) || 0;
          totalDayBatches += batchValue;

          if (
            op.shiftIds
              ?.map((id) => id.toLowerCase())
              .includes(batch.shiftId.toLowerCase())
          ) {
            operatorBatches += batchValue;
          }
        });

        if (totalDayBatches > 0 && operatorBatches > 0) {
          const perBatchProd = totalCrudeProd / totalDayBatches;
          summary.totalCrudeOilProduction += perBatchProd * operatorBatches;
          summary.batches += operatorBatches;
        }
      }
    });
  });

  // Finalize averages and round to 2 decimals
  Object.values(operatorMap).forEach((summary) => {
    if (summary.labCount > 0) {
      summary.crudeOilColor = Number(
        (summary.crudeOilColor / summary.labCount).toFixed(2)
      );
      summary.crudeOilMoisture = Number(
        (summary.crudeOilMoisture / summary.labCount).toFixed(2)
      );
      summary.dorbOilMoisture = Number(
        (summary.dorbOilMoisture / summary.labCount).toFixed(2)
      );
    } else {
      summary.crudeOilColor = Number(summary.crudeOilColor.toFixed(2));
      summary.crudeOilMoisture = Number(summary.crudeOilMoisture.toFixed(2));
      summary.dorbOilMoisture = Number(summary.dorbOilMoisture.toFixed(2));
    }

    summary.steamConsumed = Number(summary.steamConsumed.toFixed(2));
    summary.electricConsumed = Number(summary.electricConsumed.toFixed(2));
    summary.totalCrudeOilProduction = Number(
      summary.totalCrudeOilProduction.toFixed(2)
    );
    summary.totalDORBProduction = Number(
      summary.totalDORBProduction.toFixed(2)
    );
    summary.expectedDORBProduction = Number(
      summary.expectedDORBProduction.toFixed(2)
    );
    summary.avgWeightDORBBags = Number(summary.avgWeightDORBBags.toFixed(2));
    summary.totalHours = Number(summary.totalHours.toFixed(2));

    delete summary.labCount;
  });

  // Upsert into SolventOperatorSummary
  const summaries = Object.values(operatorMap);
  for (const summary of summaries) {
    await SolventOperatorSummary.findOneAndUpdate(
      {
        date: summary.date,
        operatorName: summary.operatorName,
        shiftName: summary.shiftName,
      },
      { $set: summary },
      { upsert: true, new: true }
    );
  }

  return summaries;
}