//model/solventOperatorSummarySchema
//This db stores calculated data for each operator for that date according to their shifts and total working hours
import mongoose from "mongoose";

const SolventOperatorSummarySchema = new mongoose.Schema({
  date: { type: String, required: true },

  operatorName: { type: String, required: true },
  shiftName: { type: String },
  shiftIds: [{ type: String }],

  totalHours: { type: Number, default: 0 },

  // Dashboard-aligned fields
  crudeOilColor: { type: Number, default: 0 },
  crudeOilMoisture: { type: Number, default: 0 },
  dorbOilMoisture: { type: Number, default: 0 },
  steamConsumed: { type: Number, default: 0 },
  electricConsumed: { type: Number, default: 0 },
  totalCrudeOilProduction: { type: Number, default: 0 },
  totalDORBProduction: {type: Number, default: 0},
  expectedDORBProduction: { type: Number, default: 0 }, 
  avgWeightDORBBags: { type: Number, default: 0 }, 

});

export default mongoose.model(
  "SolventOperatorSummary",
  SolventOperatorSummarySchema
);
