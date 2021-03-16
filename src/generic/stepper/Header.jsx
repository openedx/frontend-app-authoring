import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Icon from './Icon';
import Line from './Line';
import { StepperContext } from './StepperContext';

export default function Header({ steps, className }) {
  const { isAtTop } = useContext(StepperContext);

  return (
    <div
      className={classNames(
        'p-2',
        'd-flex',
        'border-bottom',
        'border-light',
        'justify-content-center',
        'align-items-center',
        className,
      )}
      style={{
        // zIndex raises this div to a higher 'layer' so that its drop shadow falls
        // above the content in the Body component.  Without this, any backgrounds in the Body
        // cut off the drop shadow as if they're 'higher' than it.
        zIndex: '1',
        boxShadow: isAtTop ? null : '0 0.25rem 0.5rem rgba(0, 0, 0, 0.3)',
      }}
    >
      {steps.map(({ iconLabel, label, incomplete }, index) => {
        const isNotLastStep = index < steps.length - 1;
        return (
        // eslint-disable-next-line react/no-array-index-key
          <React.Fragment key={`${index}-${label}`}>
            <Icon className={incomplete ? 'bg-light-900' : 'bg-primary'}>
              {iconLabel || index + 1}
            </Icon>
            <span className={classNames(
              'font-weight-bold',
              { 'text-light-900': incomplete },
            )}
            >{label}
            </span>
            {isNotLastStep && (
              <Line />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

Header.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      iconLabel: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.node,
      ]),
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  className: PropTypes.string,
};

Header.defaultProps = {
  className: null,
};
