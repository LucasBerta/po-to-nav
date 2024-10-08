import './PdfToNav.scss';
import { useState } from 'react';
import pdfToText from 'react-pdftotext';
import { Button, Snackbar } from '@mui/material';
import { Check } from '@mui/icons-material';

import { getChadwicksIndexes } from '../core/merchantsConfig/Chadwicks_config';
import { findNavItemByItemNo, itemNoHasPrice } from '../core/NavItems';

function PdfToNav() {
  const [pdfDescription, setPdfDescription] = useState();
  const [navFormatItems, setNavFormatitems] = useState();
  const [showOnCopyFeedback, setShowOnCopyFeedback] = useState(false);

  function onUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPdfDescription(file.name);

    pdfToText(file).then(text => {
      let excelString = '';
      const navItemsArr = convertToNAV(text);
      const navHeaderIndexes = JSON.parse(localStorage.getItem('NavHeaderIndexes') || '{}');

      navItemsArr.forEach(navItem => {
        const excelColumnSeparator = '	';
        const excelRowSeparator = `
`;

        Object.keys(navHeaderIndexes).forEach(key => {
          if (key !== 'Line Amount Excl. VAT') {
            excelString += (navItem[key] || '') + excelColumnSeparator;
          }

          if (key === 'Line Amount Excl. VAT' && itemNoHasPrice(navItem['No.'])) {
            excelString += navItem[key] || '';
          }
        });
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
    setShowOnCopyFeedback(true);
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
      } else if (item !== 'EACH' && item !== 'BOX' && item !== 'PALLET' && item !== 'PACK' && item !== 'LENGTH') {
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
      <div className='pdfUploadView'>
        <div className='pdfUploadContainer'>
          <input id='pdfUpload' type='file' accept='application/pdf' onChange={onUpload} />
          <label id='pdfUploadLabel' htmlFor='pdfUpload'>
            {pdfDescription || 'Select or drop a file'}
          </label>
        </div>
        <Button variant='outlined' onClick={copyNavItems} disabled={!navFormatItems}>
          Copy NAV Items
        </Button>
      </div>
      <Snackbar
        open={showOnCopyFeedback}
        autoHideDuration={3000}
        onClose={() => setShowOnCopyFeedback(false)}
        message='NAV items copied to your clipboard!'
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        className='snackbar'
        action={<Check color='primary' />}
      />
    </>
  );
}

export default PdfToNav;
