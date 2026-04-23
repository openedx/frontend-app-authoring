import moment, { Moment } from 'moment/moment';
import {
  FormattedDate,
  FormattedMessage,
  useIntl,
} from '@edx/frontend-platform/i18n';
import {
  Badge,
  Button,
  Form,
  Hyperlink,
  Icon,
  Stack,
} from '@openedx/paragon';
import { Link } from 'react-router-dom';
import {
  Cached,
  ChecklistRtl,
  Description,
  Event,
} from '@openedx/paragon/icons';

import type { ChecklistType, CourseOutlineStatusBar } from '@src/course-outline/data/types';
import { useEntityLinksSummaryByDownstreamContext } from '@src/course-libraries/data/apiHooks';
import { VIDEO_SHARING_OPTIONS } from '@src/course-outline/constants';
import { useCourseDetails } from '@src/course-outline/data/apiHooks';
import { getVideoSharingOptionText } from '@src/course-outline/utils';
import { useHelpUrls } from '@src/help-urls/hooks';

import messages from './messages';
import { NotificationStatusIcon } from './NotificationStatusIcon';

const CourseBadge = ({ startDate, endDate }: { startDate: Moment; endDate: Moment; }) => {
  const now = moment().utc();
  switch (true) {
    case !startDate.isValid():
      return null;
    case now.isBetween(startDate, endDate.isValid() ? endDate : undefined, undefined, '[]'):
      return (
        <Badge className="px-3 py-2" variant="success">
          <FormattedMessage {...messages.activeBadgeText} />
        </Badge>
      );
    case now.isBefore(startDate):
      return (
        <Badge className="px-3 py-2" variant="info">
          <FormattedMessage {...messages.upcomingBadgeText} />
        </Badge>
      );
    case endDate.isValid() && endDate.isBefore(now):
      return (
        <Badge className="px-3 py-2 bg-gray-500" variant="secondary">
          <FormattedMessage {...messages.archivedBadgeText} />
        </Badge>
      );
    default:
      // istanbul ignore next: this should not happen
      return null;
  }
};

const UnpublishedBadgeStatus = ({ courseId }: { courseId: string; }) => {
  const { data } = useCourseDetails(courseId);
  if (!data?.hasChanges) {
    return null;
  }
  return (
    <Badge
      className="px-2 py-2 bg-draft-status text-gray-700 font-weight-normal"
      variant="light"
    >
      <Stack direction="horizontal" gap={2}>
        <Icon size="xs" src={Description} />
        <FormattedMessage {...messages.unpublishedBadgeText} />
      </Stack>
    </Badge>
  );
};

const LibraryUpdates = ({ courseId }: { courseId: string; }) => {
  const { data } = useEntityLinksSummaryByDownstreamContext(courseId);
  const outOfSyncCount = data?.reduce((count, lib) => count + (lib.readyToSyncCount || 0), 0);
  const url = `/course/${courseId}/libraries?tab=review`;

  if (!outOfSyncCount || outOfSyncCount === 0) {
    return null;
  }

  return (
    <Link
      className="small text-gray-700"
      to={url}
    >
      <Stack direction="horizontal" gap={2}>
        <Icon size="sm" src={Cached} />
        <FormattedMessage
          {...messages.libraryUpdatesText}
          values={{ count: outOfSyncCount }}
        />
      </Stack>
    </Link>
  );
};

const CourseDates = ({
  startDate,
  endDate,
  startDateRaw,
  datesLink,
}: {
  startDate: Moment;
  endDate: Moment;
  startDateRaw: string;
  datesLink: string;
}) => {
  if (!startDate.isValid()) {
    // Returns string contained in startDate, i.e. `Set Date`
    return (
      <Link
        className="small"
        to={datesLink}
      >
        <Stack direction="horizontal" gap={2}>
          <Icon size="sm" className="mb-1" src={Event} />
          {startDateRaw}
        </Stack>
      </Link>
    );
  }

  return (
    <Link
      className="small text-gray-700"
      to={datesLink}
    >
      <Stack direction="horizontal" gap={2}>
        <Icon size="sm" className="mb-1" src={Event} />
        <FormattedDate
          value={startDate.toISOString()}
          year="numeric"
          month="short"
          day="2-digit"
        />
        {endDate.isValid() && (
          <>
            {' - '}
            <FormattedDate
              value={endDate.toISOString()}
              year="numeric"
              month="short"
              day="2-digit"
            />
          </>
        )}
      </Stack>
    </Link>
  );
};

const Checklists = ({ courseId, checklist }: {
  courseId: string;
  checklist: ChecklistType;
}) => {
  const {
    completedCourseLaunchChecks,
    completedCourseBestPracticesChecks,
    totalCourseLaunchChecks,
    totalCourseBestPracticesChecks,
  } = checklist;

  const completed = completedCourseLaunchChecks + completedCourseBestPracticesChecks;
  const total = totalCourseLaunchChecks + totalCourseBestPracticesChecks;

  if (completed === total) {
    return null;
  }

  const checkListTitle = `${completed}/${total}`;
  return (
    <Link
      className="small text-primary-500 d-flex"
      to={`/course/${courseId}/checklists`}
    >
      <Icon src={ChecklistRtl} size="md" className="mr-2" />
      {checkListTitle} <FormattedMessage {...messages.checklistCompleted} />
    </Link>
  );
};

const Highlights = ({ highlightsEnabledForMessaging, openEnableHighlightsModal }: {
  highlightsEnabledForMessaging: boolean;
  openEnableHighlightsModal: () => void;
}) => {
  const intl = useIntl();

  if (highlightsEnabledForMessaging) {
    return (
      <span data-testid="highlights-enabled-span" className="small">
        {intl.formatMessage(messages.highlightEmailsEnabled)}
      </span>
    );
  } else {
    return (
      <Button data-testid="highlights-enable-button" size="sm" onClick={openEnableHighlightsModal}>
        {intl.formatMessage(messages.highlightEmailsButton)}
      </Button>
    );
  }
};

const VideoSharingDropdown = ({ handleVideoSharingOptionChange, videoSharingOptions }: {
  handleVideoSharingOptionChange: (value: string) => void;
  videoSharingOptions: string;
}) => {
  const intl = useIntl();
  const {
    socialSharing: socialSharingUrl,
  } = useHelpUrls(['socialSharing']);

  return (
    <Form.Group
      size="sm"
      className="d-flex m-0 align-items-center"
    >
      <Form.Label className="h5 m-0 mr-2 text-gray-700">
        <FormattedMessage {...messages.videoSharingTitle} />
      </Form.Label>
      <div className="d-flex align-items-center">
        <Form.Control
          as="select"
          defaultValue={videoSharingOptions}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleVideoSharingOptionChange(e.target.value)}
        >
          {Object.values(VIDEO_SHARING_OPTIONS).map((option) => (
            <option
              key={option}
              value={option}
            >
              {getVideoSharingOptionText(option, messages, intl)}
            </option>
          ))}
        </Form.Control>
        <Hyperlink
          className="small"
          destination={socialSharingUrl}
          target="_blank"
          showLaunchIcon={false}
        >
          <FormattedMessage {...messages.videoSharingLink} />
        </Hyperlink>
      </div>
    </Form.Group>
  );
};

export interface StatusBarProps {
  courseId: string;
  isLoading: boolean;
  statusBarData: CourseOutlineStatusBar;
  openEnableHighlightsModal: () => void;
  handleVideoSharingOptionChange: (value: string) => void;
}

export const StatusBar = ({
  statusBarData,
  isLoading,
  courseId,
  openEnableHighlightsModal,
  handleVideoSharingOptionChange,
}: StatusBarProps) => {
  const {
    endDate,
    courseReleaseDate,
    highlightsEnabledForMessaging,
    checklist,
    videoSharingEnabled,
    videoSharingOptions,
  } = statusBarData;

  const courseReleaseDateObj = moment.utc(courseReleaseDate, 'MMM DD, YYYY [at] HH:mm UTC', true);
  const endDateObj = moment.utc(endDate);

  if (isLoading) {
    return null;
  }

  return (
    <Stack direction="horizontal" gap={4}>
      <CourseBadge startDate={courseReleaseDateObj} endDate={endDateObj} />
      <UnpublishedBadgeStatus courseId={courseId} />
      <CourseDates
        startDate={courseReleaseDateObj}
        endDate={endDateObj}
        startDateRaw={courseReleaseDate}
        datesLink={`/course/${courseId}/settings/details/#schedule`}
      />
      <Checklists courseId={courseId} checklist={checklist} />
      <LibraryUpdates courseId={courseId} />
      <Highlights
        highlightsEnabledForMessaging={highlightsEnabledForMessaging}
        openEnableHighlightsModal={openEnableHighlightsModal}
      />
      {videoSharingEnabled && (
        <VideoSharingDropdown
          handleVideoSharingOptionChange={handleVideoSharingOptionChange}
          videoSharingOptions={videoSharingOptions}
        />
      )}
      <NotificationStatusIcon />
    </Stack>
  );
};
