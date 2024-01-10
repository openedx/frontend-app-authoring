import {
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
  EditOutline as EditOutlineIcon,
} from '@edx/paragon/icons';

import { ITEM_BADGE_STATUS, VIDEO_SHARING_OPTIONS } from './constants';
import { VisibilityTypes } from '../data/constants';

/**
 * Get section status depended on section info
 * @param {bool} published - value from section info
 * @param {string} visibilityState - value from section info
 * @returns {ITEM_BADGE_STATUS[keyof ITEM_BADGE_STATUS]}
 */
const getItemStatus = ({
  published,
  visibilityState,
  hasChanges,
}) => {
  switch (true) {
  case visibilityState === VisibilityTypes.STAFF_ONLY:
    return ITEM_BADGE_STATUS.staffOnly;
  case visibilityState === VisibilityTypes.LIVE:
    return ITEM_BADGE_STATUS.live;
  case published && !hasChanges:
    return ITEM_BADGE_STATUS.publishedNotLive;
  case published && hasChanges:
    return ITEM_BADGE_STATUS.unpublishedChanges;
  default:
    return ITEM_BADGE_STATUS.draft;
  }
};

/**
 * Get section badge status content
 * @param {string} status - value from on getItemStatus util
 * @returns {
 *   badgeTitle: string,
 *   badgeIcon: node,
 * }
 */
const getItemStatusBadgeContent = (status, messages, intl) => {
  switch (status) {
  case ITEM_BADGE_STATUS.live:
    return {
      badgeTitle: intl.formatMessage(messages.statusBadgeLive),
      badgeIcon: CheckCircleIcon,
    };
  case ITEM_BADGE_STATUS.publishedNotLive:
    return {
      badgeTitle: intl.formatMessage(messages.statusBadgePublishedNotLive),
      badgeIcon: '',
    };
  case ITEM_BADGE_STATUS.staffOnly:
    return {
      badgeTitle: intl.formatMessage(messages.statusBadgeStaffOnly),
      badgeIcon: LockIcon,
    };
  case ITEM_BADGE_STATUS.unpublishedChanges:
    return {
      badgeTitle: intl.formatMessage(messages.statusBadgeUnpublishedChanges),
      badgeIcon: EditOutlineIcon,
    };
  case ITEM_BADGE_STATUS.draft:
    return {
      badgeTitle: intl.formatMessage(messages.statusBadgeDraft),
      badgeIcon: EditOutlineIcon,
    };
  default:
    return {
      badgeTitle: '',
      badgeIcon: '',
    };
  }
};

/**
 * Get formatted highlights form values
 * @param {Array<string>} currentHighlights - section highlights
 * @returns {
 *   highlight_1: string,
 *   highlight_2: string,
 *   highlight_3: string,
 *   highlight_4: string,
 *   highlight_5: string,
 * }
 */
const getHighlightsFormValues = (currentHighlights) => {
  const initialFormValues = {
    highlight_1: '',
    highlight_2: '',
    highlight_3: '',
    highlight_4: '',
    highlight_5: '',
  };

  const formValues = currentHighlights.length
    ? Object.entries(initialFormValues).reduce((result, [key], index) => {
      if (currentHighlights[index]) {
        return {
          ...result,
          [key]: currentHighlights[index],
        };
      }
      return result;
    }, initialFormValues)
    : initialFormValues;

  return formValues;
};

/**
 * Method to scroll into view port, if it's outside the viewport
 *
 * @param {Object} target - DOM Element
 * @returns {undefined}
 */
const scrollToElement = target => {
  if (target.getBoundingClientRect().bottom > window.innerHeight) {
    //  The bottom of the target will be aligned to the bottom of the visible area of the scrollable ancestor.
    target.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
  }

  // Target is outside the view from the top
  if (target.getBoundingClientRect().top < 0) {
    // The top of the target will be aligned to the top of the visible area of the scrollable ancestor
    target.scrollIntoView({ behavior: 'smooth' });
  }
};

/**
 * Get video sharing dropdown translated options.
 * @param {string} id - option id
 * @returns {string} - text to display
 */
const getVideoSharingOptionText = (id, messages, intl) => {
  switch (id) {
  case VIDEO_SHARING_OPTIONS.perVideo:
    return intl.formatMessage(messages.videoSharingPerVideoText);
  case VIDEO_SHARING_OPTIONS.allOn:
    return intl.formatMessage(messages.videoSharingAllOnText);
  case VIDEO_SHARING_OPTIONS.allOff:
    return intl.formatMessage(messages.videoSharingAllOffText);
  default:
    return '';
  }
};

export {
  getItemStatus,
  getItemStatusBadgeContent,
  getHighlightsFormValues,
  getVideoSharingOptionText,
  scrollToElement,
};
