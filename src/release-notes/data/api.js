import { getConfig, camelCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;

const getReleaseNotesApiUrl = () => new URL('/api/release_notes/v1/posts/', getApiBaseUrl()).href;
const getReleaseNoteApiUrl = (id) => new URL(`/api/release_notes/v1/posts/${id}/`, getApiBaseUrl()).href;

export async function getReleaseNotes() {
  const { data } = await getAuthenticatedHttpClient().get(getReleaseNotesApiUrl());
  return camelCaseObject(data);
}

export async function createReleaseNote(note) {
  const { data } = await getAuthenticatedHttpClient().post(getReleaseNotesApiUrl(), note);
  return camelCaseObject(data);
}

export async function editReleaseNote(note) {
  const { data } = await getAuthenticatedHttpClient().put(getReleaseNoteApiUrl(note.id), note);
  return camelCaseObject(data);
}

export async function deleteReleaseNote(id) {
  const { data } = await getAuthenticatedHttpClient().delete(getReleaseNoteApiUrl(id));
  return camelCaseObject(data);
}
