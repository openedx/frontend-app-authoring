import { useEffect } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Alert, Button, useToggle } from '@openedx/paragon';

import BaseModal from '../../editors/sharedComponents/BaseModal';
import messages from './messages';
import infoMessages from '../component-info/messages';
import { ComponentUsage } from '../component-info/ComponentUsage';

interface PublishConfirmationModalProps {
  isOpen: boolean,
  onClose: () => void,
  onConfirm: () => void,
  displayName: string,
  usageKey: string,
  showDownstreams: boolean,
}

interface PublishConfirmationBodyProps {
  displayName: string,
}

const PublishConfirmationBody = ({
  displayName,
}: PublishConfirmationBodyProps) => {
  const intl = useIntl();
  return (
    <div className="pt-4">
      {intl.formatMessage(messages.publishConfirmationBody)}
      <div className="mt-2 p-2 border">
        {displayName}
      </div>
    </div>
  );
};

const PublishConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  usageKey,
  displayName,
  showDownstreams,
}: PublishConfirmationModalProps) => {
  const intl = useIntl();

  const [
    isDownstreamsEmpty,
    setDownstreamsEmpty,
    setDownstreamsNotEmpty,
  ] = useToggle(false);

  useEffect(() => {
    // Set to default 'false' when changing usage key
    setDownstreamsNotEmpty();
  }, [usageKey]);

  return (
    <BaseModal
      isOpen={isOpen}
      close={onClose}
      title={intl.formatMessage(
        messages.publishConfirmationTitle,
        { displayName },
      )}
      confirmAction={(
        <Button onClick={onConfirm}>
          <FormattedMessage {...messages.publishConfirmationButton} />
        </Button>
      )}
    >
      {showDownstreams ? (
        <div>
          <PublishConfirmationBody displayName={displayName} />
          <div className="mt-4">
            {!isDownstreamsEmpty ? (
              <>
                <FormattedMessage {...messages.publishConfimrationDownstreamsBody} />
                <div className="mt-3 mb-3 border">
                  <ComponentUsage usageKey={usageKey} callbackEmpty={setDownstreamsEmpty} />
                </div>
                <Alert variant="warning">
                  <FormattedMessage {...messages.publishConfirmationDownstreamsAlert} />
                </Alert>
              </>
            ) : (
              <FormattedMessage {...infoMessages.detailsTabUsageEmpty} />
            )}
          </div>
        </div>
      ) : (
        <div>
          <PublishConfirmationBody displayName={displayName} />
        </div>
      )}
    </BaseModal>
  );
};

export default PublishConfirmationModal;
