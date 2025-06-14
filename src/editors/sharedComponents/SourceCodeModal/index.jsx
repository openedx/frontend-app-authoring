import PropTypes from 'prop-types';

import {
  FormattedMessage,
  useIntl,
} from '@edx/frontend-platform/i18n';

import { Button, useWindowSize } from '@openedx/paragon';
import messages from './messages';
import * as hooks from './hooks';
import BaseModal from '../BaseModal';

import CodeEditor from '../CodeEditor';

const SourceCodeModal = ({
  isOpen,
  close,
  editorRef,
}) => {
  const { saveBtnProps, value, ref } = hooks.prepareSourceCodeModal({ editorRef, close });
  const { height } = useWindowSize();
  const intl = useIntl();

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
      bodyStyle={{ maxHeight: (height - 180) }}
    >
      <div className="px-4.5 pt-2.5">
        <CodeEditor
          innerRef={ref}
          value={value}
          lang="html" // hardcoded value to do lookup on CODEMIRROR_LANGUAGES
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
};

export default SourceCodeModal;
