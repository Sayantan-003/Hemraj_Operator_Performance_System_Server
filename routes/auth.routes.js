// // routes/auth.js
// import express from 'express';
// import bcrypt from 'bcrypt';
// import User from '../models/User.js';
// import { signAccess, signRefresh, verifyRefresh } from '../utils/tokens.js';

// const router = express.Router();

// const REFRESH_COOKIE_NAME = 'ops_refresh';
// const IS_PROD = process.env.NODE_ENV === 'production';
// const REFRESH_COOKIE_OPTIONS = {
//   httpOnly: true,
//   secure: IS_PROD, // true in production with HTTPS
//   sameSite: 'lax',
//   path: '/auth',
//   maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
// };

// // POST /auth/login
// router.post('/login', async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     if (!username || !password) return res.status(400).json({ message: 'Missing username or password' });

//     const user = await User.findOne({ username });
//     if (!user) return res.status(401).json({ message: 'Invalid credentials' });

//     const ok = await bcrypt.compare(password, user.passwordHash);
//     if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

//     const payload = { username: user.username, role: user.role };
//     const accessToken = signAccess(payload);
//     const refreshToken = signRefresh({ username: user.username });

//     // store hashed refresh token for rotation / revoke
//     const hashedRefresh = await bcrypt.hash(refreshToken, 10);
//     user.refreshTokenHash = hashedRefresh;
//     await user.save();

//     // set cookie and return access token
//     res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
//     res.json({ accessToken });
//   } catch (err) {
//     console.error('Login error', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // POST /auth/refresh
// router.post('/refresh', async (req, res) => {
//   try {
//     const token = req.cookies[REFRESH_COOKIE_NAME];
//     if (!token) return res.status(401).json({ message: 'No refresh token' });

//     let payload;
//     try {
//       payload = verifyRefresh(token); // { username, iat, exp }
//     } catch (err) {
//       return res.status(401).json({ message: 'Invalid refresh token' });
//     }

//     const user = await User.findOne({ username: payload.username });
//     if (!user || !user.refreshTokenHash) return res.status(401).json({ message: 'Invalid refresh token' });

//     const valid = await bcrypt.compare(token, user.refreshTokenHash);
//     if (!valid) return res.status(401).json({ message: 'Invalid refresh token' });

//     // rotate refresh token
//     const newRefreshToken = signRefresh({ username: user.username });
//     user.refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
//     await user.save();

//     const newAccessToken = signAccess({ username: user.username, role: user.role });
//     res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, REFRESH_COOKIE_OPTIONS);
//     res.json({ accessToken: newAccessToken });
//   } catch (err) {
//     console.error('Refresh error', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // POST /auth/logout
// router.post('/logout', async (req, res) => {
//   try {
//     const token = req.cookies[REFRESH_COOKIE_NAME];
//     if (token) {
//       try {
//         const payload = verifyRefresh(token);
//         const user = await User.findOne({ username: payload.username });
//         if (user) {
//           user.refreshTokenHash = undefined;
//           await user.save();
//         }
//       } catch (e) {
//         // ignore invalid token
//       }
//     }
//     res.clearCookie(REFRESH_COOKIE_NAME, { path: '/auth' });
//     res.json({ ok: true });
//   } catch (err) {
//     console.error('Logout error', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// export default router;


// // routes/auth.js
// import express from 'express';
// import bcrypt from 'bcrypt';
// import User from '../models/user.model.js'
// import { signAccess, signRefresh, verifyRefresh } from '../utils/tokens.js';

// const router = express.Router();

// const REFRESH_COOKIE_NAME = 'ops_refresh';
// const IS_PROD = process.env.NODE_ENV === 'production';
// const REFRESH_COOKIE_OPTIONS = {
//   httpOnly: true,
//   secure: IS_PROD,
//   sameSite: 'lax',
//   path: '/auth',
//   maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
// };

// // POST /auth/login
// router.post('/login', async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     if (!username || !password)
//       return res.status(400).json({ message: 'Missing username or password' });

//     const user = await User.findOne({ username });
//     if (!user) return res.status(401).json({ message: 'Invalid credentials' });

//     const ok = await bcrypt.compare(password, user.passwordHash);
//     if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

//     const payload = { username: user.username, role: user.role };
//     const accessToken = signAccess(payload);
//     const refreshToken = signRefresh({ username: user.username });

//     // store hashed refresh token
//     user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
//     await user.save();

//     res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
//     res.json({ accessToken });
//   } catch (err) {
//     console.error('Login error', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // POST /auth/refresh
// router.post('/refresh', async (req, res) => {
//   try {
//     const token = req.cookies[REFRESH_COOKIE_NAME];
//     if (!token) return res.status(401).json({ message: 'No refresh token' });

//     let payload;
//     try {
//       payload = verifyRefresh(token);
//     } catch {
//       return res.status(401).json({ message: 'Invalid refresh token' });
//     }

//     const user = await User.findOne({ username: payload.username });
//     if (!user || !user.refreshTokenHash)
//       return res.status(401).json({ message: 'Invalid refresh token' });

//     const valid = await bcrypt.compare(token, user.refreshTokenHash);
//     if (!valid) return res.status(401).json({ message: 'Invalid refresh token' });

//     // rotate refresh
//     const newRefreshToken = signRefresh({ username: user.username });
//     user.refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
//     await user.save();

//     const newAccessToken = signAccess({ username: user.username, role: user.role });
//     res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, REFRESH_COOKIE_OPTIONS);
//     res.json({ accessToken: newAccessToken });
//   } catch (err) {
//     console.error('Refresh error', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // POST /auth/logout
// router.post('/logout', async (req, res) => {
//   try {
//     const token = req.cookies[REFRESH_COOKIE_NAME];
//     if (token) {
//       try {
//         const payload = verifyRefresh(token);
//         const user = await User.findOne({ username: payload.username });
//         if (user) {
//           user.refreshTokenHash = undefined;
//           await user.save();
//         }
//       } catch {
//         // ignore invalid token
//       }
//     }
//     res.clearCookie(REFRESH_COOKIE_NAME, { path: '/auth' });
//     res.json({ ok: true });
//   } catch (err) {
//     console.error('Logout error', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// export default router;




import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.model.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefresh,
  hashToken,
  compareToken,
} from '../utils/tokens.js';

const router = express.Router();

// LOGIN
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // store refreshToken hash in DB
  user.refreshTokenHash = await hashToken(refreshToken);
  await user.save();

  // send refresh token as HttpOnly cookie
  res.cookie('jid', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.json({ accessToken, role: user.role });
});

// REFRESH
router.post('/refresh', async (req, res) => {
  const token = req.cookies.jid;
  if (!token) return res.status(401).json({ message: 'No refresh token' });

  try {
    const payload = verifyRefresh(token, {
      issuer: 'opms-auth-server',
      audience: 'opms-client',
    });

    const user = await User.findOne({ username: payload.username });
    if (!user || !user.refreshTokenHash) {
      return res.status(401).json({ message: 'User not found' });
    }

    // validate hash
    const valid = await compareToken(token, user.refreshTokenHash);
    if (!valid) return res.status(401).json({ message: 'Invalid refresh token' });

    // rotate refresh token
    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    user.refreshTokenHash = await hashToken(newRefreshToken);
    await user.save();

    res.cookie('jid', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.json({ accessToken, role: user.role });
  } catch (err) {
    return res.status(401).json({ message: 'Expired or invalid refresh token' });
  }
});

// LOGOUT
router.post('/logout', async (req, res) => {
  const token = req.cookies.jid;
  if (token) {
    const payload = verifyRefresh(token);
    await User.updateOne({ username: payload.username }, { $unset: { refreshTokenHash: 1 } });
  }
  res.clearCookie('jid');
  res.json({ message: 'Logged out' });
});

export default router;
