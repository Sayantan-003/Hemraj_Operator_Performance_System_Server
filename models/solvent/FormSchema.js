// models/solvent/FormSchema.js
//This schema stores the raw format fo the form data and contains data for all the operators across that day
import mongoose from "mongoose";

const OperatorComputedSchema = new mongoose.Schema({
  name: { type: String, required: true },
  shiftName: { type: String },
  shiftIds: [{ type: String }],

  totalHours: { type: Number, default: 0 },

  production: { type: Number, default: 0 },
  steamConsumed: { type: Number, default: 0 },
  ampereLoad: { type: Number, default: 0 },

  colour: { type: Number, default: 0 },
  moisture: { type: Number, default: 0 },
  dorb: { type: Number, default: 0 },
});

const RawLabReportSchema = new mongoose.Schema({
  shiftId: String,
  colour: Number,
  moisture: Number,
  dorb: Number,
});

const RawSteamSchema = new mongoose.Schema({
  shiftId: String,
  consumed: Number,
});



const RawAmpereSchema = new mongoose.Schema({
  shiftId: String,
  value: Number,
});

const RawBatchSchema = new mongoose.Schema({
  shiftId: String,
  value: Number,
});


const SolventDailyLogSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, index: true },

    // Computed operators (final data for quick fetch)
    operators: [OperatorComputedSchema],

    //Raw data (straight from the form before calc)
    raw_labReports: [RawLabReportSchema],
    raw_steamReadings: [RawSteamSchema],
    raw_batches: [RawBatchSchema],
    raw_totalCrudeOilProduction : {type: Number ,  default:0},
    raw_totalDORBProduction : {type: Number ,  default:0},
    raw_ampereLoad: [RawAmpereSchema],
  },
  { timestamps: true }
);

export default mongoose.model("SolventDailyLog", SolventDailyLogSchema);
