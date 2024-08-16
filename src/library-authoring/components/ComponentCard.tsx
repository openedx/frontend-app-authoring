import React, { useContext, useMemo, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Card,
  Container,
  Icon,
  IconButton,
  Dropdown,
  Stack,
} from '@openedx/paragon';
import { MoreVert } from '@openedx/paragon/icons';

import { getItemIcon, getComponentStyleColor } from '../../generic/block-type-utils';
import { updateClipboard } from '../../generic/data/api';
import TagCount from '../../generic/tag-count';
import { ToastContext } from '../../generic/toast-context';
import { type ContentHit, Highlight } from '../../search-manager';
import { LibraryContext } from '../common/context';
import messages from './messages';
import { STUDIO_CLIPBOARD_CHANNEL } from '../../constants';

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
  const tagCount = useMemo(() => {
    if (!tags) {
      return 0;
    }
    return (tags.level0?.length || 0) + (tags.level1?.length || 0)
            + (tags.level2?.length || 0) + (tags.level3?.length || 0);
  }, [tags]);

  const componentIcon = getItemIcon(blockType);

  return (
    <Container className="library-component-card">
      <Card
        isClickable
        onClick={() => openComponentInfoSidebar(usageKey)}
      >
        <Card.Header
          className={`library-component-header ${getComponentStyleColor(blockType)}`}
          title={
            <Icon src={componentIcon} className="library-component-header-icon" />
          }
          actions={(
            <ActionRow>
              <ComponentMenu usageKey={usageKey} />
            </ActionRow>
          )}
        />
        <Card.Body>
          <Card.Section>
            <Stack direction="horizontal" className="d-flex justify-content-between">
              <Stack direction="horizontal" gap={1}>
                <Icon src={componentIcon} size="sm" />
                <span className="small">{blockTypeDisplayName}</span>
              </Stack>
              <TagCount count={tagCount} />
            </Stack>
            <div className="text-truncate h3 mt-2">
              <Highlight text={displayName} />
            </div>
            <Highlight text={description} />
          </Card.Section>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ComponentCard;
