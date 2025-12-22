import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, OverlayTrigger, Tooltip } from '@openedx/paragon';
import {
  Add as IconAdd,
  ArrowDropDown as ArrowDownIcon,
  ArrowDropUp as ArrowUpIcon,
} from '@openedx/paragon/icons';

import { OutlinePageErrors, XBlockActions } from '@src/data/types';
import messages from './messages';

export interface HeaderNavigationsProps {
  isReIndexShow: boolean,
  isSectionsExpanded: boolean,
  isDisabledReindexButton: boolean,
  headerNavigationsActions: {
    handleNewSection: () => void,
    handleReIndex: () => void,
    handleExpandAll: () => void,
    lmsLink: string,
  },
  hasSections: boolean,
  courseActions: XBlockActions,
  errors?: OutlinePageErrors,
}

const HeaderNavigations = ({
  headerNavigationsActions,
  isReIndexShow,
  isSectionsExpanded,
  isDisabledReindexButton,
  hasSections,
  courseActions,
  errors,
}: HeaderNavigationsProps) => {
  const intl = useIntl();
  const {
    handleNewSection, handleReIndex, handleExpandAll, lmsLink,
  } = headerNavigationsActions;

  return (
    <>
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
          >
            {intl.formatMessage(messages.newSectionButton)}
          </Button>
        </OverlayTrigger>
      )}
      {isReIndexShow && (
        <OverlayTrigger
          placement="bottom"
          overlay={!isDisabledReindexButton ? (
            <Tooltip id={intl.formatMessage(messages.reindexButtonTooltip)}>
              {intl.formatMessage(messages.reindexButtonTooltip)}
            </Tooltip>
          ) : <React.Fragment key="reindex close" />}
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
      {hasSections && (
        <Button
          variant="outline-primary"
          id="expand-collapse-all-button"
          data-testid="expand-collapse-all-button"
          iconBefore={isSectionsExpanded ? ArrowUpIcon : ArrowDownIcon}
          onClick={handleExpandAll}
        >
          {isSectionsExpanded
            ? intl.formatMessage(messages.collapseAllButton)
            : intl.formatMessage(messages.expandAllButton)}
        </Button>
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
          href={lmsLink}
          target="_blank"
          variant="outline-primary"
        >
          {intl.formatMessage(messages.viewLiveButton)}
        </Button>
      </OverlayTrigger>
    </>
  );
};

export default HeaderNavigations;
