import MockAdapter from 'axios-mock-adapter';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { renderHook } from '@testing-library/react-hooks';
import { Provider, useDispatch } from 'react-redux';

import { RequestStatus } from '../data/constants';
import initializeStore from '../store';
import { getContentStoreApiUrl } from './data/api';
import {
  createContentGroupQuery,
  createExperimentConfigurationQuery,
  deleteContentGroupQuery,
  deleteExperimentConfigurationQuery,
  editContentGroupQuery,
  editExperimentConfigurationQuery,
} from './data/thunk';
import { groupConfigurationResponseMock } from './__mocks__';
import { useGroupConfigurations } from './hooks';
import { updateSavingStatuses } from './data/slice';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('./data/thunk', () => ({
  ...jest.requireActual('./data/thunk'),
  createContentGroupQuery: jest.fn().mockResolvedValue(true),
  createExperimentConfigurationQuery: jest.fn().mockResolvedValue(true),
  deleteContentGroupQuery: jest.fn().mockResolvedValue(true),
  deleteExperimentConfigurationQuery: jest.fn().mockResolvedValue(true),
  editContentGroupQuery: jest.fn().mockResolvedValue(true),
  editExperimentConfigurationQuery: jest.fn().mockResolvedValue(true),
  getContentStoreApiUrlQuery: jest.fn().mockResolvedValue(true),
}));

let axiosMock;
let store;
const courseId = 'course-v1:org+101+101';
const mockObject = {};
const mockFunc = jest.fn();
let dispatch;

const wrapper = ({ children }) => (
  <Provider store={store}>
    <IntlProvider locale="en">
      {children}
    </IntlProvider>
  </Provider>
);

describe('useGroupConfigurations', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    store = initializeStore();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock
      .onGet(getContentStoreApiUrl(courseId))
      .reply(200, groupConfigurationResponseMock);
    dispatch = jest.fn().mockImplementation(() => Promise.resolve(true));
    useDispatch.mockReturnValue(dispatch);
  });

  it('successfully dispatches handleInternetConnectionFailed', async () => {
    const { result } = renderHook(() => useGroupConfigurations(courseId), { wrapper });
    result.current.handleInternetConnectionFailed();
    expect(dispatch).toHaveBeenCalledWith(updateSavingStatuses({ status: RequestStatus.FAILED }));
  });
  it('successfully dispatches handleCreate for group configuration', async () => {
    const { result } = renderHook(() => useGroupConfigurations(courseId), { wrapper });
    result.current.contentGroupActions.handleCreate(mockObject, mockFunc);
    expect(dispatch).toHaveBeenCalledWith(createContentGroupQuery(courseId, mockObject));
  });
  it('successfully dispatches handleEdit for group configuration', async () => {
    const { result } = renderHook(() => useGroupConfigurations(courseId), { wrapper });
    result.current.contentGroupActions.handleEdit(mockObject, mockFunc);
    expect(dispatch).toHaveBeenCalledWith(editContentGroupQuery(courseId, mockObject));
  });
  it('successfully dispatches handleDelete for group configuration', async () => {
    const { result } = renderHook(() => useGroupConfigurations(courseId), { wrapper });
    result.current.contentGroupActions.handleDelete(1, 1);
    expect(dispatch).toHaveBeenCalledWith(deleteContentGroupQuery(courseId, 1, 1));
  });
  it('successfully dispatches handleCreate for experiment group', async () => {
    const { result } = renderHook(() => useGroupConfigurations(courseId), { wrapper });
    result.current.experimentConfigurationActions.handleCreate(mockObject, mockFunc);
    expect(dispatch).toHaveBeenCalledWith(createExperimentConfigurationQuery(courseId, mockObject));
  });
  it('successfully dispatches handleEdit for experiment group', async () => {
    const { result } = renderHook(() => useGroupConfigurations(courseId), { wrapper });
    result.current.experimentConfigurationActions.handleEdit(mockObject, mockFunc);
    expect(dispatch).toHaveBeenCalledWith(editExperimentConfigurationQuery(courseId, mockObject));
  });
  it('successfully dispatches handleDelete for experiment group', async () => {
    const { result } = renderHook(() => useGroupConfigurations(courseId), { wrapper });
    result.current.experimentConfigurationActions.handleDelete(mockObject, 1);
    expect(dispatch).toHaveBeenCalledWith(deleteExperimentConfigurationQuery(courseId, 1));
  });
});
