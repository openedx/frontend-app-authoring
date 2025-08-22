/**
 * Shows the LibraryContainer's publish status,
 * and enables publishing any unpublished changes.
 */
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Container,
  useToggle,
} from '@openedx/paragon';
import Loading from '@src/generic/Loading';

import { useLibraryContext } from '../common/context/LibraryContext';
import messages from './messages';
import { useContainer } from '../data/apiHooks';
import { ContainerPublisher } from './ContainerPublisher';

type ContainerPublishStatusProps = {
  containerId: string;
};

const ContainerPublishStatus = ({
  containerId,
}: ContainerPublishStatusProps) => {
  const intl = useIntl();
  const { readOnly } = useLibraryContext();
  const [isConfirmingPublish, confirmPublish, cancelPublish] = useToggle(false);
  const {
    data: container,
    isLoading,
    isError,
  } = useContainer(containerId);

  if (isLoading) {
    return <Loading />;
  }

  // istanbul ignore if: this should never happen
  if (isError) {
    return null;
  }

  if (!container.hasUnpublishedChanges) {
    return (
      <Container
        className="p-2 text-nowrap flex-grow-1 status-button published-status font-weight-bold"
      >
        {intl.formatMessage(messages.publishedChipText)}
      </Container>
    );
  }

  return (
    (isConfirmingPublish
      ? (
        <ContainerPublisher
          handleClose={cancelPublish}
          containerId={containerId}
        />
      ) : (
        <Button
          variant="outline-primary rounded-0 status-button draft-status font-weight-bold"
          className="m-1 flex-grow-1"
          disabled={readOnly}
          onClick={confirmPublish}
        >
          <FormattedMessage
            {...messages.publishContainerButton}
            values={{
              publishStatus: (
                <span className="font-weight-500">
                  ({intl.formatMessage(messages.draftChipText)})
                </span>
              ),
            }}
          />
        </Button>
      )
    )
  );
};

export default ContainerPublishStatus;
