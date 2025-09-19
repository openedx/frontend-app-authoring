import { camelCaseObject } from '@edx/frontend-platform';

import type { XBlock } from '@src/data/types';

import { NOTIFICATION_MESSAGES } from '../../constants';
import { PUBLISH_TYPES } from '../constants';

export function normalizeCourseSectionVerticalData(metadata) {
  const data = camelCaseObject(metadata);
  return {
    ...data,
    sequence: {
      id: data.subsectionLocation,
      title: data.xblock.displayName,
      unitIds: data.xblockInfo.ancestorInfo?.ancestors[0].childInfo.children.map((item) => item.id),
    },
    units: data.xblockInfo.ancestorInfo?.ancestors[0].childInfo.children.map((unit) => ({
      id: unit.id,
      sequenceId: data.subsectionLocation,
      bookmarked: unit.bookmarked,
      complete: unit.complete,
      title: unit.displayName,
      contentType: unit.xblockType,
      graded: unit.graded,
      containsContentTypeGatedContent: unit.contains_content_type_gated_content,
    })),
  };
}

/**
 * Get the notification message based on the publishing type and visibility.
 * @param type - The publishing type.
 * @param isVisible - The visibility status.
 * @param isModalView - The modal view status.
 * @returns The corresponding notification message.
 */
export const getNotificationMessage = (type: string, isVisible: boolean, isModalView: boolean): string => {
  if (type === PUBLISH_TYPES.discardChanges) {
    return NOTIFICATION_MESSAGES.discardChanges;
  }
  if (type === PUBLISH_TYPES.makePublic) {
    return NOTIFICATION_MESSAGES.publishing;
  }
  if (type === PUBLISH_TYPES.republish && isModalView) {
    return NOTIFICATION_MESSAGES.saving;
  }
  // istanbul ignore next: this is not used in the app
  if (type === PUBLISH_TYPES.republish && !isVisible) {
    return NOTIFICATION_MESSAGES.makingVisibleToStudents;
  }

  // istanbul ignore next: this is not used in the app
  if (type === PUBLISH_TYPES.republish && isVisible) {
    return NOTIFICATION_MESSAGES.hidingFromStudents;
  }

  // istanbul ignore next: should never hit this case
  return NOTIFICATION_MESSAGES.empty;
};

/**
 * Updates the 'id' property of objects in the data structure using the 'blockId' value where present.
 * @param data - The original data structure to be updated.
 * @returns The updated data structure with updated 'id' values.
 */
export const updateXBlockBlockIdToId = (data: object): object => {
  // istanbul ignore if: should never hit this case
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(updateXBlockBlockIdToId);
  }

  const updatedData: Record<string, any> = {};

  Object.keys(data).forEach(key => {
    const value = data[key];

    if (key === 'children' || key === 'selectablePartitions' || key === 'groups') {
      updatedData[key] = updateXBlockBlockIdToId(value);
    } else {
      // Copy other properties unchanged
      updatedData[key] = value;
    }
  });

  // Special handling for objects with both 'id' and 'blockId' to ensure 'blockId' takes precedence
  if ('blockId' in data) {
    updatedData.id = data.blockId;
  }

  return updatedData;
};

/**
 * Returns whether the given Unit should be read-only.
 *
 * Units sourced from libraries are read-only (temporary, for Teak).
 *
 * @param unit - uses the 'upstreamInfo' object if found.
 * @returns True if readOnly, False if editable.
 */
export const isUnitImportedFromLib = ({ upstreamInfo }: XBlock): boolean => (
  !!upstreamInfo
  && !!upstreamInfo.upstreamRef
  && upstreamInfo.upstreamRef.startsWith('lct:')
);
