import MockAdapter from 'axios-mock-adapter';
import { camelCaseObject, initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { paginatedListPage } from '@src/generic/data/paginatedList';

import { courseSettingsMock, groupConfigurationResponseMock, groupConfigurationsListMock } from '../__mocks__';
import { initialContentGroupObject } from '../content-groups-section/utils';
import { initialExperimentConfiguration } from '../experiment-configurations-section/constants';
import {
  createContentGroup,
  createExperimentConfiguration,
  deleteContentGroup,
  editContentGroup,
  getCourseSettingsApiUrl,
  getGroupConfigurations,
  getGroupConfigurationsApiUrl,
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

  describe('getGroupConfigurations', () => {
    const mockList = (configurations, settings = courseSettingsMock) => {
      axiosMock.onGet(getGroupConfigurationsApiUrl(courseId)).reply(200, paginatedListPage(configurations));
      axiosMock.onGet(getCourseSettingsApiUrl(courseId)).reply(200, settings);
    };

    it('should fetch group configurations', async () => {
      mockList(groupConfigurationsListMock());

      const result = await getGroupConfigurations(courseId);

      expect(axiosMock.history.get.map(({ url }) => url).sort()).toEqual([
        'http://localhost:18010/api/authoring/v2/courses/course-v1:org+101+101/group_configurations/',
        'http://localhost:18010/api/authoring/v2/courses/course-v1:org+101+101/settings/',
      ]);
      expect(result).toEqual(groupConfigurationResponseMock);
    });

    it('should ask for the full view, which includes usage', async () => {
      mockList(groupConfigurationsListMock());

      await getGroupConfigurations(courseId);

      const listRequest = axiosMock.history.get.find(({ url }) => url === getGroupConfigurationsApiUrl(courseId));
      expect(listRequest.params).toEqual({ view: 'full', page: 1, page_size: 100 });
    });

    it('should return the configurations of every page, in order', async () => {
      const configurations = groupConfigurationsListMock();
      axiosMock
        .onGet(getGroupConfigurationsApiUrl(courseId), { params: { view: 'full', page: 1, page_size: 100 } })
        .reply(200, paginatedListPage(configurations.slice(0, 3), { page: 1, numPages: 2 }))
        .onGet(getGroupConfigurationsApiUrl(courseId), { params: { view: 'full', page: 2, page_size: 100 } })
        .reply(200, paginatedListPage(configurations.slice(3), { page: 2, numPages: 2 }))
        .onGet(getCourseSettingsApiUrl(courseId))
        .reply(200, courseSettingsMock);

      const result = await getGroupConfigurations(courseId);

      expect(result).toEqual(groupConfigurationResponseMock);
    });

    it('should tell experiment configurations apart by their random scheme', async () => {
      const [enrollmentTrack, contentGroups, team, experimentA, experimentB] = groupConfigurationsListMock();
      mockList([experimentA, enrollmentTrack, contentGroups, experimentB, team]);

      const result = await getGroupConfigurations(courseId);

      expect(result.allGroupConfigurations.map(({ id }) => id)).toEqual(
        [enrollmentTrack.id, contentGroups.id, team.id],
      );
      expect(result.experimentGroupConfigurations.map(({ id }) => id)).toEqual([experimentA.id, experimentB.id]);
    });

    it('should show the enrollment track only when its configuration is listed', async () => {
      mockList(groupConfigurationsListMock().filter(({ scheme }) => scheme !== 'enrollment_track'));

      const result = await getGroupConfigurations(courseId);

      expect(result.shouldShowEnrollmentTrack).toBe(false);
      expect(result.allGroupConfigurations.map(({ scheme }) => scheme)).toEqual(['cohort', 'team']);
    });

    it('should read the experiments flag and proctored exam settings link from the course settings', async () => {
      const proctoredExamSettingsUrl = '/course/course-v1:org+101+101/pages-and-resources/proctoring/settings';
      mockList(
        groupConfigurationsListMock().filter(({ scheme }) => scheme !== 'random'),
        {
          ...courseSettingsMock,
          content_experiments_enabled: false,
          mfe_proctored_exam_settings_url: proctoredExamSettingsUrl,
        },
      );

      const result = await getGroupConfigurations(courseId);

      expect(result.shouldShowExperimentGroups).toBe(false);
      expect(result.experimentGroupConfigurations).toEqual([]);
      expect(result.mfeProctoredExamSettingsUrl).toEqual(proctoredExamSettingsUrl);
    });

    it('should leave out whether the user may manage each configuration', async () => {
      mockList(groupConfigurationsListMock(false));

      const result = await getGroupConfigurations(courseId);

      [...result.allGroupConfigurations, ...result.experimentGroupConfigurations].forEach((configuration) => {
        expect(configuration).not.toHaveProperty('canManage');
      });
    });

    it('should convert the server\'s snake_case keys', async () => {
      mockList(groupConfigurationsListMock());

      const result = await getGroupConfigurations(courseId);

      const [enrollmentTrack, contentGroups, team] = result.allGroupConfigurations;
      expect(enrollmentTrack.readOnly).toBe(true);
      expect(enrollmentTrack.parameters).toEqual({ courseId: 'course-v1:org+101+101' });
      expect(contentGroups.readOnly).toBe(false);
      expect(team.parameters).toHaveProperty('teamSetId');
    });

    it('should fail when the user may not view the group configurations', async () => {
      axiosMock.onGet(getGroupConfigurationsApiUrl(courseId)).reply(403, {
        type: 'https://docs.openedx.org/errors/authz',
        title: 'Forbidden',
        status: 403,
        detail: 'You do not have permission to perform this action.',
        instance: '/api/authoring/v2/courses/course-v1:org+101+101/group_configurations/',
      });
      axiosMock.onGet(getCourseSettingsApiUrl(courseId)).reply(200, courseSettingsMock);

      await expect(getGroupConfigurations(courseId)).rejects.toHaveProperty('response.status', 403);
    });
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
    const updatedContentGroups = {
      ...contentGroups,
      groups: contentGroups.groups.filter((group) => group.id !== groupId),
    };

    axiosMock
      .onDelete(
        getLegacyApiUrl(courseId, parentGroupId, groupId),
      )
      .reply(200, {});

    await deleteContentGroup(courseId, parentGroupId, groupId);

    expect(axiosMock.history.delete[0].url).toEqual(
      getLegacyApiUrl(courseId, updatedContentGroups.id, groupId),
    );
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
