import React from 'react';
import PropTypes from 'prop-types';

export default function AppConfigFormDivider({ thick }) {
  return (
    <hr
      className="my-2"
      style={{
        borderTopWidth: thick ? '3px' : '1px',
        marginLeft: '-48px',
        marginRight: '-48px',
      }}
    />
  );
}

AppConfigFormDivider.propTypes = {
  thick: PropTypes.bool,
};

AppConfigFormDivider.defaultProps = {
  thick: false,
};
