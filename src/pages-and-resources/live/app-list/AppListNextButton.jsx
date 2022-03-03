import React, { useCallback, useContext } from 'react';
import { history } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';
import { useSelector } from 'react-redux';

import { LiveContext } from '../LiveProvider';

import messages from './messages';

function AppListNextButton({ intl }) {
  const { selectedAppId } = useSelector(state => state.live);
  const { path: livePath } = useContext(LiveContext);

  const handleStartConfig = useCallback(() => {
    history.push(`${livePath}/configure/${selectedAppId}`);
  }, [livePath, selectedAppId]);

  return (
    <Button
      variant="primary"
      onClick={handleStartConfig}
    >
      {intl.formatMessage(messages.nextButton)}
    </Button>
  );
}

AppListNextButton.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(AppListNextButton);
