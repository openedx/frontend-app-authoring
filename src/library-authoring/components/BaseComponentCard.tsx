import React, { useMemo } from 'react';
import {
  Card,
  Container,
  Icon,
  Stack,
} from '@openedx/paragon';

import { getItemIcon, getComponentStyleColor } from '../../generic/block-type-utils';
import TagCount from '../../generic/tag-count';
import { ContentHitTags, Highlight } from '../../search-manager';

type BaseComponentCardProps = {
  type: string,
  displayName: string,
  description: string,
  tags: ContentHitTags,
  actions: React.ReactNode,
  blockTypeDisplayName: string,
  openInfoSidebar: () => void
};

const BaseComponentCard = ({
  type,
  displayName,
  description,
  tags,
  actions,
  blockTypeDisplayName,
  openInfoSidebar,
} : BaseComponentCardProps) => {
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
      <Card
        isClickable
        onClick={openInfoSidebar}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (['Enter', ' '].includes(e.key)) {
            openInfoSidebar();
          }
        }}
      >
        <Card.Header
          className={`library-component-header ${getComponentStyleColor(type)}`}
          title={
            <Icon src={componentIcon} className="library-component-header-icon" />
          }
          actions={actions}
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

export default BaseComponentCard;
