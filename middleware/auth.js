// middleware/auth.js
import { verifyAccess } from '../utils/tokens.js';

const rolePermissions = {
  master_input_user : ['prep', 'solvent', 'refinery'],
  super_admin: ['prep', 'solvent', 'refinery'],
  solvent_admin: ['solvent'],
  prep_admin: ['prep'],
  refinery_admin: ['refinery'],
  multi_admin: ['prep', 'solvent', 'refinery'],
  input_user_1: ['refinery'],
  input_user_2: ['prep'],
  input_user_3: ['solvent'],
  superAdmin: ['prep', 'solvent', 'refinery'],
  admin1: ['prep'],
  admin2: ['solvent'],
  admin3: ['refinery'],
  admin4: ['prep', 'solvent']
};

// verify access token from Authorization header
export function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const parts = authHeader.split(' ');
  if (parts.length !== 2) return res.status(401).json({ message: 'Token error' });

  const token = parts[1];
  try {
    const decoded = verifyAccess(token); // throws on invalid/expired
    req.user = decoded; // { username, role, iat, exp }
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired access token' });
  }
}

export function allowSection(sectionKey) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) return res.status(401).json({ message: 'No role' });
    const allowed = rolePermissions[req.user.role] || [];
    if (!allowed.includes(sectionKey)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}
