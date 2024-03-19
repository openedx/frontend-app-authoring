import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@openedx/paragon';

const StatusBadge = ({
  text,
  icon,
  iconClassName,
}) => {
  if (text) {
    return (
      <div
        className="px-2 py-1 mr-2 rounded bg-white align-self-center align-items-center d-flex border border-light-300"
        role="status"
      >
        {icon && (
          <Icon
            src={icon}
            size="sm"
            className={iconClassName}
          />
        )}
        <span className="small ml-1">{text}</span>
      </div>
    );
  }
  return null;
};

StatusBadge.defaultProps = {
  text: '',
  icon: '',
  iconClassName: '',
};

StatusBadge.propTypes = {
  text: PropTypes.string,
  icon: PropTypes.func,
  iconClassName: PropTypes.string,
};

export default StatusBadge;
