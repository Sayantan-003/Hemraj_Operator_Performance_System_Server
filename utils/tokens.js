// import jsonwebtoken from 'jsonwebtoken';
// import dotenvflow from 'dotenv-flow';
// dotenvflow.config();


// const jwt = jsonwebtoken;


// const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
// const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
// const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
// const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d';


// export function signAccess(payload) {
// return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
// }


// export function signRefresh(payload) {
// return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
// }


// export function verifyAccess(token) {
// return jwt.verify(token, ACCESS_SECRET);
// }


// export function verifyRefresh(token) {
// return jwt.verify(token, REFRESH_SECRET);
// }




import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// issue access token
export function generateAccessToken(user) {
  return jwt.sign(
    { username: user.username, role: user.role, tokenVersion: user.tokenVersion },
    ACCESS_SECRET,
    { expiresIn: '15m', issuer: 'opms-auth-server', audience: 'opms-client' }
  );
}

// issue refresh token
export function generateRefreshToken(user) {
  return jwt.sign(
    { username: user.username, tokenVersion: user.tokenVersion },
    REFRESH_SECRET,
    { expiresIn: '7d', issuer: 'opms-auth-server', audience: 'opms-client' }
  );
}

// verify token (throws if invalid/expired)
export function verifyAccess(token, opts = {}) {
  return jwt.verify(token, ACCESS_SECRET, opts);
}
export function verifyRefresh(token, opts = {}) {
  return jwt.verify(token, REFRESH_SECRET, opts);
}

// hash + compare refresh tokens before saving
export async function hashToken(token) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(token, salt);
}
export async function compareToken(token, hash) {
  return bcrypt.compare(token, hash);
}
