import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import MockAdapter from 'axios-mock-adapter';

import { initializeMocks } from '../../testUtils';
import {
  getReleaseNotes, createReleaseNote, editReleaseNote, deleteReleaseNote,
} from './api';

describe('release-notes api', () => {
  let mock;
  beforeEach(() => {
    initializeMocks();
    mock = new MockAdapter(getAuthenticatedHttpClient());
  });

  test('getReleaseNotes calls correct URL and returns camelCased data', async () => {
    const url = new URL('/api/release_notes/v1/posts/', getConfig().STUDIO_BASE_URL).href;
    mock.onGet(url).reply(200, [{ id: 1, raw_html_content: '<p>x</p>', published_at: '2025-01-01T00:00:00Z' }]);
    const data = await getReleaseNotes();
    expect(data[0].rawHtmlContent).toBe('<p>x</p>');
    expect(mock.history.get[0].url).toBe(url);
  });

  test('createReleaseNote posts to collection URL and returns camelCased', async () => {
    const url = new URL('/api/release_notes/v1/posts/', getConfig().STUDIO_BASE_URL).href;
    mock.onPost(url).reply(200, { id: 2, raw_html_content: '<p>y</p>' });
    const res = await createReleaseNote({ raw_html_content: '<p>y</p>' });
    expect(res.rawHtmlContent).toBe('<p>y</p>');
    expect(mock.history.post[0].url).toBe(url);
  });

  test('editReleaseNote puts to instance URL and returns camelCased', async () => {
    const id = 3;
    const url = new URL(`/api/release_notes/v1/posts/${id}/`, getConfig().STUDIO_BASE_URL).href;
    mock.onPut(url).reply(200, { id, raw_html_content: '<p>z</p>' });
    const res = await editReleaseNote({ id, raw_html_content: '<p>z</p>' });
    expect(res.rawHtmlContent).toBe('<p>z</p>');
    expect(mock.history.put[0].url).toBe(url);
  });

  test('deleteReleaseNote deletes instance URL and returns camelCased', async () => {
    const id = 4;
    const url = new URL(`/api/release_notes/v1/posts/${id}/`, getConfig().STUDIO_BASE_URL).href;
    mock.onDelete(url).reply(200, { result_status: 'ok' });
    const res = await deleteReleaseNote(id);
    expect(res.resultStatus).toBe('ok');
    expect(mock.history.delete[0].url).toBe(url);
  });

  test('api errors propagate (rejects)', async () => {
    const url = new URL('/api/release_notes/v1/posts/', getConfig().STUDIO_BASE_URL).href;
    mock.onGet(url).reply(500, {});
    await expect(getReleaseNotes()).rejects.toBeTruthy();
  });
});
