import React from 'react';
import {
  ActionRow,
  Card,
  Container,
  Icon,
  IconButton,
  Dropdown,
  Stack,
  Truncate,
} from '@openedx/paragon';
import { MoreVert } from '@openedx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import messages from './messages';
import TagCount from '../../generic/tag-count';
import { getItemIcon, getComponentStyleColor } from '../../generic/block-type-utils';

type ComponentCardProps = {
  title: string,
  description: string,
  tagCount: number,
  blockType: string,
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

export const ComponentCardLoading = () => (
  <Container className="library-component-card" data-testid="card-loading">
    <Card isLoading>
      <Card.Section />
    </Card>
  </Container>
);

export const ComponentCard = ({
  title,
  description,
  tagCount,
  blockType,
  blockTypeDisplayName,
}: ComponentCardProps) => {
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
            <Truncate lines={1} className="h3 mt-2">
              {title}
            </Truncate>
            <Truncate lines={3}>
              {description}
            </Truncate>
          </Card.Section>
        </Card.Body>
      </Card>
    </Container>
  );
};
