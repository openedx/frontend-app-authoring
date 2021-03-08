import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import StepIcon from './StepIcon';
import StepLine from './StepLine';

export default function StepperHeader({ steps, className }) {
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
    >
      {steps.map(({ iconLabel, label }, index) => {
        const isNotLastStep = index < steps.length - 1;
        return (
        // eslint-disable-next-line react/no-array-index-key
          <React.Fragment key={`${index}-${label}`}>
            <StepIcon>
              {iconLabel || index + 1}
            </StepIcon>
            <span className="font-weight-bold">{label}</span>
            {isNotLastStep && (
              <StepLine />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

StepperHeader.propTypes = {
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

StepperHeader.defaultProps = {
  className: null,
};
