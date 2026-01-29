import moment, { Moment } from 'moment/moment';
import { FormattedDate, FormattedMessage } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform/config';
import { Badge, Icon, Stack } from '@openedx/paragon';
import { Link } from 'react-router-dom';

import type { ChecklistType, CourseOutlineStatusBar } from '@src/course-outline/data/types';
import {
  Cached, ChecklistRtl, Description, Event,
} from '@openedx/paragon/icons';
import { useWaffleFlags } from '@src/data/apiHooks';
import { useEntityLinksSummaryByDownstreamContext } from '@src/course-libraries/data/apiHooks';
import { useCourseDetails } from '@src/course-outline/data/apiHooks';
import messages from './messages';
import { NotificationStatusIcon } from './NotificationStatusIcon';

const CourseBadge = ({ startDate, endDate }: { startDate: Moment, endDate: Moment }) => {
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

const UnpublishedBadgeStatus = ({ courseId }: { courseId: string }) => {
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

const LibraryUpdates = ({ courseId }: { courseId: string }) => {
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
  startDate, endDate, startDateRaw, datesLink,
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

export interface StatusBarProps {
  courseId: string;
  isLoading: boolean;
  statusBarData: CourseOutlineStatusBar;
}

export const StatusBar = ({
  statusBarData,
  isLoading,
  courseId,
}: StatusBarProps) => {
  const waffleFlags = useWaffleFlags(courseId);

  const {
    endDate,
    courseReleaseDate,
    checklist,
  } = statusBarData;

  const courseReleaseDateObj = moment.utc(courseReleaseDate, 'MMM DD, YYYY [at] HH:mm UTC', true);
  const endDateObj = moment.utc(endDate);
  const scheduleDestination = () => new URL(`settings/details/${courseId}#schedule`, getConfig().STUDIO_BASE_URL).href;

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
        datesLink={waffleFlags.useNewScheduleDetailsPage ? `/course/${courseId}/settings/details/#schedule` : scheduleDestination()}
      />
      <Checklists courseId={courseId} checklist={checklist} />
      <LibraryUpdates courseId={courseId} />
      <NotificationStatusIcon />
    </Stack>
  );
};
