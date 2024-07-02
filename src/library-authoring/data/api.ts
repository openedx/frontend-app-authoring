import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
/**
 * Get the URL for the content library API.
 */
export const getContentLibraryApiUrl = (libraryId: string) => `${getApiBaseUrl()}/api/libraries/v2/${libraryId}/`;
/**
 * Get the URL for get block types of library.
 */
export const getLibraryBlockTypesUrl = (libraryId: string) => `${getApiBaseUrl()}/api/libraries/v2/${libraryId}/block_types/`;

export interface ContentLibrary {
  id: string;
  type: string;
  org: string;
  slug: string;
  title: string;
  description: string;
  numBlocks: number;
  version: number;
  lastPublished: Date | null;
  allowLti: boolean;
  allowPublicLearning: boolean;
  allowPublicRead: boolean;
  hasUnpublishedChanges: boolean;
  hasUnpublishedDeletes: boolean;
  license: string;
}

export interface LibraryBlockType {
  blockType: string;
  displayName: string;
}

/**
 * Fetch a content library by its ID.
 */
export async function getContentLibrary(libraryId?: string): Promise<ContentLibrary> {
  if (!libraryId) {
    throw new Error('libraryId is required');
  }

  const { data } = await getAuthenticatedHttpClient().get(getContentLibraryApiUrl(libraryId));
  return camelCaseObject(data);
}

/**
 * Fetch block types of a library
 */
export async function getLibraryBlockTypes(libraryId?: string): Promise<LibraryBlockType[]> {
  if (!libraryId) {
    throw new Error('libraryId is required');
  }

  const { data } = await getAuthenticatedHttpClient().get(getLibraryBlockTypesUrl(libraryId));
  return camelCaseObject(data);
}