import React, { useCallback, useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { PagesAndResourcesContext } from 'CourseAuthoring/pages-and-resources/PagesAndResourcesProvider';
import { useNavigate } from 'react-router-dom';

import SettingsModal from './settings-modal/SettingsModal';
import messages from './messages';

import { fetchXpertSettings } from './data/thunks';

const XpertUnitSummarySettings = ({ intl }) => {
  const { path: pagesAndResourcesPath, courseId } = useContext(PagesAndResourcesContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchXpertSettings(courseId));
  }, [courseId]);

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

XpertUnitSummarySettings.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(XpertUnitSummarySettings);
