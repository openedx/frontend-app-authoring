import type { IntlShape, MessageDescriptor } from 'react-intl';
import { getConfig } from '@edx/frontend-platform';
import {
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
} from '@openedx/paragon/icons';

import DraftIcon from '@src/generic/DraftIcon';
import { VisibilityTypes } from '@src/data/constants';
import { ValueOf } from '@src/types';
import { ITEM_BADGE_STATUS, VIDEO_SHARING_OPTIONS } from './constants';

export type ItemBadgeStatusValue = ValueOf<typeof ITEM_BADGE_STATUS>;
/**
 * Get section status depended on section info
 */
const getItemStatus = ({
  published,
  visibilityState,
  hasChanges,
}: {
  published: boolean;
  visibilityState: string;
  hasChanges?: boolean;
}): ItemBadgeStatusValue => {
  switch (true) {
    case visibilityState === VisibilityTypes.STAFF_ONLY:
      return ITEM_BADGE_STATUS.staffOnly;
    case visibilityState === VisibilityTypes.GATED:
      return ITEM_BADGE_STATUS.gated;
    case visibilityState === VisibilityTypes.LIVE:
      return ITEM_BADGE_STATUS.live;
    case visibilityState === VisibilityTypes.UNSCHEDULED:
      return ITEM_BADGE_STATUS.unscheduled;
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
 */
const getItemStatusBadgeContent = (
  status: ItemBadgeStatusValue,
  messages: Record<string, MessageDescriptor>,
  intl: IntlShape,
) => {
  switch (status) {
    case ITEM_BADGE_STATUS.gated:
      return {
        badgeTitle: intl.formatMessage(messages.statusBadgeGated),
        badgeIcon: LockIcon,
      };
    case ITEM_BADGE_STATUS.live:
      return {
        badgeTitle: intl.formatMessage(messages.statusBadgeLive),
        badgeIcon: CheckCircleIcon,
      };
    case ITEM_BADGE_STATUS.publishedNotLive:
      return {
        badgeTitle: intl.formatMessage(messages.statusBadgePublishedNotLive),
        badgeIcon: null,
      };
    case ITEM_BADGE_STATUS.staffOnly:
      return {
        badgeTitle: intl.formatMessage(messages.statusBadgeStaffOnly),
        badgeIcon: LockIcon,
      };
    case ITEM_BADGE_STATUS.unpublishedChanges:
      return {
        badgeTitle: intl.formatMessage(messages.statusBadgeUnpublishedChanges),
        badgeIcon: DraftIcon,
      };
    case ITEM_BADGE_STATUS.draft:
      return {
        badgeTitle: intl.formatMessage(messages.statusBadgeDraft),
        badgeIcon: DraftIcon,
      };
    default:
      return {
        badgeTitle: '',
        badgeIcon: null,
      };
  }
};

/**
 * Get section border color
 */
const getItemStatusBorder = (status?: ItemBadgeStatusValue) => {
  switch (status) {
    case ITEM_BADGE_STATUS.live:
      return {
        borderLeft: '5px solid #00688D',
      };
    case ITEM_BADGE_STATUS.publishedNotLive:
      return {
        borderLeft: '5px solid #0D7D4D',
      };
    case ITEM_BADGE_STATUS.gated:
      return {
        borderLeft: '5px solid #000000',
      };
    case ITEM_BADGE_STATUS.staffOnly:
      return {
        borderLeft: '5px solid #000000',
      };
    case ITEM_BADGE_STATUS.unpublishedChanges:
      return {
        borderLeft: '5px solid #F0CC00',
      };
    case ITEM_BADGE_STATUS.draft:
      return {
        borderLeft: '5px solid #F0CC00',
      };
    case ITEM_BADGE_STATUS.unscheduled:
      return {
        borderLeft: '5px solid #ccc',
      };
    default:
      return {};
  }
};

/**
 * Get formatted highlights form values
 */
const getHighlightsFormValues = (currentHighlights: Array<string>): any => {
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
 */
const scrollToElement = (
  target: HTMLElement,
  alignWithTop: boolean = false,
  highlight: boolean = false,
) => {
  if (target.getBoundingClientRect().bottom > window.innerHeight) {
    // if alignWithTop is set, the top of the target will be aligned to the top of visible area
    // of the scrollable ancestor, Otherwise, the bottom of the target will be aligned to the
    // bottom of the visible area of the scrollable ancestor.
    target.scrollIntoView({
      behavior: 'smooth',
      block: alignWithTop ? 'start' : 'end',
      inline: 'nearest',
    });
  }

  // Target is outside the view from the top
  if (target.getBoundingClientRect().top < 0) {
    // The top of the target will be aligned to the top of the visible area of the scrollable ancestor
    target.scrollIntoView({ behavior: 'smooth' });
  }

  if (highlight && !target.classList.contains('highlight')) {
    target.classList.add('highlight');
  }
};

/**
 * Get video sharing dropdown translated options.
 * @param {string} id - option id
 * @returns {string} - text to display
 */
const getVideoSharingOptionText = (
  id: ValueOf<typeof VIDEO_SHARING_OPTIONS>,
  messages: Record<string, MessageDescriptor>,
  intl: IntlShape,
): string => {
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

/**
 * Returns `true` if the new design for the course outline is enabled
 */
const isOutlineNewDesignEnabled = () => (
  getConfig().ENABLE_COURSE_OUTLINE_NEW_DESIGN?.toString().toLowerCase() === 'true'
);

export {
  getItemStatus,
  getItemStatusBadgeContent,
  getItemStatusBorder,
  getHighlightsFormValues,
  getVideoSharingOptionText,
  scrollToElement,
  isOutlineNewDesignEnabled,
};
