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

function normalizeReleaseNote(note) {
  return {
    id: note.id,
    title: note.title,
    description: note.rawHtmlContent,
    published_at: note.publishedAt,
    created_by: note.createdBy,
    sendEmail: Boolean(note.sendEmailOnPublish),
  };
}

export function fetchReleaseNotesQuery() {
  return async (dispatch) => {
    try {
      dispatch(updateLoadingStatuses({ fetchReleaseNotesQuery: RequestStatus.IN_PROGRESS }));
      const response = await getReleaseNotes();
      const notesList = Array.isArray(response) ? response : (response.results || []);
      const hasAccess = response.hasAccess || false;
      const canSendReleaseNoteEmails = response.canSendReleaseNoteEmails || false;
      const normalized = (notesList || []).map(normalizeReleaseNote)
        .sort((a, b) => {
          const ta = a.published_at ? Date.parse(a.published_at) : -Infinity;
          const tb = b.published_at ? Date.parse(b.published_at) : -Infinity;
          return tb - ta;
        });
      dispatch(fetchReleaseNotesSuccess({
        notes: normalized, hasAccess, canSendReleaseNoteEmails,
      }));
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
      const { sendEmail, ...noteData } = data;
      const payload = {
        ...noteData,
        raw_html_content: noteData.description,
        send_email_on_publish: sendEmail || false,
      };
      delete payload.description;
      const note = await createReleaseNote(payload);
      dispatch(createReleaseNoteAction(normalizeReleaseNote(note)));
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
      const { sendEmail, ...noteData } = data;
      const payload = {
        ...noteData,
        raw_html_content: noteData.description,
        send_email_on_publish: sendEmail || false,
      };
      delete payload.description;
      const note = await editReleaseNote(payload);
      dispatch(editReleaseNoteAction(normalizeReleaseNote(note)));
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
