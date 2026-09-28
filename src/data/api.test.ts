import { initializeMocks } from '../testUtils';
import * as api from './api';

let axiosMock;

describe('legacy libraries migration API', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  describe('getModulestoreMigrationStatus', () => {
    it('should get migration status', async () => {
      const migrationId = '1';
      const url = api.getModulestoreMigrationStatusUrl(migrationId);
      axiosMock.onGet(url).reply(200);
      await api.getModulestoreMigrationStatus(migrationId);

      expect(axiosMock.history.get[0].url).toEqual(url);
    });
  });

  describe('bulkMigrateLegacyLibraries', () => {
    it('should call bulk migrate legacy libraries', async () => {
      const url = api.bulkModulestoreMigrateUrl();
      axiosMock.onPost(url).reply(200);
      await api.bulkModulestoreMigrate({
        sources: [],
        target: '1',
      });

      expect(axiosMock.history.post[0].url).toEqual(url);
    });
  });

  describe('getPreviewModulestoreMigration', () => {
    it('should call get preview modulestore migration', async () => {
      const url = api.getPreviewModulestoreMigrationUrl();
      axiosMock.onGet(url).reply(200);
      await api.getPreviewModulestoreMigration('1', '2');

      expect(axiosMock.history.get[0].url).toEqual(url);
    });
  });
});

describe('course advanced settings API', () => {
  const courseId = 'course-v1:Test+T101+2024';
  // The keys of each setting are camel-cased, but its `value` must be kept as the server sent it.
  const serverData = {
    teams_configuration: {
      display_name: 'Teams Configuration',
      value: { max_team_size: 4, team_sets: [{ user_partition_id: null }] },
    },
  };
  const expected = {
    teamsConfiguration: {
      displayName: 'Teams Configuration',
      value: { max_team_size: 4, team_sets: [{ user_partition_id: null }] },
    },
  };

  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  describe('getCourseAdvancedSettings', () => {
    it('should fetch all the settings when no filter is given', async () => {
      axiosMock.onGet(api.getCourseAdvancedSettingsApiUrl(courseId)).reply(200, serverData);

      const result = await api.getCourseAdvancedSettings(courseId);

      expect(axiosMock.history.get[0].params).toEqual({ fetch_all: 0 });
      expect(result).toEqual(expected);
    });

    it('should fetch only the given settings', async () => {
      axiosMock.onGet(api.getCourseAdvancedSettingsApiUrl(courseId)).reply(200, serverData);

      const result = await api.getCourseAdvancedSettings(courseId, ['teamsConfiguration', 'maxAttempts']);

      expect(axiosMock.history.get[0].params).toEqual({ filter_fields: 'teams_configuration,max_attempts' });
      expect(result).toEqual(expected);
    });
  });

  describe('updateCourseAdvancedSettings', () => {
    it('should update a single setting', async () => {
      axiosMock.onPatch(api.getCourseAdvancedSettingsApiUrl(courseId)).reply(200, serverData);

      const result = await api.updateCourseAdvancedSettings(courseId, {
        teamsConfiguration: { max_team_size: 4 },
      });

      expect(JSON.parse(axiosMock.history.patch[0].data)).toEqual({
        teams_configuration: { value: { max_team_size: 4 } },
      });
      expect(result).toEqual(expected);
    });

    it('should update several settings at once', async () => {
      axiosMock.onPatch(api.getCourseAdvancedSettingsApiUrl(courseId)).reply(200, {});

      await api.updateCourseAdvancedSettings(courseId, { maxAttempts: 3, showCalculator: true });

      expect(JSON.parse(axiosMock.history.patch[0].data)).toEqual({
        max_attempts: { value: 3 },
        show_calculator: { value: true },
      });
    });
  });
});
