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

import { ContainerHierarchy } from './ContainerHierarchy';
import messages from './messages';
import { ItemHierarchyData } from '../data/api';

type ItemHierarchyPublisherProps = {
  itemId: string;
  hierarchy: ItemHierarchyData;
  handleClose: () => void;
  handlePublish: () => void;
};

export const ItemHierarchyPublisher = ({
  itemId,
  hierarchy,
  handleClose,
  handlePublish,
}: ItemHierarchyPublisherProps) => {
  const intl = useIntl();
  const itemType = getBlockType(itemId);

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

    switch (itemType) {
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
      <h4>{intl.formatMessage(messages.publishConfirmHeading)}</h4>
      <p>{childWarningMessage()} {parentWarningMessage()}</p>
      <ContainerHierarchy showPublishStatus />
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
