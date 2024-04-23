import MockAdapter from 'axios-mock-adapter';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { groupConfigurationResponseMock } from '../__mocks__';
import { getContentStoreApiUrl, getLegacyApiUrl } from './api';
import * as thunkActions from './thunk';
import initializeStore from '../../store';
import { executeThunk } from '../../utils';

let axiosMock;
let store;
const courseId = 'course-v1:org+101+101';

describe('group configurations thunk', () => {
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
    const response = { ...groupConfigurationResponseMock };
    axiosMock.onGet(getContentStoreApiUrl(courseId)).reply(200, response);
    await executeThunk(thunkActions.fetchGroupConfigurationsQuery(courseId), store.dispatch);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('dispatches correct actions on createContentGroupQuery', async () => {
    const mockResponse = { id: 50, name: 'new' };
    axiosMock.onPost(getLegacyApiUrl(courseId)).reply(200, mockResponse);

    await executeThunk(thunkActions.createContentGroupQuery(courseId, {}), store.dispatch);
    const updatedGroup = store.getState()
      .groupConfigurations.groupConfigurations.allGroupConfigurations
      .find(group => group.id === mockResponse.id);
    expect(updatedGroup.name).toEqual(mockResponse.name);
  });
  it('dispatches correct actions on editContentGroupQuery', async () => {
    const mockResponse = { id: 50, name: 'new' };
    axiosMock.onPost(getLegacyApiUrl(courseId)).reply(200, mockResponse);

    await executeThunk(thunkActions.editContentGroupQuery(courseId, {}), store.dispatch);
    const updatedGroup = store.getState()
      .groupConfigurations.groupConfigurations.allGroupConfigurations
      .find(group => group.id === mockResponse.id);
    expect(updatedGroup.name).toEqual(mockResponse.name);
  });
  it('dispatches correct actions on createExperimentConfigurationQuery', async () => {
    const mockResponse = { id: 50, name: 'new' };
    axiosMock.onPost(getLegacyApiUrl(courseId)).reply(200, mockResponse);

    await executeThunk(thunkActions.createExperimentConfigurationQuery(courseId, {}), store.dispatch);
    const updatedGroup = store.getState()
      .groupConfigurations.groupConfigurations.experimentGroupConfigurations
      .find(group => group.id === mockResponse.id);
    expect(updatedGroup.name).toEqual(mockResponse.name);
  });
  it('dispatches correct actions on editExperimentConfigurationQuery', async () => {
    const mockResponse = { id: 50, name: 'new' };
    axiosMock.onPost(getLegacyApiUrl(courseId)).reply(200, mockResponse);

    await executeThunk(thunkActions.editExperimentConfigurationQuery(courseId, {}), store.dispatch);
    const updatedGroup = store.getState()
      .groupConfigurations.groupConfigurations.experimentGroupConfigurations
      .find(group => group.id === mockResponse.id);
    expect(updatedGroup.name).toEqual(mockResponse.name);
  });
  it('dispatches correct actions on deleteContentGroupQuery', async () => {
    const groupToDelete = { id: 6, name: 'deleted' };
    axiosMock.onDelete(getLegacyApiUrl(courseId)).reply(200, {});

    await executeThunk(thunkActions.deleteContentGroupQuery(courseId, groupToDelete.id), store.dispatch);
    const updatedGroup = store.getState()
      .groupConfigurations.groupConfigurations.allGroupConfigurations
      .find(group => group.id === groupToDelete.id);
    expect(updatedGroup).toBeFalsy();
  });
  it('dispatches correct actions on deleteExperimentConfigurationQuery', async () => {
    const groupToDelete = { id: 276408623, name: 'deleted' };
    axiosMock.onDelete(getLegacyApiUrl(courseId)).reply(200, {});
    await executeThunk(thunkActions.deleteExperimentConfigurationQuery(courseId, groupToDelete.id), store.dispatch);
    const updatedGroup = store.getState()
      .groupConfigurations.groupConfigurations.experimentGroupConfigurations
      .find(group => group.id === groupToDelete.id);
    expect(updatedGroup).toBeFalsy();
  });
});
