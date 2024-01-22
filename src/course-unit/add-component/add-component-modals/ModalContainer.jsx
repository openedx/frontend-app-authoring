import PropTypes from 'prop-types';
import { ActionRow, Button, StandardModal } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../messages';

const ModalContainer = ({
  title, isOpen, close, children, btnText, size, onSubmit, hasValue, resetDisabled,
}) => {
  const intl = useIntl();

  const handleSubmit = () => {
    onSubmit();
    close();
  };

  const handleClose = () => {
    resetDisabled();
    close();
  };

  return (
    <StandardModal
      title={title}
      isOpen={isOpen}
      onClose={handleClose}
      size={size}
      footerNode={(
        <ActionRow>
          <ActionRow.Spacer />
          <Button variant="tertiary" onClick={handleClose}>
            {intl.formatMessage(messages.modalContainerCancelBtnText)}
          </Button>
          <Button onClick={handleSubmit} disabled={hasValue}>
            {btnText}
          </Button>
        </ActionRow>
      )}
    >
      {children}
    </StandardModal>
  );
};

ModalContainer.propTypes = {
  title: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  btnText: PropTypes.string.isRequired,
  size: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  hasValue: PropTypes.bool.isRequired,
  resetDisabled: PropTypes.func.isRequired,
};

ModalContainer.defaultProps = {
  size: 'md',
};

export default ModalContainer;
