import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button, Dropdown, Icon, OverlayTrigger, Stack, Tooltip,
} from '@openedx/paragon';
import {
  Add as IconAdd, AutoGraph, FindInPage, HelpOutline, InfoOutline, ViewSidebar,
} from '@openedx/paragon/icons';

import { OutlinePageErrors, XBlockActions } from '@src/data/types';
import messages from './messages';

export interface HeaderActionsProps {
  actions: {
    handleNewSection: () => void,
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
  const { handleNewSection, lmsLink } = actions;

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
            onClick={handleNewSection}
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
          <Dropdown.Item>
            <Stack direction="horizontal" gap={2}>
              <Icon src={InfoOutline} />
              {intl.formatMessage(messages.infoButton)}
            </Stack>
          </Dropdown.Item>
          <Dropdown.Item>
            <Stack direction="horizontal" gap={2}>
              <Icon src={AutoGraph} />
              {intl.formatMessage(messages.analyticsButton)}
            </Stack>
          </Dropdown.Item>
          <Dropdown.Item>
            <Stack direction="horizontal" gap={2}>
              <Icon src={HelpOutline} />
              {intl.formatMessage(messages.helpButton)}
            </Stack>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

    </Stack>
  );
};

export default HeaderActions;
