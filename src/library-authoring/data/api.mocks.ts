/* istanbul ignore file */
import { mockContentTaxonomyTagsData } from '../../content-tags-drawer/data/api.mocks';
import { getBlockType } from '../../generic/key-utils';
import { createAxiosError } from '../../testUtils';
import * as api from './api';

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
    case mockContentLibrary.libraryIdReadOnly:
      return {
        ...mockContentLibrary.libraryData,
        id: mockContentLibrary.libraryIdReadOnly,
        slug: 'readOnly',
        allowPublicRead: true,
        canEditLibrary: false,
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
  lastDraftCreatedBy: null,
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
mockContentLibrary.libraryIdReadOnly = 'lib:Axim:readOnly';
mockContentLibrary.libraryIdThatNeverLoads = 'lib:Axim:infiniteLoading';
mockContentLibrary.library404 = 'lib:Axim:error404';
mockContentLibrary.library500 = 'lib:Axim:error500';
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
  defKey: '123',
  blockType: 'html',
  displayName: 'New Text Component',
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
  defKey: 'prob1',
  blockType: 'problem',
  displayName: 'New Problem',
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
  defKey: 'vid1',
  blockType: 'video',
  displayName: 'New Video',
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
    case thisMock.usageKeyThirdPartyXBlock: return thisMock.dataThirdPartyXBlock;
    case thisMock.usageKeyForTags: return thisMock.dataPublished;
    default: throw new Error(`No mock has been set up for usageKey "${usageKey}"`);
  }
}
mockLibraryBlockMetadata.usageKeyThatNeverLoads = 'lb:Axim:infiniteLoading:html:123';
mockLibraryBlockMetadata.usageKeyError404 = 'lb:Axim:error404:html:123';
mockLibraryBlockMetadata.usageKeyNeverPublished = 'lb:Axim:TEST1:html:571fe018-f3ce-45c9-8f53-5dafcb422fd1';
mockLibraryBlockMetadata.dataNeverPublished = {
  id: 'lb:Axim:TEST1:html:571fe018-f3ce-45c9-8f53-5dafcb422fd1',
  defKey: null,
  blockType: 'html',
  displayName: 'Introduction to Testing 1',
  lastPublished: null,
  publishedBy: null,
  lastDraftCreated: null,
  lastDraftCreatedBy: null,
  hasUnpublishedChanges: false,
  created: '2024-06-20T13:54:21Z',
  modified: '2024-06-21T13:54:21Z',
  tagsCount: 0,
  collections: [],
} satisfies api.LibraryBlockMetadata;
mockLibraryBlockMetadata.usageKeyPublished = 'lb:Axim:TEST2:html:571fe018-f3ce-45c9-8f53-5dafcb422fd2';
mockLibraryBlockMetadata.dataPublished = {
  id: 'lb:Axim:TEST2:html:571fe018-f3ce-45c9-8f53-5dafcb422fd2',
  defKey: null,
  blockType: 'html',
  displayName: 'Introduction to Testing 2',
  lastPublished: '2024-06-21T00:00:00',
  publishedBy: 'Luke',
  lastDraftCreated: null,
  lastDraftCreatedBy: '2024-06-20T20:00:00Z',
  hasUnpublishedChanges: false,
  created: '2024-06-20T13:54:21Z',
  modified: '2024-06-21T13:54:21Z',
  tagsCount: 0,
  collections: [],
} satisfies api.LibraryBlockMetadata;
mockLibraryBlockMetadata.usageKeyThirdPartyXBlock = mockXBlockFields.usageKeyThirdParty;
mockLibraryBlockMetadata.dataThirdPartyXBlock = {
  ...mockLibraryBlockMetadata.dataPublished,
  id: mockLibraryBlockMetadata.usageKeyThirdPartyXBlock,
  blockType: 'third_party',
} satisfies api.LibraryBlockMetadata;
mockLibraryBlockMetadata.usageKeyForTags = mockContentTaxonomyTagsData.largeTagsId;
mockLibraryBlockMetadata.usageKeyWithCollections = 'lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd';
mockLibraryBlockMetadata.dataWithCollections = {
  id: 'lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd',
  defKey: null,
  blockType: 'html',
  displayName: 'Introduction to Testing 2',
  lastPublished: '2024-06-21T00:00:00',
  publishedBy: 'Luke',
  lastDraftCreated: null,
  lastDraftCreatedBy: '2024-06-20T20:00:00Z',
  hasUnpublishedChanges: false,
  created: '2024-06-20T13:54:21Z',
  modified: '2024-06-21T13:54:21Z',
  tagsCount: 0,
  collections: [{ title: 'My first collection', key: 'my-first-collection'}],
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
