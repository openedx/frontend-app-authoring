import { useIntl } from '@edx/frontend-platform/i18n';

import { getUnitReleaseStatus, UNIT_VISIBILITY_STATES } from '../constants';
import messages from './messages';
import { extractCourseUnitId } from './utils';

const useCourseUnitData = ({
  hasChanges, published, visibilityState, id,
}) => {
  const intl = useIntl();
  const releaseStatus = getUnitReleaseStatus(intl);
  const locationId = extractCourseUnitId(id);
  const visibleToStaffOnly = visibilityState === UNIT_VISIBILITY_STATES.staffOnly;
  const titleMessages = {
    [UNIT_VISIBILITY_STATES.staffOnly]: messages.sidebarTitleVisibleToStaffOnly,
    [UNIT_VISIBILITY_STATES.live]: messages.sidebarTitlePublishedAndLive,
    // eslint-disable-next-line no-nested-ternary
    default: published
      ? (hasChanges ? messages.sidebarTitleDraftUnpublishedChanges
        : messages.sidebarTitlePublishedNotYetReleased)
      : messages.sidebarTitleDraftNeverPublished,
  };

  const releaseLabels = {
    [UNIT_VISIBILITY_STATES.staffOnly]: releaseStatus.release,
    [UNIT_VISIBILITY_STATES.live]: releaseStatus.released,
    [UNIT_VISIBILITY_STATES.ready]: releaseStatus.scheduled,
    default: releaseStatus.release,
  };

  const title = intl.formatMessage(titleMessages[visibilityState] || titleMessages.default);
  const releaseLabel = releaseLabels[visibilityState] || releaseLabels.default;

  return {
    title,
    locationId,
    releaseLabel,
    visibilityState,
    visibleToStaffOnly,
  };
};

export default useCourseUnitData;
