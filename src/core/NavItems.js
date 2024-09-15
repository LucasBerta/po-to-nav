import stringSimilarity from 'string-similarity-js';
import { itemsText } from './assets/Items';
import { getChadwicksIndexes } from './merchantsConfig/Chadwicks_config';

export function findNavItemByItemNo(row) {
  const itemNo = row[getChadwicksIndexes().itemNo];
  const description = row[getChadwicksIndexes().description];

  const exactItem = getNavItems().find(item => item['No.'] === itemNo);

  if (exactItem) return exactItem;

  const navItemsSortedBySimilarity = getNavItems().sort((a, b) => {
    const aItemNoSimilarity = stringSimilarity(a['No.'], itemNo, 2, false);
    const aItemNo2Similarity = stringSimilarity(a['No. 2'] || '', itemNo, 2, false);
    const aDescriptionSimilarity = stringSimilarity(a['Description'] || '', description, 2, false);
    const aSearchDescriptionSimilarity = stringSimilarity(a['Search Description'] || '', description, 2, false);
    const bItemNoSimilarity = stringSimilarity(b['No.'], itemNo, 2, false);
    const bItemNo2Similarity = stringSimilarity(b['No. 2'] || '', itemNo, 2, false);
    const bDescriptionSimilarity = stringSimilarity(b['Description'] || '', description, 2, false);
    const bSearchDescriptionSimilarity = stringSimilarity(b['Search Description'] || '', description, 2, false);

    let aSimilarity = aItemNoSimilarity > aItemNo2Similarity ? aItemNoSimilarity : aItemNo2Similarity;
    aSimilarity = aSimilarity > aDescriptionSimilarity ? aSimilarity : aDescriptionSimilarity;
    aSimilarity = aSimilarity > aSearchDescriptionSimilarity ? aSimilarity : aSearchDescriptionSimilarity;
    let bSimilarity = bItemNoSimilarity > bItemNo2Similarity ? bItemNoSimilarity : bItemNo2Similarity;
    bSimilarity = bSimilarity > bDescriptionSimilarity ? bSimilarity : bDescriptionSimilarity;
    bSimilarity = bSimilarity > bSearchDescriptionSimilarity ? bSimilarity : bSearchDescriptionSimilarity;

    return bSimilarity - aSimilarity;
  });

  return navItemsSortedBySimilarity[0];
}

export function itemNoHasPrice(itemNo) {
  return !getNavItemCodesWithoutUnitCost().includes(itemNo);
}

////////////////////////

function getNavItems() {
  const rows = itemsText.split(/\n|\r/g);
  const rowsArr = rows.map(row => row.split('\t'));
  const indexes = getIndexesFromRow(rowsArr[0]);
  const rowsWithoutheader = rowsArr.filter((_, index) => index > 0);
  const items = getItems(rowsWithoutheader, indexes);

  return items;
}

function getIndexesFromRow(row = '') {
  const itemNoIndex = row.findIndex(item => item === 'No.');
  const itemNo2Index = row.findIndex(item => item === 'No. 2');
  const descriptionIndex = row.findIndex(item => item === 'Description');
  const searchDescriptionIndex = row.findIndex(item => item === 'Search Description');

  return {
    no: itemNoIndex,
    no2: itemNo2Index,
    description: descriptionIndex,
    searchDescription: searchDescriptionIndex,
  };
}

function getItems(rows = [], indexes) {
  const items = rows.map(row => ({
    'No.': row[indexes.no],
    'No. 2': row[indexes.no2],
    Description: row[indexes.description],
    'Search Description': row[indexes.searchDescription],
    'Location Code': 'PROD-JIE',
    Type: 'Item',
  }));

  return items;
}

function getNavItemCodesWithoutUnitCost() {
  return ['HZ-SM-05-G6-LP', 'HZ-SM-08-G6-LP', 'HZ-SM-12-G6-LP', 'HZ-SM-16-G6-LP'];
}
