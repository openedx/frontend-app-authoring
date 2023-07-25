import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

const AppConfigFormDivider = ({ thick, marginAdj }) => (
  <hr
    className={classNames(
      'my-2 mx-n4 border-light-300',
      {
        [`mx-sm-n${marginAdj.sm}`]: marginAdj.sm !== null,
        [`mx-n${marginAdj.default}`]: marginAdj.default !== null,
      },
    )}
    style={{
      borderTopWidth: thick ? '3px' : '1px',
    }}
  />
);

AppConfigFormDivider.propTypes = {
  thick: PropTypes.bool,
  marginAdj: PropTypes.shape({
    default: PropTypes.number,
    sm: PropTypes.number,
  }),
};

AppConfigFormDivider.defaultProps = {
  thick: false,
  marginAdj: {
    default: 4,
    sm: 5,
  },
};

export default AppConfigFormDivider;
