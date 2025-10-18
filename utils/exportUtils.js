import ExcelJS from 'exceljs';

export async function exportToExcel(data, fields) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Solvent Report');
  worksheet.columns = fields.map(field => ({ header: field, key: field }));
  data.forEach(row => worksheet.addRow(row));
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}
