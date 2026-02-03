import {
  AccessTimeFilled,
  CheckCircle as CheckCircleIcon,
  Description,
  Lock,
} from '@openedx/paragon/icons';

import type { IntlShape } from 'react-intl';

import { ICON_COLOR_VARIANTS, UNIT_VISIBILITY_STATES } from '../constants';
import messages from './messages';

/**
 * Get information about the publishing status.
 * @param intl - The internationalization object.
 * @param hasChanges - Indicates if there are unpublished changes.
 * @param editedBy - The user who edited the content.
 * @param editedOn - The timestamp when the content was edited.
 * @param publishedBy - The user who last published the content.
 * @param publishedOn - The timestamp when the content was last published.
 * @returns Publish information based on the provided parameters.
 */
// this fn appears to be unused - <SidebarBody> is never called with displayUnitLocation=false.
// Ingoring it for coverage for now and we'll delete the whole legacy sidebar soon.
// istanbul ignore next
export const getPublishInfo = (
  intl: IntlShape,
  hasChanges: boolean,
  editedBy: string,
  editedOn: string,
  publishedBy: string,
  publishedOn: any,
): string => {
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
 * @param intl - The internationalization object.
 * @param releaseDate - The release date of the content.
 * @param releaseDateFrom - The section name associated with the release date.
 * @returns Release information based on the provided parameters.
 */
export const getReleaseInfo = (intl: IntlShape, releaseDate: string, releaseDateFrom: string) => {
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
 * @param visibilityState - The visibility state of the content.
 * @param published - Indicates if the content is published.
 * @param hasChanges - Indicates if there are unpublished changes.
 * @returns An object containing the icon component and color variant.
 *   - iconSrc: The source component for the icon.
 *   - colorVariant: The color variant for the icon.
 */
export const getIconVariant = (visibilityState: string, published: boolean, hasChanges: boolean) => {
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
 * @param id - The course unit ID.
 * @returns The clear course unit ID extracted from the provided data.
 */
export const extractCourseUnitId = (id: string): string => id.match(/block@(.+)$/)![1];
