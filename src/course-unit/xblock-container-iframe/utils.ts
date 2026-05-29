import { getConfig } from '@edx/frontend-platform';

import { UserPartitionInfoTypes, UserPartitionTypes } from '@src/data/types';
import { COURSE_BLOCK_NAMES } from '../../constants';
import { FormattedAccessManagedXBlockDataTypes, XBlockTypes } from './types';

const emptyUserPartitionInfo = (): UserPartitionInfoTypes => ({
  selectablePartitions: [],
  selectedPartitionIndex: -1,
  selectedGroupsLabel: '',
});

export const normalizeUserPartitionInfo = (xblock: {
  userPartitionInfo?: UserPartitionInfoTypes;
  userPartitions?: UserPartitionTypes[];
}): UserPartitionInfoTypes => {
  const partitionInfo = xblock.userPartitionInfo;
  if (partitionInfo?.selectablePartitions?.length) {
    return partitionInfo;
  }

  const userPartitions = xblock.userPartitions ?? [];
  if (!userPartitions.length) {
    return partitionInfo ?? emptyUserPartitionInfo();
  }

  const selectablePartitions = userPartitions.filter((partition) => {
    if (partition.scheme === 'enrollment_track') {
      return partition.groups.length > 1 || partition.groups.some((group) => group.selected);
    }
    return true;
  });

  return {
    selectablePartitions: selectablePartitions.length ? selectablePartitions : userPartitions,
    selectedPartitionIndex: partitionInfo?.selectedPartitionIndex ?? -1,
    selectedGroupsLabel: partitionInfo?.selectedGroupsLabel ?? '',
  };
};

/**
 * Formats the XBlock data into a standardized structure for access management.
 *
 * @param {XBlockTypes} xblock - The XBlock object containing the original data.
 * @param {string} usageId - The unique identifier for the XBlock.
 *
 * @returns {FormattedAccessManagedXBlockDataTypes} - The formatted XBlock data, ready for access management operations.
 */
export const formatAccessManagedXBlockData = (
  xblock: XBlockTypes,
  usageId: string,
): FormattedAccessManagedXBlockDataTypes => ({
  category: COURSE_BLOCK_NAMES.component.id,
  displayName: xblock.name,
  userPartitionInfo: normalizeUserPartitionInfo(xblock),
  showCorrectness: 'always',
  blockType: xblock.blockType,
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
export const getLegacyEditModalUrl = (
  blockId: string | null,
): string => (blockId ? `${getConfig().STUDIO_BASE_URL}/xblock/${blockId}/action/edit` : '');
