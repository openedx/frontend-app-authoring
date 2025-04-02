import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Dropdown,
  Icon,
  IconButton,
} from '@openedx/paragon';
import { MoreVert } from '@openedx/paragon/icons';
import { ReactNode, useCallback } from 'react';
import { Link } from 'react-router-dom';

import { getItemIcon, getComponentStyleColor } from '../../generic/block-type-utils';
import { type ContainerHit, PublishStatus } from '../../search-manager';
import { useComponentPickerContext } from '../common/context/ComponentPickerContext';
import { useLibraryContext } from '../common/context/LibraryContext';
import { useSidebarContext } from '../common/context/SidebarContext';
import BaseCard from './BaseCard';
import { useContainerChildren } from '../data/apiHooks';
import { useLibraryRoutes } from '../routes';
import messages from './messages';

type ContainerMenuProps = {
  hit: ContainerHit,
};

const ContainerMenu = ({ hit } : ContainerMenuProps) => {
  const intl = useIntl();
  const { contextKey, blockId } = hit;

  return (
    <Dropdown id="container-card-dropdown">
      <Dropdown.Toggle
        id="container-card-menu-toggle"
        as={IconButton}
        src={MoreVert}
        iconAs={Icon}
        variant="primary"
        alt={intl.formatMessage(messages.collectionCardMenuAlt)}
        data-testid="container-card-menu-toggle"
      />
      <Dropdown.Menu>
        <Dropdown.Item
          as={Link}
          to={`/library/${contextKey}/container/${blockId}`}
          disabled
        >
          <FormattedMessage {...messages.menuOpen} />
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

type ContainerCardPreviewProps = {
  containerId: string;
  showMaxChildren?: number;
};

const ContainerCardPreview = ({ containerId, showMaxChildren = 5 }: ContainerCardPreviewProps) => {
  const { data, isLoading, isError } = useContainerChildren(containerId);
  if (isLoading || isError) {
    return null;
  }

  const hiddenChildren = data.length - showMaxChildren;
  return (
    <div className="container-card-preview d-flex flex-wrap align-self-start">
      {
        data.slice(0, showMaxChildren).map(({ id, blockType, displayName }, idx) => {
          let classNames = 'd-inline-flex rounded align-items-center m-1 p-1';
          let blockPreview: ReactNode;

          if (idx < showMaxChildren - 1 || hiddenChildren <= 0) {
            // Show the first N-1 blocks as item icons
            // (or all N blocks if no hidden children)
            classNames = `${classNames} ${getComponentStyleColor(blockType)}`;
            blockPreview = (
              <Icon
                src={getItemIcon(blockType)}
                screenReaderText={blockType}
                title={displayName}
              />
            );
          } else {
            // Container has more blocks than can fit in the preview, so show "+N"
            blockPreview = (
              <FormattedMessage
                {...messages.containerPreviewMoreBlocks}
                values={{ count: hiddenChildren + 1 }}
              />
            );
          }
          return (
            <div
              key={`container-card-preview-block-${id}`}
              className={classNames}
            >
              {blockPreview}
            </div>
          );
        })
      }
    </div>
  );
};

type ContainerCardProps = {
  hit: ContainerHit,
};

const ContainerCard = ({ hit } : ContainerCardProps) => {
  const { componentPickerMode } = useComponentPickerContext();
  const { showOnlyPublished } = useLibraryContext();
  const { openUnitInfoSidebar } = useSidebarContext();

  const {
    blockType: itemType,
    formatted,
    tags,
    numChildren,
    published,
    publishStatus,
    usageKey: unitId,
  } = hit;

  const numChildrenCount = showOnlyPublished ? (
    published?.numChildren || 0
  ) : numChildren;

  const displayName: string = (
    showOnlyPublished ? formatted.published?.displayName : formatted.displayName
  ) ?? '';

  const { navigateTo } = useLibraryRoutes();

  const openContainer = useCallback(() => {
    if (itemType === 'unit') {
      openUnitInfoSidebar(unitId);

      navigateTo({ unitId });
    }
  }, [unitId, itemType, openUnitInfoSidebar, navigateTo]);

  return (
    <BaseCard
      itemType={itemType}
      displayName={displayName}
      preview={<ContainerCardPreview containerId={unitId} />}
      tags={tags}
      numChildren={numChildrenCount}
      actions={!componentPickerMode && (
        <ActionRow>
          <ContainerMenu hit={hit} />
        </ActionRow>
      )}
      hasUnpublishedChanges={publishStatus !== PublishStatus.Published}
      onSelect={openContainer}
    />
  );
};

export default ContainerCard;
