import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
username: { type: String, required: true, unique: true },
passwordHash: { type: String, required: true },
role: { type: String, required: true },
// store current refresh token hash to support rotation / revoke
refreshTokenHash: { type: String }
});


export default mongoose.model('User', UserSchema);

