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
import { SidebarActions, SidebarBodyComponentId, useSidebarContext } from '../common/context/SidebarContext';
import { useRemoveItemsFromCollection } from '../data/apiHooks';
import { useLibraryRoutes } from '../routes';
import AddComponentWidget from './AddComponentWidget';
import BaseCard from './BaseCard';
import messages from './messages';
import ContainerDeleter from './ContainerDeleter';
import { useRunOnNextRender } from '../../utils';

type ContainerMenuProps = {
  hit: ContainerHit,
};

const ContainerMenu = ({ hit } : ContainerMenuProps) => {
  const intl = useIntl();
  const {
    blockType: itemType,
    usageKey: containerId,
    displayName,
  } = hit;
  const { libraryId, collectionId } = useLibraryContext();
  const {
    sidebarComponentInfo,
    openUnitInfoSidebar,
    closeLibrarySidebar,
    setSidebarAction,
  } = useSidebarContext();
  const { showToast } = useContext(ToastContext);
  const [isConfirmingDelete, confirmDelete, cancelDelete] = useToggle(false);
  const { navigateTo } = useLibraryRoutes();

  const removeComponentsMutation = useRemoveItemsFromCollection(libraryId, collectionId);

  const removeFromCollection = () => {
    removeComponentsMutation.mutateAsync([containerId]).then(() => {
      if (sidebarComponentInfo?.id === containerId) {
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
    if (itemType === 'unit') {
      navigateTo({ unitId: containerId });
      openUnitInfoSidebar(containerId);
      scheduleJumpToCollection();
    }
  }, [scheduleJumpToCollection, navigateTo, openUnitInfoSidebar, containerId]);

  const openContainerPage = useCallback(() => {
    if (itemType === 'unit') {
      // Set `doubleClicked` to true to open the unit page
      navigateTo({ unitId: containerId, doubleClicked: true });
    }
  }, [itemType, containerId]);

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
          <Dropdown.Item onClick={openContainerPage} disabled={itemType !== 'unit'}>
            <FormattedMessage {...messages.menuOpen} />
          </Dropdown.Item>
          <Dropdown.Item onClick={confirmDelete} disabled={itemType !== 'unit'}>
            <FormattedMessage {...messages.menuDeleteContainer} />
          </Dropdown.Item>
          {collectionId && (
            <Dropdown.Item onClick={removeFromCollection}>
              <FormattedMessage {...messages.menuRemoveFromCollection} />
            </Dropdown.Item>
          )}
          <Dropdown.Item onClick={showManageCollections} disabled={itemType !== 'unit'}>
            <FormattedMessage {...messages.menuAddToCollection} />
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <ContainerDeleter
        isOpen={isConfirmingDelete}
        close={cancelDelete}
        containerId={containerId}
        displayName={displayName}
      />
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

  if (childNames) {
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
  const { setUnitId, showOnlyPublished } = useLibraryContext();
  const { openUnitInfoSidebar, sidebarComponentInfo } = useSidebarContext();

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

  const selected = sidebarComponentInfo?.type === SidebarBodyComponentId.UnitInfo
    && sidebarComponentInfo.id === unitId;

  const { navigateTo } = useLibraryRoutes();

  const openContainer = useCallback((e?: React.MouseEvent) => {
    if (itemType === 'unit') {
      openUnitInfoSidebar(unitId);
      setUnitId(unitId);
      if (!componentPickerMode) {
        navigateTo({ unitId, doubleClicked: (e?.detail || 0) > 1 });
      }
    }
  }, [unitId, itemType, openUnitInfoSidebar, navigateTo]);

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
            <AddComponentWidget usageKey={unitId} blockType={itemType} />
          ) : (
            <ContainerMenu hit={hit} />
          )}
        </ActionRow>
      )}
      hasUnpublishedChanges={publishStatus !== PublishStatus.Published}
      onSelect={openContainer}
      selected={selected}
    />
  );
};

export default ContainerCard;
