import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button, ButtonGroup, Stack,
} from '@openedx/paragon';
import {
  Add, Edit as EditIcon, FindInPage, InfoOutline,
} from '@openedx/paragon/icons';
import { COURSE_BLOCK_NAMES } from '@src/constants';

import messages from './messages';
import { isUnitPageNewDesignEnabled } from '../utils';

type HeaderNavigationActions = {
  handleViewLive: () => void;
  handlePreview: () => void;
  handleEdit: () => void;
};

type HeaderNavigationsProps = {
  headerNavigationsActions: HeaderNavigationActions;
  category: string;
};

const HeaderNavigations = ({ headerNavigationsActions, category }: HeaderNavigationsProps) => {
  const intl = useIntl();
  const {
    handleViewLive,
    handlePreview,
    handleEdit,
  } = headerNavigationsActions;

  const showNewDesignButtons = isUnitPageNewDesignEnabled();

  return (
    <nav className="header-navigations ml-auto flex-shrink-0">
      {category === COURSE_BLOCK_NAMES.vertical.id && (
        <Stack direction="horizontal" gap={3}>
          {showNewDesignButtons && (
            <>
              <Button
                variant="outline-primary"
                iconBefore={InfoOutline}
              >
                {intl.formatMessage(messages.infoButton)}
              </Button>
              <Button
                variant="outline-primary"
                iconBefore={Add}
              >
                {intl.formatMessage(messages.addButton)}
              </Button>
            </>
          )}
          <ButtonGroup>
            <Button
              variant="outline-primary"
              onClick={handleViewLive}
              iconBefore={FindInPage}
            >
              {intl.formatMessage(messages.viewLiveButton)}
            </Button>
            <Button
              variant="outline-primary"
              onClick={handlePreview}
            >
              {intl.formatMessage(messages.previewButton)}
            </Button>
          </ButtonGroup>
        </Stack>
      )}
      {[COURSE_BLOCK_NAMES.libraryContent.id, COURSE_BLOCK_NAMES.splitTest.id].includes(category) && (
        <Button
          iconBefore={EditIcon}
          variant="outline-primary"
          onClick={handleEdit}
          data-testid="header-edit-button"
        >
          {intl.formatMessage(messages.editButton)}
        </Button>
      )}
    </nav>
  );
};

export default HeaderNavigations;
