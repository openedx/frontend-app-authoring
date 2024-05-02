import React, { useContext } from 'react';
import moment from 'moment/moment';
import PropTypes from 'prop-types';
import { FormattedDate, useIntl } from '@edx/frontend-platform/i18n';
import {
  Button, Hyperlink, Form, Sheet, Stack, useToggle,
} from '@openedx/paragon';
import { AppContext } from '@edx/frontend-platform/react';

import { ContentTagsDrawer } from '../../content-tags-drawer';
import TagCount from '../../generic/tag-count';
import { useHelpUrls } from '../../help-urls/hooks';
import { VIDEO_SHARING_OPTIONS } from '../constants';
import { useContentTagsCount, useStudioHomeData } from '../../generic/data/apiHooks';
import messages from './messages';
import { getVideoSharingOptionText } from '../utils';

const StatusBarItem = ({ title, children }) => (
  <div className="d-flex flex-column justify-content-between">
    <h5>{title}</h5>
    <div className="d-flex align-items-center">
      {children}
    </div>
  </div>
);

StatusBarItem.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
};

StatusBarItem.defaultProps = {
  children: null,
};

const StatusBar = ({
  statusBarData,
  isLoading,
  courseId,
  openEnableHighlightsModal,
  handleVideoSharingOptionChange,
}) => {
  const intl = useIntl();
  const { config } = useContext(AppContext);

  const {
    courseReleaseDate,
    highlightsEnabledForMessaging,
    checklist,
    isSelfPaced,
    videoSharingEnabled,
    videoSharingOptions,
  } = statusBarData;

  const {
    completedCourseLaunchChecks,
    completedCourseBestPracticesChecks,
    totalCourseLaunchChecks,
    totalCourseBestPracticesChecks,
  } = checklist;

  const courseReleaseDateObj = moment.utc(courseReleaseDate, 'MMM DD, YYYY at HH:mm UTC', true);
  const checkListTitle = `${completedCourseLaunchChecks + completedCourseBestPracticesChecks}/${totalCourseLaunchChecks + totalCourseBestPracticesChecks}`;
  const checklistDestination = () => new URL(`checklists/${courseId}`, config.STUDIO_BASE_URL).href;
  const scheduleDestination = () => new URL(`settings/details/${courseId}#schedule`, config.STUDIO_BASE_URL).href;

  const {
    contentHighlights: contentHighlightsUrl,
    socialSharing: socialSharingUrl,
  } = useHelpUrls(['contentHighlights', 'socialSharing']);

  const { data: courseTagCount } = useContentTagsCount(courseId);
  const { data: studioData } = useStudioHomeData();
  const taxonomiesEnabled = studioData?.taxonomiesEnabled;

  const [isManageTagsDrawerOpen, openManageTagsDrawer, closeManageTagsDrawer] = useToggle(false);

  if (isLoading) {
    return null;
  }

  return (
    <>
      <Stack direction="horizontal" gap={3.5} className="d-flex align-items-stretch outline-status-bar" data-testid="outline-status-bar">
        <StatusBarItem title={intl.formatMessage(messages.startDateTitle)}>
          <Hyperlink
            className="small"
            destination={scheduleDestination()}
            showLaunchIcon={false}
          >
            {courseReleaseDateObj.isValid() ? (
              <FormattedDate
                value={courseReleaseDateObj}
                year="numeric"
                month="short"
                day="2-digit"
                hour="numeric"
                minute="numeric"
              />
            ) : courseReleaseDate}
          </Hyperlink>
        </StatusBarItem>
        <StatusBarItem title={intl.formatMessage(messages.pacingTypeTitle)}>
          <span className="small">
            {isSelfPaced
              ? intl.formatMessage(messages.pacingTypeSelfPaced)
              : intl.formatMessage(messages.pacingTypeInstructorPaced)}
          </span>
        </StatusBarItem>
        <StatusBarItem title={intl.formatMessage(messages.checklistTitle)}>
          <Hyperlink
            className="small"
            destination={checklistDestination()}
            showLaunchIcon={false}
          >
            {checkListTitle} {intl.formatMessage(messages.checklistCompleted)}
          </Hyperlink>
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
        {taxonomiesEnabled && (
          <StatusBarItem title={intl.formatMessage(messages.courseTagsTitle)}>
            <div className="d-flex align-items-center">
              <TagCount count={courseTagCount} />
              { /* eslint-disable-next-line jsx-a11y/anchor-is-valid */ }
              <a
                className="small ml-2"
                href="#"
                onClick={openManageTagsDrawer}
              >
                {intl.formatMessage(messages.courseManageTagsLink)}
              </a>
            </div>
          </StatusBarItem>
        )}
        {videoSharingEnabled && (
          <Form.Group
            size="sm"
            className="d-flex flex-column justify-content-between m-0"
          >
            <Form.Label
              className="h5"
            >{intl.formatMessage(messages.videoSharingTitle)}
            </Form.Label>
            <div className="d-flex align-items-center">
              <Form.Control
                as="select"
                defaultValue={videoSharingOptions}
                onChange={(e) => handleVideoSharingOptionChange(e.target.value)}
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
                {intl.formatMessage(messages.videoSharingLink)}
              </Hyperlink>
            </div>
          </Form.Group>

        )}
      </Stack>
      <Sheet
        position="right"
        show={isManageTagsDrawerOpen}
        onClose={/* istanbul ignore next */ () => closeManageTagsDrawer()}
      >
        <ContentTagsDrawer
          id={courseId}
          onClose={/* istanbul ignore next */ () => closeManageTagsDrawer()}
        />
      </Sheet>
    </>
  );
};

StatusBar.propTypes = {
  courseId: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  openEnableHighlightsModal: PropTypes.func.isRequired,
  handleVideoSharingOptionChange: PropTypes.func.isRequired,
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
    videoSharingEnabled: PropTypes.bool.isRequired,
    videoSharingOptions: PropTypes.string.isRequired,
  }).isRequired,
};

export default StatusBar;
