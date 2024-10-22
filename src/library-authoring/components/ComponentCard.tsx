import { useContext, useState } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Button,
  Dropdown,
  Icon,
  IconButton,
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
import { useLibraryContext } from '../common/context';
import { useRemoveComponentsFromCollection } from '../data/apiHooks';
import BaseComponentCard from './BaseComponentCard';
import { canEditComponent } from './ComponentEditorModal';
import messages from './messages';

type ComponentCardProps = {
  contentHit: ContentHit,
};

export const ComponentMenu = ({ usageKey }: { usageKey: string }) => {
  const intl = useIntl();
  const {
    libraryId,
    collectionId,
    sidebarComponentUsageKey,
    openComponentEditor,
    closeLibrarySidebar,
  } = useLibraryContext();

  const canEdit = usageKey && canEditComponent(usageKey);
  const { showToast } = useContext(ToastContext);
  const [clipboardBroadcastChannel] = useState(() => new BroadcastChannel(STUDIO_CLIPBOARD_CHANNEL));
  const removeComponentsMutation = useRemoveComponentsFromCollection(libraryId, collectionId);
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
      if (sidebarComponentUsageKey === usageKey) {
        // Close sidebar if current component is open
        closeLibrarySidebar();
      }
      showToast(intl.formatMessage(messages.removeComponentSucess));
    }).catch(() => {
      showToast(intl.formatMessage(messages.removeComponentFailure));
    });
  };

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
        {collectionId && (
          <Dropdown.Item onClick={removeFromCollection}>
            <FormattedMessage {...messages.menuRemoveFromCollection} />
          </Dropdown.Item>
        )}
        <Dropdown.Item disabled>
          <FormattedMessage {...messages.menuAddToCollection} />
        </Dropdown.Item>
      </Dropdown.Menu>
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
  } = useLibraryContext();

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

  return (
    <BaseComponentCard
      componentType={blockType}
      displayName={displayName}
      description={description}
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
      openInfoSidebar={() => openComponentInfoSidebar(usageKey)}
    />
  );
};

export default ComponentCard;
