import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Hyperlink, Stack } from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';

import messages from './messages';

const StatusBar = ({
  statusBarData,
  isLoading,
  courseId,
  openEnableHighlightsModal,
}) => {
  const intl = useIntl();
  const { config } = useContext(AppContext);

  const {
    courseReleaseDate,
    highlightsEnabledForMessaging,
    highlightsDocUrl,
    checklist,
    isSelfPaced,
  } = statusBarData;

  const {
    completedCourseLaunchChecks,
    completedCourseBestPracticesChecks,
    totalCourseLaunchChecks,
    totalCourseBestPracticesChecks,
  } = checklist;

  const checkListTitle = `${completedCourseLaunchChecks + completedCourseBestPracticesChecks}/${totalCourseLaunchChecks + totalCourseBestPracticesChecks}`;
  const checklistDestination = new URL(`checklists/${courseId}`, config.STUDIO_BASE_URL).href;
  const scheduleDestination = new URL(`course/${courseId}/settings/details#schedule`, config.BASE_URL).href;

  if (isLoading) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
  }

  return (
    <Stack direction="horizontal" gap={3.5} className="outline-status-bar" data-testid="outline-status-bar">
      <div className="outline-status-bar__item">
        <h5>{intl.formatMessage(messages.startDateTitle)}</h5>
        <Hyperlink
          className="small"
          destination={scheduleDestination}
          showLaunchIcon={false}
        >
          {courseReleaseDate}
        </Hyperlink>
      </div>
      <div className="outline-status-bar__item">
        <h5>{intl.formatMessage(messages.pacingTypeTitle)}</h5>
        <span className="small">
          {isSelfPaced
            ? intl.formatMessage(messages.pacingTypeSelfPaced)
            : intl.formatMessage(messages.pacingTypeInstructorPaced)}
        </span>
      </div>
      <div className="outline-status-bar__item mr-4">
        <h5>{intl.formatMessage(messages.checklistTitle)}</h5>
        <Hyperlink
          className="small"
          destination={checklistDestination}
          showLaunchIcon={false}
        >
          {checkListTitle} {intl.formatMessage(messages.checklistCompleted)}
        </Hyperlink>
      </div>
      <div className="outline-status-bar__item ml-4">
        <h5>{intl.formatMessage(messages.highlightEmailsTitle)}</h5>
        <div className="d-flex align-items-end">
          {highlightsEnabledForMessaging ? (
            <span data-testid="highlights-enabled-span" className="small">
              {intl.formatMessage(messages.highlightEmailsEnabled)}
            </span>
          ) : (
            <Button size="sm" onClick={openEnableHighlightsModal}>
              {intl.formatMessage(messages.highlightEmailsButton)}
            </Button>
          )}
          <Hyperlink
            className="small ml-2"
            destination={highlightsDocUrl}
            target="_blank"
            showLaunchIcon={false}
          >
            {intl.formatMessage(messages.highlightEmailsLink)}
          </Hyperlink>
        </div>
      </div>
    </Stack>
  );
};

StatusBar.propTypes = {
  courseId: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  openEnableHighlightsModal: PropTypes.func.isRequired,
  statusBarData: PropTypes.shape({
    courseReleaseDate: PropTypes.string.isRequired,
    isSelfPaced: PropTypes.bool.isRequired,
    checklist: PropTypes.shape({
      totalCourseLaunchChecks: PropTypes.number.isRequired,
      completedCourseLaunchChecks: PropTypes.number.isRequired,
      totalCourseBestPracticesChecks: PropTypes.number.isRequired,
      completedCourseBestPracticesChecks: PropTypes.number.isRequired,
    }),
    highlightsEnabledForMessaging: PropTypes.bool.isRequired,
    highlightsDocUrl: PropTypes.string.isRequired,
  }).isRequired,
};

export default StatusBar;
