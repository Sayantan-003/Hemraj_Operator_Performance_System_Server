import mongoose from "mongoose";

const operatorDetailsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    shiftHour: { type: String, required: true },
    shiftName: { type: String, required: true },
  },
  { _id: false }
);

// Schema for storing Steam, Ampere, and Feeding data
const prepSchema = new mongoose.Schema(
  {
    date: {
      type: String, // Or you can use Date if needed: { type: Date }
      required: true,
    },

    operatorDetails: {
      type: [operatorDetailsSchema], // ✅ Array of operator objects
      required: true,
    },

    steamEntries: {
      type: Map, //  Using Map to handle dynamic shift keys
      of: String, // Example: { "Shift A": "100", "Shift B": "200" }
      required: true,
    },

    ampereLoadEntries: {
      type: Map, // Using Map to handle dynamic shift keys
      of: String,
      required: true,
    },

    feedingEntries: {
      type: Map, // Using Map for flexible bran-related fields
      of: String,
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt
  }
);

const PrepModel = mongoose.model("Prep", prepSchema);
export default PrepModel;
