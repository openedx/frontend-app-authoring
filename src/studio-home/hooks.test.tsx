import { act, renderHook, waitFor } from '@testing-library/react';
import { initializeMocks, makeWrapper } from '@src/testUtils';
import { RequestStatus } from '@src/data/constants';
import { updateSavingStatus } from '@src/generic/data/slice';
import studioHomeMock from './__mocks__/studioHomeMock';
import { getStudioHomeApiUrl } from './data/api';
import { useStudioHome } from './hooks';

describe('native Studio create form completion', () => {
  it.each([RequestStatus.SUCCESSFUL, RequestStatus.FAILED])(
    'refreshes and closes the form only on successful creation (%s)',
    async (status) => {
      const { reduxStore, axiosMock } = initializeMocks();
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);
      const view = renderHook(() => useStudioHome(), { wrapper: makeWrapper() });
      await waitFor(() => expect(view.result.current.isLoadingPage).toBe(false));
      act(() => view.result.current.setShowNewCourseContainer(true));
      expect(view.result.current.showNewCourseContainer).toBe(true);
      const requestsBefore = axiosMock.history.get.length;
      await act(async () => {
        reduxStore.dispatch(updateSavingStatus({ status }));
      });
      expect(view.result.current.showNewCourseContainer).toBe(status !== RequestStatus.SUCCESSFUL);
      expect(reduxStore.getState().generic.savingStatus).toBe('');
      expect(axiosMock.history.get).toHaveLength(requestsBefore + (status === RequestStatus.SUCCESSFUL ? 2 : 0));
    },
  );
});
