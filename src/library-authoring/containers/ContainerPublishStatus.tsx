/**
 * Shows the LibraryContainer's publish status,
 * and enables publishing any unpublished changes.
 */
import { type ReactNode, useContext, useCallback } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import type { MessageDescriptor } from 'react-intl';
import {
  ActionRow,
  Button,
  Container,
  useToggle,
} from '@openedx/paragon';
import Loading from '@src/generic/Loading';
import LoadingButton from '@src/generic/loading-button';
import { ToastContext } from '@src/generic/toast-context';
import { ContainerType, getBlockType } from '@src/generic/key-utils';
import { useLibraryContext } from '../common/context/LibraryContext';
import { useContainer, useContainerHierarchy, usePublishContainer } from '../data/apiHooks';
import messages from './messages';
import { ContainerHierarchy } from '../hierarchy/ContainerHierarchy';

type ContainerPublisherProps = {
  close: () => void;
  containerId: string;
};

const ContainerPublisher = ({
  close,
  containerId,
}: ContainerPublisherProps) => {
  const intl = useIntl();
  const containerType = getBlockType(containerId);
  const publishContainer = usePublishContainer(containerId);

  const {
    data: hierarchy,
    isLoading,
    isError,
  } = useContainerHierarchy(containerId);

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

  if (isLoading) {
    return <Loading />;
  }

  // istanbul ignore if: this should never happen
  if (isError) {
    return null;
  }

  const highlight = (...chunks: ReactNode[]) => <strong>{chunks}</strong>;
  const childWarningMessage = () => {
    let childCount: number;
    let childMessage: MessageDescriptor;
    let noChildMessage: MessageDescriptor;

    switch (containerType) {
      case ContainerType.Section:
        childCount = hierarchy.subsections.length;
        childMessage = messages.publishSectionWithChildrenWarning;
        noChildMessage = messages.publishSectionWarning;
        break;
      case ContainerType.Subsection:
        childCount = hierarchy.units.length;
        childMessage = messages.publishSubsectionWithChildrenWarning;
        noChildMessage = messages.publishSubsectionWarning;
        break;
      default: // ContainerType.Unit
        childCount = hierarchy.components.length;
        childMessage = messages.publishUnitWithChildrenWarning;
        noChildMessage = messages.publishUnitWarning;
    }
    return intl.formatMessage(
      childCount ? childMessage : noChildMessage,
      {
        childCount,
        highlight,
      },
    );
  };

  const parentWarningMessage = () => {
    let parentCount: number;
    let parentMessage: MessageDescriptor;

    switch (containerType) {
      case ContainerType.Subsection:
        parentMessage = messages.publishSubsectionWithParentWarning;
        parentCount = hierarchy.sections.length;
        break;
      case ContainerType.Unit:
        parentMessage = messages.publishUnitWithParentWarning;
        parentCount = hierarchy.subsections.length;
        break;
      default: // ContainerType.Section has no parents
        return undefined;
    }
    return intl.formatMessage(parentMessage, { parentCount, highlight });
  };

  return (
    <Container
      className="p-3 status-box draft-status"
    >
      <h4>{intl.formatMessage(messages.publishContainerConfirmHeading)}</h4>
      <p>{childWarningMessage()} {parentWarningMessage()}</p>
      <ContainerHierarchy showPublishStatus />
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
          close={cancelPublish}
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
