import {
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
  EditOutline as EditOutlineIcon,
} from '@edx/paragon/icons';

import { ITEM_BADGE_STATUS, STAFF_ONLY } from './constants';

/**
 * Get section status depended on section info
 * @param {bool} published - value from section info
 * @param {bool} releasedToStudents - value from section info
 * @param {bool} visibleToStaffOnly - value from section info
 * @param {string} visibilityState - value from section info
 * @param {bool} staffOnlyMessage - value from section info
 * @returns {ITEM_BADGE_STATUS[keyof ITEM_BADGE_STATUS]}
 */
const getItemStatus = ({
  published,
  releasedToStudents,
  visibleToStaffOnly,
  visibilityState,
  staffOnlyMessage,
}) => {
  switch (true) {
  case published && releasedToStudents:
    return ITEM_BADGE_STATUS.live;
  case published && !releasedToStudents:
    return ITEM_BADGE_STATUS.publishedNotLive;
  case visibleToStaffOnly && staffOnlyMessage && visibilityState === STAFF_ONLY:
    return ITEM_BADGE_STATUS.staffOnly;
  case !published:
    return ITEM_BADGE_STATUS.draft;
  default:
    return '';
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

const scrollToElement = (ref) => {
  ref.current?.scrollIntoView({
    block: 'end',
    inline: 'nearest',
    behavior: 'smooth',
  });
};

export {
  getItemStatus,
  getItemStatusBadgeContent,
  getHighlightsFormValues,
  scrollToElement,
};
