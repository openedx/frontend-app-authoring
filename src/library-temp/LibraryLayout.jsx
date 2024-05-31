import React from 'react';
import {
    Button
} from '@openedx/paragon';
import { Add } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useDispatch } from 'react-redux';
import messages from './messages';
import { LibrarySheet } from './library-sheet';
import { openAddContentSheet } from './data/slice';

const LibraryLayout = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  return (
    <div>
      <Button
        iconBefore={Add}
        variant='primary rounded-0'
        onClick={() => dispatch(openAddContentSheet())}
      >
        {intl.formatMessage(messages.newContentButton)}
      </Button>
      <LibrarySheet />
    </div>
  );
}

export default LibraryLayout;
