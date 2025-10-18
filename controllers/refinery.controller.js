const RefineryLog = require('../models/refinery/FormSchema');

// Create new refinery log
exports.createRefineryLog = async (req, res) => {
  try {
    const log = new RefineryLog(req.body);
    await log.save();
    res.status(201).json({ message: 'Refinery log created successfully.', data: log });
  } catch (error) {
    console.error('Error creating refinery log:', error);
    res.status(500).json({ message: 'Failed to create refinery log.', error });
  }
};

// Get all logs (with optional date filter)
exports.getAllLogs = async (req, res) => {
  try {
    const { date } = req.query;
    const filter = date ? { date: new Date(date) } : {};
    const logs = await RefineryLog.find(filter).sort({ createdAt: -1 });
    res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching refinery logs:', error);
    res.status(500).json({ message: 'Failed to fetch logs.', error });
  }
};

// Get single log by ID
exports.getLogById = async (req, res) => {
  try {
    const log = await RefineryLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Log not found.' });
    res.status(200).json(log);
  } catch (error) {
    console.error('Error fetching refinery log:', error);
    res.status(500).json({ message: 'Failed to fetch log.', error });
  }
};

// Update a log
exports.updateLog = async (req, res) => {
  try {
    const updatedLog = await RefineryLog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedLog) return res.status(404).json({ message: 'Log not found for update.' });
    res.status(200).json({ message: 'Log updated successfully.', data: updatedLog });
  } catch (error) {
    console.error('Error updating log:', error);
    res.status(500).json({ message: 'Failed to update log.', error });
  }
};

// Delete a log
exports.deleteLog = async (req, res) => {
  try {
    const deleted = await RefineryLog.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Log not found for deletion.' });
    res.status(200).json({ message: 'Log deleted successfully.' });
  } catch (error) {
    console.error('Error deleting log:', error);
    res.status(500).json({ message: 'Failed to delete log.', error });
  }
};


const DegumLog = require('../models/degumLog.model');

exports.createDegumLog = async (req, res) => {
  try {
    const { date, operators } = req.body;

    if (!date || !Array.isArray(operators) || operators.length === 0) {
      return res.status(400).json({ error: 'Invalid data submitted' });
    }

    const newLog = new DegumLog({
      date,
      section: "Degumming & Bleaching",
      operators
    });

    await newLog.save();
    res.status(201).json({ message: 'Degum log saved successfully', data: newLog });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while saving degum log' });
  }
};


