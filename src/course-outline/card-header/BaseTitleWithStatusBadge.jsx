import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, Truncate } from '@edx/paragon';
import classNames from 'classnames';
import { ITEM_BADGE_STATUS } from '../constants';
import { getItemStatusBadgeContent } from '../utils';
import messages from './messages';

const BaseTitleWithStatusBadge = ({
  title,
  status,
  namePrefix,
}) => {
  const intl = useIntl();
  const { badgeTitle, badgeIcon } = getItemStatusBadgeContent(status, messages, intl);

  return (
    <>
      <Truncate lines={1} className={`${namePrefix}-card-title mb-0`}>{title}</Truncate>
      {badgeTitle && (
        <div className="item-card-header__badge-status" data-testid={`${namePrefix}-card-header__badge-status`}>
          {badgeIcon && (
            <Icon
              src={badgeIcon}
              size="sm"
              className={classNames({ 'text-success-500': status === ITEM_BADGE_STATUS.live })}
            />
          )}
          <span className="small">{badgeTitle}</span>
        </div>
      )}
    </>
  );
};

BaseTitleWithStatusBadge.propTypes = {
  title: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  namePrefix: PropTypes.string.isRequired,
};

export default BaseTitleWithStatusBadge;
