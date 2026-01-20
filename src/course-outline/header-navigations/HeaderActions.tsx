import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button, Dropdown, Icon, OverlayTrigger, Stack, Tooltip,
} from '@openedx/paragon';
import {
  Add as IconAdd, FindInPage, ViewSidebar,
} from '@openedx/paragon/icons';

import { OutlinePageErrors, XBlockActions } from '@src/data/types';
import type { SidebarPage } from '@src/generic/sidebar';

import { type OutlineSidebarPageKeys, useOutlineSidebarContext } from '../outline-sidebar/OutlineSidebarContext';

import messages from './messages';
import { getOutlineSidebarPages } from '../outline-sidebar/sidebarPages';

export interface HeaderActionsProps {
  actions: {
    lmsLink: string,
  },
  courseActions: XBlockActions,
  errors?: OutlinePageErrors,
}

const HeaderActions = ({
  actions,
  courseActions,
  errors,
}: HeaderActionsProps) => {
  const intl = useIntl();
  const { lmsLink } = actions;
  const sidebarPages = getOutlineSidebarPages();

  const { setCurrentPageKey } = useOutlineSidebarContext();

  return (
    <Stack direction="horizontal" gap={3}>
      {courseActions.childAddable && (
        <OverlayTrigger
          placement="bottom"
          overlay={(
            <Tooltip id={intl.formatMessage(messages.newSectionButtonTooltip)}>
              {intl.formatMessage(messages.newSectionButtonTooltip)}
            </Tooltip>
          )}
        >
          <Button
            iconBefore={IconAdd}
            onClick={() => setCurrentPageKey('add')}
            disabled={!(errors?.outlineIndexApi === undefined || errors?.outlineIndexApi === null)}
            variant="outline-primary"
          >
            {intl.formatMessage(messages.addButton)}
          </Button>
        </OverlayTrigger>
      )}
      <OverlayTrigger
        placement="bottom"
        overlay={(
          <Tooltip id={intl.formatMessage(messages.viewLiveButtonTooltip)}>
            {intl.formatMessage(messages.viewLiveButtonTooltip)}
          </Tooltip>
        )}
      >
        <Button
          iconBefore={FindInPage}
          href={lmsLink}
          target="_blank"
          variant="outline-primary"
        >
          {intl.formatMessage(messages.viewLiveButton)}
        </Button>
      </OverlayTrigger>
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
          {Object.entries(sidebarPages).filter(([, page]) => !page.hideFromActionMenu)
            .map(([key, page]: [OutlineSidebarPageKeys, SidebarPage]) => (
              <Dropdown.Item
                key={key}
                onClick={() => setCurrentPageKey(key)}
              >
                <Stack direction="horizontal" gap={2}>
                  <Icon src={page.icon} />
                  {intl.formatMessage(page.title)}
                </Stack>
              </Dropdown.Item>
            ))}
        </Dropdown.Menu>
      </Dropdown>

    </Stack>
  );
};

export default HeaderActions;
