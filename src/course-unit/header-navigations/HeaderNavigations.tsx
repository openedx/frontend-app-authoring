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
import { useUnitSidebarContext } from '../unit-sidebar/UnitSidebarContext';

type HeaderNavigationActions = {
  handleViewLive: () => void;
  handlePreview: () => void;
  handleEdit: () => void;
};

type HeaderNavigationsProps = {
  headerNavigationsActions: HeaderNavigationActions;
  category: string;
};

/**
 * Generic header navigations to be used in this pages:
 * - Unit page
 * - Legacy library content page
 * - Split test page
 */
const HeaderNavigations = ({ headerNavigationsActions, category }: HeaderNavigationsProps) => {
  const intl = useIntl();
  const {
    handleViewLive,
    handlePreview,
    handleEdit,
  } = headerNavigationsActions;

  const { setCurrentPageKey, readOnly } = useUnitSidebarContext();

  const showNewDesignButtons = isUnitPageNewDesignEnabled();

  return (
    <nav className="header-navigations ml-auto flex-shrink-0">
      {/**
       * Action buttons used in the unit page
       */}
      {category === COURSE_BLOCK_NAMES.vertical.id && (
        <Stack direction="horizontal" gap={3}>
          {showNewDesignButtons && (
            <>
              <Button
                variant="outline-primary"
                iconBefore={InfoOutline}
                onClick={() => setCurrentPageKey('info', null)}
              >
                {intl.formatMessage(messages.infoButton)}
              </Button>
              {!readOnly && (
                <Button
                  variant="outline-primary"
                  iconBefore={Add}
                  onClick={() => setCurrentPageKey('add', null)}
                >
                  {intl.formatMessage(messages.addButton)}
                </Button>
              )}
            </>
          )}
          <ButtonGroup>
            <Button
              variant="outline-primary"
              onClick={handlePreview}
              iconBefore={FindInPage}
            >
              {intl.formatMessage(messages.previewButton)}
            </Button>
            <Button
              variant="outline-primary"
              onClick={handleViewLive}
            >
              {intl.formatMessage(messages.viewLiveButton)}
            </Button>

          </ButtonGroup>
        </Stack>
      )}
      {/**
       * Action buttons used in legacy libraries content page and split test page
       */}
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
