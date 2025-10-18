import mongoose from 'mongoose';

const OperatorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

export default mongoose.model('Operator', OperatorSchema);
