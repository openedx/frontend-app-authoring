import { initializeMocks } from '../../testUtils';
import { RequestStatus } from '../../data/constants';
import * as api from './api';
import {
  createReleaseNote as createReleaseNoteAction,
  deleteReleaseNote as deleteReleaseNoteAction,
  editReleaseNote as editReleaseNoteAction,
  fetchReleaseNotesSuccess,
  updateLoadingStatuses,
  updateSavingStatuses,
} from './slice';
import {
  fetchReleaseNotesQuery, createReleaseNoteQuery, editReleaseNoteQuery, deleteReleaseNoteQuery,
} from './thunk';
import * as processingSlice from '../../generic/processing-notification/data/slice';

const collectActions = () => {
  const actions = [];
  const dispatch = (action) => actions.push(action);
  return { actions, dispatch };
};

describe('release-notes thunks', () => {
  beforeEach(() => {
    initializeMocks();
  });

  test('fetchReleaseNotesQuery success dispatches loading updates and normalized data', async () => {
    jest.spyOn(api, 'getReleaseNotes').mockResolvedValue([
      {
        id: 2, title: 'b', rawHtmlContent: '<p>b</p>', publishedAt: '2025-01-02T00:00:00Z', createdBy: 'b@x',
      },
      {
        id: 1, title: 'a', rawHtmlContent: '<p>a</p>', publishedAt: '2025-01-01T00:00:00Z', createdBy: 'a@x',
      },
    ]);
    const { actions, dispatch } = collectActions();

    await fetchReleaseNotesQuery()(dispatch);

    expect(actions[0].type).toBe(updateLoadingStatuses.type);
    const success = actions.find(a => a.type === fetchReleaseNotesSuccess.type);
    expect(success.payload[0].id).toBe(2);
    expect(success.payload[0]).toEqual(expect.objectContaining({ description: '<p>b</p>', published_at: expect.any(String), created_by: 'b@x' }));
    const last = actions[actions.length - 1];
    expect(last.type).toBe(updateLoadingStatuses.type);
    expect(last.payload.status.fetchReleaseNotesQuery).toBe(RequestStatus.SUCCESSFUL);
  });

  test('fetchReleaseNotesQuery failure sets FAILED', async () => {
    jest.spyOn(api, 'getReleaseNotes').mockRejectedValue(new Error('boom'));
    const { actions, dispatch } = collectActions();
    await fetchReleaseNotesQuery()(dispatch);
    const last = actions[actions.length - 1];
    expect(last.type).toBe(updateLoadingStatuses.type);
    expect(last.payload.status.fetchReleaseNotesQuery).toBe(RequestStatus.FAILED);
    expect(last.payload.error.loadingNotes).toBe(true);
  });

  test('createReleaseNoteQuery success creates note and sets SUCCESSFUL', async () => {
    jest.spyOn(api, 'createReleaseNote').mockResolvedValue({
      id: 9, title: 't', rawHtmlContent: '<p>x</p>', publishedAt: '2025-01-01T00:00:00Z', createdBy: 'u',
    });
    const { actions, dispatch } = collectActions();
    await createReleaseNoteQuery({ id: 9, title: 't', description: '<p>x</p>' })(dispatch);
    expect(actions.find(a => a.type === createReleaseNoteAction.type)).toBeTruthy();
    const last = actions[actions.length - 1];
    expect(last.type).toBe(updateSavingStatuses.type);
    expect(last.payload.status.createReleaseNoteQuery).toBe(RequestStatus.SUCCESSFUL);
  });

  test('createReleaseNoteQuery failure sets FAILED', async () => {
    jest.spyOn(api, 'createReleaseNote').mockRejectedValue(new Error('boom'));
    const { actions, dispatch } = collectActions();
    await createReleaseNoteQuery({ id: 9, title: 't', description: '<p>x</p>' })(dispatch);
    const last = actions[actions.length - 1];
    expect(last.type).toBe(updateSavingStatuses.type);
    expect(last.payload.status.createReleaseNoteQuery).toBe(RequestStatus.FAILED);
    expect(last.payload.error.creatingNote).toBe(true);
  });

  test('createReleaseNoteQuery toggles processing notifications', async () => {
    jest.spyOn(api, 'createReleaseNote').mockResolvedValue({ id: 10, title: 't', rawHtmlContent: '<p>x</p>' });
    const spyShow = jest.spyOn(processingSlice, 'showProcessingNotification');
    const spyHide = jest.spyOn(processingSlice, 'hideProcessingNotification');
    const { dispatch } = collectActions();
    await createReleaseNoteQuery({ id: 10, title: 't', description: '<p>x</p>' })(dispatch);
    expect(spyShow).toHaveBeenCalled();
    expect(spyHide).toHaveBeenCalled();
  });

  test('editReleaseNoteQuery success edits note and sets SUCCESSFUL', async () => {
    jest.spyOn(api, 'editReleaseNote').mockResolvedValue({
      id: 5, title: 't2', rawHtmlContent: '<p>y</p>', publishedAt: '2025-01-03T00:00:00Z', createdBy: 'v',
    });
    const { actions, dispatch } = collectActions();
    await editReleaseNoteQuery({ id: 5, title: 't2', description: '<p>y</p>' })(dispatch);
    expect(actions.find(a => a.type === editReleaseNoteAction.type)).toBeTruthy();
    const last = actions[actions.length - 1];
    expect(last.type).toBe(updateSavingStatuses.type);
    expect(last.payload.status.editReleaseNoteQuery).toBe(RequestStatus.SUCCESSFUL);
  });

  test('editReleaseNoteQuery failure sets FAILED', async () => {
    jest.spyOn(api, 'editReleaseNote').mockRejectedValue(new Error('boom'));
    const { actions, dispatch } = collectActions();
    await editReleaseNoteQuery({ id: 5, title: 't2', description: '<p>y</p>' })(dispatch);
    const last = actions[actions.length - 1];
    expect(last.type).toBe(updateSavingStatuses.type);
    expect(last.payload.status.editReleaseNoteQuery).toBe(RequestStatus.FAILED);
    expect(last.payload.error.savingNote).toBe(true);
  });

  test('deleteReleaseNoteQuery toggles processing notifications', async () => {
    jest.spyOn(api, 'deleteReleaseNote').mockResolvedValue({});
    const spyShow = jest.spyOn(processingSlice, 'showProcessingNotification');
    const spyHide = jest.spyOn(processingSlice, 'hideProcessingNotification');
    const { dispatch } = collectActions();
    await deleteReleaseNoteQuery(1)(dispatch);
    expect(spyShow).toHaveBeenCalled();
    expect(spyHide).toHaveBeenCalled();
  });

  test('deleteReleaseNoteQuery success deletes and sets SUCCESSFUL', async () => {
    jest.spyOn(api, 'deleteReleaseNote').mockResolvedValue({});
    const { actions, dispatch } = collectActions();
    await deleteReleaseNoteQuery(42)(dispatch);
    expect(actions.find(a => a.type === deleteReleaseNoteAction.type && a.payload === 42)).toBeTruthy();
    const last = actions[actions.length - 1];
    expect(last.type).toBe(updateSavingStatuses.type);
    expect(last.payload.status.deleteReleaseNoteQuery).toBe(RequestStatus.SUCCESSFUL);
  });

  test('deleteReleaseNoteQuery failure sets FAILED', async () => {
    jest.spyOn(api, 'deleteReleaseNote').mockRejectedValue(new Error('boom'));
    const { actions, dispatch } = collectActions();
    await deleteReleaseNoteQuery(42)(dispatch);
    const last = actions[actions.length - 1];
    expect(last.type).toBe(updateSavingStatuses.type);
    expect(last.payload.status.deleteReleaseNoteQuery).toBe(RequestStatus.FAILED);
    expect(last.payload.error.deletingNote).toBe(true);
  });

  test('createReleaseNoteQuery transforms payload (raw_html_content) before API', async () => {
    const spy = jest.spyOn(api, 'createReleaseNote').mockResolvedValue({ id: 1, title: 't', rawHtmlContent: '<p>x</p>' });
    const { dispatch } = collectActions();
    await createReleaseNoteQuery({ id: 1, title: 't', description: '<p>x</p>' })(dispatch);
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ raw_html_content: '<p>x</p>' }));
    expect(spy).toHaveBeenCalledWith(expect.not.objectContaining({ description: expect.anything() }));
  });

  test('editReleaseNoteQuery transforms payload (raw_html_content) before API', async () => {
    const spy = jest.spyOn(api, 'editReleaseNote').mockResolvedValue({ id: 2, title: 't2', rawHtmlContent: '<p>y</p>' });
    const { dispatch } = collectActions();
    await editReleaseNoteQuery({ id: 2, title: 't2', description: '<p>y</p>' })(dispatch);
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ raw_html_content: '<p>y</p>' }));
    expect(spy).toHaveBeenCalledWith(expect.not.objectContaining({ description: expect.anything() }));
  });
});
