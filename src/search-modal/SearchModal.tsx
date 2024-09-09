import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { ModalDialog } from '@openedx/paragon';

import messages from './messages';
import SearchUI from './SearchUI';

const SearchModal: React.FC<{ courseId?: string, isOpen: boolean, onClose: () => void }> = ({ courseId, ...props }) => {
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
      <SearchUI courseId={courseId} closeSearchModal={props.onClose} />
    </ModalDialog>
  );
};

export default SearchModal;
