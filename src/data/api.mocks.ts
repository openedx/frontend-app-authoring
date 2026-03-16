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
mockGetMigrationStatus.applyMock = () => jest.spyOn(api, 'getModulestoreMigrationStatus').mockImplementation(mockGetMigrationStatus);

export async function mockGetPreviewModulestoreMigration(
  _: string,
  sourceKey: string,
): Promise<api.PreviewMigrationInfo> {
  switch (sourceKey) {
    case mockGetPreviewModulestoreMigration.sourceKeyGood:
      return mockGetPreviewModulestoreMigration.goodData;
    case mockGetPreviewModulestoreMigration.sourceKeyUnsupported:
      return mockGetPreviewModulestoreMigration.unsupportedData;
    case mockGetPreviewModulestoreMigration.sourceKeyBlockLimit:
      return mockGetPreviewModulestoreMigration.blockLimitData;
    case mockGetPreviewModulestoreMigration.sourceKeyBlockLoading:
      return new Promise(() => {});
    default:
      /* istanbul ignore next */
      throw new Error(`mockGetPreviewModulestoreMigration: unknown sourceKey "${sourceKey}"`);
  }
}
mockGetPreviewModulestoreMigration.sourceKeyGood = 'course-v1:HarvardX+123+2023';
mockGetPreviewModulestoreMigration.goodData = {
  state: 'success',
  unsupportedBlocks: 0,
  unsupportedPercentage: 0,
  blocksLimit: 1000,
  totalBlocks: 10,
  totalComponents: 5,
  sections: 1,
  subsections: 2,
  units: 3,
} as api.PreviewMigrationInfo;
mockGetPreviewModulestoreMigration.sourceKeyUnsupported = 'course-v1:HarvardX+2+2023';
mockGetPreviewModulestoreMigration.unsupportedData = {
  state: 'partial',
  unsupportedBlocks: 5,
  unsupportedPercentage: 25,
  blocksLimit: 1000,
  totalBlocks: 20,
  totalComponents: 10,
  sections: 2,
  subsections: 3,
  units: 5,
} as api.PreviewMigrationInfo;
mockGetPreviewModulestoreMigration.sourceKeyBlockLimit = 'course-v1:HarvardX+3+2023';
mockGetPreviewModulestoreMigration.blockLimitData = {
  state: 'block_limit_reached',
  unsupportedBlocks: 5,
  unsupportedPercentage: 25,
  blocksLimit: 1000,
  totalBlocks: 20,
  totalComponents: 10,
  sections: 2,
  subsections: 3,
  units: 5,
} as api.PreviewMigrationInfo;
mockGetPreviewModulestoreMigration.sourceKeyBlockLoading = 'course-v1:HarvardX+4+2023';
mockGetPreviewModulestoreMigration.applyMock = () => jest.spyOn(api, 'getPreviewModulestoreMigration').mockImplementation(mockGetPreviewModulestoreMigration);
