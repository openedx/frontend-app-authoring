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
import { ContainerType, getBlockType } from '../../generic/key-utils';
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
  containerKey: string;
  containerType: ContainerType;
  displayName: string;
};

export const ContainerMenu = ({ containerKey, containerType, displayName } : ContainerMenuProps) => {
  const intl = useIntl();
  const { libraryId, collectionId } = useLibraryContext();
  const {
    sidebarComponentInfo,
    openUnitInfoSidebar,
    closeLibrarySidebar,
    setSidebarAction,
  } = useSidebarContext();
  const { showToast } = useContext(ToastContext);
  const [isConfirmingDelete, confirmDelete, cancelDelete] = useToggle(false);
  const { navigateTo, insideCollection } = useLibraryRoutes();

  const removeComponentsMutation = useRemoveItemsFromCollection(libraryId, collectionId);

  const removeFromCollection = () => {
    removeComponentsMutation.mutateAsync([containerKey]).then(() => {
      if (sidebarComponentInfo?.id === containerKey) {
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
    navigateTo({ [`${containerType}Id`]: containerKey });
    openUnitInfoSidebar(containerKey);
    scheduleJumpToCollection();
  }, [scheduleJumpToCollection, navigateTo, openUnitInfoSidebar, containerKey]);

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
            // required to set container ID in library context
            onClick={() => navigateTo({ [`${containerType}Id`]: containerKey, doubleClicked: true })}
          >
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
      <ContainerDeleter
        isOpen={isConfirmingDelete}
        close={cancelDelete}
        containerId={containerKey}
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
  const { setSectionId, setSubsectionId, setUnitId, showOnlyPublished } = useLibraryContext();
  const { openUnitInfoSidebar, sidebarComponentInfo } = useSidebarContext();

  const {
    blockType: itemType,
    formatted,
    tags,
    numChildren,
    published,
    publishStatus,
    usageKey: containerKey,
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
    && sidebarComponentInfo.id === containerKey;

  const { navigateTo } = useLibraryRoutes();

  const openContainer = useCallback((e?: React.MouseEvent) => {
    switch (itemType) {
      case ContainerType.Unit:
        openUnitInfoSidebar(containerKey);
        if (!componentPickerMode) {
          navigateTo({ unitId: containerKey, doubleClicked: (e?.detail || 0) > 1 });
        } else {
          setUnitId(containerKey);
        }
        break;
      case ContainerType.Section:
        // TODO: open section sidebar
        if (!componentPickerMode) {
          navigateTo({ sectionId: containerKey, doubleClicked: (e?.detail || 0) > 1 });
        } else {
          setSectionId(containerKey);
        }
        break;
      case ContainerType.Subsection:
        // TODO: open subsection sidebar
        if (!componentPickerMode) {
          navigateTo({ subsectionId: containerKey, doubleClicked: (e?.detail || 0) > 1 });
        } else {
          setSubsectionId(containerKey);
        }
        break;
      default:
        break;
    }
  }, [containerKey, itemType, openUnitInfoSidebar, navigateTo]);

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
            <AddComponentWidget usageKey={containerKey} blockType={itemType} />
          ) : (
            <ContainerMenu
              containerKey={containerKey}
              containerType={itemType}
              displayName={hit.displayName}
            />
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
