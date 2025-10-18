import ExcelJS from "exceljs";

export const exportSolventToExcel = async (solventData, filePath) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Solvent Report");

  worksheet.columns = [
    { header: "Field", key: "field", width: 35 },
    { header: "Value", key: "value", width: 20 },
    { header: "Unit", key: "unit", width: 15 },
  ];

  // Define rows
  const rows = [
    { field: "Crude Oil Color", value: solventData.crudeOilColor, unit: "" },
    { field: "Crude Oil Moisture", value: solventData.crudeOilMoisture, unit: "%" },
    { field: "DORB Oil Moisture %", value: solventData.dorbOilMoisture, unit: "%" },
    { field: "Steam Consumed", value: solventData.steamConsumed, unit: "Ton" },
    { field: "Electric Consumed", value: solventData.electric, unit: "Units" },
    { field: "Total Production", value: solventData.totalProduction, unit: "mT" },
  ];

  worksheet.addRows(rows);

  await workbook.xlsx.writeFile(filePath);
  return filePath;
};
