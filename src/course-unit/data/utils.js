import { camelCaseObject } from '@edx/frontend-platform';

import { NOTIFICATION_MESSAGES } from '../../constants';
import { PUBLISH_TYPES } from '../constants';

export function normalizeCourseSectionVerticalData(metadata) {
  const data = camelCaseObject(metadata);
  return {
    ...data,
    sequence: {
      id: data.subsectionLocation,
      title: data.xblock.displayName,
      unitIds: data.xblockInfo.ancestorInfo.ancestors[0].childInfo.children.map((item) => item.id),
    },
    units: data.xblockInfo.ancestorInfo.ancestors[0].childInfo.children.map((unit) => ({
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
 * @param {string} type - The publishing type.
 * @param {boolean} isVisible - The visibility status.
 * @param {boolean} isModalView - The modal view status.
 * @returns {string} The corresponding notification message.
 */
export const getNotificationMessage = (type, isVisible, isModalView) => {
  let notificationMessage;

  if (type === PUBLISH_TYPES.discardChanges) {
    notificationMessage = NOTIFICATION_MESSAGES.discardChanges;
  } else if (type === PUBLISH_TYPES.makePublic) {
    notificationMessage = NOTIFICATION_MESSAGES.publishing;
  } else if (type === PUBLISH_TYPES.republish && isModalView) {
    notificationMessage = NOTIFICATION_MESSAGES.saving;
  } else if (type === PUBLISH_TYPES.republish && !isVisible) {
    notificationMessage = NOTIFICATION_MESSAGES.makingVisibleToStudents;
  } else if (type === PUBLISH_TYPES.republish && isVisible) {
    notificationMessage = NOTIFICATION_MESSAGES.hidingFromStudents;
  }

  return notificationMessage;
};

/**
 * Updates the 'id' property of objects in the data structure using the 'blockId' value where present.
 * @param {Object} data - The original data structure to be updated.
 * @returns {Object} - The updated data structure with updated 'id' values.
 */
export const updateXBlockBlockIdToId = (data) => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(updateXBlockBlockIdToId);
  }

  const updatedData = {};

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
