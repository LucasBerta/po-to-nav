import pdfToText from 'react-pdftotext';
import './PdfToNav.scss';
import { getChadwicksIndexes } from '../core/merchantsConfig/Chadwicks_config';
import { findNavItemByItemNo, itemNoHasPrice } from '../core/NavItems';
import { useState } from 'react';

function PdfToNav() {
  const [pdfDescription, setPdfDescription] = useState();
  const [navFormatItems, setNavFormatitems] = useState();

  function onUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPdfDescription(file.name);

    pdfToText(file).then(text => {
      let excelString = '';
      const navItemsArr = convertToNAV(text);
      navItemsArr.forEach(navItem => {
        const excelColumnSeparator = '	';
        const excelRowSeparator = `
`;

        excelString += navItem['Type'] + excelColumnSeparator;
        excelString += navItem['No.'] + excelColumnSeparator;
        excelString += navItem['No. 2'] + excelColumnSeparator;
        excelString += navItem['Description'] + excelColumnSeparator;
        excelString += navItem['Location Code'] + excelColumnSeparator;
        excelString += '' + excelColumnSeparator; // Bin Code
        excelString += '' + excelColumnSeparator; // Purchasing Code
        excelString += '' + excelColumnSeparator; // Office Comment
        excelString += navItem['Quantity'] + excelColumnSeparator;

        if (itemNoHasPrice(navItem['No.'])) {
          excelString += navItem['Line Amount Excl. VAT'];
        }
        excelString += excelRowSeparator;
      });

      setNavFormatitems(excelString);
    });
  }

  function convertToNAV(text = '') {
    let rows = parseRows(text);
    const items = rows.map(row => {
      const navItem = findNavItemByItemNo(row);

      return {
        Type: navItem.Type,
        'No.': navItem['No.'],
        'No. 2': navItem['No. 2'],
        Description: navItem['Description'],
        'Search Description': navItem['Search Description'],
        Quantity: row[getChadwicksIndexes().qty],
        'Location Code': navItem['Location Code'],
        'Line Amount Excl. VAT': parseFloat(row[getChadwicksIndexes().lineAmountExclVAT]).toFixed(2),
      };
    });

    return items;
  }

  function copyNavItems() {
    navigator.clipboard.writeText(navFormatItems);
    setNavFormatitems();
    setPdfDescription('');
  }

  function parseRows(text = '') {
    // To parse the raw text to rows
    let splitText = text.split(/Description.+Price\s+(\d)+\s+/); // Where the items start
    splitText = splitText[splitText.length - 1]; // The last index is where the items are
    splitText = splitText.split(/\s+All goods must be supplied/)[0]; // To remove irrelevant text at the end
    splitText = splitText.split(/\s{3,3}/g); // Split every column

    let splitItems = [];
    splitText.forEach(item => {
      if (item.includes(' Suppliers Item Code - ')) {
        const splitItem = item.split(/ Suppliers Item Code - /); // To extract the item no
        splitItems.push(splitItem[0]);
        splitItems.push(splitItem[1].split(' ')[0]); // To remove the Chadwicks item code from the end of string
      } else if (item !== 'EACH' && item !== 'BOX' && item !== 'PALLET') {
        // To remove the EACH|BOX|PALLET string which is irrelevant
        splitItems.push(item);
      }
    });

    let rows = [];
    let tempArr = [];
    splitItems.forEach(item => {
      tempArr.push(item);
      if (tempArr.length === 5) {
        rows.push(tempArr);
        tempArr = [];
      }
    });

    return rows;
  }

  return (
    <>
      <input className='pdfUpload' type='file' accept='application/pdf' onChange={onUpload} />
      <button onClick={copyNavItems} disabled={!navFormatItems}>
        Copy NAV Items
      </button>
      <div>{pdfDescription}</div>
    </>
  );
}

export default PdfToNav;
