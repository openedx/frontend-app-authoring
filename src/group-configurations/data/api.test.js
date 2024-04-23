import MockAdapter from 'axios-mock-adapter';
import { camelCaseObject, initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { groupConfigurationResponseMock } from '../__mocks__';
import { initialContentGroupObject } from '../content-groups-section/utils';
import { initialExperimentConfiguration } from '../experiment-configurations-section/constants';
import {
  createContentGroup,
  createExperimentConfiguration,
  deleteContentGroup,
  editContentGroup,
  getContentStoreApiUrl,
  getGroupConfigurations,
  getLegacyApiUrl,
} from './api';

let axiosMock;
const courseId = 'course-v1:org+101+101';
const contentGroups = groupConfigurationResponseMock.allGroupConfigurations[1];
const experimentConfigurations = groupConfigurationResponseMock.experimentGroupConfigurations;

describe('group configurations API calls', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch group configurations', async () => {
    const response = { ...groupConfigurationResponseMock };
    axiosMock.onGet(getContentStoreApiUrl(courseId)).reply(200, response);

    const result = await getGroupConfigurations(courseId);
    const expected = camelCaseObject(response);

    expect(axiosMock.history.get[0].url).toEqual(
      getContentStoreApiUrl(courseId),
    );
    expect(result).toEqual(expected);
  });

  it('should create content group', async () => {
    const response = { ...groupConfigurationResponseMock };
    const newContentGroupName = 'content-group-test';
    const updatedContentGroups = {
      ...contentGroups,
      groups: [
        ...contentGroups.groups,
        initialContentGroupObject(newContentGroupName),
      ],
    };

    response.allGroupConfigurations[1] = updatedContentGroups;
    axiosMock
      .onPost(getLegacyApiUrl(courseId, contentGroups.id), updatedContentGroups)
      .reply(200, response);

    const result = await createContentGroup(courseId, updatedContentGroups);
    const expected = camelCaseObject(response);

    expect(axiosMock.history.post[0].url).toEqual(
      getLegacyApiUrl(courseId, updatedContentGroups.id),
    );
    expect(result).toEqual(expected);
  });

  it('should edit content group', async () => {
    const editedName = 'content-group-edited';
    const groupId = contentGroups.groups[0].id;
    const response = { ...groupConfigurationResponseMock };
    const editedContentGroups = {
      ...contentGroups,
      groups: contentGroups.groups.map((group) => (group.id === groupId ? { ...group, name: editedName } : group)),
    };

    response.allGroupConfigurations[1] = editedContentGroups;
    axiosMock
      .onPost(getLegacyApiUrl(courseId, contentGroups.id), editedContentGroups)
      .reply(200, response);

    const result = await editContentGroup(courseId, editedContentGroups);
    const expected = camelCaseObject(response);

    expect(axiosMock.history.post[0].url).toEqual(
      getLegacyApiUrl(courseId, editedContentGroups.id),
    );
    expect(result).toEqual(expected);
  });

  it('should delete content group', async () => {
    const parentGroupId = contentGroups.id;
    const groupId = contentGroups.groups[0].id;
    const response = { ...groupConfigurationResponseMock };
    const updatedContentGroups = {
      ...contentGroups,
      groups: contentGroups.groups.filter((group) => group.id !== groupId),
    };

    response.allGroupConfigurations[1] = updatedContentGroups;
    axiosMock
      .onDelete(
        getLegacyApiUrl(courseId, parentGroupId, groupId),
        updatedContentGroups,
      )
      .reply(200, response);

    const result = await deleteContentGroup(courseId, parentGroupId, groupId);
    const expected = camelCaseObject(response);

    expect(axiosMock.history.delete[0].url).toEqual(
      getLegacyApiUrl(courseId, updatedContentGroups.id, groupId),
    );
    expect(result).toEqual(expected);
  });

  it('should create experiment configurations', async () => {
    const newConfigurationName = 'experiment-configuration-test';
    const response = { ...groupConfigurationResponseMock };
    const updatedConfigurations = [
      ...experimentConfigurations,
      { ...initialExperimentConfiguration, name: newConfigurationName },
    ];

    response.experimentGroupConfigurations = updatedConfigurations;
    axiosMock
      .onPost(getLegacyApiUrl(courseId), updatedConfigurations)
      .reply(200, response);

    const result = await createExperimentConfiguration(
      courseId,
      updatedConfigurations,
    );
    const expected = camelCaseObject(response);

    expect(axiosMock.history.post[0].url).toEqual(getLegacyApiUrl(courseId));
    expect(result).toEqual(expected);
  });
});
