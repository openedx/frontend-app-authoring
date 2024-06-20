// @ts-check
import React from 'react';
import {
  ActionRow,
  Card,
  Container,
  Icon,
  IconButton,
  Dropdown,
  Stack,
} from '@openedx/paragon';
import PropTypes from 'prop-types';
import { MoreVert } from '@openedx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import messages from './messages';
import TagCount from '../../generic/tag-count';
import getItemIcon from '../../search-modal/utils';
import getComponentColor from '../utils';

const ComponentCardMenu = () => (
  <Dropdown>
    <Dropdown.Toggle
      id="dropdown-toggle-with-iconbutton"
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
  <Container className="library-component-card">
    <Card isLoading>
      <Card.Section />
    </Card>
  </Container>
);

export const ComponentCard = ({
  isLoading,
  title,
  description,
  tagCount,
  blockType,
  blockTypeDisplayName,
}) => {
  const componentIcon = getItemIcon(blockType);

  return (
    <Container className="library-component-card">
      <Card isLoading={isLoading}>
        <Card.Header
          className={`library-component-header ${getComponentColor(blockType)}`}
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
            <div className="h3 text-truncate mt-2">
              {title}
            </div>
            <p className="library-component-card-description">
              {description}
            </p>
          </Card.Section>
        </Card.Body>
      </Card>
    </Container>
  );
};

ComponentCard.defaultProps = {
  isLoading: false,
};

ComponentCard.propTypes = {
  isLoading: PropTypes.bool,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  tagCount: PropTypes.number.isRequired,
  blockType: PropTypes.string.isRequired,
  blockTypeDisplayName: PropTypes.string.isRequired,
};
