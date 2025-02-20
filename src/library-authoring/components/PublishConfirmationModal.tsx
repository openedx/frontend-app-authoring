import { useIntl } from '@edx/frontend-platform/i18n';
import { Alert, Button } from '@openedx/paragon';

import BaseModal from '../../editors/sharedComponents/BaseModal';
import messages from './messages';

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
      <div className="mt-4 p-2 border">
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

  console.log(usageKey);

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
          {intl.formatMessage(messages.publishConfirmationButton)}
        </Button>
      )}
    >
      {showDownstreams ? (
        <div>
          <PublishConfirmationBody displayName={displayName} />
          <div className="m-2">
            {intl.formatMessage(messages.publishConfimrationDownstreamsBody)}
            <div>
              TODO: Add list of course here
            </div>
            <Alert variant="warning">
              {intl.formatMessage(messages.publishConfirmationDownstreamsAlert)}
            </Alert>
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
