import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Button, Stack,
} from '@openedx/paragon';
import { Add } from '@openedx/paragon/icons';

import messages from './messages';

export const NoComponents = () => (
  <Stack direction="horizontal" gap={3} className="mt-6 justify-content-center">
    <div>You have not added any content to this library yet.</div>
    <Button iconBefore={Add}>Add Content</Button>
  </Stack>
);

export const NoSearchResults = () => (
  <div className="d-flex mt-6 justify-content-center">
    <FormattedMessage {...messages.noSearchResults} />
  </div>
);
