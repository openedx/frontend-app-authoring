/**
 * Shows the Container's publish status,
 * and enables publishing any unpublished changes.
 */
import { useContext, useCallback, useMemo } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import type { MessageDescriptor } from 'react-intl';
import {
  ActionRow,
  Button,
  Container,
  useToggle,
} from '@openedx/paragon';
import Loading from '../../generic/Loading';
import LoadingButton from '../../generic/loading-button';
import { ToastContext } from '../../generic/toast-context';
import { ContainerType } from '../../generic/key-utils';
import { ContainerHit, PublishStatus } from '../../search-manager';
import { useLibraryContext } from '../common/context/LibraryContext';
import { useContentFromSearchIndex, usePublishContainer } from '../data/apiHooks';
import messages from './messages';

type ContainerPublisherProps = {
  close: () => void;
  container: ContainerHit;
};

const ContainerPublisher = ({
  close,
  container,
}: ContainerPublisherProps) => {
  const intl = useIntl();
  const publishContainer = usePublishContainer(container.usageKey);
  const { showToast } = useContext(ToastContext);

  const handlePublish = useCallback(async () => {
    try {
      await publishContainer.mutateAsync();
      showToast(intl.formatMessage(messages.publishContainerSuccess));
    } catch (error) {
      showToast(intl.formatMessage(messages.publishContainerFailed));
    }
    close();
  }, [publishContainer, showToast]);

  const warningMessage = useMemo(() => {
    const childCount = container.content?.childDisplayNames?.length || 0;
    let childMessage: MessageDescriptor;
    let noChildMessage: MessageDescriptor;

    switch (container.blockType) {
      case ContainerType.Section:
        childMessage = messages.publishSectionWithChildrenWarning;
        noChildMessage = messages.publishSectionWarning;
        break;
      case ContainerType.Subsection:
        childMessage = messages.publishSubsectionWithChildrenWarning;
        noChildMessage = messages.publishSubsectionWarning;
        break;
      default: // ContainerType.Unit
        childMessage = messages.publishUnitWithChildrenWarning;
        noChildMessage = messages.publishUnitWarning;
    }
    return intl.formatMessage(
      childCount ? childMessage : noChildMessage,
      { childCount },
    );
  }, [container]);

  return (
    <Container
      className="p-3 status-box draft-status"
    >
      <h4>{intl.formatMessage(messages.publishContainerConfirmHeading)}</h4>
      <p>{warningMessage}</p>
      <ActionRow>
        <Button
          variant="outline-primary rounded-0"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            close();
          }}
        >
          {intl.formatMessage(messages.publishContainerCancel)}
        </Button>
        <LoadingButton
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await handlePublish();
          }}
          variant="primary rounded-0"
          label={intl.formatMessage(messages.publishContainerConfirm)}
        />
      </ActionRow>
    </Container>
  );
};

type ContainerPublishStatusProps = {
  containerId: string;
};

const ContainerPublishStatus = ({
  containerId,
}: ContainerPublishStatusProps) => {
  const intl = useIntl();
  const { readOnly } = useLibraryContext();
  const [isConfirmingPublish, confirmPublish, cancelPublish] = useToggle(false);
  const { hits, isLoading, isError } = useContentFromSearchIndex([containerId]);

  if (isLoading) {
    return <Loading />;
  }

  // istanbul ignore if: this should never happen
  if (isError || !hits) {
    return null;
  }

  // TODO -- why isn't this auto-updating when the container gets modified or published?
  const container = (hits as ContainerHit[])[0];
  if (container.publishStatus === PublishStatus.Published) {
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
          close={cancelPublish}
          container={container}
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
