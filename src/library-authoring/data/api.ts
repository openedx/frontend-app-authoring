import { camelCaseObject, getConfig, snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;

/**
 * Get the URL for the content library API.
 */
export const getContentLibraryApiUrl = (libraryId: string) => `${getApiBaseUrl()}/api/libraries/v2/${libraryId}/`;

/**
 * Get the URL for getting block types of a library (what types can be created).
 */
export const getLibraryBlockTypesUrl = (libraryId: string) => `${getApiBaseUrl()}/api/libraries/v2/${libraryId}/block_types/`;

/**
 * Get the URL for create content in library.
 */
export const getCreateLibraryBlockUrl = (libraryId: string) => `${getApiBaseUrl()}/api/libraries/v2/${libraryId}/blocks/`;

/**
 * Get the URL for library block metadata.
 */
export const getLibraryBlockMetadataUrl = (usageKey: string) => `${getApiBaseUrl()}/api/libraries/v2/blocks/${usageKey}/`;

/**
 * Get the URL for content library list API.
 */
export const getContentLibraryV2ListApiUrl = () => `${getApiBaseUrl()}/api/libraries/v2/`;

/**
 * Get the URL for commit/revert changes in library.
 */
export const getCommitLibraryChangesUrl = (libraryId: string) => `${getApiBaseUrl()}/api/libraries/v2/${libraryId}/commit/`;

/**
 * Get the URL for paste clipboard content into library.
 */
export const getLibraryPasteClipboardUrl = (libraryId: string) => `${getApiBaseUrl()}/api/libraries/v2/${libraryId}/paste_clipboard/`;

/**
  * Get the URL for the xblock fields/metadata API.
  */
export const getXBlockFieldsApiUrl = (usageKey: string) => `${getApiBaseUrl()}/api/xblock/v2/xblocks/${usageKey}/fields/`;
/**
  * Get the URL for the xblock OLX API
  */
export const getXBlockOLXApiUrl = (usageKey: string) => `${getApiBaseUrl()}/api/libraries/v2/blocks/${usageKey}/olx/`;
/**
 * Get the URL for the Library Collections API.
 */
export const getLibraryCollectionsApiUrl = (libraryId: string) => `${getApiBaseUrl()}/api/libraries/v2/${libraryId}/collections/`;
/**
 * Get the URL for the collection API.
 */
export const getLibraryCollectionApiUrl = (libraryId: string, collectionId: string) => `${getLibraryCollectionsApiUrl(libraryId)}${collectionId}/`;
/**
 * Get the URL for the collection API.
 */
export const getLibraryCollectionComponentApiUrl = (libraryId: string, collectionId: string) => `${getLibraryCollectionApiUrl(libraryId, collectionId)}components/`;

export interface ContentLibrary {
  id: string;
  type: string;
  org: string;
  slug: string;
  title: string;
  description: string;
  numBlocks: number;
  version: number;
  lastPublished: string | null;
  lastDraftCreated: string | null;
  publishedBy: string | null;
  lastDraftCreatedBy: string | null;
  allowLti: boolean;
  allowPublicLearning: boolean;
  allowPublicRead: boolean;
  hasUnpublishedChanges: boolean;
  hasUnpublishedDeletes: boolean;
  canEditLibrary: boolean;
  license: string;
  created: string | null;
  updated: string | null;
}

export interface Collection {
  id: number;
  key: string;
  title: string;
  description: string;
  enabled: boolean;
  createdBy: string | null;
  created: string;
  modified: string;
  learningPackage: number;
}

export interface LibraryBlockType {
  blockType: string;
  displayName: string;
}

export interface LibrariesV2Response {
  next: string | null,
  previous: string | null,
  count: number,
  numPages: number,
  currentPage: number,
  start: number,
  results: ContentLibrary[],
}

export interface XBlockFields {
  displayName: string;
  metadata: Record<string, unknown>;
  data: string;
}

/* Additional custom parameters for the API request. */
export interface GetLibrariesV2CustomParams {
  /* (optional) Library type, default `complex` */
  type?: string,
  /* (optional) Page number of results */
  page?: number,
  /* (optional) The number of results on each page, default `50` */
  pageSize?: number,
  /* (optional) Whether pagination is supported, default `true` */
  pagination?: boolean,
  /* (optional) Library field to order results by. Prefix with '-' for descending */
  order?: string,
  /* (optional) Search query to filter v2 Libraries by */
  search?: string,
}

export interface CreateBlockDataRequest {
  libraryId: string;
  blockType: string;
  definitionId: string;
}

export interface LibraryBlockMetadata {
  id: string;
  blockType: string;
  defKey: string | null;
  displayName: string;
  lastPublished: string | null;
  publishedBy: string | null,
  lastDraftCreated: string | null,
  lastDraftCreatedBy: string | null,
  hasUnpublishedChanges: boolean;
  created: string | null,
  modified: string | null,
  tagsCount: number;
}

export interface UpdateLibraryDataRequest {
  id: string;
  title?: string;
  description?: string;
  allow_public_learning?: boolean;
  allow_public_read?: boolean;
  type?: string;
  license?: string;
}

export interface LibraryPasteClipboardRequest {
  libraryId: string;
  blockId: string;
}

export interface UpdateXBlockFieldsRequest {
  data?: unknown;
  metadata?: {
    display_name?: string;
  };
}

export interface CreateLibraryCollectionDataRequest {
  title: string;
  description: string | null;
}

export type UpdateCollectionComponentsRequest = Partial<CreateLibraryCollectionDataRequest>;

/**
 * Fetch the list of XBlock types that can be added to this library
 */
export async function getLibraryBlockTypes(libraryId: string): Promise<LibraryBlockType[]> {
  const { data } = await getAuthenticatedHttpClient().get(getLibraryBlockTypesUrl(libraryId));
  return camelCaseObject(data);
}

/**
 * Fetch a content library by its ID.
 */
export async function getContentLibrary(libraryId: string): Promise<ContentLibrary> {
  const { data } = await getAuthenticatedHttpClient().get(getContentLibraryApiUrl(libraryId));
  return camelCaseObject(data);
}

export async function createLibraryBlock({
  libraryId,
  blockType,
  definitionId,
}: CreateBlockDataRequest): Promise<LibraryBlockMetadata> {
  const client = getAuthenticatedHttpClient();
  const { data } = await client.post(
    getCreateLibraryBlockUrl(libraryId),
    {
      block_type: blockType,
      definition_id: definitionId,
    },
  );
  return camelCaseObject(data);
}

/**
 * Update library metadata.
 */
export async function updateLibraryMetadata(libraryData: UpdateLibraryDataRequest): Promise<ContentLibrary> {
  const client = getAuthenticatedHttpClient();
  const { data } = await client.patch(getContentLibraryApiUrl(libraryData.id), libraryData);

  return camelCaseObject(data);
}

/**
 * Get a list of content libraries.
 */
export async function getContentLibraryV2List(customParams: GetLibrariesV2CustomParams): Promise<LibrariesV2Response> {
  // Set default params if not passed in
  const customParamsDefaults = {
    type: customParams.type || 'complex',
    page: customParams.page || 1,
    pageSize: customParams.pageSize || 50,
    pagination: customParams.pagination !== undefined ? customParams.pagination : true,
    order: customParams.order || 'title',
    textSearch: customParams.search,
  };
  const customParamsFormated = snakeCaseObject(customParamsDefaults);
  const { data } = await getAuthenticatedHttpClient()
    .get(getContentLibraryV2ListApiUrl(), { params: customParamsFormated });
  return camelCaseObject(data);
}

/**
 * Commit library changes.
 */
export async function commitLibraryChanges(libraryId: string) {
  const client = getAuthenticatedHttpClient();
  await client.post(getCommitLibraryChangesUrl(libraryId));
}

/**
 * Revert library changes.
 */
export async function revertLibraryChanges(libraryId: string) {
  const client = getAuthenticatedHttpClient();
  await client.delete(getCommitLibraryChangesUrl(libraryId));
}

/**
 * Paste clipboard content into library.
 */
export async function libraryPasteClipboard({
  libraryId,
  blockId,
}: LibraryPasteClipboardRequest): Promise<LibraryBlockMetadata> {
  const client = getAuthenticatedHttpClient();
  const { data } = await client.post(
    getLibraryPasteClipboardUrl(libraryId),
    {
      block_id: blockId,
    },
  );
  return data;
}

/**
 * Fetch library block metadata.
 */
export async function getLibraryBlockMetadata(usageKey: string): Promise<LibraryBlockMetadata> {
  const { data } = await getAuthenticatedHttpClient().get(getLibraryBlockMetadataUrl(usageKey));
  return camelCaseObject(data);
}

/**
 * Fetch xblock fields.
 */
export async function getXBlockFields(usageKey: string): Promise<XBlockFields> {
  const { data } = await getAuthenticatedHttpClient().get(getXBlockFieldsApiUrl(usageKey));
  return camelCaseObject(data);
}

/**
 * Update xblock fields.
 */
export async function updateXBlockFields(usageKey: string, xblockData: UpdateXBlockFieldsRequest) {
  const client = getAuthenticatedHttpClient();
  await client.post(getXBlockFieldsApiUrl(usageKey), xblockData);
}

/**
 * Create a library collection
 */
export async function createCollection(libraryId: string, collectionData: CreateLibraryCollectionDataRequest) {
  const client = getAuthenticatedHttpClient();
  const { data } = await client.post(getLibraryCollectionsApiUrl(libraryId), collectionData);

  return camelCaseObject(data);
}

/**
 * Fetch the OLX for the given XBlock.
 */
export async function getXBlockOLX(usageKey: string): Promise<string> {
  const { data } = await getAuthenticatedHttpClient().get(getXBlockOLXApiUrl(usageKey));
  return data.olx;
}

/**
 * Get the collection metadata.
 */
export async function getCollectionMetadata(libraryId: string, collectionId: string): Promise<Collection> {
  const { data } = await getAuthenticatedHttpClient().get(getLibraryCollectionApiUrl(libraryId, collectionId));
  return camelCaseObject(data);
}

/**
 * Update collection metadata.
 */
export async function updateCollectionMetadata(
  libraryId: string,
  collectionId: string,
  collectionData: UpdateCollectionComponentsRequest,
) {
  const client = getAuthenticatedHttpClient();
  await client.patch(getLibraryCollectionApiUrl(libraryId, collectionId), collectionData);
}

/**
 * Update collection components.
 */
export async function updateCollectionComponents(libraryId: string, collectionId: string, usageKeys: string[]) {
  await getAuthenticatedHttpClient().patch(getLibraryCollectionComponentApiUrl(libraryId, collectionId), {
    usage_keys: usageKeys,
  });
}
