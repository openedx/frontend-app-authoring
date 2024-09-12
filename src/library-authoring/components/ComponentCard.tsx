import React, { useContext, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Icon,
  IconButton,
  Dropdown,
} from '@openedx/paragon';
import { MoreVert } from '@openedx/paragon/icons';

import { updateClipboard } from '../../generic/data/api';
import { ToastContext } from '../../generic/toast-context';
import { type ContentHit } from '../../search-manager';
import { LibraryContext } from '../common/context';
import messages from './messages';
import { STUDIO_CLIPBOARD_CHANNEL } from '../../constants';
import BaseComponentCard from './BaseComponentCard';

type ComponentCardProps = {
  contentHit: ContentHit,
  blockTypeDisplayName: string,
};

export const ComponentMenu = ({ usageKey }: { usageKey: string }) => {
  const intl = useIntl();
  const { showToast } = useContext(ToastContext);
  const [clipboardBroadcastChannel] = useState(() => new BroadcastChannel(STUDIO_CLIPBOARD_CHANNEL));
  const updateClipboardClick = () => {
    updateClipboard(usageKey)
      .then((clipboardData) => {
        clipboardBroadcastChannel.postMessage(clipboardData);
        showToast(intl.formatMessage(messages.copyToClipboardSuccess));
      })
      .catch(() => showToast(intl.formatMessage(messages.copyToClipboardError)));
  };

  return (
    <Dropdown id="component-card-dropdown" onClick={(e) => e.stopPropagation()}>
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
        <Dropdown.Item disabled>
          {intl.formatMessage(messages.menuEdit)}
        </Dropdown.Item>
        <Dropdown.Item onClick={updateClipboardClick}>
          {intl.formatMessage(messages.menuCopyToClipboard)}
        </Dropdown.Item>
        <Dropdown.Item disabled>
          {intl.formatMessage(messages.menuAddToCollection)}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

const ComponentCard = ({ contentHit, blockTypeDisplayName } : ComponentCardProps) => {
  const {
    openComponentInfoSidebar,
  } = useContext(LibraryContext);

  const {
    blockType,
    formatted,
    tags,
    usageKey,
  } = contentHit;
  const description = formatted?.content?.htmlContent ?? '';
  const displayName = formatted?.displayName ?? '';

  return (
    <BaseComponentCard
      type={blockType}
      displayName={displayName}
      description={description}
      tags={tags}
      actions={(
        <ActionRow>
          <ComponentMenu usageKey={usageKey} />
        </ActionRow>
      )}
      blockTypeDisplayName={blockTypeDisplayName}
      openInfoSidebar={() => openComponentInfoSidebar(usageKey)}
    />
  );
};

export default ComponentCard;
