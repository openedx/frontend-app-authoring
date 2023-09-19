import React from 'react';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import { HelpSidebar } from '../../generic/help-sidebar';
import messages from './messages';

const SettingsSidebar = ({ intl, courseId, proctoredExamSettingsUrl }) => (
  <HelpSidebar
    courseId={courseId}
    proctoredExamSettingsUrl={proctoredExamSettingsUrl}
    showOtherSettings
  >
    <h4 className="help-sidebar-about-title">
      {intl.formatMessage(messages.about)}
    </h4>
    <p className="help-sidebar-about-descriptions">
      {intl.formatMessage(messages.aboutDescription1)}
    </p>
    <p className="help-sidebar-about-descriptions">
      {intl.formatMessage(messages.aboutDescription2)}
    </p>
    <p className="help-sidebar-about-descriptions">
      <FormattedMessage
        id="course-authoring.advanced-settings.about.description-3"
        defaultMessage="{notice} When you enter strings as policy values, ensure that you use double quotation marks (“) around the string. Do not use single quotation marks (‘)."
        values={{ notice: <strong>Note:</strong> }}
      />
    </p>
  </HelpSidebar>
);

SettingsSidebar.defaultProps = {
  proctoredExamSettingsUrl: '',
};

SettingsSidebar.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
  proctoredExamSettingsUrl: PropTypes.string,
};

export default injectIntl(SettingsSidebar);
