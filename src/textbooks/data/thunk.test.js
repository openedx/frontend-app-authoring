import {
  hideProcessingNotification,
  showProcessingNotification,
} from '../../generic/processing-notification/data/slice';
import {
  fetchTextbooksQuery,
  createTextbookQuery,
  editTextbookQuery,
  deleteTextbookQuery,
} from './thunk';
import {
  fetchTextbooks,
  updateLoadingStatus,
  updateSavingStatus,
  createTextbookSuccess,
  editTextbookSuccess,
  deleteTextbookSuccess,
} from './slice';
import { RequestStatus } from '../../data/constants';
import { NOTIFICATION_MESSAGES } from '../../constants';
import {
  getTextbooks, createTextbook, editTextbook, deleteTextbook,
} from './api';

jest.mock('./api', () => ({
  getTextbooks: jest.fn(),
  createTextbook: jest.fn(),
  editTextbook: jest.fn(),
  deleteTextbook: jest.fn(),
}));

const dispatch = jest.fn();

describe('fetchTextbooksQuery', () => {
  it('should dispatch fetchTextbooks with textbooks data on success', async () => {
    const textbooks = [{ id: '1', title: 'Textbook 1' }];
    getTextbooks.mockResolvedValue({ textbooks });

    await fetchTextbooksQuery('courseId')(dispatch);

    expect(dispatch).toHaveBeenCalledWith(updateLoadingStatus({ status: RequestStatus.IN_PROGRESS }));
    expect(getTextbooks).toHaveBeenCalledWith('courseId');
    expect(dispatch).toHaveBeenCalledWith(fetchTextbooks({ textbooks }));
    expect(dispatch).toHaveBeenCalledWith(updateLoadingStatus({ status: RequestStatus.SUCCESSFUL }));
  });

  it('should dispatch updateLoadingStatus with RequestStatus.FAILED on failure', async () => {
    getTextbooks.mockRejectedValue(new Error('Failed to fetch textbooks'));

    await fetchTextbooksQuery('courseId')(dispatch);

    expect(dispatch).toHaveBeenCalledWith(updateLoadingStatus({ status: RequestStatus.IN_PROGRESS }));
    expect(getTextbooks).toHaveBeenCalledWith('courseId');
    expect(dispatch).toHaveBeenCalledWith(updateLoadingStatus({ status: RequestStatus.FAILED }));
  });
});

describe('createTextbookQuery', () => {
  it('should dispatch createTextbookSuccess on success', async () => {
    const textbook = { id: '1', title: 'New Textbook' };
    createTextbook.mockResolvedValue(textbook);

    await createTextbookQuery('courseId', textbook)(dispatch);

    expect(dispatch).toHaveBeenCalledWith(updateSavingStatus({ status: RequestStatus.IN_PROGRESS }));
    expect(dispatch).toHaveBeenCalledWith(showProcessingNotification(NOTIFICATION_MESSAGES.saving));
    expect(createTextbook).toHaveBeenCalledWith('courseId', textbook);
    expect(dispatch).toHaveBeenCalledWith(createTextbookSuccess(textbook));
    expect(dispatch).toHaveBeenCalledWith(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
    expect(dispatch).toHaveBeenCalledWith(hideProcessingNotification());
  });

  it('should dispatch updateSavingStatus with RequestStatus.FAILED on failure', async () => {
    createTextbook.mockRejectedValue(new Error('Failed to create textbook'));

    await createTextbookQuery('courseId', {})(dispatch);

    expect(dispatch).toHaveBeenCalledWith(updateSavingStatus({ status: RequestStatus.IN_PROGRESS }));
    expect(dispatch).toHaveBeenCalledWith(showProcessingNotification(NOTIFICATION_MESSAGES.saving));
    expect(createTextbook).toHaveBeenCalledWith('courseId', {});
    expect(dispatch).toHaveBeenCalledWith(updateSavingStatus({ status: RequestStatus.FAILED, errorMessage: '' }));
    expect(dispatch).toHaveBeenCalledWith(hideProcessingNotification());
  });
});

describe('editTextbookQuery', () => {
  it('should dispatch editTextbookSuccess on success', async () => {
    const textbook = { id: '1', title: 'Edited Textbook' };
    editTextbook.mockResolvedValue(textbook);

    await editTextbookQuery('courseId', textbook)(dispatch);

    expect(dispatch).toHaveBeenCalledWith(updateSavingStatus({ status: RequestStatus.IN_PROGRESS }));
    expect(dispatch).toHaveBeenCalledWith(showProcessingNotification(NOTIFICATION_MESSAGES.saving));
    expect(editTextbook).toHaveBeenCalledWith('courseId', textbook);
    expect(dispatch).toHaveBeenCalledWith(editTextbookSuccess(textbook));
    expect(dispatch).toHaveBeenCalledWith(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
    expect(dispatch).toHaveBeenCalledWith(hideProcessingNotification());
  });

  it('should dispatch updateSavingStatus with RequestStatus.FAILED on failure', async () => {
    editTextbook.mockRejectedValue(new Error('Failed to edit textbook'));

    await editTextbookQuery('courseId', {})(dispatch);

    expect(dispatch).toHaveBeenCalledWith(updateSavingStatus({ status: RequestStatus.IN_PROGRESS }));
    expect(dispatch).toHaveBeenCalledWith(showProcessingNotification(NOTIFICATION_MESSAGES.saving));
    expect(editTextbook).toHaveBeenCalledWith('courseId', {});
    expect(dispatch).toHaveBeenCalledWith(updateSavingStatus({ status: RequestStatus.FAILED, errorMessage: '' }));
    expect(dispatch).toHaveBeenCalledWith(hideProcessingNotification());
  });
});

describe('deleteTextbookQuery', () => {
  it('should dispatch deleteTextbookSuccess on success', async () => {
    deleteTextbook.mockResolvedValue();

    await deleteTextbookQuery('courseId', 'textbookId')(dispatch);

    expect(dispatch).toHaveBeenCalledWith(updateSavingStatus({ status: RequestStatus.IN_PROGRESS }));
    expect(dispatch).toHaveBeenCalledWith(showProcessingNotification(NOTIFICATION_MESSAGES.deleting));
    expect(deleteTextbook).toHaveBeenCalledWith('courseId', 'textbookId');
    expect(dispatch).toHaveBeenCalledWith(deleteTextbookSuccess('textbookId'));
    expect(dispatch).toHaveBeenCalledWith(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
    expect(dispatch).toHaveBeenCalledWith(hideProcessingNotification());
  });

  it('should dispatch updateSavingStatus with RequestStatus.FAILED on failure', async () => {
    deleteTextbook.mockRejectedValue(new Error('Failed to delete textbook'));

    await deleteTextbookQuery('courseId', 'textbookId')(dispatch);

    expect(dispatch).toHaveBeenCalledWith(updateSavingStatus({ status: RequestStatus.IN_PROGRESS }));
    expect(dispatch).toHaveBeenCalledWith(showProcessingNotification(NOTIFICATION_MESSAGES.deleting));
    expect(deleteTextbook).toHaveBeenCalledWith('courseId', 'textbookId');
    expect(dispatch).toHaveBeenCalledWith(updateSavingStatus({ status: RequestStatus.FAILED, errorMessage: '' }));
    expect(dispatch).toHaveBeenCalledWith(hideProcessingNotification());
  });
});
