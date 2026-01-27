import {
  AccessTimeFilled,
  CheckCircle as CheckCircleIcon,
  Description,
  Lock,
} from '@openedx/paragon/icons';

import { ICON_COLOR_VARIANTS, UNIT_VISIBILITY_STATES } from '../constants';
import messages from './messages';

/**
 * Get information about the publishing status.
 * @param {Object} intl - The internationalization object.
 * @param {boolean} hasChanges - Indicates if there are unpublished changes.
 * @param {string} editedBy - The user who edited the content.
 * @param {string} editedOn - The timestamp when the content was edited.
 * @param {string} publishedBy - The user who last published the content.
 * @param {string} publishedOn - The timestamp when the content was last published.
 * @returns {string} Publish information based on the provided parameters.
 */
export const getPublishInfo = (intl, hasChanges, editedBy, editedOn, publishedBy, publishedOn) => {
  let publishInfoText;
  if (hasChanges && editedOn && editedBy) {
    publishInfoText = intl.formatMessage(messages.publishInfoDraftSaved, { editedOn, editedBy });
  } else if (publishedOn && publishedBy) {
    publishInfoText = intl.formatMessage(messages.publishLastPublished, { publishedOn, publishedBy });
  } else {
    publishInfoText = intl.formatMessage(messages.publishInfoPreviouslyPublished);
  }

  return publishInfoText;
};

/**
 * Get information about the release status.
 * @param {Object} intl - The internationalization object.
 * @param {string} releaseDate - The release date of the content.
 * @param {string} releaseDateFrom - The section name associated with the release date.
 * @returns {string|ReactElement} Release information based on the provided parameters.
 */
export const getReleaseInfo = (intl, releaseDate, releaseDateFrom) => {
  if (releaseDate) {
    return {
      isScheduled: true,
      releaseDate,
      releaseDateFrom,
      sectionNameMessage: intl.formatMessage(messages.releaseInfoWithSection, { sectionName: releaseDateFrom }),
    };
  }
  return {
    isScheduled: false,
    message: intl.formatMessage(messages.releaseInfoUnscheduled),
  };
};

/**
 * Get the icon variant based on the provided visibility state and publication status.
 * @param {string} visibilityState - The visibility state of the content.
 * @param {boolean} published - Indicates if the content is published.
 * @param {boolean} hasChanges - Indicates if there are unpublished changes.
 * @returns {Object} An object containing the icon component and color variant.
 *   - iconSrc: The source component for the icon.
 *   - colorVariant: The color variant for the icon.
 */
export const getIconVariant = (visibilityState, published, hasChanges) => {
  const iconVariants = {
    [UNIT_VISIBILITY_STATES.staffOnly]: { iconSrc: Lock, colorVariant: ICON_COLOR_VARIANTS.PRIMARY },
    [UNIT_VISIBILITY_STATES.live]: { iconSrc: CheckCircleIcon, colorVariant: ICON_COLOR_VARIANTS.GREEN },
    publishedNoChanges: { iconSrc: AccessTimeFilled, colorVariant: ICON_COLOR_VARIANTS.INFO },
    publishedWithChanges: { iconSrc: Description, colorVariant: ICON_COLOR_VARIANTS.ORANGE },
    default: { iconSrc: Description, colorVariant: ICON_COLOR_VARIANTS.ORANGE },
  };
  if (visibilityState in iconVariants) {
    return iconVariants[visibilityState];
  }
  if (published) {
    return hasChanges ? iconVariants.publishedWithChanges : iconVariants.publishedNoChanges;
  }
  return iconVariants.default;
};

/**
 * Extracts the clear course unit ID from the given course unit data.
 * @param {string} id - The course unit ID.
 * @returns {string} The clear course unit ID extracted from the provided data.
 */
export const extractCourseUnitId = (id) => id.match(/block@(.+)$/)[1];
