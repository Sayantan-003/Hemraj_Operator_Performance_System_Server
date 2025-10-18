const calculateDeoProduction = require('./deoProduction');
const calculateAlphaProduction = require('./alphaSectionProduction');
const calculateDeGummingAndBleachingProduction = require('./deGummingAndBleachingProduction');
const calculateDeWaxingProduction = require('./dewaxingProduction');

function calculateProductionBySection(section, params) {
  switch (section.toLowerCase()) {
    case 'deo':
      return calculateDeoProduction(params);
    case 'deGummingAndBleaching':
      return calculateDeGummingAndBleachingProduction(params);
    case 'alpha':
      return calculateAlphaProduction(params);
    case 'dewaxing' :
      return calculateDeWaxingProduction(params);
    default:
      throw new Error(`Unknown production section: ${section}`);
  }
}

module.exports = {
  calculateProductionBySection
};
