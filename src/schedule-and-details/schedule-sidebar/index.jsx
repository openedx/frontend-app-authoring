import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import HelpSidebar from '../../generic/help-sidebar';
import messages from './messages';

const ScheduleSidebar = ({ intl, courseId, proctoredExamSettingsUrl }) => (
  <HelpSidebar
    courseId={courseId}
    proctoredExamSettingsUrl={proctoredExamSettingsUrl}
    showOtherSettings
  >
    <h4 className="help-sidebar-about-title">
      {intl.formatMessage(messages.scheduleSidebarTitle)}
    </h4>
    <p className="help-sidebar-about-descriptions">
      {intl.formatMessage(messages.scheduleSidebarAbout)}
    </p>
  </HelpSidebar>
);

ScheduleSidebar.defaultProps = {
  proctoredExamSettingsUrl: '',
};

ScheduleSidebar.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
  proctoredExamSettingsUrl: PropTypes.string,
};

export default injectIntl(ScheduleSidebar);
