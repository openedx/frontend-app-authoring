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
import { Link } from 'react-router-dom';

import { getItemIcon, getComponentStyleColor } from '../../generic/block-type-utils';
import { getBlockType } from '../../generic/key-utils';
import { ToastContext } from '../../generic/toast-context';
import { type ContainerHit, PublishStatus } from '../../search-manager';
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
    contextKey,
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
    navigateTo({ unitId: containerId });
    openUnitInfoSidebar(containerId);
    scheduleJumpToCollection();
  }, [scheduleJumpToCollection, navigateTo, openUnitInfoSidebar, containerId]);

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
          <Dropdown.Item
            as={Link}
            to={`/library/${contextKey}/unit/${containerId}`}
          >
            <FormattedMessage {...messages.menuOpen} />
          </Dropdown.Item>
          <Dropdown.Item onClick={confirmDelete}>
            <FormattedMessage {...messages.menuDeleteContainer} />
          </Dropdown.Item>
          {collectionId && (
            <Dropdown.Item onClick={removeFromCollection}>
              <FormattedMessage {...messages.menuRemoveFromCollection} />
            </Dropdown.Item>
          )}
          <Dropdown.Item onClick={showManageCollections}>
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

type ContainerCardPreviewProps = {
  childUsageKeys: Array<string>;
  showMaxChildren?: number;
};

const ContainerCardPreview = ({ childUsageKeys, showMaxChildren = 5 }: ContainerCardPreviewProps) => {
  const hiddenChildren = childUsageKeys.length - showMaxChildren;
  return (
    <Stack direction="horizontal" gap={2}>
      {
        childUsageKeys.slice(0, showMaxChildren).map((usageKey, idx) => {
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
    content,
  } = hit;

  const numChildrenCount = showOnlyPublished ? (
    published?.numChildren || 0
  ) : numChildren;

  const displayName: string = (
    showOnlyPublished ? formatted.published?.displayName : formatted.displayName
  ) ?? '';

  const childUsageKeys: Array<string> = (
    showOnlyPublished ? published?.content?.childUsageKeys : content?.childUsageKeys
  ) ?? [];

  const selected = sidebarComponentInfo?.type === SidebarBodyComponentId.UnitInfo
    && sidebarComponentInfo.id === unitId;

  const { navigateTo } = useLibraryRoutes();

  const openContainer = useCallback(() => {
    if (itemType === 'unit') {
      openUnitInfoSidebar(unitId);
      setUnitId(unitId);
      navigateTo({ unitId });
    }
  }, [unitId, itemType, openUnitInfoSidebar, navigateTo]);

  return (
    <BaseCard
      itemType={itemType}
      displayName={displayName}
      preview={<ContainerCardPreview childUsageKeys={childUsageKeys} />}
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
