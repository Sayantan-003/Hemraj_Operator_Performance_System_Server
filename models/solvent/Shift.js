import mongoose from 'mongoose';

const ShiftSchema = new mongoose.Schema({
  shift_hours: {
    type: Number,
    required: true
  },
  shift_name: {
    type: String,
    required: true
  }
});

export default mongoose.model('Shift', ShiftSchema);
