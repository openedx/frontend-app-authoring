import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  OverlayTrigger,
  Stack,
  Tooltip,
} from '@openedx/paragon';
import {
  Add as IconAdd,
  FindInPage,
  InfoOutline,
} from '@openedx/paragon/icons';

import { OutlinePageErrors, XBlockActions } from '@src/data/types';

import { useOutlineSidebarContext } from '../outline-sidebar/OutlineSidebarContext';

import messages from './messages';

export interface HeaderActionsProps {
  actions: {
    lmsLink: string;
  };
  courseActions: XBlockActions;
  headerNavigationsActions: {
    handleNewSection: () => void;
    handleReIndex: () => void;
    handleExpandAll: () => void;
    lmsLink: string;
  };
  isReIndexShow: boolean;
  isDisabledReindexButton: boolean;
  errors?: OutlinePageErrors;
}

const HeaderActions = ({
  actions,
  courseActions,
  headerNavigationsActions,
  isReIndexShow,
  isDisabledReindexButton,
  errors,
}: HeaderActionsProps) => {
  const intl = useIntl();
  const { lmsLink } = actions;

  const { clearSelection, open, setCurrentPageKey } = useOutlineSidebarContext();
  const { handleReIndex } = headerNavigationsActions;

  const handleCourseInfoClick = () => {
    clearSelection();
    setCurrentPageKey('info');
    open();
  };

  return (
    <Stack direction="horizontal" gap={3}>
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id={intl.formatMessage(messages.courseInfoButtonTooltip)}>
            {intl.formatMessage(messages.courseInfoButtonTooltip)}
          </Tooltip>
        }
      >
        <Button
          iconBefore={InfoOutline}
          onClick={handleCourseInfoClick}
          variant="outline-primary"
        >
          {intl.formatMessage(messages.courseInfoButton)}
        </Button>
      </OverlayTrigger>
      {isReIndexShow && (
        <OverlayTrigger
          placement="bottom"
          overlay={!isDisabledReindexButton ?
            (
              <Tooltip id={intl.formatMessage(messages.reindexButtonTooltip)}>
                {intl.formatMessage(messages.reindexButtonTooltip)}
              </Tooltip>
            ) :
            <></>}
        >
          <Button
            onClick={handleReIndex}
            data-testid="course-reindex"
            variant="outline-primary"
            disabled={isDisabledReindexButton}
          >
            {intl.formatMessage(messages.reindexButton)}
          </Button>
        </OverlayTrigger>
      )}
      {courseActions.childAddable && (
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip id={intl.formatMessage(messages.newSectionButtonTooltip)}>
              {intl.formatMessage(messages.newSectionButtonTooltip)}
            </Tooltip>
          }
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
        overlay={
          <Tooltip id={intl.formatMessage(messages.viewLiveButtonTooltip)}>
            {intl.formatMessage(messages.viewLiveButtonTooltip)}
          </Tooltip>
        }
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
    </Stack>
  );
};

export default HeaderActions;
