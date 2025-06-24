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

import { getItemIcon, getComponentStyleColor } from '../../generic/block-type-utils';
import { getBlockType } from '../../generic/key-utils';
import { ToastContext } from '../../generic/toast-context';
import { type ContainerHit, Highlight, PublishStatus } from '../../search-manager';
import { useComponentPickerContext } from '../common/context/ComponentPickerContext';
import { useLibraryContext } from '../common/context/LibraryContext';
import { SidebarActions, useSidebarContext } from '../common/context/SidebarContext';
import { useRemoveItemsFromCollection } from '../data/apiHooks';
import { useLibraryRoutes } from '../routes';
import messages from './messages';
import ContainerDeleter from './ContainerDeleter';
import { useRunOnNextRender } from '../../utils';
import BaseCard from '../components/BaseCard';
import AddComponentWidget from '../components/AddComponentWidget';

type ContainerMenuProps = {
  containerKey: string;
  displayName: string;
};

export const ContainerMenu = ({ containerKey, displayName } : ContainerMenuProps) => {
  const intl = useIntl();
  const { libraryId, collectionId } = useLibraryContext();
  const {
    sidebarItemInfo,
    closeLibrarySidebar,
    setSidebarAction,
  } = useSidebarContext();
  const { showToast } = useContext(ToastContext);
  const [isConfirmingDelete, confirmDelete, cancelDelete] = useToggle(false);
  const { navigateTo, insideCollection } = useLibraryRoutes();

  const removeComponentsMutation = useRemoveItemsFromCollection(libraryId, collectionId);

  const removeFromCollection = () => {
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
          <Dropdown.Item onClick={confirmDelete}>
            <FormattedMessage {...messages.menuDeleteContainer} />
          </Dropdown.Item>
          {insideCollection && (
            <Dropdown.Item onClick={removeFromCollection}>
              <FormattedMessage {...messages.menuRemoveFromCollection} />
            </Dropdown.Item>
          )}
          <Dropdown.Item onClick={showManageCollections}>
            <FormattedMessage {...messages.menuAddToCollection} />
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      {isConfirmingDelete && (
        <ContainerDeleter
          isOpen={isConfirmingDelete}
          close={cancelDelete}
          containerId={containerKey}
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
  const { openContainerInfoSidebar, sidebarItemInfo } = useSidebarContext();

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
      navigateTo({ selectedItemId: containerKey });
    } else {
      navigateTo({ containerId: containerKey });
    }
  }, [containerKey, openContainerInfoSidebar, navigateTo]);

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
            <ContainerMenu
              containerKey={containerKey}
              displayName={hit.displayName}
            />
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
