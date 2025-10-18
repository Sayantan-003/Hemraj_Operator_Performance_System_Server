const express = require('express');
const router = express.Router();
const refineryController = require('../controllers/refineryController');

router.post('/', refineryController.createRefineryLog);
router.get('/', refineryController.getAllLogs);
router.get('/:id', refineryController.getLogById);
router.put('/:id', refineryController.updateLog);
router.delete('/:id', refineryController.deleteLog);

module.exports = router;
