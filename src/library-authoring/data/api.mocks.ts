/* istanbul ignore file */
import { camelCaseObject } from '@edx/frontend-platform';

import { mockContentTaxonomyTagsData } from '@src/content-tags-drawer/data/api.mocks';
import { ContainerType, getBlockType } from '@src/generic/key-utils';
import { createAxiosError } from '@src/testUtils';
import downstreamLinkInfo from '@src/search-manager/data/__mocks__/downstream-links.json';
import * as courseLibApi from '@src/course-libraries/data/api';

import contentLibrariesListV2 from '../__mocks__/contentLibrariesListV2';
import * as api from './api';

/**
 * Mock for `getContentLibraryV2List()`
 */
export const mockGetContentLibraryV2List = {
  applyMock: () => jest.spyOn(api, 'getContentLibraryV2List').mockResolvedValue(
    camelCaseObject(contentLibrariesListV2),
  ),
  applyMockNoPagination: () => jest.spyOn(api, 'getContentLibraryV2List').mockResolvedValue(
    camelCaseObject(contentLibrariesListV2.results),
  ),
  applyMockNoPaginationEmpty: () => jest.spyOn(api, 'getContentLibraryV2List').mockResolvedValue([] as api.ContentLibrary[]),
  applyMockError: () => jest.spyOn(api, 'getContentLibraryV2List').mockRejectedValue(
    createAxiosError({ code: 500, message: 'Internal Error.', path: api.getContentLibraryV2ListApiUrl() }),
  ),
  applyMockLoading: () => jest.spyOn(api, 'getContentLibraryV2List').mockResolvedValue(
    new Promise(() => {}),
  ),
  applyMockEmpty: () => jest.spyOn(api, 'getContentLibraryV2List').mockResolvedValue({
    next: null,
    previous: null,
    count: 0,
    numPages: 1,
    currentPage: 1,
    start: 0,
    results: [],
  }),
};

export const mockGetModulestoreMigratedBlocksInfo = {
  applyMockSuccess: () => jest.spyOn(api, 'getModulestoreMigrationBlocksInfo').mockResolvedValue(
    [
      {
        sourceKey: 'block-v1:UNIX+UX2+2025_T2+type@chapter+block@1',
        targetKey: '1',
        unsupportedReason: undefined,
      },
      {
        sourceKey: 'block-v1:UNIX+UX2+2025_T2+type@sequential+block@2',
        targetKey: '2',
        unsupportedReason: undefined,
      },
      {
        sourceKey: 'block-v1:UNIX+UX2+2025_T2+type@vertical+block@2',
        targetKey: '3',
        unsupportedReason: undefined,
      },
      {
        sourceKey: 'block-v1:UNIX+UX2+2025_T2+type@html+block@3',
        targetKey: '4',
        unsupportedReason: undefined,
      },
    ],
  ),
  applyMockPartial: () => jest.spyOn(api, 'getModulestoreMigrationBlocksInfo').mockResolvedValue(
    [
      {
        sourceKey: 'block-v1:UNIX+UX2+2025_T2+type@library_content+block@test_lib_content',
        targetKey: null,
        unsupportedReason: 'The "library_content" XBlock (ID: "test_lib_content") has children, so it is not supported in content libraries. It has 2 children blocks.',
      },
      {
        sourceKey: 'block-v1:UNIX+UX2+2025_T2+type@html+block@1',
        targetKey: '1',
        unsupportedReason: undefined,
      },
      {
        sourceKey: 'block-v1:UNIX+UX2+2025_T2+type@chapter+block@1',
        targetKey: '2',
        unsupportedReason: undefined,
      },
    ],
  ),
};

/**
 * Mock for `getContentLibrary()`
 *
 * This mock returns different data/responses depending on the ID of the library
 * that you request.
 */
export async function mockContentLibrary(libraryId: string): Promise<api.ContentLibrary> {
  // This mock has many different behaviors, depending on the library ID:
  switch (libraryId) {
    case mockContentLibrary.libraryIdThatNeverLoads:
      // Return a promise that never resolves, to simulate never loading:
      return new Promise<any>(() => {});
    case mockContentLibrary.library404:
      throw createAxiosError({ code: 400, message: 'Not found.', path: api.getContentLibraryApiUrl(libraryId) });
    case mockContentLibrary.library500:
      throw createAxiosError({ code: 500, message: 'Internal Error.', path: api.getContentLibraryApiUrl(libraryId) });
    case mockContentLibrary.libraryId:
      return mockContentLibrary.libraryData;
    case mockContentLibrary.libraryId2:
      return { ...mockContentLibrary.libraryData, id: mockContentLibrary.libraryId2, slug: 'TEST2' };
    case mockContentLibrary.libraryIdReadOnly:
      return {
        ...mockContentLibrary.libraryData,
        id: mockContentLibrary.libraryIdReadOnly,
        slug: 'readOnly',
        allowPublicRead: true,
        canEditLibrary: false,
      };
    case mockContentLibrary.libraryDraftWithoutUser:
      return {
        ...mockContentLibrary.libraryData,
        id: mockContentLibrary.libraryDraftWithoutUser,
        slug: 'draftNoUser',
        lastDraftCreatedBy: null,
      };
    case mockContentLibrary.libraryNoDraftDate:
      return {
        ...mockContentLibrary.libraryData,
        id: mockContentLibrary.libraryNoDraftDate,
        slug: 'noDraftDate',
        lastDraftCreated: null,
      };
    case mockContentLibrary.libraryNoDraftNoCrateDate:
      return {
        ...mockContentLibrary.libraryData,
        id: mockContentLibrary.libraryNoDraftNoCrateDate,
        slug: 'noDraftNoCreateDate',
        lastDraftCreated: null,
        created: null,
      };
    case mockContentLibrary.libraryUnpublishedChanges:
      return {
        ...mockContentLibrary.libraryData,
        id: mockContentLibrary.libraryUnpublishedChanges,
        slug: 'unpublishedChanges',
        lastPublished: '2024-07-26T16:37:42Z',
        hasUnpublishedChanges: true,
      };
    case mockContentLibrary.libraryPublished:
      return {
        ...mockContentLibrary.libraryData,
        id: mockContentLibrary.libraryPublished,
        slug: 'published',
        lastPublished: '2024-07-26T16:37:42Z',
        hasUnpublishedChanges: false,
        publishedBy: 'staff',
      };
    case mockContentLibrary.libraryPublishedWithoutUser:
      return {
        ...mockContentLibrary.libraryData,
        id: mockContentLibrary.libraryPublishedWithoutUser,
        slug: 'publishedWithUser',
        lastPublished: '2024-07-26T16:37:42Z',
        hasUnpublishedChanges: false,
        publishedBy: null,
      };
    case mockContentLibrary.libraryDraftWithoutChanges:
      return {
        ...mockContentLibrary.libraryData,
        id: mockContentLibrary.libraryDraftWithoutChanges,
        slug: 'draftNoChanges',
        numBlocks: 0,
      };
    case mockContentLibrary.libraryFromList:
      return {
        ...mockContentLibrary.libraryData,
        id: mockContentLibrary.libraryFromList,
        slug: 'TL1',
        org: 'SampleTaxonomyOrg1',
        title: 'Test Library 1',
      };
    default:
      throw new Error(`mockContentLibrary: unknown library ID "${libraryId}"`);
  }
}
mockContentLibrary.libraryId = 'lib:Axim:TEST';
mockContentLibrary.libraryData = {
  // This is captured from a real API response:
  id: mockContentLibrary.libraryId,
  type: 'complex', // 'type' is a deprecated field; don't use it.
  org: 'Axim',
  slug: 'TEST',
  title: 'Test Library',
  description: 'A library for testing',
  numBlocks: 10,
  version: 18,
  lastPublished: null, // or e.g. '2024-08-30T16:37:42Z',
  publishedBy: null, // or e.g. 'test_author',
  lastDraftCreated: '2024-07-22T21:37:49Z',
  lastDraftCreatedBy: 'staff',
  allowLti: false,
  allowPublicLearning: false,
  allowPublicRead: false,
  hasUnpublishedChanges: true,
  hasUnpublishedDeletes: false,
  license: '',
  canEditLibrary: true,
  created: '2024-06-26T14:19:59Z',
  updated: '2024-07-20T17:36:51Z',
} satisfies api.ContentLibrary;
mockContentLibrary.libraryId2 = 'lib:Axim:TEST2';
mockContentLibrary.libraryIdReadOnly = 'lib:Axim:readOnly';
mockContentLibrary.libraryIdThatNeverLoads = 'lib:Axim:infiniteLoading';
mockContentLibrary.library404 = 'lib:Axim:error404';
mockContentLibrary.library500 = 'lib:Axim:error500';
mockContentLibrary.libraryDraftWithoutUser = 'lib:Axim:draftNoUser';
mockContentLibrary.libraryNoDraftDate = 'lib:Axim:noDraftDate';
mockContentLibrary.libraryNoDraftNoCrateDate = 'lib:Axim:noDraftNoCreateDate';
mockContentLibrary.libraryUnpublishedChanges = 'lib:Axim:unpublishedChanges';
mockContentLibrary.libraryPublished = 'lib:Axim:published';
mockContentLibrary.libraryPublishedWithoutUser = 'lib:Axim:publishedWithoutUser';
mockContentLibrary.libraryDraftWithoutChanges = 'lib:Axim:draftNoChanges';
mockContentLibrary.libraryFromList = 'lib:SampleTaxonomyOrg1:TL1';
mockContentLibrary.applyMock = () => jest.spyOn(api, 'getContentLibrary').mockImplementation(mockContentLibrary);

/**
 * Mock for `createLibraryBlock()`
 */
export async function mockCreateLibraryBlock(
  args: api.CreateBlockDataRequest,
): ReturnType<typeof api.createLibraryBlock> {
  if (args.libraryId === mockContentLibrary.libraryId) {
    switch (args.blockType) {
      case 'html': return mockCreateLibraryBlock.newHtmlData;
      case 'problem': return mockCreateLibraryBlock.newProblemData;
      case 'video': return mockCreateLibraryBlock.newVideoData;
      default:
        // Continue to error handling below.
    }
  }
  throw new Error(`mockCreateLibraryBlock doesn't know how to mock ${JSON.stringify(args)}`);
}
mockCreateLibraryBlock.newHtmlData = {
  id: 'lb:Axim:TEST:html:123',
  blockType: 'html',
  displayName: 'New Text Component',
  publishedDisplayName: null,
  hasUnpublishedChanges: true,
  lastPublished: null, // or e.g. '2024-08-30T16:37:42Z',
  publishedBy: null, // or e.g. 'test_author',
  lastDraftCreated: '2024-07-22T21:37:49Z',
  lastDraftCreatedBy: null,
  created: '2024-07-22T21:37:49Z',
  modified: '2024-07-22T21:37:49Z',
  tagsCount: 0,
  collections: [],
} satisfies api.LibraryBlockMetadata;
mockCreateLibraryBlock.newProblemData = {
  id: 'lb:Axim:TEST:problem:prob1',
  blockType: 'problem',
  displayName: 'New Problem',
  publishedDisplayName: null,
  hasUnpublishedChanges: true,
  lastPublished: null, // or e.g. '2024-08-30T16:37:42Z',
  publishedBy: null, // or e.g. 'test_author',
  lastDraftCreated: '2024-07-22T21:37:49Z',
  lastDraftCreatedBy: null,
  created: '2024-07-22T21:37:49Z',
  modified: '2024-07-22T21:37:49Z',
  tagsCount: 0,
  collections: [],
} satisfies api.LibraryBlockMetadata;
mockCreateLibraryBlock.newVideoData = {
  id: 'lb:Axim:TEST:video:vid1',
  blockType: 'video',
  displayName: 'New Video',
  publishedDisplayName: null,
  hasUnpublishedChanges: true,
  lastPublished: null, // or e.g. '2024-08-30T16:37:42Z',
  publishedBy: null, // or e.g. 'test_author',
  lastDraftCreated: '2024-07-22T21:37:49Z',
  lastDraftCreatedBy: null,
  created: '2024-07-22T21:37:49Z',
  modified: '2024-07-22T21:37:49Z',
  tagsCount: 0,
  collections: [],
} satisfies api.LibraryBlockMetadata;
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockCreateLibraryBlock.applyMock = () => (
  jest.spyOn(api, 'createLibraryBlock').mockImplementation(mockCreateLibraryBlock)
);

/**
 * Mock for `deleteLibraryBlock()`
 */
export async function mockDeleteLibraryBlock(): ReturnType<typeof api.deleteLibraryBlock> {
  // no-op
}
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockDeleteLibraryBlock.applyMock = () => (
  jest.spyOn(api, 'deleteLibraryBlock').mockImplementation(mockDeleteLibraryBlock)
);

/**
 * Mock for `restoreLibraryBlock()`
 */
export async function mockRestoreLibraryBlock(): ReturnType<typeof api.restoreLibraryBlock> {
  // no-op
}
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockRestoreLibraryBlock.applyMock = () => (
  jest.spyOn(api, 'restoreLibraryBlock').mockImplementation(mockRestoreLibraryBlock)
);

/**
 * Mock for `deleteContainer()`
 */
export async function mockDeleteContainer(): ReturnType<typeof api.deleteContainer> {
  // no-op
}
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockDeleteContainer.applyMock = () => (
  jest.spyOn(api, 'deleteContainer').mockImplementation(mockDeleteContainer)
);

/**
 * Mock for `restoreContainer()`
 */
export async function mockRestoreContainer(): ReturnType<typeof api.restoreContainer> {
  // no-op
}
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockRestoreContainer.applyMock = () => (
  jest.spyOn(api, 'restoreContainer').mockImplementation(mockRestoreContainer)
);

/**
 * Mock for `getXBlockFields()`
 *
 * This mock returns different data/responses depending on the ID of the block
 * that you request. Use `mockXBlockFields.applyMock()` to apply it to the whole
 * test suite.
 */
export async function mockXBlockFields(usageKey: string): Promise<api.XBlockFields> {
  const thisMock = mockXBlockFields;
  switch (usageKey) {
    case thisMock.usageKeyHtml: return thisMock.dataHtml;
    case thisMock.usageKeyNewHtml: return thisMock.dataNewHtml;
    case thisMock.usageKeyNewProblem: return thisMock.dataNewProblem;
    case thisMock.usageKeyNewVideo: return thisMock.dataNewVideo;
    case thisMock.usageKeyThirdParty: return thisMock.dataThirdParty;
    case thisMock.usageKey0: return thisMock.dataHtml0;
    default: throw new Error(`No mock has been set up for usageKey "${usageKey}"`);
  }
}
// Mock of a "regular" HTML (Text) block:
mockXBlockFields.usageKeyHtml = 'lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd';
mockXBlockFields.dataHtml = {
  displayName: 'Introduction to Testing',
  data: '<p>This is a text component which uses <strong>HTML</strong>.</p>',
  metadata: { displayName: 'Introduction to Testing' },
} satisfies api.XBlockFields;
// Mock of another "regular" HTML (Text) block:
mockXBlockFields.usageKey0 = 'lb:org1:Demo_course_generated:html:text-0';
mockXBlockFields.dataHtml0 = {
  displayName: 'text block 0',
  data: '<p>This is a text component which uses <strong>HTML</strong>.</p>',
  metadata: { displayName: 'text block 0' },
} satisfies api.XBlockFields;
// Mock of a blank/new HTML (Text) block:
mockXBlockFields.usageKeyNewHtml = 'lb:Axim:TEST:html:123';
mockXBlockFields.dataNewHtml = {
  displayName: 'New Text Component',
  data: '',
  metadata: { displayName: 'New Text Component' },
} satisfies api.XBlockFields;
// Mock of a blank/new problem (CAPA) block:
mockXBlockFields.usageKeyNewProblem = 'lb:Axim:TEST:problem:prob1';
mockXBlockFields.dataNewProblem = {
  displayName: 'New Problem Component',
  data: '',
  metadata: { displayName: 'New Problem Component' },
} satisfies api.XBlockFields;
mockXBlockFields.usageKeyNewVideo = 'lb:Axim:TEST:video:vid1';
mockXBlockFields.dataNewVideo = {
  displayName: 'New Video',
  data: '',
  metadata: { displayName: 'New Video' },
} satisfies api.XBlockFields;
mockXBlockFields.usageKeyThirdParty = 'lb:Axim:TEST:third_party:12345';
mockXBlockFields.dataThirdParty = {
  displayName: 'Third party XBlock',
  data: '',
  metadata: { displayName: 'Third party XBlock' },
} satisfies api.XBlockFields;
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockXBlockFields.applyMock = () => jest.spyOn(api, 'getXBlockFields').mockImplementation(mockXBlockFields);

/**
 * Mock for `getLibraryBlockMetadata()`
 *
 * This mock returns different data/responses depending on the ID of the block
 * that you request. Use `mockLibraryBlockMetadata.applyMock()` to apply it to the whole
 * test suite.
 */
export async function mockLibraryBlockMetadata(usageKey: string): Promise<api.LibraryBlockMetadata> {
  const thisMock = mockLibraryBlockMetadata;
  switch (usageKey) {
    case thisMock.usageKeyThatNeverLoads:
      // Return a promise that never resolves, to simulate never loading:
      return new Promise<any>(() => {});
    case thisMock.usageKeyError404:
      throw createAxiosError({ code: 404, message: 'Not found.', path: api.getLibraryBlockMetadataUrl(usageKey) });
    case thisMock.usageKeyNeverPublished: return thisMock.dataNeverPublished;
    case thisMock.usageKeyPublished: return thisMock.dataPublished;
    case thisMock.usageKeyWithCollections: return thisMock.dataWithCollections;
    case thisMock.usageKeyPublishDisabled: return thisMock.dataPublishDisabled;
    case thisMock.usageKeyUnsupportedXBlock: return thisMock.dataUnsupportedXBlock;
    case thisMock.usageKeyForTags: return thisMock.dataPublished;
    case thisMock.usageKeyPublishedWithChanges: return thisMock.dataPublishedWithChanges;
    case thisMock.usageKeyPublishedWithChangesV2: return thisMock.dataPublishedWithChanges;
    default: throw new Error(`No mock has been set up for usageKey "${usageKey}"`);
  }
}
mockLibraryBlockMetadata.usageKeyThatNeverLoads = 'lb:Axim:infiniteLoading:html:123';
mockLibraryBlockMetadata.usageKeyError404 = 'lb:Axim:error404:html:123';
mockLibraryBlockMetadata.usageKeyNeverPublished = 'lb:Axim:TEST1:html:571fe018-f3ce-45c9-8f53-5dafcb422fd1';
mockLibraryBlockMetadata.dataNeverPublished = {
  id: 'lb:Axim:TEST1:html:571fe018-f3ce-45c9-8f53-5dafcb422fd1',
  blockType: 'html',
  displayName: 'Introduction to Testing 1',
  publishedDisplayName: null,
  lastPublished: null,
  publishedBy: null,
  lastDraftCreated: null,
  lastDraftCreatedBy: null,
  hasUnpublishedChanges: true,
  created: '2024-06-20T13:54:21Z',
  modified: '2024-06-21T13:54:21Z',
  tagsCount: 0,
  collections: [],
} satisfies api.LibraryBlockMetadata;
mockLibraryBlockMetadata.usageKeyPublished = 'lb:Axim:TEST2:html:571fe018-f3ce-45c9-8f53-5dafcb422fd2';
mockLibraryBlockMetadata.dataPublished = {
  id: 'lb:Axim:TEST2:html:571fe018-f3ce-45c9-8f53-5dafcb422fd2',
  blockType: 'html',
  displayName: 'Introduction to Testing 2',
  publishedDisplayName: 'Introduction to Testing 2',
  lastPublished: '2024-06-22T00:00:00',
  publishedBy: 'Luke',
  lastDraftCreated: null,
  lastDraftCreatedBy: '2024-06-20T20:00:00Z',
  hasUnpublishedChanges: false,
  created: '2024-06-20T13:54:21Z',
  modified: '2024-06-21T13:54:21Z',
  tagsCount: 0,
  collections: [],
} satisfies api.LibraryBlockMetadata;
mockLibraryBlockMetadata.usageKeyPublishDisabled = 'lb:Axim:TEST2-disabled:html:571fe018-f3ce-45c9-8f53-5dafcb422fd2';
mockLibraryBlockMetadata.dataPublishDisabled = {
  ...mockLibraryBlockMetadata.dataPublished,
  id: mockLibraryBlockMetadata.usageKeyPublishDisabled,
  modified: '2024-06-11T13:54:21Z',
} satisfies api.LibraryBlockMetadata;
mockLibraryBlockMetadata.usageKeyUnsupportedXBlock = 'lb:Axim:TEST:conditional:12345';
mockLibraryBlockMetadata.dataUnsupportedXBlock = {
  ...mockLibraryBlockMetadata.dataPublished,
  id: mockLibraryBlockMetadata.usageKeyUnsupportedXBlock,
  blockType: 'conditional',
} satisfies api.LibraryBlockMetadata;
mockLibraryBlockMetadata.usageKeyForTags = mockContentTaxonomyTagsData.largeTagsId;
mockLibraryBlockMetadata.usageKeyWithCollections = 'lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd';
mockLibraryBlockMetadata.dataWithCollections = {
  id: 'lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd',
  blockType: 'html',
  displayName: 'Introduction to Testing 2',
  publishedDisplayName: null,
  lastPublished: '2024-06-21T00:00:00',
  publishedBy: 'Luke',
  lastDraftCreated: null,
  lastDraftCreatedBy: '2024-06-20T20:00:00Z',
  hasUnpublishedChanges: false,
  created: '2024-06-20T13:54:21Z',
  modified: '2024-06-21T13:54:21Z',
  tagsCount: 0,
  collections: [{ title: 'My first collection', key: 'my-first-collection' }],
} satisfies api.LibraryBlockMetadata;
mockLibraryBlockMetadata.usageKeyPublishedWithChanges = 'lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fvv';
mockLibraryBlockMetadata.usageKeyPublishedWithChangesV2 = 'lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fv2';
mockLibraryBlockMetadata.dataPublishedWithChanges = {
  id: 'lb:Axim:TEST2:html:571fe018-f3ce-45c9-8f53-5dafcb422fvv',
  blockType: 'html',
  displayName: 'Introduction to Testing 2',
  publishedDisplayName: 'Introduction to Testing 3',
  lastPublished: '2024-06-22T00:00:00',
  publishedBy: 'Luke',
  lastDraftCreated: null,
  lastDraftCreatedBy: '2024-06-20T20:00:00Z',
  hasUnpublishedChanges: true,
  created: '2024-06-20T13:54:21Z',
  modified: '2024-06-23T13:54:21Z',
  tagsCount: 0,
  collections: [],
} satisfies api.LibraryBlockMetadata;
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockLibraryBlockMetadata.applyMock = () => jest.spyOn(api, 'getLibraryBlockMetadata').mockImplementation(mockLibraryBlockMetadata);

/**
 * Mock for `getCollectionMetadata()`
 *
 * This mock returns a fixed response for the collection ID *collection_1*.
 */
export async function mockGetCollectionMetadata(libraryId: string, collectionId: string): Promise<api.Collection> {
  switch (collectionId) {
    case mockGetCollectionMetadata.collectionIdError:
      throw createAxiosError({
        code: 404,
        message: 'Not found.',
        path: api.getLibraryCollectionApiUrl(libraryId, collectionId),
      });
    case mockGetCollectionMetadata.collectionIdLoading:
      return new Promise(() => {});
    default:
      return Promise.resolve(mockGetCollectionMetadata.collectionData);
  }
}
mockGetCollectionMetadata.collectionId = 'collection_1';
mockGetCollectionMetadata.collectionIdError = 'collection_error';
mockGetCollectionMetadata.collectionIdLoading = 'collection_loading';
mockGetCollectionMetadata.collectionData = {
  id: 1,
  key: 'collection_1',
  title: 'Test Collection',
  description: 'A collection for testing',
  created: '2024-09-19T10:00:00Z',
  createdBy: 'test_author',
  modified: '2024-09-20T11:00:00Z',
  learningPackage: 11,
  enabled: true,
} satisfies api.Collection;
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockGetCollectionMetadata.applyMock = () => {
  jest.spyOn(api, 'getCollectionMetadata').mockImplementation(mockGetCollectionMetadata);
};

/**
 * Mock for `getContainerMetadata()`
 *
 * This mock returns a fixed response for the container ID *container_1*.
 */
export async function mockGetContainerMetadata(containerId: string): Promise<api.Container> {
  switch (containerId) {
    case mockGetContainerMetadata.unitIdError:
    case mockGetContainerMetadata.sectionIdError:
    case mockGetContainerMetadata.subsectionIdError:
      throw createAxiosError({
        code: 404,
        message: 'Not found.',
        path: api.getLibraryContainerApiUrl(containerId),
      });
    case mockGetContainerMetadata.unitIdLoading:
    case mockGetContainerMetadata.sectionIdLoading:
    case mockGetContainerMetadata.subsectionIdLoading:
      return new Promise(() => { });
    case mockGetContainerMetadata.unitIdWithCollections:
      return Promise.resolve(mockGetContainerMetadata.containerDataWithCollections);
    case mockGetContainerMetadata.sectionId:
    case mockGetContainerMetadata.sectionIdEmpty:
      return Promise.resolve(mockGetContainerMetadata.sectionData);
    case mockGetContainerMetadata.subsectionId:
    case mockGetContainerMetadata.subsectionIdEmpty:
      return Promise.resolve(mockGetContainerMetadata.subsectionData);
    case mockGetContainerMetadata.unitIdPublished:
    case mockGetContainerMetadata.sectionIdPublished:
    case mockGetContainerMetadata.subsectionIdPublished:
      return Promise.resolve({
        ...mockGetContainerMetadata.containerData,
        hasUnpublishedChanges: false,
      });
    default:
      if (containerId.startsWith('lct:org1:Demo_course_generated:')) {
        const lastPart = containerId.split(':').pop();
        if (lastPart) {
          const [name, idx] = lastPart.split('-');
          return Promise.resolve({
            ...mockGetContainerMetadata.containerData,
            displayName: `${name} block ${idx}`,
            publishedDisplayName: `${name} block published ${idx}`,
          });
        }
      }
      return Promise.resolve(mockGetContainerMetadata.containerData);
  }
}
mockGetContainerMetadata.unitId = 'lct:org:lib:unit:test-unit-9a207';
mockGetContainerMetadata.unitIdEmpty = 'lct:org:lib:unit:test-unit-empty';
mockGetContainerMetadata.unitIdPublished = 'lct:org:lib:unit:test-unit-published';
mockGetContainerMetadata.sectionId = 'lct:org:lib:section:test-section-1';
mockGetContainerMetadata.sectionIdPublished = 'lct:org:lib:section:test-section-published';
mockGetContainerMetadata.subsectionId = 'lct:org1:Demo_course:subsection:subsection-0';
mockGetContainerMetadata.subsectionIdPublished = 'lct:org1:Demo_course:subsection:subsection-published';
mockGetContainerMetadata.sectionIdEmpty = 'lct:org:lib:section:test-section-empty';
mockGetContainerMetadata.subsectionIdEmpty = 'lct:org1:Demo_course:subsection:subsection-empty';
mockGetContainerMetadata.unitIdError = 'lct:org:lib:unit:container_error';
mockGetContainerMetadata.sectionIdError = 'lct:org:lib:section:section_error';
mockGetContainerMetadata.subsectionIdError = 'lct:org:lib:section:section_error';
mockGetContainerMetadata.unitIdLoading = 'lct:org:lib:unit:container_loading';
mockGetContainerMetadata.sectionIdLoading = 'lct:org:lib:section:section_loading';
mockGetContainerMetadata.subsectionIdLoading = 'lct:org:lib:subsection:subsection_loading';
mockGetContainerMetadata.unitIdForTags = mockContentTaxonomyTagsData.containerTagsId;
mockGetContainerMetadata.unitIdWithCollections = 'lct:org:lib:unit:container_collections';
mockGetContainerMetadata.containerData = {
  id: 'lct:org:lib:unit:test-unit-9a2072',
  containerType: ContainerType.Unit,
  displayName: 'Test Unit',
  publishedDisplayName: 'Published Test Unit',
  created: '2024-09-19T10:00:00Z',
  createdBy: 'test_author',
  lastPublished: '2024-09-20T10:00:00Z',
  publishedBy: 'test_publisher',
  lastDraftCreated: '2024-09-20T10:00:00Z',
  lastDraftCreatedBy: 'test_author',
  modified: '2024-09-20T11:00:00Z',
  hasUnpublishedChanges: true,
  collections: [],
  tagsCount: 0,
} satisfies api.Container;
mockGetContainerMetadata.sectionData = {
  ...mockGetContainerMetadata.containerData,
  id: 'lct:org:lib:section:test-section-1',
  containerType: ContainerType.Section,
  displayName: 'Test section',
  publishedDisplayName: 'Test section',
} satisfies api.Container;
mockGetContainerMetadata.subsectionData = {
  ...mockGetContainerMetadata.containerData,
  id: 'lb:org1:Demo_course:subsection:subsection-0',
  containerType: ContainerType.Subsection,
  displayName: 'Test subsection',
  publishedDisplayName: 'Test subsection',
} satisfies api.Container;
mockGetContainerMetadata.containerDataWithCollections = {
  ...mockGetContainerMetadata.containerData,
  id: mockGetContainerMetadata.unitIdWithCollections,
  collections: [{ title: 'My first collection', key: 'my-first-collection' }],
} satisfies api.Container;
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockGetContainerMetadata.applyMock = () => {
  jest.spyOn(api, 'getContainerMetadata').mockImplementation(mockGetContainerMetadata);
};

/**
 * Mock for `getLibraryContainerChildren()`
 *
 * This mock returns a fixed response for the given container ID.
 */
export async function mockGetContainerChildren(containerId: string): Promise<api.LibraryBlockMetadata[]> {
  let numChildren: number;
  let blockType = 'html';
  let addDuplicate = false;
  switch (containerId) {
    case mockGetContainerMetadata.unitId:
    case mockGetContainerMetadata.sectionId:
    case mockGetContainerMetadata.subsectionId:
      numChildren = 3;
      break;
    case mockGetContainerChildren.fiveChildren:
      numChildren = 5;
      break;
    case mockGetContainerChildren.sixChildren:
      numChildren = 6;
      break;
    case mockGetContainerChildren.unitIdWithDuplicate:
      numChildren = 3;
      addDuplicate = true;
      break;
    default:
      numChildren = 0;
      break;
  }
  let name = 'text';
  let typeNamespace = 'lb';
  if (containerId.includes('subsection')) {
    blockType = 'unit';
    name = blockType;
    typeNamespace = 'lct';
  } else if (containerId.includes('section')) {
    blockType = 'subsection';
    name = blockType;
    typeNamespace = 'lct';
  }
  let result = Array(numChildren).fill(mockGetContainerChildren.childTemplate).map((child, idx) => (
    {
      ...child,
      // Generate a unique ID for each child block to avoid "duplicate key" errors in tests
      id: `${typeNamespace}:org1:Demo_course_generated:${blockType}:${name}-${idx}`,
      displayName: `${name} block ${idx}`,
      publishedDisplayName: `${name} block published ${idx}`,
      blockType,
    }
  ));
  if (addDuplicate) {
    result = [...result, result[0]];
  }
  return Promise.resolve(result);
}
mockGetContainerChildren.unitIdWithDuplicate = 'lct:org1:Demo_Course:unit:unit-duplicate';
mockGetContainerChildren.fiveChildren = 'lct:org1:Demo_Course:unit:unit-5';
mockGetContainerChildren.sixChildren = 'lct:org1:Demo_Course:unit:unit-6';
mockGetContainerChildren.childTemplate = {
  id: 'lb:org1:Demo_course:html:text',
  blockType: 'html',
  displayName: 'text block',
  publishedDisplayName: 'text block published',
  lastPublished: null,
  publishedBy: null,
  lastDraftCreated: null,
  lastDraftCreatedBy: null,
  hasUnpublishedChanges: false,
  created: null,
  modified: null,
  tagsCount: 0,
  collections: [] as api.CollectionMetadata[],
} satisfies api.LibraryBlockMetadata;
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockGetContainerChildren.applyMock = () => {
  jest.spyOn(api, 'getLibraryContainerChildren').mockImplementation(mockGetContainerChildren);
};

/**
 * Mock for `getBlockHierarchy()`
 *
 * This mock returns a fixed response for the given component ID.
 */
export async function mockGetComponentHierarchy(componentId: string): Promise<api.ItemHierarchyData> {
  const getChildren = (childId: string, childCount: number) => {
    let blockType = 'html';
    let name = 'text';
    let typeNamespace = 'lb';
    if (childId.includes('unit')) {
      blockType = 'unit';
      name = blockType;
      typeNamespace = 'lct';
    } else if (childId.includes('subsection')) {
      blockType = 'subsection';
      name = blockType;
      typeNamespace = 'lct';
    } else if (childId.includes('section')) {
      blockType = 'section';
      name = blockType;
      typeNamespace = 'lct';
    }

    return Array(childCount).fill(mockGetContainerChildren.childTemplate).map(
      (child, idx) => (
        {
          ...child,
          id: `${typeNamespace}:org1:Demo_course_generated:${blockType}:${name}-${idx}`,
          displayName: `${name} block ${idx}`,
          publishedDisplayName: `${name} block published ${idx}`,
          hasUnpublishedChanges: true,
        }
      ),
    );
  };

  return Promise.resolve(
    {
      objectKey: componentId,
      sections: getChildren(mockGetContainerMetadata.sectionId, 2),
      subsections: getChildren(mockGetContainerMetadata.subsectionId, 3),
      units: getChildren(mockGetContainerMetadata.unitId, 4),
      components: getChildren(componentId, 1),
    },
  );
}
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockGetComponentHierarchy.applyMock = () => {
  jest.spyOn(api, 'getBlockHierarchy').mockImplementation(mockGetComponentHierarchy);
};

/**
 * Mock for `getLibraryContainerHierarchy()`
 *
 * This mock returns a fixed response for the given container ID.
 */
export async function mockGetContainerHierarchy(containerId: string): Promise<api.ItemHierarchyData> {
  const getChildren = (childId: string, childCount: number) => {
    let blockType = 'html';
    let name = 'text';
    let typeNamespace = 'lb';
    if (childId.includes('unit')) {
      blockType = 'unit';
      name = blockType;
      typeNamespace = 'lct';
    } else if (childId.includes('subsection')) {
      blockType = 'subsection';
      name = blockType;
      typeNamespace = 'lct';
    } else if (childId.includes('section')) {
      blockType = 'section';
      name = blockType;
      typeNamespace = 'lct';
    }

    let numChildren = childCount;
    if (
      // The selected container only shows itself, no other items.
      childId === containerId
      || [
        mockGetContainerHierarchy.unitIdOneChild,
        mockGetContainerHierarchy.subsectionIdOneChild,
        mockGetContainerHierarchy.sectionIdOneChild,
      ].includes(containerId)
    ) {
      numChildren = 1;
    } else if ([
      mockGetContainerMetadata.unitIdEmpty,
      mockGetContainerMetadata.sectionIdEmpty,
      mockGetContainerMetadata.subsectionIdEmpty,
    ].includes(containerId)) {
      numChildren = 0;
    }
    return Array(numChildren).fill(mockGetContainerChildren.childTemplate).map(
      (child, idx) => (
        {
          ...child,
          id: (
            childId === containerId
              ? childId
              // Generate a unique ID when multiple child blocks
              : `${typeNamespace}:org1:Demo_course_generated:${blockType}:${name}-${idx}`
          ),
          displayName: `${name} block ${idx}`,
          publishedDisplayName: `${name} block published ${idx}`,
          hasUnpublishedChanges: true,
        }
      ),
    );
  };

  return Promise.resolve(
    {
      objectKey: containerId,
      sections: getChildren(mockGetContainerMetadata.sectionId, 2),
      subsections: getChildren(mockGetContainerMetadata.subsectionId, 3),
      units: getChildren(mockGetContainerMetadata.unitId, 4),
      components: getChildren('lb:org1:Demo_course_generated:text:text-0', 5),
    },
  );
}

mockGetContainerHierarchy.unitIdOneChild = 'lct:org:lib:unit:test-unit-one';
mockGetContainerHierarchy.sectionIdOneChild = 'lct:org:lib:section:test-section-one';
mockGetContainerHierarchy.subsectionIdOneChild = 'lct:org1:Demo_course:subsection:subsection-one';

/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockGetContainerHierarchy.applyMock = () => {
  jest.spyOn(api, 'getLibraryContainerHierarchy').mockImplementation(mockGetContainerHierarchy);
};

/**
 * Mock for `getXBlockOLX()`
 *
 * This mock returns different data/responses depending on the ID of the block
 * that you request. Use `mockXBlockOLX.applyMock()` to apply it to the whole
 * test suite.
 */
export async function mockXBlockOLX(usageKey: string): Promise<string> {
  const thisMock = mockXBlockOLX;
  switch (usageKey) {
    case thisMock.usageKeyHtml: return thisMock.olxHtml;
    default: {
      const blockType = getBlockType(usageKey);
      return `<${blockType}>This is mock OLX for usageKey "${usageKey}"</${blockType}>`;
    }
  }
}
// Mock of a "regular" HTML (Text) block:
mockXBlockOLX.usageKeyHtml = mockXBlockFields.usageKeyHtml;
mockXBlockOLX.olxHtml = `
  <html display_name="${mockXBlockFields.dataHtml.displayName}">
    ${mockXBlockFields.dataHtml.data}
  </html>
`;
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockXBlockOLX.applyMock = () => jest.spyOn(api, 'getXBlockOLX').mockImplementation(mockXBlockOLX);

/**
 * Mock for `setXBlockOLX()`
 */
export async function mockSetXBlockOLX(_usageKey: string, newOLX: string): Promise<string> {
  return newOLX;
}
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockSetXBlockOLX.applyMock = () => jest.spyOn(api, 'setXBlockOLX').mockImplementation(mockSetXBlockOLX);

/**
 * Mock for `getXBlockAssets()`
 *
 * Use `getXBlockAssets.applyMock()` to apply it to the whole test suite.
 */
export async function mockXBlockAssets(): ReturnType<typeof api['getXBlockAssets']> {
  return [
    { path: 'static/image1.png', url: 'https://cdn.test.none/image1.png', size: 12_345_000 },
    { path: 'static/data.csv', url: 'https://cdn.test.none/data.csv', size: 8_000 },
  ];
}
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockXBlockAssets.applyMock = () => jest.spyOn(api, 'getXBlockAssets').mockImplementation(mockXBlockAssets);

/**
 * Mock for `getLibraryTeam()`
 *
 * Use `mockGetLibraryTeam.applyMock()` to apply it to the whole test suite.
 */
export async function mockGetLibraryTeam(libraryId: string): Promise<api.LibraryTeamMember[]> {
  switch (libraryId) {
    case mockContentLibrary.libraryIdThatNeverLoads:
      // Return a promise that never resolves, to simulate never loading:
      return new Promise<any>(() => {});
    default:
      return [
        mockGetLibraryTeam.adminMember,
        mockGetLibraryTeam.authorMember,
        mockGetLibraryTeam.readerMember,
      ];
  }
}
mockGetLibraryTeam.adminMember = {
  username: 'admin-user',
  email: 'admin@domain.tld',
  accessLevel: 'admin' as api.LibraryAccessLevel,
};
mockGetLibraryTeam.authorMember = {
  username: 'author-user',
  email: 'author@domain.tld',
  accessLevel: 'author' as api.LibraryAccessLevel,
};
mockGetLibraryTeam.readerMember = {
  username: 'reader-user',
  email: 'reader@domain.tld',
  accessLevel: 'read' as api.LibraryAccessLevel,
};
mockGetLibraryTeam.notMember = {
  username: 'not-user',
  email: 'not@domain.tld',
};

/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockGetLibraryTeam.applyMock = () => jest.spyOn(api, 'getLibraryTeam').mockImplementation(mockGetLibraryTeam);

/**
 * Mock for `getBlockTypes()`
 *
 * Use `mockBlockTypesMetadata.applyMock()` to apply it to the whole test suite.
 */
export async function mockBlockTypesMetadata(libraryId: string): Promise<api.BlockTypeMetadata[]> {
  const thisMock = mockBlockTypesMetadata;
  switch (libraryId) {
    case mockContentLibrary.libraryId: return thisMock.blockTypesMetadata;
    default: {
      return [];
    }
  }
}

mockBlockTypesMetadata.blockTypesMetadata = [
  { blockType: 'poll', displayName: 'Poll' },
  { blockType: 'survey', displayName: 'Survey' },
  { blockType: 'google-document', displayName: 'Google Document' },
];
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockBlockTypesMetadata.applyMock = () => jest.spyOn(api, 'getBlockTypes').mockImplementation(mockBlockTypesMetadata);

export async function mockGetEntityLinks(
  _downstreamContextKey?: string,
  _readyToSync?: boolean,
  _useTopLevelParents?: boolean,
  upstreamKey?: string,
  contentType?: 'all' | 'components' | 'containers',
): ReturnType<typeof courseLibApi.getEntityLinks> {
  const thisMock = mockGetEntityLinks;
  if (contentType === 'components') {
    switch (upstreamKey) {
      case thisMock.upstreamContainerKey: return thisMock.componentResponse;
      case mockLibraryBlockMetadata.usageKeyPublishedWithChanges: return thisMock.componentResponse;
      case thisMock.emptyUsageKey: return thisMock.emptyComponentUsage;
      default: return [];
    }
  } else if (contentType === 'containers') {
    switch (upstreamKey) {
      case thisMock.unitKey: return thisMock.unitResponse;
      case thisMock.subsectionKey: return thisMock.subsectionResponse;
      case thisMock.sectionKey: return thisMock.sectionResponse;
      default: return [];
    }
  }
  return thisMock.allResponse;
}

mockGetEntityLinks.upstreamContainerKey = mockLibraryBlockMetadata.usageKeyPublished;
mockGetEntityLinks.componentResponse = downstreamLinkInfo.results[0].hits.map((obj: { usageKey: any; }) => ({
  id: 875,
  upstreamContextTitle: 'CS problems 3',
  upstreamVersion: 10,
  readyToSync: true,
  upstreamKey: mockLibraryBlockMetadata.usageKeyPublished,
  upstreamContextKey: 'lib:Axim:TEST2',
  downstreamUsageKey: obj.usageKey,
  downstreamContextKey: 'course-v1:OpenEdx+DemoX+CourseX',
  versionSynced: 2,
  versionDeclined: null,
  created: '2025-02-08T14:07:05.588484Z',
  updated: '2025-02-08T14:07:05.588484Z',
  upstreamType: 'component',
}));
mockGetEntityLinks.emptyUsageKey = 'lb:Axim:TEST1:html:empty';
mockGetEntityLinks.emptyComponentUsage = [] as courseLibApi.PublishableEntityLink[];
mockGetEntityLinks.unitKey = mockGetContainerMetadata.unitId;
mockGetEntityLinks.unitResponse = [
  {
    id: 1,
    upstreamContextTitle: 'CS problems 3',
    upstreamVersion: 1,
    readyToSync: false,
    upstreamKey: mockGetEntityLinks.unitKey,
    upstreamContextKey: 'lib:Axim:TEST2',
    downstreamUsageKey: 'some-key',
    downstreamContextKey: 'course-v1:OpenEdx+DemoX+CourseX',
    versionSynced: 1,
    versionDeclined: null,
    created: '2025-02-08T14:07:05.588484Z',
    updated: '2025-02-08T14:07:05.588484Z',
    upstreamType: 'container',
  },
  {
    id: 1,
    upstreamContextTitle: 'CS problems 3',
    upstreamVersion: 1,
    readyToSync: false,
    upstreamKey: mockGetEntityLinks.unitKey,
    upstreamContextKey: 'lib:Axim:TEST2',
    downstreamUsageKey: 'some-key-1',
    downstreamContextKey: 'course-v1:OpenEdx+DemoX+CourseX',
    versionSynced: 1,
    versionDeclined: null,
    created: '2025-02-08T14:07:05.588484Z',
    updated: '2025-02-08T14:07:05.588484Z',
    upstreamType: 'container',
  },
] as courseLibApi.PublishableEntityLink[];
mockGetEntityLinks.subsectionKey = mockGetContainerMetadata.subsectionId;
mockGetEntityLinks.subsectionResponse = [
  {
    id: 1,
    upstreamContextTitle: 'CS problems 3',
    upstreamVersion: 1,
    readyToSync: false,
    upstreamKey: mockGetEntityLinks.subsectionKey,
    upstreamContextKey: 'lib:Axim:TEST2',
    downstreamUsageKey: 'some-subsection-key',
    downstreamContextKey: 'course-v1:OpenEdx+DemoX+CourseX',
    versionSynced: 1,
    versionDeclined: null,
    created: '2025-02-08T14:07:05.588484Z',
    updated: '2025-02-08T14:07:05.588484Z',
    upstreamType: 'container',
  },
  {
    id: 1,
    upstreamContextTitle: 'CS problems 3',
    upstreamVersion: 1,
    readyToSync: false,
    upstreamKey: mockGetEntityLinks.subsectionKey,
    upstreamContextKey: 'lib:Axim:TEST2',
    downstreamUsageKey: 'some-subsection-key-1',
    downstreamContextKey: 'course-v1:OpenEdx+DemoX+CourseX',
    versionSynced: 1,
    versionDeclined: null,
    created: '2025-02-08T14:07:05.588484Z',
    updated: '2025-02-08T14:07:05.588484Z',
    upstreamType: 'container',
  },
] as courseLibApi.PublishableEntityLink[];
mockGetEntityLinks.sectionKey = mockGetContainerMetadata.sectionId;
mockGetEntityLinks.sectionResponse = [
  {
    id: 1,
    upstreamContextTitle: 'CS problems 3',
    upstreamVersion: 1,
    readyToSync: false,
    upstreamKey: mockGetEntityLinks.sectionKey,
    upstreamContextKey: 'lib:Axim:TEST2',
    downstreamUsageKey: 'some-section-key',
    downstreamContextKey: 'course-v1:OpenEdx+DemoX+CourseX',
    versionSynced: 1,
    versionDeclined: null,
    created: '2025-02-08T14:07:05.588484Z',
    updated: '2025-02-08T14:07:05.588484Z',
    upstreamType: 'container',
  },
  {
    id: 1,
    upstreamContextTitle: 'CS problems 3',
    upstreamVersion: 1,
    readyToSync: false,
    upstreamKey: mockGetEntityLinks.sectionKey,
    upstreamContextKey: 'lib:Axim:TEST2',
    downstreamUsageKey: 'some-section-key-1',
    downstreamContextKey: 'course-v1:OpenEdx+DemoX+CourseX',
    versionSynced: 1,
    versionDeclined: null,
    created: '2025-02-08T14:07:05.588484Z',
    updated: '2025-02-08T14:07:05.588484Z',
    upstreamType: 'container',
  },
] as courseLibApi.PublishableEntityLink[];
mockGetEntityLinks.allResponse = [
  ...mockGetEntityLinks.componentResponse,
  ...mockGetEntityLinks.unitResponse,
  ...mockGetEntityLinks.subsectionResponse,
  ...mockGetEntityLinks.sectionResponse,
];
mockGetEntityLinks.applyMock = () => jest.spyOn(
  courseLibApi,
  'getEntityLinks',
).mockImplementation(mockGetEntityLinks);

export async function mockGetCourseImports(libraryId: string): ReturnType<typeof api.getCourseImports> {
  switch (libraryId) {
    case mockContentLibrary.libraryId:
      return [
        mockGetCourseImports.succeedImport,
        mockGetCourseImports.succeedImportWithCollection,
        mockGetCourseImports.failImport,
        mockGetCourseImports.inProgressImport,
      ];
    case mockGetCourseImports.emptyLibraryId:
      return [];
    default:
      throw new Error(`mockGetCourseImports doesn't know how to mock ${JSON.stringify(libraryId)}`);
  }
}
mockGetCourseImports.libraryId = mockContentLibrary.libraryId;
mockGetCourseImports.emptyLibraryId = mockContentLibrary.libraryId2;
mockGetCourseImports.succeedImport = {
  taskUuid: '2d35e36b-1234-1234-1234-123456789000',
  source: {
    key: 'course-v1:edX+DemoX+2025_T1',
    displayName: 'DemoX 2025 T1',
  },
  targetCollection: null,
  state: 'Succeeded',
  progress: 1,
} satisfies api.CourseImport;
mockGetCourseImports.succeedImportWithCollection = {
  taskUuid: '2',
  source: {
    key: 'course-v1:edX+DemoX+2025_T2',
    displayName: 'DemoX 2025 T2',
  },
  targetCollection: {
    key: 'sample-collection',
    title: 'DemoX 2025 T1 (2)',
  },
  state: 'Succeeded',
  progress: 1,
} satisfies api.CourseImport;
mockGetCourseImports.failImport = {
  taskUuid: '3',
  source: {
    key: 'course-v1:edX+DemoX+2025_T3',
    displayName: 'DemoX 2025 T3',
  },
  targetCollection: null,
  state: 'Failed',
  progress: 0.30,
} satisfies api.CourseImport;
mockGetCourseImports.inProgressImport = {
  taskUuid: '4',
  source: {
    key: 'course-v1:edX+DemoX+2025_T4',
    displayName: 'DemoX 2025 T4',
  },
  targetCollection: null,
  state: 'In Progress',
  progress: 0.5012,
} satisfies api.CourseImport;
mockGetCourseImports.applyMock = () => jest.spyOn(
  api,
  'getCourseImports',
).mockImplementation(mockGetCourseImports);

export const mockGetMigrationInfo = {
  applyMock: () => jest.spyOn(api, 'getMigrationInfo').mockResolvedValue(
    camelCaseObject({
      'course-v1:HarvardX+123+2023': [{
        sourceKey: 'course-v1:HarvardX+123+2023',
        targetCollectionKey: 'ltc:org:coll-1',
        targetCollectionTitle: 'Collection 1',
        targetKey: mockContentLibrary.libraryId,
        targetTitle: 'Library 1',
      }],
    }),
  ),
};
