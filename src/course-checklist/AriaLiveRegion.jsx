import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from '@edx/frontend-platform/i18n';

import messages from './messages';

const AriaLiveRegion = ({
  isCourseLaunchChecklistLoading,
  isCourseBestPracticeChecklistLoading,
  enableQuality,
}) => {
  const courseLaunchLoadingMessage = isCourseLaunchChecklistLoading
    ? <FormattedMessage {...messages.launchChecklistLoadingLabel} />
    : <FormattedMessage {...messages.launchChecklistDoneLoadingLabel} />;

  const courseBestPracticesLoadingMessage = isCourseBestPracticeChecklistLoading
    ? <FormattedMessage {...messages.bestPracticesChecklistLoadingLabel} />
    : <FormattedMessage {...messages.bestPracticesChecklistDoneLoadingLabel} />;

  return (
    <div className="sr-only" aria-live="polite" role="status">
      <div>
        {courseLaunchLoadingMessage}
      </div>
      {enableQuality ? <div>{courseBestPracticesLoadingMessage}</div> : null}
    </div>
  );
};

AriaLiveRegion.propTypes = {
  isCourseLaunchChecklistLoading: PropTypes.bool.isRequired,
  isCourseBestPracticeChecklistLoading: PropTypes.bool.isRequired,
  enableQuality: PropTypes.bool.isRequired,
};

export default injectIntl(AriaLiveRegion);
