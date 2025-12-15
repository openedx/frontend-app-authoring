import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import {
  Button, Dropdown, Icon, Stack,
} from '@openedx/paragon';
import {
  Add, AutoGraph, Edit as EditIcon, Tag, ViewSidebar,
} from '@openedx/paragon/icons';
import { COURSE_BLOCK_NAMES } from '@src/constants';

import messages from './messages';

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

  const showNewDesignButtons = getConfig().ENABLE_UNIT_PAGE_NEW_DESIGN === 'true';

  return (
    <nav className="header-navigations ml-auto flex-shrink-0">
      {category === COURSE_BLOCK_NAMES.vertical.id && (
        <Stack direction="horizontal" gap={3}>
          {showNewDesignButtons && (
            <Button
              variant="outline-primary"
              iconBefore={Add}
            >
              {intl.formatMessage(messages.addButton)}
            </Button>
          )}
          <Button
            variant="outline-primary"
            onClick={handleViewLive}
          >
            {intl.formatMessage(messages.viewLiveButton)}
          </Button>
          <Button
            variant="outline-primary"
            onClick={handlePreview}
          >
            {intl.formatMessage(messages.previewButton)}
          </Button>
          {showNewDesignButtons && (
            <Dropdown>
              <Dropdown.Toggle
                id="dropdown-toggle-with-iconbutton"
                as={Button}
                variant="outline-primary"
                aria-label={intl.formatMessage(messages.moreActionsButtonAriaLabel)}
              >
                <Icon src={ViewSidebar} />
              </Dropdown.Toggle>
              <Dropdown.Menu className="mt-1">
                <Dropdown.Item>
                  <Stack direction="horizontal" gap={2}>
                    <Icon src={AutoGraph} />
                    {intl.formatMessage(messages.analyticsMenu)}
                  </Stack>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Stack direction="horizontal" gap={2}>
                    <Icon src={Tag} />
                    {intl.formatMessage(messages.alignMenu)}
                  </Stack>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
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
