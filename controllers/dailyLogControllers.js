import DailyLog from '../models/dailyLog/DailyLog.js';

// POST /api/daily-logs
export const createDailyLog = async (req, res) => {
  try {
    const newLog = new DailyLog(req.body);
    const savedLog = await newLog.save();
    res.status(201).json(savedLog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/daily-logs
export const getAllLogs = async (req, res) => {
  try {
    const logs = await DailyLog.find().sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/daily-logs/:id
export const getDailyLogById = async (req, res) => {
  try {
    const log = await DailyLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Not found' });
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/daily-logs/:id
export const updateDailyLog = async (req, res) => {
  try {
    const updated = await DailyLog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/daily-logs/:id
export const deleteDailyLog = async (req, res) => {
  try {
    await DailyLog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
