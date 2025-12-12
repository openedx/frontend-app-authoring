import moment, { Moment } from 'moment/moment';
import { FormattedDate, useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform/config';
import { Badge, Icon, Stack } from '@openedx/paragon';
import { Link } from 'react-router-dom';

import { CourseOutlineStatusBar } from '@src/course-outline/data/types';
import { ChecklistRtl, NotificationsNone } from '@openedx/paragon/icons';
import messages from './messages';
import { useWaffleFlags } from '../../data/apiHooks';

const CourseBadge = ({ startDate, endDate }: { startDate: Moment, endDate: Moment }) => {
  const now = moment().utc();
  switch (true) {
    case !startDate.isValid():
      return null;
    case now.isBetween(startDate, endDate.isValid() ? endDate : undefined, undefined, '[]'):
      return <Badge className="px-3 py-2" variant="success">Active</Badge>;
    case now.isBefore(startDate):
      return <Badge className="px-3 py-2 bg-white text-success-400 border border-success-500" variant="success">Upcoming</Badge>;
    case endDate.isValid() && endDate.isBefore(now):
      return <Badge className="px-3 py-2" variant="light">Archived</Badge>;
    default:
      // istanbul ignore next: this should not happen
      return null;
  }
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
        {startDateRaw}
      </Link>
    );
  }

  return (
    <Link
      className="small text-gray-700"
      to={datesLink}
    >
      <FormattedDate
        value={startDate.toString()}
        year="numeric"
        month="short"
        day="2-digit"
      />
      {endDate.isValid() && (
        <>
          {' - '}
          <FormattedDate
            value={endDate.toString()}
            year="numeric"
            month="short"
            day="2-digit"
          />
        </>
      )}
    </Link>
  );
};

export interface StatusBarProps {
  courseId: string;
  isLoading: boolean;
  statusBarData: CourseOutlineStatusBar;
  notificationCount?: number;
}

export const StatusBar = ({
  statusBarData,
  isLoading,
  courseId,
  notificationCount,
}: StatusBarProps) => {
  const intl = useIntl();
  const waffleFlags = useWaffleFlags(courseId);

  const {
    endDate,
    courseReleaseDate,
    checklist,
  } = statusBarData;

  const {
    completedCourseLaunchChecks,
    completedCourseBestPracticesChecks,
    totalCourseLaunchChecks,
    totalCourseBestPracticesChecks,
  } = checklist;

  const courseReleaseDateObj = moment.utc(courseReleaseDate, 'MMM DD, YYYY [at] HH:mm UTC', true);
  const endDateObj = moment.utc(endDate);
  const checkListTitle = `${completedCourseLaunchChecks + completedCourseBestPracticesChecks}/${totalCourseLaunchChecks + totalCourseBestPracticesChecks}`;
  const scheduleDestination = () => new URL(`settings/details/${courseId}#schedule`, getConfig().STUDIO_BASE_URL).href;

  if (isLoading) {
    return null;
  }

  return (
    <Stack direction="horizontal" gap={4}>
      <CourseBadge startDate={courseReleaseDateObj} endDate={endDateObj} />
      <CourseDates
        startDate={courseReleaseDateObj}
        endDate={endDateObj}
        startDateRaw={courseReleaseDate}
        datesLink={waffleFlags.useNewScheduleDetailsPage ? `/course/${courseId}/settings/details/#schedule` : scheduleDestination()}
      />
      {(notificationCount || 0) > 0 && (
      <small className="d-flex">
        <Icon className="mr-2" size="md" src={NotificationsNone} />
        {intl.formatMessage(messages.notificationMetadataTitle, { count: notificationCount })}
      </small>
      )}
      <Link
        className="small text-primary-500 d-flex"
        to={`/course/${courseId}/checklists`}
      >
        <Icon src={ChecklistRtl} size="md" className="mr-2" />
        {checkListTitle} {intl.formatMessage(messages.checklistCompleted)}
      </Link>
    </Stack>
  );
};
