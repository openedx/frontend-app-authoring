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
    case mockGetMigrationStatus.migrationIdLoading:
      return new Promise(() => {});
    case mockGetMigrationStatus.migrationIdInProgress:
      return mockGetMigrationStatus.migrationStatusInProgressData;
    case mockGetMigrationStatus.migrationIdPartial:
      return mockGetMigrationStatus.migrationStatusPartialData;
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
      id: 1,
      source: 'legacy-lib-1',
      target: 'lib',
      compositionLevel: 'component',
      repeatHandlingStrategy: 'update',
      preserveUrlSlugs: false,
      targetCollectionSlug: 'coll-1',
      forwardSourceToTarget: true,
      isFailed: false,
      targetCollection: {
        key: 'coll',
        title: 'Test Collection',
      },
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
      id: 1,
      source: 'legacy-lib-1',
      target: 'lib',
      compositionLevel: 'component',
      repeatHandlingStrategy: 'update',
      preserveUrlSlugs: false,
      targetCollectionSlug: 'coll-1',
      forwardSourceToTarget: true,
      isFailed: true,
      targetCollection: null,
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
      id: 1,
      source: 'legacy-lib-1',
      target: 'lib',
      compositionLevel: 'component',
      repeatHandlingStrategy: 'update',
      preserveUrlSlugs: false,
      targetCollectionSlug: 'coll-1',
      forwardSourceToTarget: true,
      isFailed: true,
      targetCollection: null,
    },
    {
      id: 2,
      source: 'legacy-lib-2',
      target: 'lib',
      compositionLevel: 'component',
      repeatHandlingStrategy: 'update',
      preserveUrlSlugs: false,
      targetCollectionSlug: 'coll-1',
      forwardSourceToTarget: true,
      isFailed: true,
      targetCollection: null,
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
      id: 1,
      source: 'legacy-lib-1',
      target: 'lib',
      compositionLevel: 'component',
      repeatHandlingStrategy: 'update',
      preserveUrlSlugs: false,
      targetCollectionSlug: 'coll-1',
      forwardSourceToTarget: true,
      isFailed: true,
      targetCollection: null,
    },
    {
      id: 2,
      source: 'legacy-lib-2',
      target: 'lib',
      compositionLevel: 'component',
      repeatHandlingStrategy: 'update',
      preserveUrlSlugs: false,
      targetCollectionSlug: 'coll-1',
      forwardSourceToTarget: true,
      isFailed: false,
      targetCollection: null,
    },
  ],
} as api.MigrateTaskStatusData;
mockGetMigrationStatus.migrationIdLoading = '5';
mockGetMigrationStatus.migrationIdInProgress = '6';
mockGetMigrationStatus.migrationStatusInProgressData = {
  uuid: mockGetMigrationStatus.migrationIdInProgress,
  state: 'In Progress',
  stateText: 'In Progress',
  completedSteps: 3,
  totalSteps: 9,
  attempts: 1,
  created: '',
  modified: '',
  artifacts: [],
  parameters: [
    {
      id: 1,
      source: 'legacy-lib-1',
      target: 'lib',
      compositionLevel: 'component',
      repeatHandlingStrategy: 'update',
      preserveUrlSlugs: false,
      targetCollectionSlug: 'coll-1',
      forwardSourceToTarget: true,
      isFailed: false,
      targetCollection: null,
    },
  ],
} as api.MigrateTaskStatusData;
mockGetMigrationStatus.migrationIdPartial = '7';
mockGetMigrationStatus.migrationStatusPartialData = {
  uuid: mockGetMigrationStatus.migrationIdPartial,
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
      id: 1,
      source: 'legacy-lib-1',
      target: 'lib',
      compositionLevel: 'component',
      repeatHandlingStrategy: 'update',
      preserveUrlSlugs: false,
      targetCollectionSlug: 'coll-1',
      forwardSourceToTarget: true,
      isFailed: false,
      targetCollection: {
        key: 'coll',
        title: 'Test Collection',
      },
    },
  ],
} as api.MigrateTaskStatusData;
mockGetMigrationStatus.applyMock = () => jest.spyOn(api, 'getModulestoreMigrationStatus').mockImplementation(mockGetMigrationStatus);
