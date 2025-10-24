import { NOTIFICATION_MESSAGES } from '../../constants';
import { RequestStatus } from '../../data/constants';
import { hideProcessingNotification, showProcessingNotification } from '../../generic/processing-notification/data/slice';
import {
  getReleaseNotes,
  createReleaseNote,
  editReleaseNote,
  deleteReleaseNote,
} from './api';
import {
  fetchReleaseNotesSuccess,
  createReleaseNote as createReleaseNoteAction,
  editReleaseNote as editReleaseNoteAction,
  deleteReleaseNote as deleteReleaseNoteAction,
  updateLoadingStatuses,
  updateSavingStatuses,
} from './slice';

export function fetchReleaseNotesQuery() {
  return async (dispatch) => {
    try {
      dispatch(updateLoadingStatuses({ fetchReleaseNotesQuery: RequestStatus.IN_PROGRESS }));
      const notes = await getReleaseNotes();
      const normalized = (notes || []).map((n) => ({
        id: n.id,
        title: n.title,
        description: n.rawHtmlContent,
        published_at: n.publishedAt,
        created_by: n.createdBy,
      }))
        .sort((a, b) => {
          const ta = a.published_at ? Date.parse(a.published_at) : -Infinity;
          const tb = b.published_at ? Date.parse(b.published_at) : -Infinity;
          return tb - ta;
        });
      dispatch(fetchReleaseNotesSuccess(normalized));
      dispatch(updateLoadingStatuses({
        status: { fetchReleaseNotesQuery: RequestStatus.SUCCESSFUL },
        error: { loadingNotes: false },
      }));
    } catch (error) {
      dispatch(updateLoadingStatuses({
        status: { fetchReleaseNotesQuery: RequestStatus.FAILED },
        error: { loadingNotes: true },
      }));
    }
  };
}

export function createReleaseNoteQuery(data) {
  return async (dispatch) => {
    try {
      dispatch(updateSavingStatuses({
        status: { createReleaseNoteQuery: RequestStatus.PENDING },
        error: {},
      }));
      dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));
      const payload = {
        ...data,
        raw_html_content: data.description,
      };
      delete payload.description;
      const note = await createReleaseNote(payload);
      const normalized = {
        id: note.id,
        title: note.title,
        description: note.rawHtmlContent,
        published_at: note.publishedAt,
        created_by: note.createdBy,
      };
      dispatch(createReleaseNoteAction(normalized));
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatuses({
        status: { createReleaseNoteQuery: RequestStatus.SUCCESSFUL },
        error: { creatingNote: false },
      }));
      return { success: true };
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatuses({
        status: { createReleaseNoteQuery: RequestStatus.FAILED },
        error: { creatingNote: true },
      }));
      return { success: false };
    }
  };
}

export function editReleaseNoteQuery(data) {
  return async (dispatch) => {
    try {
      dispatch(updateSavingStatuses({
        status: { editReleaseNoteQuery: RequestStatus.PENDING },
        error: {},
      }));
      dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));
      const payload = {
        ...data,
        raw_html_content: data.description,
      };
      delete payload.description;
      const note = await editReleaseNote(payload);
      const normalized = {
        id: note.id,
        title: note.title,
        description: note.rawHtmlContent,
        published_at: note.publishedAt,
        created_by: note.createdBy,
      };
      dispatch(editReleaseNoteAction(normalized));
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatuses({
        status: { editReleaseNoteQuery: RequestStatus.SUCCESSFUL },
        error: { savingNote: false },
      }));
      return { success: true };
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatuses({
        status: { editReleaseNoteQuery: RequestStatus.FAILED },
        error: { savingNote: true },
      }));
      return { success: false };
    }
  };
}

export function deleteReleaseNoteQuery(noteId) {
  return async (dispatch) => {
    try {
      dispatch(updateSavingStatuses({
        status: { deleteReleaseNoteQuery: RequestStatus.PENDING },
        error: {},
      }));
      dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.deleting));
      await deleteReleaseNote(noteId);
      dispatch(deleteReleaseNoteAction(noteId));
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatuses({
        status: { deleteReleaseNoteQuery: RequestStatus.SUCCESSFUL },
        error: { deletingNote: false },
      }));
      return { success: true };
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatuses({
        status: { deleteReleaseNoteQuery: RequestStatus.FAILED },
        error: { deletingNote: true },
      }));
      return { success: false };
    }
  };
}
