import React, { useCallback, useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { DiscussionsContext } from '../DiscussionsProvider';

import messages from './messages';

const AppListNextButton = () => {
  const intl = useIntl();
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

export default AppListNextButton;
