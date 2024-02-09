import React from 'react';
import PropTypes from 'prop-types';

import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from '@edx/frontend-platform/i18n';

import { Button } from '@openedx/paragon';
import messages from './messages';
import hooks from './hooks';
import BaseModal from '../BaseModal';

import CodeEditor from '../CodeEditor';

export const SourceCodeModal = ({
  isOpen,
  close,
  editorRef,
  // injected
  intl,
}) => {
  const { saveBtnProps, value, ref } = hooks.prepareSourceCodeModal({ editorRef, close });
  return (
    <BaseModal
      close={close}
      size="xl"
      confirmAction={(
        <Button {...saveBtnProps} variant="primary">
          <FormattedMessage {...messages.saveButtonLabel} />
        </Button>
            )}
      isOpen={isOpen}
      title={intl.formatMessage(messages.titleLabel)}
    >
      <div style={{ padding: '10px 30px', height: '300px' }}>
        <CodeEditor
          innerRef={ref}
          value={value}
        />
      </div>

    </BaseModal>
  );
};

SourceCodeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  editorRef: PropTypes.oneOfType([
    PropTypes.func,
    // eslint-disable-next-line react/forbid-prop-types
    PropTypes.shape({ current: PropTypes.any }),
  ]).isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(SourceCodeModal);
