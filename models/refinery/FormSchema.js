const mongoose = require('mongoose');

// --- Generic dip entry (time + value) ---
const TankEntrySchema = new mongoose.Schema({
  time: String,   // e.g., "10:30 AM"
  value: String   // Dip or GAP reading
}, { _id: false });

// --- Used for Fatty, ST, FOT, OUT ---
const DipGapSchema = new mongoose.Schema({
  tankLabel: { type: String, required: true },
  dipGap: { type: String }
}, { _id: false });

// --- ST tanks per shift (A, B, C) ---
const ShiftTankDipSchema = new mongoose.Schema({
  shiftName: { type: String, enum: ['A', 'B', 'C'], required: true },
  stTanks: [DipGapSchema]
}, { _id: false });

// --- Fatty tank per shift (A, B, C) ---
const ShiftFattyTankSchema = new mongoose.Schema({
  shiftName: { type: String, enum: ['A', 'B', 'C'], required: true },
  tank: DipGapSchema
}, { _id: false });

// --- Common meta for all sections ---
const SectionMetaSchema = new mongoose.Schema({
  operatorName: { type: String, required: true },
  shiftHours: { type: String, required: true }, // "8 Hours", "12 Hours", etc.
  shiftName: { type: String, required: true },  // "Shift A + Shift B", etc.
  tankType: { type: String, required: true }
}, { _id: false });

// --- Main Schema ---
const RefineryFormSchema = new mongoose.Schema({

  date: { type: Date, required: true },

  // --- DE-GUMMING + BLEACHING SECTION ---
  deGummingBleaching: {
    ...SectionMetaSchema.obj,
    cotTankEntries: [TankEntrySchema],
    bleacherTankEntries: [TankEntrySchema]
  },

  // --- ALPHA SECTION ---
  alphaSection: {
    ...SectionMetaSchema.obj,
    dgotTankEntries: [TankEntrySchema]
  },

  // --- DE-WAXING SECTION ---
  deWaxing: {
    ...SectionMetaSchema.obj,
    crystallizer: {
      rawWaterStartTime: String,
      filterStopTime: String
    },
    deWaxTankEntries: [TankEntrySchema],
    cloudyTankEntries: [TankEntrySchema]
  },

  // --- DEO SECTION ---
  deoSection: {
    ...SectionMetaSchema.obj,

    // ST Tanks: 6 per shift
    stTanks: [ShiftTankDipSchema],

    // Fatty Tank: 1 per shift
    fattyTanks: [ShiftFattyTankSchema],

    // FOT Tanks (2/4/4/6 based on shiftHours)
    fotTanks: [DipGapSchema],

    // OUT Tanks (1/2/2/3 based on shiftHours)
    outTanks: [DipGapSchema]
  }

}, { timestamps: true });

module.exports = mongoose.model('RefineryLog', RefineryFormSchema);
