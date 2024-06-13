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
      <Dropdown.Item>
        <FormattedMessage
          {...messages.menuEdit}
        />
      </Dropdown.Item>
      <Dropdown.Item>
        <FormattedMessage
          {...messages.menuCopyToClipboard}
        />
      </Dropdown.Item>
      <Dropdown.Item>
        <FormattedMessage
          {...messages.menuAddToCollection}
        />
      </Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>
);

const ComponentCard = ({ icon, tagCount, blockType }) => (
  <Container className="library-component-card">
    <Card>
      <Card.Header
        className={`library-component-header-${blockType}`}
        title={
          <Icon src={icon} />
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
            <Stack direction="horizontal">
              <Icon src={icon} size="sm" />
              <span className="small">Type</span>
            </Stack>
            <TagCount count={tagCount} />
          </Stack>
          <div className="h3 text-truncate mt-2">
            Este es un titulo largo pero muuuuuyyyyyy largoooooo.
          </div>
          <p className="library-component-card-description">
            This is a long. long. long descriprioooon
            This is a long. long. long descriprioooon
            This is a long. long. long descriprioooon
            This is a long. long. long descriprioooon
            This is a long. long. long descriprioooon
            This is a long. long. long descriprioooon
            This is a long. long. long descriprioooon
            This is a long. long. long descriprioooon
            This is a long. long. long descriprioooon
          </p>
        </Card.Section>
      </Card.Body>

    </Card>
  </Container>
);

ComponentCard.propTypes = {
  icon: PropTypes.node.isRequired,
  tagCount: PropTypes.number.isRequired,
  blockType: PropTypes.string.isRequired,
};

export default ComponentCard;
