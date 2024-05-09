import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, OverlayTrigger, Tooltip } from '@openedx/paragon';
import {
  Add as IconAdd,
  ArrowDropDown as ArrowDownIcon,
  ArrowDropUp as ArrowUpIcon,
} from '@openedx/paragon/icons';

import messages from './messages';

const HeaderNavigations = ({
  headerNavigationsActions,
  isReIndexShow,
  isSectionsExpanded,
  isDisabledReindexButton,
  hasSections,
  courseActions,
  errors,
}) => {
  const intl = useIntl();
  const {
    handleNewSection, handleReIndex, handleExpandAll, lmsLink,
  } = headerNavigationsActions;

  return (
    <nav className="header-navigations ml-auto">
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
            disabled={errors?.outlineIndexApi}
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
    </nav>
  );
};

HeaderNavigations.defaultProps = {
  errors: {},
};

HeaderNavigations.propTypes = {
  isReIndexShow: PropTypes.bool.isRequired,
  isSectionsExpanded: PropTypes.bool.isRequired,
  isDisabledReindexButton: PropTypes.bool.isRequired,
  headerNavigationsActions: PropTypes.shape({
    handleNewSection: PropTypes.func.isRequired,
    handleReIndex: PropTypes.func.isRequired,
    handleExpandAll: PropTypes.func.isRequired,
    lmsLink: PropTypes.string.isRequired,
  }).isRequired,
  hasSections: PropTypes.bool.isRequired,
  courseActions: PropTypes.shape({
    deletable: PropTypes.bool.isRequired,
    draggable: PropTypes.bool.isRequired,
    childAddable: PropTypes.bool.isRequired,
    duplicable: PropTypes.bool.isRequired,
  }).isRequired,
  errors: PropTypes.shape({
    outlineIndexApi: PropTypes.shape({
      data: PropTypes.string,
      type: PropTypes.string.isRequired,
    }),
    reindexApi: PropTypes.shape({
      data: PropTypes.string,
      type: PropTypes.string.isRequired,
    }),
    sectionLoadingApi: PropTypes.shape({
      data: PropTypes.string,
      type: PropTypes.string.isRequired,
    }),
    courseLaunchApi: PropTypes.shape({
      data: PropTypes.string,
      type: PropTypes.string.isRequired,
    }),
  }),
};

export default HeaderNavigations;
