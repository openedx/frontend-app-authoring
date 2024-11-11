import { StrictDict, keyStore } from '../../../utils';
import messages from './messages';

export const sortKeys = StrictDict({
  dateNewest: 'dateNewest',
  dateOldest: 'dateOldest',
  nameAscending: 'nameAscending',
  nameDescending: 'nameDescending',
});

const messageKeys = keyStore(messages);

export const sortMessages = StrictDict({
  dateNewest: messages[messageKeys.sortByDateNewest],
  dateOldest: messages[messageKeys.sortByDateOldest],
  nameAscending: messages[messageKeys.sortByNameAscending],
  nameDescending: messages[messageKeys.sortByNameDescending],
});

export const sortFunctions = StrictDict({
  dateNewest: (a, b) => b.dateAdded - a.dateAdded,
  dateOldest: (a, b) => a.dateAdded - b.dateAdded,
  nameAscending: (a, b) => {
    const nameA = a.displayName.toLowerCase();
    const nameB = b.displayName.toLowerCase();
    if (nameA < nameB) { return -1; }
    if (nameB < nameA) { return 1; }
    return b.dateAdded - a.dateAdded;
  },
  nameDescending: (a, b) => {
    const nameA = a.displayName.toLowerCase();
    const nameB = b.displayName.toLowerCase();
    if (nameA < nameB) { return 1; }
    if (nameB < nameA) { return -1; }
    return b.dateAdded - a.dateAdded;
  },
});

export const acceptedImgKeys = StrictDict({
  gif: '.gif',
  jpg: '.jpg',
  jpeg: '.jpeg',
  png: '.png',
  tif: '.tif',
  tiff: '.tiff',
  ico: '.ico',
  svg: '.svg',
  webp: '.webp',
});
