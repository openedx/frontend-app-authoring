import React from 'react';
import PropTypes from 'prop-types';

export default function AppConfigFormDivider({ thick }) {
  return (
    <hr
      className="my-2 mx-sm-n5 mx-n4 border-light-300"
      style={{
        borderTopWidth: thick ? '3px' : '1px',
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
