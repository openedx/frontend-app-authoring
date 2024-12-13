import { camelCaseObject, getConfig, snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { VersionSpec } from '../LibraryBlock';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;

/**
 * Get the URL for the content library API.
 */
export const getContentLibraryApiUrl = (libraryId: string) => `${getApiBaseUrl()}/api/libraries/v2/${libraryId}/`;

/**
 * Get the URL for create content in library.
 */
export const getCreateLibraryBlockUrl = (libraryId: string) => `${getApiBaseUrl()}/api/libraries/v2/${libraryId}/blocks/`;

/**
 * Get the URL for the content library team API.
 */
export const getLibraryTeamApiUrl = (libraryId: string) => `${getApiBaseUrl()}/api/libraries/v2/${libraryId}/team/`;

/**
 * Get the URL for updating/deleting a content library team member.
 */
export const getLibraryTeamMemberApiUrl = (libraryId: string, username: string) => `${getApiBaseUrl()}/api/libraries/v2/${libraryId}/team/user/${username}/`;

/**
 * Get the URL for library block metadata.
 */
export const getLibraryBlockMetadataUrl = (usageKey: string) => `${getApiBaseUrl()}/api/libraries/v2/blocks/${usageKey}/`;

/**
 * Get the URL for restoring deleted library block.
 */
export const getLibraryBlockRestoreUrl = (usageKey: string) => `${getLibraryBlockMetadataUrl(usageKey)}restore/`;

/**
 * Get the URL for library block metadata.
 */
export const getLibraryBlockCollectionsUrl = (usageKey: string) => `${getLibraryBlockMetadataUrl(usageKey)}collections/`;

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
export const getXBlockFieldsVersionApiUrl = (usageKey: string, version: VersionSpec) => `${getApiBaseUrl()}/api/xblock/v2/xblocks/${usageKey}@${version}/fields/`;

/**
  * Get the URL for the xblock OLX API
  */
export const getXBlockOLXApiUrl = (usageKey: string) => `${getLibraryBlockMetadataUrl(usageKey)}olx/`;
export const getXBlockOLXVersionApiUrl = (usageKey: string, version: VersionSpec) => `${getApiBaseUrl()}/api/xblock/v2/xblocks/${usageKey}@${version}/olx/`;

/**
 * Get the URL for the xblock Publish API
 */
export const getXBlockPublishApiUrl = (usageKey: string) => `${getApiBaseUrl()}/api/libraries/v2/blocks/${usageKey}/publish/`;
/**
  * Get the URL for the xblock Assets List API
  */
export const getXBlockAssetsApiUrl = (usageKey: string) => `${getApiBaseUrl()}/api/libraries/v2/blocks/${usageKey}/assets/`;
/**
 * Get the URL for the Library Collections API.
 */
export const getLibraryCollectionsApiUrl = (libraryId: string) => `${getApiBaseUrl()}/api/libraries/v2/${libraryId}/collections/`;
/**
 * Get the URL for the collection detail API.
 */
export const getLibraryCollectionApiUrl = (libraryId: string, collectionId: string) => `${getLibraryCollectionsApiUrl(libraryId)}${collectionId}/`;
/**
 * Get the URL for the collection components API.
 */
export const getLibraryCollectionComponentApiUrl = (libraryId: string, collectionId: string) => `${getLibraryCollectionApiUrl(libraryId, collectionId)}components/`;
/**
 * Get the API URL for restoring deleted collection.
 */
export const getLibraryCollectionRestoreApiUrl = (libraryId: string, collectionId: string) => `${getLibraryCollectionApiUrl(libraryId, collectionId)}restore/`;
/**
 * Get the URL for the xblock api.
 */
export const getXBlockBaseApiUrl = () => `${getApiBaseUrl()}/xblock/`;

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

export type LibraryAccessLevel = 'read' | 'author' | 'admin';

export interface LibraryTeamMember {
  username: string;
  email: string;
  accessLevel: LibraryAccessLevel,
}

export interface AddLibraryTeamMember {
  libraryId: string,
  email: string;
  accessLevel: LibraryAccessLevel,
}

export interface DeleteLibraryTeamMember {
  libraryId: string,
  username: string;
}

export interface UpdateLibraryTeamMember extends DeleteLibraryTeamMember {
  accessLevel: LibraryAccessLevel,
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

export type LibraryAssetResponse = {
  path: string,
  size: number,
  url: string,
};

export interface CreateBlockDataRequest {
  libraryId: string;
  blockType: string;
  definitionId: string;
}

export interface DeleteBlockDataRequest {
  usageKey: string;
}

export interface CollectionMetadata {
  key: string;
  title: string;
}

export interface LibraryBlockMetadata {
  id: string;
  blockType: string;
  defKey: string | null;
  displayName: string;
  lastPublished: string | null;
  publishedBy: string | null;
  lastDraftCreated: string | null;
  lastDraftCreatedBy: string | null,
  hasUnpublishedChanges: boolean;
  created: string | null;
  modified: string | null;
  tagsCount: number;
  collections: CollectionMetadata[];
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

export async function deleteLibraryBlock({ usageKey }: DeleteBlockDataRequest): Promise<void> {
  const client = getAuthenticatedHttpClient();
  await client.delete(getLibraryBlockMetadataUrl(usageKey));
}

export async function restoreLibraryBlock({ usageKey }: DeleteBlockDataRequest): Promise<void> {
  const client = getAuthenticatedHttpClient();
  await client.post(getLibraryBlockRestoreUrl(usageKey));
}

/**
 * Update library metadata.
 */
export async function updateLibraryMetadata(libraryData: UpdateLibraryDataRequest): Promise<ContentLibrary> {
  const client = getAuthenticatedHttpClient();
  const { id: libraryId, ...updateData } = libraryData;
  const { data } = await client.patch(getContentLibraryApiUrl(libraryId), updateData);

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
 * Fetch  content library's team by library ID.
 */
export async function getLibraryTeam(libraryId: string): Promise<LibraryTeamMember[]> {
  const client = getAuthenticatedHttpClient();
  const { data } = await client.get(getLibraryTeamApiUrl(libraryId));
  return camelCaseObject(data);
}

/**
 * Add a new member to the library's team by email.
 */
export async function addLibraryTeamMember(memberData: AddLibraryTeamMember): Promise<LibraryTeamMember> {
  const client = getAuthenticatedHttpClient();
  const url = getLibraryTeamApiUrl(memberData.libraryId);
  const { data } = await client.post(url, snakeCaseObject(memberData));
  return camelCaseObject(data);
}

/**
 * Delete an existing member from the library's team by username.
 */
export async function deleteLibraryTeamMember(memberData: DeleteLibraryTeamMember): Promise<LibraryTeamMember> {
  const client = getAuthenticatedHttpClient();
  const url = getLibraryTeamMemberApiUrl(memberData.libraryId, memberData.username);
  const { data } = await client.delete(url);
  return camelCaseObject(data);
}

/**
 * Update an existing member's access to the library's team by username.
 */
export async function updateLibraryTeamMember(memberData: UpdateLibraryTeamMember): Promise<LibraryTeamMember> {
  const client = getAuthenticatedHttpClient();
  const url = getLibraryTeamMemberApiUrl(memberData.libraryId, memberData.username);
  const { data } = await client.put(url, snakeCaseObject(memberData));
  return camelCaseObject(data);
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
export async function getXBlockFields(usageKey: string, version: VersionSpec = 'draft'): Promise<XBlockFields> {
  const { data } = await getAuthenticatedHttpClient().get(getXBlockFieldsVersionApiUrl(usageKey, version));
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
// istanbul ignore next
export async function getXBlockOLX(usageKey: string, version: VersionSpec = 'draft'): Promise<string> {
  const { data } = await getAuthenticatedHttpClient().get(getXBlockOLXVersionApiUrl(usageKey, version));
  return data.olx;
}

/**
 * Set the OLX for the given XBlock.
 * Returns the OLX as it was actually saved.
 */
// istanbul ignore next
export async function setXBlockOLX(usageKey: string, newOLX: string): Promise<string> {
  const { data } = await getAuthenticatedHttpClient().post(getXBlockOLXApiUrl(usageKey), { olx: newOLX });
  return data.olx;
}

/**
 * Publish the given XBlock.
 */
export async function publishXBlock(usageKey: string) {
  const client = getAuthenticatedHttpClient();
  await client.post(getXBlockPublishApiUrl(usageKey));
}

/**
 * Fetch the asset (static file) list for the given XBlock.
 */
// istanbul ignore next
export async function getXBlockAssets(usageKey: string): Promise<LibraryAssetResponse[]> {
  const { data } = await getAuthenticatedHttpClient().get(getXBlockAssetsApiUrl(usageKey));
  return data.files;
}

/**
 * Delete a single asset file
 */
// istanbul ignore next
export async function deleteXBlockAsset(usageKey: string, path: string): Promise<void> {
  await getAuthenticatedHttpClient().delete(getXBlockAssetsApiUrl(usageKey) + encodeURIComponent(path));
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
 * Add components to collection.
 */
export async function addComponentsToCollection(libraryId: string, collectionId: string, usageKeys: string[]) {
  await getAuthenticatedHttpClient().patch(getLibraryCollectionComponentApiUrl(libraryId, collectionId), {
    usage_keys: usageKeys,
  });
}

/**
 * Remove components from collection.
 */
export async function removeComponentsFromCollection(libraryId: string, collectionId: string, usageKeys: string[]) {
  await getAuthenticatedHttpClient().delete(getLibraryCollectionComponentApiUrl(libraryId, collectionId), {
    data: { usage_keys: usageKeys },
  });
}

/**
 * Soft-Delete collection.
 */
export async function deleteCollection(libraryId: string, collectionId: string) {
  const client = getAuthenticatedHttpClient();
  await client.delete(getLibraryCollectionApiUrl(libraryId, collectionId));
}

/**
 * Restore soft-deleted collection
 */
export async function restoreCollection(libraryId: string, collectionId: string) {
  const client = getAuthenticatedHttpClient();
  await client.post(getLibraryCollectionRestoreApiUrl(libraryId, collectionId));
}

/**
 * Update component collections.
 */
export async function updateComponentCollections(usageKey: string, collectionKeys: string[]) {
  await getAuthenticatedHttpClient().patch(getLibraryBlockCollectionsUrl(usageKey), {
    collection_keys: collectionKeys,
  });
}
