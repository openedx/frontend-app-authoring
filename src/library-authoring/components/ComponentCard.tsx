import { useCallback, useContext, useState } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Button,
  Dropdown,
  Icon,
  IconButton,
  useToggle,
} from '@openedx/paragon';
import {
  AddCircleOutline,
  CheckBoxIcon,
  CheckBoxOutlineBlank,
  MoreVert,
} from '@openedx/paragon/icons';

import { STUDIO_CLIPBOARD_CHANNEL } from '../../constants';
import { updateClipboard } from '../../generic/data/api';
import { ToastContext } from '../../generic/toast-context';
import { type ContentHit } from '../../search-manager';
import { useComponentPickerContext } from '../common/context/ComponentPickerContext';
import { useLibraryContext } from '../common/context/LibraryContext';
import { SidebarActions, useSidebarContext } from '../common/context/SidebarContext';
import { useRemoveComponentsFromCollection } from '../data/apiHooks';
import { useLibraryRoutes } from '../routes';

import BaseComponentCard from './BaseComponentCard';
import { canEditComponent } from './ComponentEditorModal';
import messages from './messages';
import ComponentDeleter from './ComponentDeleter';

type ComponentCardProps = {
  contentHit: ContentHit,
};

export const ComponentMenu = ({ usageKey }: { usageKey: string }) => {
  const intl = useIntl();
  const {
    libraryId,
    collectionId,
    openComponentEditor,
  } = useLibraryContext();

  const {
    sidebarComponentInfo,
    openComponentInfoSidebar,
    closeLibrarySidebar,
    setSidebarAction,
  } = useSidebarContext();

  const canEdit = usageKey && canEditComponent(usageKey);
  const { showToast } = useContext(ToastContext);
  const [clipboardBroadcastChannel] = useState(() => new BroadcastChannel(STUDIO_CLIPBOARD_CHANNEL));
  const removeComponentsMutation = useRemoveComponentsFromCollection(libraryId, collectionId);
  const [isConfirmingDelete, confirmDelete, cancelDelete] = useToggle(false);

  const updateClipboardClick = () => {
    updateClipboard(usageKey)
      .then((clipboardData) => {
        clipboardBroadcastChannel.postMessage(clipboardData);
        showToast(intl.formatMessage(messages.copyToClipboardSuccess));
      })
      .catch(() => showToast(intl.formatMessage(messages.copyToClipboardError)));
  };

  const removeFromCollection = () => {
    removeComponentsMutation.mutateAsync([usageKey]).then(() => {
      if (sidebarComponentInfo?.id === usageKey) {
        // Close sidebar if current component is open
        closeLibrarySidebar();
      }
      showToast(intl.formatMessage(messages.removeComponentSucess));
    }).catch(() => {
      showToast(intl.formatMessage(messages.removeComponentFailure));
    });
  };

  const showManageCollections = useCallback(() => {
    setSidebarAction(SidebarActions.JumpToAddCollections);
    openComponentInfoSidebar(usageKey);
  }, [setSidebarAction, openComponentInfoSidebar, usageKey]);

  return (
    <Dropdown id="component-card-dropdown">
      <Dropdown.Toggle
        id="component-card-menu-toggle"
        as={IconButton}
        src={MoreVert}
        iconAs={Icon}
        variant="primary"
        alt={intl.formatMessage(messages.componentCardMenuAlt)}
        data-testid="component-card-menu-toggle"
      />
      <Dropdown.Menu>
        <Dropdown.Item {...(canEdit ? { onClick: () => openComponentEditor(usageKey) } : { disabled: true })}>
          <FormattedMessage {...messages.menuEdit} />
        </Dropdown.Item>
        <Dropdown.Item onClick={updateClipboardClick}>
          <FormattedMessage {...messages.menuCopyToClipboard} />
        </Dropdown.Item>
        <Dropdown.Item onClick={confirmDelete}>
          <FormattedMessage {...messages.menuDelete} />
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
      <ComponentDeleter usageKey={usageKey} isConfirmingDelete={isConfirmingDelete} cancelDelete={cancelDelete} />
    </Dropdown>
  );
};

interface AddComponentWidgetProps {
  usageKey: string;
  blockType: string;
}

const AddComponentWidget = ({ usageKey, blockType }: AddComponentWidgetProps) => {
  const intl = useIntl();

  const {
    componentPickerMode,
    onComponentSelected,
    addComponentToSelectedComponents,
    removeComponentFromSelectedComponents,
    selectedComponents,
  } = useComponentPickerContext();

  // istanbul ignore if: this should never happen
  if (!usageKey) {
    throw new Error('usageKey is required');
  }

  // istanbul ignore if: this should never happen
  if (!componentPickerMode) {
    return null;
  }

  if (componentPickerMode === 'single') {
    return (
      <Button
        variant="outline-primary"
        iconBefore={AddCircleOutline}
        onClick={() => {
          onComponentSelected({ usageKey, blockType });
        }}
      >
        <FormattedMessage {...messages.componentPickerSingleSelectTitle} />
      </Button>
    );
  }

  if (componentPickerMode === 'multiple') {
    const isChecked = selectedComponents.some((component) => component.usageKey === usageKey);

    const handleChange = () => {
      const selectedComponent = {
        usageKey,
        blockType,
      };
      if (!isChecked) {
        addComponentToSelectedComponents(selectedComponent);
      } else {
        removeComponentFromSelectedComponents(selectedComponent);
      }
    };

    return (
      <Button
        variant="outline-primary"
        iconBefore={isChecked ? CheckBoxIcon : CheckBoxOutlineBlank}
        onClick={handleChange}
      >
        {intl.formatMessage(messages.componentPickerMultipleSelectTitle)}
      </Button>
    );
  }

  // istanbul ignore next: this should never happen
  return null;
};

const ComponentCard = ({ contentHit }: ComponentCardProps) => {
  const { showOnlyPublished } = useLibraryContext();
  const { openComponentInfoSidebar } = useSidebarContext();
  const { componentPickerMode } = useComponentPickerContext();

  const {
    blockType,
    formatted,
    tags,
    usageKey,
  } = contentHit;
  const componentDescription: string = (
    showOnlyPublished ? formatted.published?.description : formatted.description
  ) ?? '';
  const displayName: string = (
    showOnlyPublished ? formatted.published?.displayName : formatted.displayName
  ) ?? '';

  const { navigateTo } = useLibraryRoutes();
  const openComponent = useCallback(() => {
    openComponentInfoSidebar(usageKey);

    if (!componentPickerMode) {
      navigateTo({ componentId: usageKey });
    }
  }, [usageKey, navigateTo, openComponentInfoSidebar]);

  return (
    <BaseComponentCard
      componentType={blockType}
      displayName={displayName}
      description={componentDescription}
      tags={tags}
      actions={(
        <ActionRow>
          {componentPickerMode ? (
            <AddComponentWidget usageKey={usageKey} blockType={blockType} />
          ) : (
            <ComponentMenu usageKey={usageKey} />
          )}
        </ActionRow>
      )}
      onSelect={openComponent}
    />
  );
};

export default ComponentCard;
