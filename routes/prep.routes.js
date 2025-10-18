
import express from "express";
import {
  createPrepEntry,
  getPrepDashboard,
  getPrepShift,
  getPrepReport,
  getPrepOperator,
  getDashboardData,
} from "../controllers/prep.controller.js";

const router = express.Router();

/**
 * @route   POST /api/prep/create
 * @desc    Create a new Prep Section entry
 * @access  Public (can secure later with auth)
 */
router.post("/create", createPrepEntry);

/**
 * @route   GET /api/prep/dashboard
 * @desc    Get overall dashboard summary
 * @access  Public
 */

router.post("/dashboard", getDashboardData);


router.get("/dashboard", getPrepDashboard);

/**
 * @route   GET /api/prep/shift
 * @desc    Get details of a particular shift
 * @query   ?date=YYYY-MM-DD&shiftId=1
 * @access  Public
 */
router.get("/shift", getPrepShift);

/**
 * @route   GET /api/prep/report
 * @desc    Get detailed report data
 * @query   ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * @access  Public
 */
router.get("/report", getPrepReport);

/**
 * @route   GET /api/prep/operator
 * @desc    Get operator-wise data
 * @query   ?operatorName=John
 * @access  Public
 */
router.get("/operator", getPrepOperator);

/**
 * @route   404 Handler for /api/prep/*
 * @desc    Handles invalid prep routes
 */
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `❌ API route not found: ${req.originalUrl}`,
  });
});

export default router;
