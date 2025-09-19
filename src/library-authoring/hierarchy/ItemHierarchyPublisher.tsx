import { type ReactNode } from 'react';
import type { MessageDescriptor } from 'react-intl';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Button,
  Container,
} from '@openedx/paragon';

import LoadingButton from '@src/generic/loading-button';
import { ContainerType, getBlockType } from '@src/generic/key-utils';
import Loading from '@src/generic/Loading';

import messages from './messages';
import { ItemHierarchy } from './ItemHierarchy';
import { useLibraryItemHierarchy } from '../data/apiHooks';

type ItemHierarchyPublisherProps = {
  itemId: string;
  handleClose: () => void;
  handlePublish: () => void;
};

export const ItemHierarchyPublisher = ({
  itemId,
  handleClose,
  handlePublish,
}: ItemHierarchyPublisherProps) => {
  const intl = useIntl();
  const itemType = getBlockType(itemId);

  const {
    data: hierarchy,
    isPending,
    isError,
  } = useLibraryItemHierarchy(itemId);

  if (isPending) {
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

    switch (itemType) {
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
      case ContainerType.Unit:
        childCount = hierarchy.components.length;
        childMessage = messages.publishUnitWithChildrenWarning;
        noChildMessage = messages.publishUnitWarning;
        break;
      default: // The item is a component
        childCount = 0;
        childMessage = messages.empty; // Never used
        noChildMessage = messages.publishComponentWarning;
        break;
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

    switch (itemType) {
      case ContainerType.Section:
        // Section has no parents
        return undefined;
      case ContainerType.Subsection:
        parentMessage = messages.publishSubsectionWithParentWarning;
        parentCount = hierarchy.sections.length;
        break;
      case ContainerType.Unit:
        parentMessage = messages.publishUnitWithParentWarning;
        parentCount = hierarchy.subsections.length;
        break;
      default: // The item is a component
        parentMessage = messages.publishComponentsWithParentWarning;
        parentCount = hierarchy.units.length;
    }
    return intl.formatMessage(parentMessage, { parentCount, highlight });
  };

  return (
    <Container
      className="p-3 status-box draft-status"
    >
      <h4>{intl.formatMessage(messages.publishConfirmHeading)}</h4>
      <p>{childWarningMessage()} {parentWarningMessage()}</p>
      <ItemHierarchy showPublishStatus />
      <ActionRow>
        <Button
          variant="outline-primary rounded-0"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleClose();
          }}
        >
          {intl.formatMessage(messages.publishCancel)}
        </Button>
        <LoadingButton
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await handlePublish();
          }}
          variant="primary rounded-0"
          label={intl.formatMessage(messages.publishConfirm)}
        />
      </ActionRow>
    </Container>
  );
};
