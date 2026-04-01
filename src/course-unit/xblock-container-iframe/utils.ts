import { getConfig } from '@edx/frontend-platform';
import { AccessManagedXBlockDataTypes } from '@src/data/types';

import { COURSE_BLOCK_NAMES } from '../../constants';
import { XBlockTypes } from './types';

/**
 * Formats the XBlock data into a standardized structure for access management.
 */
export const formatAccessManagedXBlockData = (xblock: XBlockTypes, usageId: string): AccessManagedXBlockDataTypes => ({
  category: COURSE_BLOCK_NAMES.component.id,
  displayName: xblock.name,
  userPartitionInfo: xblock.userPartitionInfo,
  showCorrectness: 'always',
  id: usageId,
});

/**
 * Generates the iframe URL for the given block ID.
 *
 * @param {string} blockId - The unique identifier of the block.
 *
 * @returns {string} - The generated iframe URL.
 */
export const getIframeUrl = (blockId: string): string => `${getConfig().STUDIO_BASE_URL}/container_embed/${blockId}`;

/**
 * Generates the legacy edit modal URL for the given block ID.
 *
 * @param {string | null} blockId - The unique identifier of the block.
 *
 * @returns {string} - The generated URL for editing the XBlock in the legacy modal.
 */
export const getLegacyEditModalUrl = (blockId: string | null): string =>
  blockId ? `${getConfig().STUDIO_BASE_URL}/xblock/${blockId}/action/edit` : '';
