import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Dropdown,
  Icon,
  IconButton,
} from '@openedx/paragon';
import { MoreVert } from '@openedx/paragon/icons';
import { Link } from 'react-router-dom';

import { type ContainerHit, PublishStatus } from '../../search-manager';
import { useComponentPickerContext } from '../common/context/ComponentPickerContext';
import { useLibraryContext } from '../common/context/LibraryContext';
import BaseComponentCard from './BaseComponentCard';
import messages from './messages';

type ContainerMenuProps = {
  containerHit: ContainerHit,
};

const ContainerMenu = ({ containerHit } : ContainerMenuProps) => {
  const intl = useIntl();

  return (
    <Dropdown id="container-card-dropdown">
      <Dropdown.Toggle
        id="container-card-menu-toggle"
        as={IconButton}
        src={MoreVert}
        iconAs={Icon}
        variant="primary"
        alt={intl.formatMessage(messages.collectionCardMenuAlt)}
        data-testid="container-card-menu-toggle"
      />
      <Dropdown.Menu>
        <Dropdown.Item
          as={Link}
          to={`/library/${containerHit.contextKey}/container/${containerHit.blockId}`}
          disabled
        >
          <FormattedMessage {...messages.menuOpen} />
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

type ContainerCardProps = {
  hit: ContainerHit,
};

const ContainerCard = ({ hit } : ContainerCardProps) => {
  const { componentPickerMode } = useComponentPickerContext();
  const { showOnlyPublished } = useLibraryContext();

  const {
    blockType: componentType,
    formatted,
    tags,
    numChildren,
    published,
    publishStatus,
  } = hit;

  const numChildrenCount = showOnlyPublished ? (
    published?.numChildren || 0
  ) : numChildren;

  const displayName: string = (
    showOnlyPublished ? formatted.published?.displayName : formatted.displayName
  ) ?? '';

  const openContainer = () => {};

  return (
    <BaseComponentCard
      componentType={componentType}
      displayName={displayName}
      tags={tags}
      numChildren={numChildrenCount}
      actions={!componentPickerMode && (
        <ActionRow>
          <ContainerMenu containerHit={hit} />
        </ActionRow>
      )}
      hasUnpublishedChanges={publishStatus !== PublishStatus.Published}
      onSelect={openContainer}
    />
  );
};

export default ContainerCard;
