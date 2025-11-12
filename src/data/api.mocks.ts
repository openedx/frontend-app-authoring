import * as api from './api';

export async function mockGetMigrationStatus(migrationId: string): Promise<api.MigrateTaskStatusData> {
  switch (migrationId) {
    case mockGetMigrationStatus.migrationId:
      return mockGetMigrationStatus.migrationStatusData;
    case mockGetMigrationStatus.migrationIdFailed:
      return mockGetMigrationStatus.migrationStatusFailedData;
    case mockGetMigrationStatus.migrationIdMultiple:
      return mockGetMigrationStatus.migrationStatusFailedMultipleData;
    case mockGetMigrationStatus.migrationIdOneLibrary:
      return mockGetMigrationStatus.migrationStatusFailedOneLibraryData;
    default:
      /* istanbul ignore next */
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
      isFailed: false,
    },
  ],
} as api.MigrateTaskStatusData;
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
      isFailed: true,
    },
  ],
} as api.MigrateTaskStatusData;
mockGetMigrationStatus.migrationIdMultiple = '3';
mockGetMigrationStatus.migrationStatusFailedMultipleData = {
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
      isFailed: true,
    },
    {
      source: 'legacy-lib-2',
      target: 'lib',
      compositionLevel: 'component',
      repeatHandlingStrategy: 'update',
      preserveUrlSlugs: false,
      targetCollectionSlug: 'coll-1',
      forwardSourceToTarget: true,
      isFailed: true,
    },
  ],
} as api.MigrateTaskStatusData;
mockGetMigrationStatus.migrationIdOneLibrary = '4';
mockGetMigrationStatus.migrationStatusFailedOneLibraryData = {
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
      isFailed: true,
    },
    {
      source: 'legacy-lib-2',
      target: 'lib',
      compositionLevel: 'component',
      repeatHandlingStrategy: 'update',
      preserveUrlSlugs: false,
      targetCollectionSlug: 'coll-1',
      forwardSourceToTarget: true,
      isFailed: false,
    },
  ],
} as api.MigrateTaskStatusData;
mockGetMigrationStatus.applyMock = () => jest.spyOn(api, 'getMigrationStatus').mockImplementation(mockGetMigrationStatus);
