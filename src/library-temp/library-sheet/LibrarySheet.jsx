// @ts-check
import React from 'react';
import { Sheet, Stack, Icon, IconButton } from '@openedx/paragon';
import { useDispatch, useSelector } from 'react-redux';
import { getShowLibrarySheet, getSheetBodyComponent } from '../data/selectors';
import { closeLibrarySheet } from '../data/slice';
import { Close } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from '../messages';
import { AddContentContainer } from '../add-content';

const LibrarySheet = () => {
  const intl = useIntl();
  const showSheet = useSelector(getShowLibrarySheet);
  const bodyComponent = useSelector(getSheetBodyComponent);
  const dispatch = useDispatch();

  const bodyComponetMap = {
    'add-content': <AddContentContainer />
  };

  const buildBody = () => {
    return bodyComponetMap[bodyComponent];
  };
  
  return (
    <Sheet
      position="right"
      show={showSheet}
      onClose={() => dispatch(closeLibrarySheet())}
      blocking={true}
    >
      <Stack direction='horizontal' className='d-flex justify-content-between'>
        <span className='font-weight-bold m-2'>
          {intl.formatMessage(messages.addContentTitle)}
        </span>
        <IconButton src={Close} iconAs={Icon} alt="Close" onClick={() => dispatch(closeLibrarySheet())} variant={'black'}/>
      </Stack>
      {buildBody()}
    </Sheet>
  );
};

LibrarySheet.propTypes = {};

export default LibrarySheet;
