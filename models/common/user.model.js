import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['InputUser', 'DashboardUser'], required: true },
  // Add other fields as needed
});

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
