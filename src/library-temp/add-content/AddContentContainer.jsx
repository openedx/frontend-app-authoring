// @ts-check
import React from 'react';
import {
  Stack,
  Button,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';

const AddContentContainer = () => {
  const intl = useIntl();

  const contentTypes = [
    {
      name: intl.formatMessage(messages.textTypeButton),
      disabled: false,
    },
    {
      name: intl.formatMessage(messages.problemTypeButton),
      disabled: false,
    },
    {
      name: intl.formatMessage(messages.openResponseTypeButton),
      disabled: false,
    },
    {
      name: intl.formatMessage(messages.dragDropTypeButton),
      disabled: false,
    },
    {
      name: intl.formatMessage(messages.videoTypeButton),
      disabled: false,
    },
    {
      name: intl.formatMessage(messages.otherTypeButton),
      disabled: true,
    },
  ];

  return (
    <Stack direction="vertical">
      <Button
        variant="outline-primary"
        disabled
        className="m-2 rounded-0"
      >
        {intl.formatMessage(messages.collectionButton)}
      </Button>
      <hr />
      {contentTypes.map((contentType) => (
        <Button
          variant="outline-primary"
          disabled={contentType.disabled}
          className="m-2 rounded-0"
        >
          {contentType.name}
        </Button>
      ))}
    </Stack>
  );
};

AddContentContainer.propTypes = {};

export default AddContentContainer;
