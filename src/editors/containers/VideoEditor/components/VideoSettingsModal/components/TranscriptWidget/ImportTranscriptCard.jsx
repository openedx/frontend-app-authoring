import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Button,
  Icon,
  IconButton,
  Stack,
} from '@openedx/paragon';
import { Close } from '@openedx/paragon/icons';

import messages from './messages';
import { thunkActions } from '../../../../../../data/redux';

const ImportTranscriptCard = ({ setOpen }) => {
  const dispatch = useDispatch();

  const importTranscript = () => {
    dispatch(thunkActions.video.importTranscript());
  };

  return (
    <Stack gap={3} className="border rounded border-primary-200 p-4">
      <ActionRow className="h5">
        <FormattedMessage {...messages.importHeader} />
        <ActionRow.Spacer />
        <IconButton
          src={Close}
          iconAs={Icon}
          onClick={() => setOpen(false)}
        />
      </ActionRow>
      <FormattedMessage {...messages.importMessage} />
      <Button
        variant="outline-primary"
        size="sm"
        onClick={importTranscript}
      >
        <FormattedMessage {...messages.importButtonLabel} />
      </Button>
    </Stack>
  );
};

ImportTranscriptCard.propTypes = {
  setOpen: PropTypes.func.isRequired,
};

export const ImportTranscriptCardInternal = ImportTranscriptCard; // For testing only
export default ImportTranscriptCard;
