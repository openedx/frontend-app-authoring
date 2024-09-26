import React, { useContext, useState } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Icon,
  IconButton,
  Dropdown,
} from '@openedx/paragon';
import { MoreVert } from '@openedx/paragon/icons';
import { Link } from 'react-router-dom';

import { updateClipboard } from '../../generic/data/api';
import { ToastContext } from '../../generic/toast-context';
import { type ContentHit } from '../../search-manager';
import { useLibraryContext } from '../common/context';
import messages from './messages';
import { STUDIO_CLIPBOARD_CHANNEL } from '../../constants';
import { getEditUrl } from './utils';
import BaseComponentCard from './BaseComponentCard';

type ComponentCardProps = {
  contentHit: ContentHit,
};

export const ComponentMenu = ({ usageKey }: { usageKey: string }) => {
  const intl = useIntl();
  const editUrl = usageKey && getEditUrl(usageKey);
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
        <Dropdown.Item {...(editUrl ? { as: Link, to: editUrl } : { disabled: true, to: '#' })}>
          <FormattedMessage {...messages.menuEdit} />
        </Dropdown.Item>
        <Dropdown.Item onClick={updateClipboardClick}>
          <FormattedMessage {...messages.menuCopyToClipboard} />
        </Dropdown.Item>
        <Dropdown.Item disabled>
          <FormattedMessage {...messages.menuAddToCollection} />
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

const ComponentCard = ({ contentHit } : ComponentCardProps) => {
  const {
    openComponentInfoSidebar,
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
          <ComponentMenu usageKey={usageKey} />
        </ActionRow>
      )}
      openInfoSidebar={() => openComponentInfoSidebar(usageKey)}
    />
  );
};

export default ComponentCard;
