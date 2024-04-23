import { Fragment } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@openedx/paragon';

import { HelpSidebar } from '../../generic/help-sidebar';
import { useHelpUrls } from '../../help-urls/hooks';
import { getSidebarData } from './utils';
import messages from './messages';

const GroupConfigurationSidebar = ({
  courseId, shouldShowExperimentGroups, shouldShowContentGroup, shouldShowEnrollmentTrackGroup,
}) => {
  const intl = useIntl();
  const urls = useHelpUrls(['groupConfigurations', 'enrollmentTracks', 'contentGroups']);
  const sidebarData = getSidebarData({
    messages, intl, shouldShowExperimentGroups, shouldShowContentGroup, shouldShowEnrollmentTrackGroup,
  });

  return (
    <HelpSidebar
      courseId={courseId}
      showOtherSettings
      className="mt-4"
    >
      {sidebarData
        .map(({ title, paragraphs, urlKey }, idx) => (
          <Fragment key={title}>
            <h4 className="help-sidebar-about-title">
              {title}
            </h4>
            {paragraphs.map((text) => (
              <p key={text} className="help-sidebar-about-descriptions">
                {text}
              </p>
            ))}
            <Hyperlink
              target="_blank"
              showLaunchIcon={false}
              href={urls[urlKey]}
              className="mt-2 mb-3.5 sidebar-link"
            >
              {intl.formatMessage(messages.learnMoreBtn)}
            </Hyperlink>
            {idx !== sidebarData.length - 1 && <hr />}
          </Fragment>
        ))}
    </HelpSidebar>
  );
};

GroupConfigurationSidebar.propTypes = {
  courseId: PropTypes.string.isRequired,
  shouldShowContentGroup: PropTypes.bool.isRequired,
  shouldShowExperimentGroups: PropTypes.bool.isRequired,
  shouldShowEnrollmentTrackGroup: PropTypes.bool.isRequired,
};

export default GroupConfigurationSidebar;
