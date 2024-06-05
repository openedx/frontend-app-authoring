import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Button, Stack,
} from '@openedx/paragon';
import { Add } from '@openedx/paragon/icons';
import { useDispatch } from 'react-redux';
import { openAddContentSidebar } from './data/slice';
import messages from './messages';

export const NoComponents = () => {
  const dispatch = useDispatch();

  return (
    <Stack direction="horizontal" gap={3} className="mt-6 justify-content-center">
      <FormattedMessage {...messages.noComponents} />
      <Button iconBefore={Add} onClick={() => dispatch(openAddContentSidebar())}>
        <FormattedMessage {...messages.addComponent} />
      </Button>
    </Stack>
  );
};

export const NoSearchResults = () => (
  <div className="d-flex mt-6 justify-content-center">
    <FormattedMessage {...messages.noSearchResults} />
  </div>
);
