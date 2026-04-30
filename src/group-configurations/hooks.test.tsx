import {
  act,
  renderHook,
  waitFor,
  initializeMocks,
  makeWrapper,
} from '@src/testUtils';

import { getContentStoreApiUrl, getLegacyApiUrl } from './data/api';
import { groupConfigurationResponseMock } from './__mocks__';
import { useGroupConfigurations } from './hooks';
import { AvailableGroup } from './types';

jest.mock('@src/CourseAuthoringContext', () => ({
  ...jest.requireActual('@src/CourseAuthoringContext'),
  useCourseAuthoringContext: jest.fn(() => ({ courseId: 'course-v1:org+101+101' })),
}));

const courseId = 'course-v1:org+101+101';
const mockGroup: AvailableGroup = {
  id: 1,
  name: 'Test Group',
  groups: [],
  scheme: '',
  version: 1,
};
const mockCallback = jest.fn();
let axiosMock;

describe('useGroupConfigurations', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    axiosMock.onGet(getContentStoreApiUrl(courseId)).reply(200, groupConfigurationResponseMock);
  });

  describe('contentGroupActions', () => {
    it('handleCreate calls the create API and invokes the callback on success', async () => {
      axiosMock.onPost(getLegacyApiUrl(courseId, mockGroup.id)).reply(200, mockGroup);
      const { result } = renderHook(() => useGroupConfigurations(), { wrapper: makeWrapper() });

      act(() => {
        void result.current.contentGroupActions.handleCreate(mockGroup, mockCallback);
      });
      await waitFor(() => expect(mockCallback).toHaveBeenCalled());
    });

    it('handleEdit calls the edit API and invokes the callback on success', async () => {
      axiosMock.onPost(getLegacyApiUrl(courseId, mockGroup.id)).reply(200, mockGroup);
      const { result } = renderHook(() => useGroupConfigurations(), { wrapper: makeWrapper() });

      act(() => {
        void result.current.contentGroupActions.handleEdit(mockGroup, mockCallback);
      });
      await waitFor(() => expect(mockCallback).toHaveBeenCalled());
    });

    it('handleDelete calls the delete API', async () => {
      const parentGroupId = 1;
      const groupId = 2;
      axiosMock.onDelete(getLegacyApiUrl(courseId, parentGroupId, groupId)).reply(204);
      const { result } = renderHook(() => useGroupConfigurations(), { wrapper: makeWrapper() });

      act(() => {
        result.current.contentGroupActions.handleDelete(parentGroupId, groupId);
      });
      await waitFor(() => expect(axiosMock.history.delete).toHaveLength(1));
    });
  });

  describe('experimentConfigurationActions', () => {
    it('handleCreate calls the create experiment API and invokes the callback on success', async () => {
      axiosMock.onPost(getLegacyApiUrl(courseId)).reply(200, mockGroup);
      const { result } = renderHook(() => useGroupConfigurations(), { wrapper: makeWrapper() });

      act(() => {
        void result.current.experimentConfigurationActions.handleCreate(mockGroup, mockCallback);
      });
      await waitFor(() => expect(mockCallback).toHaveBeenCalled());
    });

    it('handleEdit calls the edit experiment API and invokes the callback on success', async () => {
      axiosMock.onPost(getLegacyApiUrl(courseId, mockGroup.id)).reply(200, mockGroup);
      const { result } = renderHook(() => useGroupConfigurations(), { wrapper: makeWrapper() });

      act(() => {
        void result.current.experimentConfigurationActions.handleEdit(mockGroup, mockCallback);
      });
      await waitFor(() => expect(mockCallback).toHaveBeenCalled());
    });

    it('handleDelete calls the delete experiment API', async () => {
      const configurationId = 1;
      axiosMock.onDelete(getLegacyApiUrl(courseId, configurationId)).reply(204);
      const { result } = renderHook(() => useGroupConfigurations(), { wrapper: makeWrapper() });

      act(() => {
        result.current.experimentConfigurationActions.handleDelete(configurationId);
      });
      await waitFor(() => expect(axiosMock.history.delete).toHaveLength(1));
    });
  });

  it('sets anyMutationFailed when a mutation fails', async () => {
    // Use handleDelete (which calls mutate, not mutateAsync) so errors don't
    // cause unhandled promise rejections that would fail the test.
    axiosMock.onDelete(getLegacyApiUrl(courseId, 1, 2)).reply(500);
    const { result } = renderHook(() => useGroupConfigurations(), { wrapper: makeWrapper() });

    act(() => {
      result.current.contentGroupActions.handleDelete(1, 2);
    });
    await waitFor(() => expect(result.current.anyMutationFailed).toBe(true));
  });
});
