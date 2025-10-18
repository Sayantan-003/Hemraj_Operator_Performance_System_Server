const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Shared sub-schemas
const OperatorDetailsSchema = new Schema({
  operator: { type: Schema.Types.ObjectId, ref: 'Operator', required: true },
  shiftHours: { type: Number, required: true },
  shift: { type: Schema.Types.ObjectId, ref: 'Shift', required: true }
});

// ================= PREP SECTION =================
const PrepAmpereLoadSchema = new Schema({
  time: String,
  session: { type: String, enum: ['AM', 'PM'] },
  load: Number
});

const PrepProductionSchema = new Schema({
  bran20Raw: Number,
  bran21Local: Number,
  bran10Mota: Number,
  poraDORB: Number,
  valoDORB: Number
});

const PrepSectionSchema = new Schema({
  steamTotalOpen: String,
  ampereLoads: [PrepAmpereLoadSchema],
  production: PrepProductionSchema
});

// ================= REFINERY SECTION =================
const TankEntrySchema = new Schema({
  tankName: String,
  readings: [{
    time: String,
    value: String
  }]
});

const RefinerySectionSchema = new Schema({
  deGummingBleaching: {
    COT: [TankEntrySchema],
    Bleacher: [TankEntrySchema]
  },
  alphaSection: {
    DGOT: [TankEntrySchema]
  }
});

// ================= DAILY LOG ROOT =================
const DailyLogSchema = new Schema({
  section: {
    type: String,
    enum: ['refinery', 'prep', 'solvent'],
    required: true
  },
  date: { type: Date, required: true },
  operatorDetails: OperatorDetailsSchema,

  // Section-specific data
  prep: PrepSectionSchema,
  refinery: RefinerySectionSchema,

  // You can add `solvent` similarly later
}, { timestamps: true });

module.exports = mongoose.model('DailyLog', DailyLogSchema);

export default DailyLogSchema;
