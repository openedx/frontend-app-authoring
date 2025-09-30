import { createAxiosError } from '@src/testUtils';

import * as api from './api';

export async function mockGetMigrationStatus(migrationId: string): Promise<api.MigrateTaskStatusData> {
  switch (migrationId) {
    case mockGetMigrationStatus.migrationId:
      return mockGetMigrationStatus.migrationStatusData;
    case mockGetMigrationStatus.migrationIdFailed:
      return mockGetMigrationStatus.migrationStatusFailedData;
    case mockGetMigrationStatus.migrationIdError:
      throw createAxiosError({ code: 500, message: 'Internal Error.', path: api.getMigrationStatusUrl(migrationId) });
    default:
      throw new Error(`mockGetMigrationStatus: unknown migration ID "${migrationId}"`);
  }
}

mockGetMigrationStatus.migrationId = '1';
mockGetMigrationStatus.migrationStatusData = {
  uuid: mockGetMigrationStatus.migrationId,
  state: 'Succeeded',
  stateText: 'Succeeded',
  completedSteps: 9,
  totalSteps: 9,
  attempts: 1,
  created: '',
  modified: '',
  artifacts: [],
  parameters: [
    {
      source: 'legacy-lib-1',
      target: 'lib',
      compositionLevel: 'component',
      repeatHandlingStrategy: 'update',
      preserveUrlSlugs: false,
      targetCollectionSlug: 'coll-1',
      forwardSourceToTarget: true,
    },
  ],
};
mockGetMigrationStatus.migrationIdFailed = '2';
mockGetMigrationStatus.migrationStatusFailedData = {
  uuid: mockGetMigrationStatus.migrationId,
  state: 'Failed',
  stateText: 'Failed',
  completedSteps: 9,
  totalSteps: 9,
  attempts: 1,
  created: '',
  modified: '',
  artifacts: [],
  parameters: [
    {
      source: 'legacy-lib-1',
      target: 'lib',
      compositionLevel: 'component',
      repeatHandlingStrategy: 'update',
      preserveUrlSlugs: false,
      targetCollectionSlug: 'coll-1',
      forwardSourceToTarget: true,
    },
  ],
};
mockGetMigrationStatus.migrationIdError = '3';
mockGetMigrationStatus.applyMock = () => jest.spyOn(api, 'getMigrationStatus').mockImplementation(mockGetMigrationStatus);
