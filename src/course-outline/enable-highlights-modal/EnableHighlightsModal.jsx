import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow, AlertModal, Button, Hyperlink,
} from '@edx/paragon';

import messages from './messages';

const EnableHighlightsModal = ({
  onEnableHighlightsSubmit,
  isOpen,
  close,
  highlightsDocUrl,
}) => {
  const intl = useIntl();

  return (
    <AlertModal
      title={intl.formatMessage(messages.title)}
      variant="default"
      size="lg"
      isOpen={isOpen}
      onClose={close}
      footerNode={(
        <ActionRow>
          <Button variant="tertiary" onClick={close}>
            {intl.formatMessage(messages.cancelButton)}
          </Button>
          <Button onClick={onEnableHighlightsSubmit}>
            {intl.formatMessage(messages.submitButton)}
          </Button>
        </ActionRow>
      )}
    >
      <p className="small">{intl.formatMessage(messages.description_1)}</p>
      <p className="small">
        {intl.formatMessage(messages.description_2)}
        <Hyperlink
          className="small ml-2 text-decoration-none"
          destination={highlightsDocUrl}
          target="_blank"
          showLaunchIcon={false}
        >
          {intl.formatMessage(messages.link)}
        </Hyperlink>
      </p>
    </AlertModal>
  );
};

EnableHighlightsModal.propTypes = {
  onEnableHighlightsSubmit: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  highlightsDocUrl: PropTypes.string.isRequired,
};

export default EnableHighlightsModal;
