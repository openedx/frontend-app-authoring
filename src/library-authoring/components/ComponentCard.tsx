import React, { useMemo } from 'react';
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
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import messages from './messages';
import TagCount from '../../generic/tag-count';
import { getItemIcon, getComponentStyleColor } from '../../generic/block-type-utils';
import { ContentHit } from '../../search-modal/data/api';
import Highlight from '../../search-modal/Highlight';

type ComponentCardProps = {
  contentHit: ContentHit,
  blockTypeDisplayName: string,
};

const ComponentCardMenu = () => (
  <Dropdown>
    <Dropdown.Toggle
      as={IconButton}
      src={MoreVert}
      iconAs={Icon}
      variant="primary"
    />
    <Dropdown.Menu>
      <Dropdown.Item disabled>
        <FormattedMessage
          {...messages.menuEdit}
        />
      </Dropdown.Item>
      <Dropdown.Item disabled>
        <FormattedMessage
          {...messages.menuCopyToClipboard}
        />
      </Dropdown.Item>
      <Dropdown.Item disabled>
        <FormattedMessage
          {...messages.menuAddToCollection}
        />
      </Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>
);

const ComponentCard = ({ contentHit, blockTypeDisplayName } : ComponentCardProps) => {
  const {
    blockType,
    formatted,
    tags,
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
      <Card>
        <Card.Header
          className={`library-component-header ${getComponentStyleColor(blockType)}`}
          title={
            <Icon src={componentIcon} className="library-component-header-icon" />
          }
          actions={(
            <ActionRow>
              <ComponentCardMenu />
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
