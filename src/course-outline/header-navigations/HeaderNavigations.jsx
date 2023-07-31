import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, OverlayTrigger, Tooltip } from '@edx/paragon';

import { getHeaderNavigationsSettings } from './utils';

const HeaderNavigations = ({ headerNavigationsActions, isReIndexShow, isSectionsExpanded }) => {
  const intl = useIntl();
  const navigationsSettings = getHeaderNavigationsSettings(
    headerNavigationsActions,
    isSectionsExpanded,
    isReIndexShow,
    intl,
  );

  return (
    <nav className="header-navigations ml-auto">
      {navigationsSettings.map(({
        tooltipText, buttonText, buttonVariant, icon, handler,
      }) => {
        if (tooltipText) {
          return (
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip id={tooltipText}>{tooltipText}</Tooltip>}
            >
              <Button variant={buttonVariant} iconBefore={icon} onClick={handler}>
                {buttonText}
              </Button>
            </OverlayTrigger>
          );
        }
        return (
          <Button
            variant={buttonVariant}
            className={isSectionsExpanded && 'expand-button-active'}
            iconBefore={icon}
            onClick={handler}
          >
            {buttonText}
          </Button>
        );
      })}
    </nav>
  );
};

HeaderNavigations.propTypes = {
  isReIndexShow: PropTypes.bool.isRequired,
  isSectionsExpanded: PropTypes.bool.isRequired,
  headerNavigationsActions: PropTypes.shape({
    handleNewSection: PropTypes.func.isRequired,
    handleReIndex: PropTypes.func.isRequired,
    handleExpandAll: PropTypes.func.isRequired,
    handleViewLive: PropTypes.func.isRequired,
  }).isRequired,
};

export default HeaderNavigations;
