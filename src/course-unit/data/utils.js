import { camelCaseObject } from '@edx/frontend-platform';

import { NOTIFICATION_MESSAGES } from '../../constants';
import { PUBLISH_TYPES } from '../constants';

// eslint-disable-next-line import/prefer-default-export
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
 * @returns {string} The corresponding notification message.
 */
export const getNotificationMessage = (type, isVisible) => {
  let notificationMessage;

  if (type === PUBLISH_TYPES.discardChanges) {
    notificationMessage = NOTIFICATION_MESSAGES.discardChanges;
  } else if (type === PUBLISH_TYPES.makePublic) {
    notificationMessage = NOTIFICATION_MESSAGES.publishing;
  } else if (type === PUBLISH_TYPES.republish && !isVisible) {
    notificationMessage = NOTIFICATION_MESSAGES.makingVisibleToStudents;
  } else if (type === PUBLISH_TYPES.republish && isVisible) {
    notificationMessage = NOTIFICATION_MESSAGES.hidingFromStudents;
  }

  return notificationMessage;
};
