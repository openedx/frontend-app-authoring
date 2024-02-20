import React, { useCallback, useContext } from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { DiscussionsContext } from '../DiscussionsProvider';

import messages from './messages';

const AppListNextButton = ({ intl }) => {
  const { selectedAppId } = useSelector(state => state.discussions);
  const { path: discussionsPath } = useContext(DiscussionsContext);
  const navigate = useNavigate();

  const handleStartConfig = useCallback(() => {
    navigate(`${discussionsPath}/configure/${selectedAppId}`);
  }, [discussionsPath, selectedAppId]);

  return (
    <Button
      variant="primary"
      onClick={handleStartConfig}
    >
      {intl.formatMessage(messages.nextButton)}
    </Button>
  );
};

AppListNextButton.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(AppListNextButton);
