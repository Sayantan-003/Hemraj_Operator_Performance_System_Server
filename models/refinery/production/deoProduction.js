function calculateDeoFattyProduction({ fattyTanks, FattycalibrationFactor }) {
  const Fattycal = parseFloat(calibrationFactor);

  if (shiftHours === '8') {
    const shift = shiftName.trim();
    return parseFloat(shiftData[shift]?.dipGap || 0) * cal;

  } else if (shiftHours === '12') {
    const [shiftA, shiftB] = shiftName.split('+').map(s => s.trim());
    const dipA = parseFloat(shiftData[shiftA]?.dipGap || 0);
    const dipB = parseFloat(shiftData[shiftB]?.dipGap || 0);
    return dipA * cal + (dipB * cal) / 2;

  } else if (shiftHours === '16') {
    const [shiftA, shiftB] = shiftName.split('+').map(s => s.trim());
    const dipA = parseFloat(shiftData[shiftA]?.dipGap || 0);
    const dipB = parseFloat(shiftData[shiftB]?.dipGap || 0);
    return dipA * cal + dipB * cal;

  } else if (shiftHours === '24') {
    const shifts = shiftName.split('+').map(s => s.trim());
    let total = 0;
    shifts.forEach(shift => {
      const dip = parseFloat(shiftData[shift]?.dipGap || 0);
      total += dip * cal;
    });
    return total;
  }

  return 0;
}

function calculateDeoSTProduction({ stTanks, STcalibrationFactor }) {
  const STcal = parseFloat(calibrationFactor);
  const stTotal = 0;
  for (const shift of stTanks){
    for(const val of shift){
      const numericVal = parseFloat(val);
      if(!NaN(numericVal)){
          stTotal += numericVal * STcal;
      }
    }
  }
  return stTotal;
}

function calculateDeoFOTProduction({ FOTTanks, FOTcalibrationFactor}){
  const FOTcal = parseFloat(FOTcalibrationFactor);
  const FOTTotal = 0;
  for(const shift of FOTTanks) {
    for (const val of shift){
      const numericVal = parseFloat(val);
      if(!NaN(numericVal)){
        FOTTotal += numericVal * FOTcal;
      }
    }
  } 
return FOTTotal;
}


function calculateDeoOUTProduction({ OUTTanks, calibrationFactor}){
  const OUTcal = parseFloat(calibrationFactor);
  const OUTTotal = 0;
  for(const shift of FOTTanks) {
    for (const val of shift){
      const numericVal = parseFloat(val);
      if(!NaN(numericVal)){
        OUTTotal += numericVal * OUTcal;
      }
    }
  } 
return OUTTotal;
}







module.exports = calculateDeoProduction;
