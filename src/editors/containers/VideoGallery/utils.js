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
  videoStatus: 'videoStatus',
  uploading: 'uploading',
  processing: 'processing',
  ready: 'ready',
  failed: 'failed',
});

export const filterMessages = StrictDict({
  videoStatus: messages[messageKeys.filterByVideoStatusNone],
  uploading: messages[messageKeys.filterByVideoStatusUploading],
  processing: messages[messageKeys.filterByVideoStatusProcessing],
  ready: messages[messageKeys.filterByVideoStatusReady],
  failed: messages[messageKeys.filterByVideoStatusFailed],
});

export const acceptedImgKeys = StrictDict({
  mp4: '.mp4',
});
