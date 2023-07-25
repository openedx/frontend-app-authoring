import React, { useCallback, useContext, useEffect } from 'react';
import { history } from '@edx/frontend-platform';
import { useDispatch } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { PagesAndResourcesContext } from '../PagesAndResourcesProvider';

import SettingsModal from './settings-modal/SettingsModal';
import messages from './messages';

import { fetchXpertSettings } from './data/thunks';

const XpertUnitSummarySettings = ({ intl }) => {
  const { path: pagesAndResourcesPath, courseId } = useContext(PagesAndResourcesContext);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchXpertSettings(courseId));
  }, [courseId]);

  const handleClose = useCallback(() => {
    history.push(pagesAndResourcesPath);
  }, [pagesAndResourcesPath]);

  return (
    <SettingsModal
      appId="xpert-unit-summary"
      title={intl.formatMessage(messages.heading)}
      enableAppHelp={intl.formatMessage(messages.enableXpertUnitSummaryHelp)}
      enableAppLabel={intl.formatMessage(messages.enableXpertUnitSummaryLabel)}
      learnMoreText={intl.formatMessage(messages.enableXpertUnitSummaryLink)}
      onClose={handleClose}
    />
  );
};

XpertUnitSummarySettings.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(XpertUnitSummarySettings);
