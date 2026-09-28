import React, { useCallback, useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { PagesAndResourcesContext } from 'CourseAuthoring/pages-and-resources/PagesAndResourcesProvider';
import { useNavigate } from 'react-router-dom';

import SettingsModal from './settings-modal/SettingsModal';
import messages from './messages';

const XpertUnitSummarySettings = () => {
  const intl = useIntl();
  const { path: pagesAndResourcesPath } = useContext(PagesAndResourcesContext);
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    navigate(pagesAndResourcesPath);
  }, [pagesAndResourcesPath]);

  return (
    <SettingsModal
      appId="xpert-unit-summary"
      title={intl.formatMessage(messages.heading)}
      enableAppHelp={intl.formatMessage(messages.enableXpertUnitSummaryHelp)}
      helpPrivacyText={intl.formatMessage(messages.enableXpertUnitSummaryHelpPrivacyLink)}
      enableAppLabel={intl.formatMessage(messages.enableXpertUnitSummaryLabel)}
      learnMoreText={intl.formatMessage(messages.enableXpertUnitSummaryLink)}
      allUnitsEnabledText={intl.formatMessage(messages.allUnitsEnabledByDefault)}
      noUnitsEnabledText={intl.formatMessage(messages.noUnitsEnabledByDefault)}
      onClose={handleClose}
    />
  );
};

export default XpertUnitSummarySettings;
