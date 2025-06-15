import React, { useMemo } from 'react';
import {
  Badge,
  Card,
  Container,
  Icon,
  Stack,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';
import { getItemIcon, getComponentStyleColor } from '../../generic/block-type-utils';
import ComponentCount from '../../generic/component-count';
import TagCount from '../../generic/tag-count';
import { BlockTypeLabel, type ContentHitTags, Highlight } from '../../search-manager';

type BaseCardProps = {
  itemType: string;
  displayName: string;
  description?: string;
  preview?: React.ReactNode;
  numChildren?: number;
  tags: ContentHitTags;
  actions: React.ReactNode;
  hasUnpublishedChanges?: boolean;
  onSelect: (e?: React.MouseEvent) => void;
  selected?: boolean;
};

const BaseCard = ({
  itemType,
  displayName,
  description = '',
  numChildren,
  tags,
  actions,
  onSelect,
  selected = false,
  ...props
} : BaseCardProps) => {
  const tagCount = useMemo(() => {
    if (!tags) {
      return 0;
    }
    return (tags.level0?.length || 0) + (tags.level1?.length || 0)
            + (tags.level2?.length || 0) + (tags.level3?.length || 0);
  }, [tags]);

  const itemIcon = getItemIcon(itemType);
  const intl = useIntl();

  return (
    <Container className="library-item-card selected">
      <Card
        isClickable
        onClick={onSelect}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (['Enter', ' '].includes(e.key)) {
            onSelect();
          }
        }}
        className={selected ? 'selected' : undefined}
      >
        <Card.Header
          className={`library-item-header ${getComponentStyleColor(itemType)}`}
          title={
            <Icon src={itemIcon} className="library-item-header-icon" />
          }
          actions={
            // Wrap the actions in a div to prevent the card from being clicked when the actions are clicked
            /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
            jsx-a11y/no-static-element-interactions */
            <div onClick={(e) => e.stopPropagation()}>{actions}</div>
          }
        />
        <Card.Body className="w-100">
          <Card.Section>
            <div className="text-truncate h3 mt-1">
              <Highlight text={displayName} />
            </div>
            {props.preview || <Highlight text={description} />}
          </Card.Section>
        </Card.Body>
        <Card.Footer className="mt-auto">
          <Stack gap={2}>
            <Stack direction="horizontal" gap={1}>
              <Stack direction="horizontal" gap={1} className="mr-auto">
                <Icon src={itemIcon} size="sm" />
                <small>
                  <BlockTypeLabel blockType={itemType} />
                </small>
              </Stack>
              <ComponentCount count={numChildren} />
              <TagCount size="sm" count={tagCount} />
            </Stack>
            <div className="badge-container d-flex align-items-center justify-content-center">
              {props.hasUnpublishedChanges && (
                <Badge variant="warning">{intl.formatMessage(messages.unpublishedChanges)}</Badge>
              )}
            </div>
          </Stack>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default BaseCard;
