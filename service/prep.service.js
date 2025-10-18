import PrepModel from "../models/prep/FormSchema.js";

export const createPrepLog = async (data) => {
  const { date, operatorDetails, totalProduction } = data;

  const shiftHourMap = {
    8: 1,
    12: 1.5,
    16: 2,
    24: 3,
  };

  const weightedOperators = operatorDetails.map(op => ({
    ...op,
    weight: shiftHourMap[parseInt(op.shiftHours)] || 0,
  }));

  const totalWeight = weightedOperators.reduce((sum, op) => sum + op.weight, 0);

  const logs = weightedOperators.map(op => {
    const fraction = op.weight / totalWeight;

    const individualProduction = {
      bran21Local: +(totalProduction.bran21Local * fraction).toFixed(2),
      bran20Raw: +(totalProduction.bran20Raw * fraction).toFixed(2),
      bran10Mota: +(totalProduction.bran10Mota * fraction).toFixed(2),
      poraDORB: +(totalProduction.poraDORB * fraction).toFixed(2),
      valoDORB: +(totalProduction.valoDORB * fraction).toFixed(2),
    };

    return {
      date,
      operatorName: op.operatorName,
      shiftHours: op.shiftHours,
      shiftName: op.shiftName,
      steamConsumedEntries: op.steamConsumedEntries,
      ampereLoadEntries: op.ampereLoadEntries,
      totalProduction: individualProduction,
    };
  });

  const saved = await PrepModel.insertMany(logs);
  return saved;
};
