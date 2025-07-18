import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import { HelpSidebar } from '../../generic/help-sidebar';
import messages from './messages';

const GradingSidebar = ({ courseId, proctoredExamSettingsUrl }) => {
  const intl = useIntl();
  return (
    <HelpSidebar
      courseId={courseId}
      showOtherSettings
      proctoredExamSettingsUrl={proctoredExamSettingsUrl}
    >
      <h4 className="help-sidebar-about-title">
        {intl.formatMessage(messages.gradingSidebarTitle)}
      </h4>
      <p className="help-sidebar-about-descriptions">
        {intl.formatMessage(messages.gradingSidebarAbout1)}
      </p>
      <p className="help-sidebar-about-descriptions">
        {intl.formatMessage(messages.gradingSidebarAbout2)}
      </p>
      <p className="help-sidebar-about-descriptions">
        {intl.formatMessage(messages.gradingSidebarAbout3)}
      </p>
    </HelpSidebar>
  );
};

GradingSidebar.defaultProps = {
  proctoredExamSettingsUrl: '',
};

GradingSidebar.propTypes = {
  courseId: PropTypes.string.isRequired,
  proctoredExamSettingsUrl: PropTypes.string,
};

export default GradingSidebar;
