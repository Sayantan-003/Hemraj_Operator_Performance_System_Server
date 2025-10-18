// addUser.js
// Usage: node addUser.js <username> <password> <role>
// Example: node addUser.js super_admin admin@1234 super_admin

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenvFlow from 'dotenv-flow';
import User from './models/User.model.js';

// Load environment variables based on NODE_ENV
dotenvFlow.config();

const MONGO_URI = process.env.MONGO_URI;

// Allowed roles in the system
const ALLOWED_ROLES = [
  'prep_admin',
  'solvent_admin',
  'refinery_admin',
  'multi_admin',
  'super_admin',
  'input_user_1', // refinery-form
  'input_user_2', // prep-form
  'input_user_3', // solvent-form
  'master_input_user' //master_input _user to access all forms
];

async function addUser(username, password, role) {
  if (!username || !password || !role) {
    console.error('Usage: node addUser.js <username> <password> <role>');
    process.exit(1);
  }

  if (!ALLOWED_ROLES.includes(role)) {
    console.error(`Role must be one of: ${ALLOWED_ROLES.join(', ')}`);
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);

    const existing = await User.findOne({ username });
    if (existing) {
      console.error(`User "${username}" already exists`);
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, passwordHash: hashedPassword, role });
    await user.save();

    console.log(`User "${username}" with role "${role}" added successfully`);
  } catch (err) {
    console.error('Error adding user:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

const [,, username, password, role] = process.argv;
addUser(username, password, role);
