import React, { useMemo } from 'react';
import {
  Card,
  Container,
  Icon,
  Stack,
} from '@openedx/paragon';

import { getItemIcon, getComponentStyleColor } from '../../generic/block-type-utils';
import TagCount from '../../generic/tag-count';
import { BlockTypeLabel, type ContentHitTags, Highlight } from '../../search-manager';

type BaseComponentCardProps = {
  componentType: string,
  displayName: string, description: string,
  numChildren?: number,
  tags: ContentHitTags,
  actions: React.ReactNode,
  onSelect: () => void
};

const BaseComponentCard = ({
  componentType,
  displayName,
  description,
  numChildren,
  tags,
  actions,
  onSelect,
} : BaseComponentCardProps) => {
  const tagCount = useMemo(() => {
    if (!tags) {
      return 0;
    }
    return (tags.level0?.length || 0) + (tags.level1?.length || 0)
            + (tags.level2?.length || 0) + (tags.level3?.length || 0);
  }, [tags]);

  const componentIcon = getItemIcon(componentType);

  return (
    <Container className="library-component-card">
      <Card
        isClickable
        onClick={onSelect}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (['Enter', ' '].includes(e.key)) {
            onSelect();
          }
        }}
      >
        <Card.Header
          className={`library-component-header ${getComponentStyleColor(componentType)}`}
          title={
            <Icon src={componentIcon} className="library-component-header-icon" />
          }
          actions={
            // Wrap the actions in a div to prevent the card from being clicked when the actions are clicked
            /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
            jsx-a11y/no-static-element-interactions */
            <div onClick={(e) => e.stopPropagation()}>{actions}</div>
          }
        />
        <Card.Body>
          <Card.Section>
            <Stack direction="horizontal" className="d-flex justify-content-between">
              <Stack direction="horizontal" gap={1}>
                <Icon src={componentIcon} size="sm" />
                <span className="small">
                  <BlockTypeLabel blockType={componentType} count={numChildren} />
                </span>
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

export default BaseComponentCard;
