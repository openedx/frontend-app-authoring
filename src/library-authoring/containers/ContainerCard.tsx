import { ReactNode, useCallback, useContext } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Dropdown,
  Icon,
  IconButton,
  useToggle,
  Stack,
} from '@openedx/paragon';
import { MoreVert } from '@openedx/paragon/icons';

import { getItemIcon, getComponentStyleColor } from '@src/generic/block-type-utils';
import { useClipboard } from '@src/generic/clipboard';
import { getBlockType } from '@src/generic/key-utils';
import { type ContainerHit, Highlight, PublishStatus } from '@src/search-manager';
import { ToastContext } from '@src/generic/toast-context';
import { useRunOnNextRender } from '@src/utils';

import { useComponentPickerContext } from '@src/library-authoring/common/context/ComponentPickerContext';
import { useLibraryContext } from '@src/library-authoring/common/context/LibraryContext';
import { SidebarActions, SidebarBodyItemId, useSidebarContext } from '@src/library-authoring/common/context/SidebarContext';
import { useRemoveItemsFromCollection } from '@src/library-authoring/data/apiHooks';
import { useLibraryRoutes } from '@src/library-authoring/routes';
import BaseCard from '@src/library-authoring/components/BaseCard';
import AddComponentWidget from '@src/library-authoring/components/AddComponentWidget';
import messages from './messages';
import ContainerDeleter from './ContainerDeleter';
import ContainerRemover from './ContainerRemover';

type ContainerMenuProps = {
  containerKey: string;
  displayName: string;
  index?: number;
};

export const ContainerMenu = ({ containerKey, displayName, index } : ContainerMenuProps) => {
  const intl = useIntl();
  const { libraryId, collectionId, containerId } = useLibraryContext();
  const {
    sidebarItemInfo,
    closeLibrarySidebar,
    setSidebarAction,
  } = useSidebarContext();
  const { copyToClipboard } = useClipboard();

  const { showToast } = useContext(ToastContext);
  const [isConfirmingDelete, confirmDelete, cancelDelete] = useToggle(false);
  const [isConfirmingRemove, confirmRemove, cancelRemove] = useToggle(false);
  const {
    navigateTo,
    insideCollection,
    insideSection,
    insideSubsection,
  } = useLibraryRoutes();

  const removeComponentsMutation = useRemoveItemsFromCollection(libraryId, collectionId);

  const handleRemoveFromCollection = () => {
    removeComponentsMutation.mutateAsync([containerKey]).then(() => {
      if (sidebarItemInfo?.id === containerKey) {
      // Close sidebar if current component is open
        closeLibrarySidebar();
      }
      showToast(intl.formatMessage(messages.removeComponentFromCollectionSuccess));
    }).catch(() => {
      showToast(intl.formatMessage(messages.removeComponentFromCollectionFailure));
    });
  };

  const handleRemove = () => {
    if (insideCollection) {
      handleRemoveFromCollection();
    } else if (insideSection || insideSubsection) {
      confirmRemove();
    }
  };

  const scheduleJumpToCollection = useRunOnNextRender(() => {
    // TODO: Ugly hack to make sure sidebar shows add to collection section
    // This needs to run after all changes to url takes place to avoid conflicts.
    setTimeout(() => setSidebarAction(SidebarActions.JumpToManageCollections));
  });

  const showManageCollections = useCallback(() => {
    navigateTo({ selectedItemId: containerKey });
    scheduleJumpToCollection();
  }, [scheduleJumpToCollection, navigateTo, containerKey]);

  const openContainer = useCallback(() => {
    navigateTo({ containerId: containerKey });
  }, [navigateTo, containerKey]);

  const handleCopy = useCallback(() => {
    copyToClipboard(containerKey);
  }, [copyToClipboard, containerKey]);

  const containerType = containerId ? getBlockType(containerId) : 'collection';

  return (
    <>
      <Dropdown id="container-card-dropdown">
        <Dropdown.Toggle
          id="container-card-menu-toggle"
          as={IconButton}
          src={MoreVert}
          iconAs={Icon}
          variant="primary"
          alt={intl.formatMessage(messages.containerCardMenuAlt)}
          data-testid="container-card-menu-toggle"
        />
        <Dropdown.Menu>
          <Dropdown.Item onClick={openContainer}>
            <FormattedMessage {...messages.menuOpen} />
          </Dropdown.Item>
          <Dropdown.Item onClick={handleCopy}>
            <FormattedMessage {...messages.menuCopyContainer} />
          </Dropdown.Item>
          <Dropdown.Item onClick={confirmDelete}>
            <FormattedMessage {...messages.menuDeleteContainer} />
          </Dropdown.Item>
          {(insideCollection || insideSection || insideSubsection) && (
            <Dropdown.Item onClick={handleRemove}>
              <FormattedMessage
                {...messages.menuRemoveFromContainer}
                values={{
                  containerType,
                }}
              />
            </Dropdown.Item>
          )}
          <Dropdown.Item onClick={showManageCollections}>
            <FormattedMessage {...messages.menuAddToCollection} />
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      {isConfirmingDelete && (
        <ContainerDeleter
          close={cancelDelete}
          containerId={containerKey}
        />
      )}
      {isConfirmingRemove && (
        <ContainerRemover
          close={cancelRemove}
          containerKey={containerKey}
          displayName={displayName}
          index={index}
        />
      )}
    </>
  );
};

type UnitCardPreviewProps = {
  childKeys: Array<string>;
  showMaxChildren?: number;
};

const UnitcardPreview = ({ childKeys, showMaxChildren = 5 }: UnitCardPreviewProps) => {
  const hiddenChildren = childKeys.length - showMaxChildren;
  return (
    <Stack direction="horizontal" gap={2}>
      {
        childKeys.slice(0, showMaxChildren).map((usageKey, idx) => {
          const blockType = getBlockType(usageKey);
          let blockPreview: ReactNode;
          let classNames;

          if (idx < showMaxChildren - 1 || hiddenChildren <= 0) {
            // Show the first N-1 blocks as item icons
            // (or all N blocks if no hidden children)
            classNames = `rounded p-1 ${getComponentStyleColor(blockType)}`;
            blockPreview = (
              <Icon
                src={getItemIcon(blockType)}
                screenReaderText={blockType}
                title={usageKey}
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
              // A container can have multiple instances of the same block
              // eslint-disable-next-line react/no-array-index-key
              key={`${usageKey}-${idx}`}
              className={classNames}
            >
              {blockPreview}
            </div>
          );
        })
      }
    </Stack>
  );
};

type ContainerCardPreviewProps = {
  hit: ContainerHit,
};

const ContainerCardPreview = ({ hit }: ContainerCardPreviewProps) => {
  const intl = useIntl();
  const { showOnlyPublished } = useLibraryContext();
  const {
    blockType: itemType,
    published,
    content,
  } = hit;

  if (itemType === 'unit') {
    const childKeys: Array<string> = (
      showOnlyPublished ? published?.content?.childUsageKeys : content?.childUsageKeys
    ) ?? [];

    return <UnitcardPreview childKeys={childKeys} />;
  }
  // TODO Section highlights

  const childNames: Array<string> = (
    showOnlyPublished ? published?.content?.childDisplayNames : content?.childDisplayNames
  ) ?? [];

  if (childNames.length > 0) {
    // Preview with a truncated text with all children display names
    const childrenText = intl.formatMessage(
      messages.containerPreviewText,
      {
        children: childNames.join(', '),
      },
    );

    return (
      <div className="container-card-preview-text">
        <Highlight text={childrenText} />
      </div>
    );
  }
  // Empty preview
  return null;
};

type ContainerCardProps = {
  hit: ContainerHit,
};

const ContainerCard = ({ hit } : ContainerCardProps) => {
  const { componentPickerMode } = useComponentPickerContext();
  const { showOnlyPublished } = useLibraryContext();
  const { openContainerInfoSidebar, openItemSidebar, sidebarItemInfo } = useSidebarContext();

  const {
    blockType: itemType,
    formatted,
    tags,
    numChildren,
    published,
    publishStatus,
    usageKey: containerKey,
  } = hit;

  const numChildrenCount = showOnlyPublished ? (
    published?.numChildren || 0
  ) : numChildren;

  const displayName: string = (
    showOnlyPublished ? formatted.published?.displayName : formatted.displayName
  ) ?? '';

  const selected = sidebarItemInfo?.id === containerKey;

  const { navigateTo } = useLibraryRoutes();

  const selectContainer = useCallback((e?: React.MouseEvent) => {
    const doubleClicked = (e?.detail || 0) > 1;
    if (componentPickerMode) {
      // In component picker mode, we want to open the sidebar
      // without changing the URL
      openContainerInfoSidebar(containerKey);
    } else if (!doubleClicked) {
      openItemSidebar(containerKey, SidebarBodyItemId.ContainerInfo);
    } else {
      navigateTo({ containerId: containerKey });
    }
  }, [containerKey, openContainerInfoSidebar, openItemSidebar, navigateTo]);

  return (
    <BaseCard
      itemType={itemType}
      displayName={displayName}
      preview={<ContainerCardPreview hit={hit} />}
      tags={tags}
      numChildren={numChildrenCount}
      actions={(
        <ActionRow>
          {componentPickerMode ? (
            <AddComponentWidget usageKey={containerKey} blockType={itemType} />
          ) : (
            <ContainerMenu containerKey={containerKey} displayName={displayName} />
          )}
        </ActionRow>
      )}
      hasUnpublishedChanges={publishStatus !== PublishStatus.Published}
      onSelect={selectContainer}
      selected={selected}
    />
  );
};

export default ContainerCard;
