import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Icon from './Icon';
import Line from './Line';
import Body from './Body';
import Footer from './Footer';
import Header from './Header';
import { StepperContextProvider } from './StepperContext';

export default function Stepper({ children, className }) {
  return (
    <div
      className={classNames(
        'd-flex',
        'flex-column',
        className,
      )}
    >
      <StepperContextProvider>
        {children}
      </StepperContextProvider>
    </div>
  );
}

Stepper.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

Stepper.defaultProps = {
  className: null,
};

Stepper.Icon = Icon;
Stepper.Line = Line;
Stepper.Body = Body;
Stepper.Footer = Footer;
Stepper.Header = Header;
