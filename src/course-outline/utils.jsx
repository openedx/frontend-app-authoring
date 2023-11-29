import {
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
  EditOutline as EditOutlineIcon,
} from '@edx/paragon/icons';

import { SECTION_BADGE_STATUTES, STAFF_ONLY } from './constants';

/**
 * Get section status depended on section info
 * @param {bool} published - value from section info
 * @param {bool} releasedToStudents - value from section info
 * @param {bool} visibleToStaffOnly - value from section info
 * @param {string} visibilityState - value from section info
 * @param {bool} staffOnlyMessage - value from section info
 * @returns {SECTION_BADGE_STATUTES[keyof SECTION_BADGE_STATUTES]}
 */
const getSectionStatus = ({
  published,
  releasedToStudents,
  visibleToStaffOnly,
  visibilityState,
  staffOnlyMessage,
}) => {
  switch (true) {
  case published && releasedToStudents:
    return SECTION_BADGE_STATUTES.live;
  case published && !releasedToStudents:
    return SECTION_BADGE_STATUTES.publishedNotLive;
  case visibleToStaffOnly && staffOnlyMessage && visibilityState === STAFF_ONLY:
    return SECTION_BADGE_STATUTES.staffOnly;
  case !published:
    return SECTION_BADGE_STATUTES.draft;
  default:
    return '';
  }
};

/**
 * Get section badge status content
 * @param {string} status - value from on getSectionStatus util
 * @returns {
 *   badgeTitle: string,
 *   badgeIcon: node,
 * }
 */
const getSectionStatusBadgeContent = (status, messages, intl) => {
  switch (status) {
  case SECTION_BADGE_STATUTES.live:
    return {
      badgeTitle: intl.formatMessage(messages.statusBadgeLive),
      badgeIcon: CheckCircleIcon,
    };
  case SECTION_BADGE_STATUTES.publishedNotLive:
    return {
      badgeTitle: intl.formatMessage(messages.statusBadgePublishedNotLive),
      badgeIcon: '',
    };
  case SECTION_BADGE_STATUTES.staffOnly:
    return {
      badgeTitle: intl.formatMessage(messages.statusBadgeStaffOnly),
      badgeIcon: LockIcon,
    };
  case SECTION_BADGE_STATUTES.draft:
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
  ref.current?.scrollIntoView({ behavior: 'smooth' });
};

export {
  getSectionStatus,
  getSectionStatusBadgeContent,
  getHighlightsFormValues,
  scrollToElement,
};
