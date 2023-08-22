import React, { useCallback, useContext, useEffect } from 'react';
import { history } from '@edx/frontend-platform';
import { Hyperlink } from '@edx/paragon';
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
      enableAppHelp={
        (
          <>
            {intl.formatMessage(messages.enableXpertUnitSummaryHelp)}
            {' '}
            <Hyperlink
              destination="https://openai.com/api-data-privacy"
              target="_blank"
              showLaunchIcon={false}
            >
              {intl.formatMessage(messages.enableXpertUnitSummaryHelpPrivacyLink)}
            </Hyperlink>
          </>
        )
      }
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
