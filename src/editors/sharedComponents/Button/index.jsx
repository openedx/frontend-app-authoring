import React from 'react';
import { string, node, arrayOf } from 'prop-types';
import { Button as ParagonButton } from '@openedx/paragon';
import { Add } from '@openedx/paragon/icons';

import { getButtonProps } from './hooks';
import './index.scss';

const Button = ({
  variant, className, text, children, ...props
}) => (
  <ParagonButton
    {...getButtonProps({ variant, className, Add })}
    {...props}
  >
    {children || text}
  </ParagonButton>
);
Button.propTypes = {
  variant: string,
  className: string,
  text: string,
  children: node || arrayOf(node),
};
Button.defaultProps = {
  variant: 'default',
  className: null,
  text: null,
  children: null,
};

export default Button;
