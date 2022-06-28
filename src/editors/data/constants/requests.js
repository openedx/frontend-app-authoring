import { StrictDict } from '../../utils';

export const RequestStates = StrictDict({
  inactive: 'inactive',
  pending: 'pending',
  completed: 'completed',
  failed: 'failed',
});

export const RequestKeys = StrictDict({
  fetchBlock: 'fetchBlock',
  fetchImages: 'fetchImages',
  fetchStudioView: 'fetchStudioView',
  fetchUnit: 'fetchUnit',
  saveBlock: 'saveBlock',
  uploadImage: 'uploadImage',
});
