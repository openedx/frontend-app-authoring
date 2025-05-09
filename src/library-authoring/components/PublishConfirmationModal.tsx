import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Alert, Button } from '@openedx/paragon';

import BaseModal from '../../editors/sharedComponents/BaseModal';
import messages from './messages';
import infoMessages from '../component-info/messages';
import { ComponentUsage } from '../component-info/ComponentUsage';
import { useEntityLinks } from '../../course-libraries/data/apiHooks';

interface PublishConfirmationModalProps {
  isOpen: boolean,
  onClose: () => void,
  onConfirm: () => void,
  displayName: string,
  usageKey: string,
  showDownstreams: boolean,
}

const PublishConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  usageKey,
  displayName,
  showDownstreams,
}: PublishConfirmationModalProps) => {
  const intl = useIntl();

  const {
    data: dataDownstreamLinks,
    isLoading: isLoadingDownstreamLinks,
  } = useEntityLinks({ upstreamUsageKey: usageKey });

  const hasDownstreamUsages = !isLoadingDownstreamLinks && dataDownstreamLinks?.length !== 0;

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
      <div>
        <div className="pt-4">
          {intl.formatMessage(messages.publishConfirmationBody)}
          <div className="mt-2 p-2 border">
            {displayName}
          </div>
        </div>
        {showDownstreams && (
          <div className="mt-4">
            {hasDownstreamUsages ? (
              <>
                <FormattedMessage {...messages.publishConfimrationDownstreamsBody} />
                <div className="mt-3 mb-3 border">
                  <ComponentUsage usageKey={usageKey} />
                </div>
                <Alert variant="warning">
                  <FormattedMessage {...messages.publishConfirmationDownstreamsAlert} />
                </Alert>
              </>
            ) : (
              <FormattedMessage {...infoMessages.detailsTabUsageEmpty} />
            )}
          </div>
        )}
      </div>
    </BaseModal>
  );
};

export default PublishConfirmationModal;
