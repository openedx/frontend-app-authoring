import { useContext, useState } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Button,
  Dropdown,
  Icon,
  IconButton,
  useToggle,
} from '@openedx/paragon';
import { AddCircleOutline, MoreVert } from '@openedx/paragon/icons';

import { STUDIO_CLIPBOARD_CHANNEL } from '../../constants';
import { updateClipboard } from '../../generic/data/api';
import { ToastContext } from '../../generic/toast-context';
import { type ContentHit } from '../../search-manager';
import { SidebarBodyComponentId, useLibraryContext } from '../common/context';
import { useRemoveComponentsFromCollection } from '../data/apiHooks';
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
    sidebarComponentInfo,
    openComponentInfoSidebar,
    openComponentEditor,
    closeLibrarySidebar,
  } = useLibraryContext();

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

  const showManageCollections = () => {
    openComponentInfoSidebar(usageKey);
  }

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

const ComponentCard = ({ contentHit }: ComponentCardProps) => {
  const {
    openComponentInfoSidebar,
    componentPickerMode,
  } = useLibraryContext();

  const {
    blockType,
    formatted,
    tags,
    usageKey,
  } = contentHit;
  const description: string = (/* eslint-disable */
    blockType === 'html' ? formatted?.content?.htmlContent :
      blockType === 'problem' ? formatted?.content?.capaContent :
        undefined
  ) ?? '';/* eslint-enable */
  const displayName = formatted?.displayName ?? '';

  const handleAddComponentToCourse = () => {
    window.parent.postMessage({
      usageKey,
      type: 'pickerComponentSelected',
      category: blockType,
    }, '*');
  };

  return (
    <BaseComponentCard
      componentType={blockType}
      displayName={displayName}
      description={description}
      tags={tags}
      actions={(
        <ActionRow>
          {componentPickerMode ? (
            <Button
              variant="outline-primary"
              iconBefore={AddCircleOutline}
              onClick={handleAddComponentToCourse}
            >
              <FormattedMessage {...messages.addComponentToCourseButtonTitle} />
            </Button>
          ) : (
            <ComponentMenu usageKey={usageKey} />
          )}
        </ActionRow>
      )}
      openInfoSidebar={() => openComponentInfoSidebar(usageKey)}
    />
  );
};

export default ComponentCard;
