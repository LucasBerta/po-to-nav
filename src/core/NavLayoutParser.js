export default function parseNAVLayoutToIndexes(bomLines) {
  if (!validateBOM(bomLines)) return alert('Please copy the BOM from NAV and try again!');
  return getHeaderIndexes(bomLines);
}

function validateBOM(bom) {
  const matrix = getMatrix(bom);
  const indexes = getIndexes(matrix[0]);

  return indexes.qty > 0 && indexes.unitPrice > 0;
}

function getMatrix(bomLines) {
  const lines = bomLines?.split(/\n|\r/g);
  const matrix = lines?.map(line => line.split(/\t/g));
  return matrix;
}

function getIndexes(row) {
  return { qty: findFieldIndex(row, 'Quantity'), unitPrice: findFieldIndex(row, 'Unit Price Excl. VAT') };
}

function findFieldIndex(row, field) {
  return row.findIndex(item => item === field);
}

function getHeaderIndexes(bomLines) {
  const matrix = getMatrix(bomLines);
  const header = matrix[0];
  const allIndexes = {
    Type: findFieldIndex(header, 'Type'),
    'No.': findFieldIndex(header, 'No.'),
    'No. 2': findFieldIndex(header, 'No. 2'),
    Description: findFieldIndex(header, 'Description'),
    'Location Code': findFieldIndex(header, 'Location Code'),
    'Bin Code': findFieldIndex(header, 'Bin Code'),
    'Purchasing Code': findFieldIndex(header, 'Purchasing Code'),
    'Office Comment': findFieldIndex(header, 'Office Comment'),
    Quantity: findFieldIndex(header, 'Quantity'),
    'Line Amount Excl. VAT': findFieldIndex(header, 'Line Amount Excl. VAT'),
  };

  let lineAmountIndexFound = false;
  const indexes = {};
  Object.keys(allIndexes).forEach(key => {
    if (!lineAmountIndexFound) {
      indexes[key] = allIndexes[key];
    }
    if (key === 'Line Amount Excl. VAT') {
      lineAmountIndexFound = true;
    }
  });

  return indexes;
}
