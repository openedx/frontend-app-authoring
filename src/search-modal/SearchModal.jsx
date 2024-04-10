/* eslint-disable react/prop-types */
// @ts-check
import React from 'react';
import { ModalDialog } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';
import SearchUI from './SearchUI';

/** @type {React.FC<{courseId: string, isOpen: boolean, onClose: () => void}>} */
const SearchModal = ({ courseId, ...props }) => {
  const intl = useIntl();
  const title = intl.formatMessage(messages.title);

  return (
    <ModalDialog
      title={title}
      size="xl"
      isOpen={props.isOpen}
      onClose={props.onClose}
      hasCloseButton
      // We need isOverflowVisible={false} - see the .scss file in this folder
      isOverflowVisible={false}
      isFullscreenOnMobile
      className="courseware-search-modal"
    >
      <SearchUI courseId={courseId} />
    </ModalDialog>
  );
};

export default SearchModal;
