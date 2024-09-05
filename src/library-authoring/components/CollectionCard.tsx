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
import { type CollectionHit, Highlight } from '../../search-manager';
import { LibraryContext } from '../common/context';
import messages from './messages';
import { STUDIO_CLIPBOARD_CHANNEL } from '../../constants';

type CollectionCardProps = {
  collectionHit: CollectionHit,
};

const CollectionCard = ({ collectionHit } : CollectionCardProps) => {
  const intl = useIntl();

  const {
    type,
    formatted,
    tags,
  } = collectionHit;
  const { displayName = '', description = '' } = formatted;

  const tagCount = useMemo(() => {
    if (!tags) {
      return 0;
    }
    return (tags.level0?.length || 0) + (tags.level1?.length || 0)
            + (tags.level2?.length || 0) + (tags.level3?.length || 0);
  }, [tags]);

  const componentIcon = getItemIcon(type);

  return (
    <Container className="library-component-card">
      <Card>
        <Card.Header
          className={`library-component-header ${getComponentStyleColor(type)}`}
          title={
            <Icon src={componentIcon} className="library-component-header-icon" />
          }
          actions={(
            <ActionRow>
              <IconButton
                src={MoreVert}
                iconAs={Icon}
                variant="primary"
                alt={intl.formatMessage(messages.collectionCardMenuAlt)}
              />
            </ActionRow>
          )}
        />
        <Card.Body>
          <Card.Section>
            <Stack direction="horizontal" className="d-flex justify-content-between">
              <Stack direction="horizontal" gap={1}>
                <Icon src={componentIcon} size="sm" />
                <span className="small">{intl.formatMessage(messages.collectionType)}</span>
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

export default CollectionCard;
