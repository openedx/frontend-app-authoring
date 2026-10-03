import MockAdapter from 'axios-mock-adapter';
import { configureStore } from '@reduxjs/toolkit';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { RequestStatus } from '@src/data/constants';
import { reducer } from './slice';
import { getCreateOrRerunCourseUrl } from './api';
import { updateCreateOrRerunCourseQuery } from './thunks';

describe('course creation native transport and Redux contract', () => {
  let axiosMock;
  let store;
  beforeEach(() => {
    initializeMockApp({ authenticatedUser: { userId: 3, username: 'staff', administrator: true, roles: [] } });
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    store = configureStore({ reducer: { generic: reducer } });
  });
  afterEach(() => axiosMock.restore());

  it.each([null, ''])('completes an empty successful response without inventing a course URL (%s)', async (body) => {
    axiosMock.onPost(getCreateOrRerunCourseUrl()).reply(201, body);
    expect(await store.dispatch(updateCreateOrRerunCourseQuery({ displayName: 'Demo' }))).toBe(true);
    expect(store.getState().generic.savingStatus).toBe(RequestStatus.SUCCESSFUL);
    expect(store.getState().generic.createOrRerunCourse).toMatchObject({ redirectUrlObj: {}, postErrors: {} });
  });

  it('preserves a healthy JSON course URL', async () => {
    axiosMock.onPost(getCreateOrRerunCourseUrl()).reply(200, { url: '/course/course-v1:Test+Demo+2026' });
    expect(await store.dispatch(updateCreateOrRerunCourseQuery({}))).toBe(true);
    expect(store.getState().generic.createOrRerunCourse.redirectUrlObj).toEqual({
      url: '/course/course-v1:Test+Demo+2026',
    });
  });

  it('keeps the rerun home destination on an empty successful response', async () => {
    axiosMock.onPost(getCreateOrRerunCourseUrl()).reply(201, '');
    expect(await store.dispatch(updateCreateOrRerunCourseQuery({}, true))).toBe(true);
    expect(store.getState().generic.createOrRerunCourse.redirectUrlObj).toEqual({ url: '/home' });
  });

  it('retains a native backend error for the form and reports failure', async () => {
    axiosMock.onPost(getCreateOrRerunCourseUrl()).reply(400, { error: 'Course number already exists' });
    expect(await store.dispatch(updateCreateOrRerunCourseQuery({}))).toBe(false);
    expect(store.getState().generic.savingStatus).toBe(RequestStatus.FAILED);
    expect(store.getState().generic.createOrRerunCourse.postErrors).toEqual({ errMsg: 'Course number already exists' });
  });

  it('keeps the form error when the backend reports err_msg in a successful HTTP response', async () => {
    axiosMock.onPost(getCreateOrRerunCourseUrl()).reply(200, { err_msg: 'Course number already exists' });
    expect(await store.dispatch(updateCreateOrRerunCourseQuery({}))).toBe(false);
    expect(store.getState().generic.savingStatus).toBe(RequestStatus.FAILED);
    expect(store.getState().generic.createOrRerunCourse.postErrors).toEqual({ errMsg: 'Course number already exists' });
  });

  it('refuses an unrelated HTML response instead of hiding the form as a success', async () => {
    axiosMock.onPost(getCreateOrRerunCourseUrl()).reply(200, '<html>Sign in</html>', { location: '/login' });
    expect(await store.dispatch(updateCreateOrRerunCourseQuery({}))).toBe(false);
    expect(store.getState().generic.savingStatus).toBe(RequestStatus.FAILED);
    expect(store.getState().generic.createOrRerunCourse.postErrors.errMsg).toMatch(
      /unexpected course creation response/,
    );
  });
});
