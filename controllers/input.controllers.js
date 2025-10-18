const PrepInput = require('../models/prepInput.model');
const RefineryInput = require('../models/refineryInput.model');
const SolventInput = require('../models/solventInput.model');

// Prep Input
exports.createPrepInput = async (req, res) => {
  try {
    const input = new PrepInput({ ...req.body, user: req.user.id });
    await input.save();
    res.json({ message: 'Prep input saved' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getPrepInputs = async (req, res) => {
  try {
    const inputs = await PrepInput.find({ user: req.user.id });
    res.json({ inputs });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Refinery Input
exports.createRefineryInput = async (req, res) => {
  try {
    const input = new RefineryInput({ ...req.body, user: req.user.id });
    await input.save();
    res.json({ message: 'Refinery input saved' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getRefineryInputs = async (req, res) => {
  try {
    const inputs = await RefineryInput.find({ user: req.user.id });
    res.json({ inputs });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Solvent Input
exports.createSolventInput = async (req, res) => {
  try {
    const input = new SolventInput({ ...req.body, user: req.user.id });
    await input.save();
    res.json({ message: 'Solvent input saved' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getSolventInputs = async (req, res) => {
  try {
    const inputs = await SolventInput.find({ user: req.user.id });
    res.json({ inputs });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
