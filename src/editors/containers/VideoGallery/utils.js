import { StrictDict, keyStore } from '../../utils';
import messages from './messages';

const messageKeys = keyStore(messages);

export const sortKeys = StrictDict({
  dateNewest: 'dateNewest',
  dateOldest: 'dateOldest',
  nameAscending: 'nameAscending',
  nameDescending: 'nameDescending',
  durationShortest: 'durationShortest',
  durationLongest: 'durationLongest',
});

export const sortMessages = StrictDict({
  dateNewest: messages[messageKeys.sortByDateNewest],
  dateOldest: messages[messageKeys.sortByDateOldest],
  nameAscending: messages[messageKeys.sortByNameAscending],
  nameDescending: messages[messageKeys.sortByNameDescending],
  durationShortest: messages[messageKeys.sortByDurationShortest],
  durationLongest: messages[messageKeys.sortByDurationLongest],
});

export const filterKeys = StrictDict({
  uploading: 'Uploading',
  processing: 'In Progress',
  ready: 'Ready',
  failed: 'Failed',
});

export const filterMessages = StrictDict({
  title: messages[messageKeys.filterByVideoStatusNone],
  uploading: messages[messageKeys.filterByVideoStatusUploading],
  processing: messages[messageKeys.filterByVideoStatusProcessing],
  ready: messages[messageKeys.filterByVideoStatusReady],
  failed: messages[messageKeys.filterByVideoStatusFailed],
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
  durationShortest: (a, b) => a.duration - b.duration,
  durationLongest: (a, b) => b.duration - a.duration,
});

export const acceptedImgKeys = StrictDict({
  mp4: '.mp4',
});
