const mongoose = require('mongoose');
const RefineryFormSchema = require('./FormSchema');

const RefineryLog = mongoose.model('RefineryLog', RefineryFormSchema);

module.exports = RefineryLog;
