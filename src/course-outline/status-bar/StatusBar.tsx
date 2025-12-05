import moment from 'moment/moment';
import { FormattedDate, useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform/config';
import {
  Button, Hyperlink, Stack,
} from '@openedx/paragon';
import { Link } from 'react-router-dom';

import { useHelpUrls } from '../../help-urls/hooks';
import { useWaffleFlags } from '../../data/apiHooks';
import messages from './messages';
import { ReactNode } from 'react';
import { CourseOutlineStatusBar } from '@src/course-outline/data/types';

interface StatusBarItemProps {
  title: string,
  children: ReactNode,
};

const StatusBarItem = ({ title, children }: StatusBarItemProps) => (
  <div className="d-flex flex-column justify-content-between">
    <h5>{title}</h5>
    <div className="d-flex align-items-center">
      {children}
    </div>
  </div>
);

interface StatusBarProps {
  courseId: string,
  isLoading: boolean,
  openEnableHighlightsModal: () => void,
  handleVideoSharingOptionChange: () => void,
  statusBarData: CourseOutlineStatusBar,
};

const StatusBar = ({
  statusBarData,
  isLoading,
  courseId,
  openEnableHighlightsModal,
}: StatusBarProps) => {
  const intl = useIntl();
  const waffleFlags = useWaffleFlags(courseId);

  const {
    endDate,
    courseReleaseDate,
    highlightsEnabledForMessaging,
    checklist,
    isSelfPaced,
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

  const {
    contentHighlights: contentHighlightsUrl,
  } = useHelpUrls(['contentHighlights', 'socialSharing']);

  if (isLoading) {
    return null;
  }

  return (
    <>
      <Stack direction="horizontal" gap={3.5} className="d-flex align-items-stretch outline-status-bar" data-testid="outline-status-bar">
        <StatusBarItem title={intl.formatMessage(messages.startDateTitle)}>
          <Link
            className="small"
            to={waffleFlags.useNewScheduleDetailsPage ? `/course/${courseId}/settings/details/#schedule` : scheduleDestination()}
          >
            {courseReleaseDateObj.isValid() ? (
              <FormattedDate
                value={courseReleaseDateObj.toString()}
                year="numeric"
                month="short"
                day="2-digit"
              />
            ) : courseReleaseDate}
          </Link>
        </StatusBarItem>
        <StatusBarItem title={intl.formatMessage(messages.pacingTypeTitle)}>
          <span className="small">
            {isSelfPaced
              ? intl.formatMessage(messages.pacingTypeSelfPaced)
              : intl.formatMessage(messages.pacingTypeInstructorPaced)}
          </span>
        </StatusBarItem>
        <StatusBarItem title={intl.formatMessage(messages.checklistTitle)}>
          <Link
            className="small"
            to={`/course/${courseId}/checklists`}
          >
            {checkListTitle} {intl.formatMessage(messages.checklistCompleted)}
          </Link>
        </StatusBarItem>
        <StatusBarItem title={intl.formatMessage(messages.highlightEmailsTitle)}>
          <div className="d-flex align-items-center">
            {highlightsEnabledForMessaging ? (
              <span data-testid="highlights-enabled-span" className="small">
                {intl.formatMessage(messages.highlightEmailsEnabled)}
              </span>
            ) : (
              <Button data-testid="highlights-enable-button" size="sm" onClick={openEnableHighlightsModal}>
                {intl.formatMessage(messages.highlightEmailsButton)}
              </Button>
            )}
            <Hyperlink
              className="small ml-2"
              destination={contentHighlightsUrl}
              target="_blank"
              showLaunchIcon={false}
            >
              {intl.formatMessage(messages.highlightEmailsLink)}
            </Hyperlink>
          </div>
        </StatusBarItem>
      </Stack>
    </>
  );
};

export default StatusBar;
