import React from 'react';
import { injectIntl } from '@edx/frontend-platform/i18n';
import {
  Settings as SettingsIcon,
  ManageHistory as SuccessIcon,
  Warning as ErrorIcon,
  CheckCircle,
} from '@openedx/paragon/icons';
import { Icon } from '@openedx/paragon';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const CourseStepper = ({
  steps,
  activeKey,
  percent,
  hasError,
  errorMessage,
}) => {
  const getStepperSettings = (index) => {
    const lastStepIndex = steps.length - 1;
    const isActiveStep = index === activeKey;
    const isLastStep = index === lastStepIndex;
    const isErrorStep = isActiveStep && hasError;
    const isLastStepDone = isLastStep && isActiveStep;
    const completedStep = index < activeKey && !hasError;

    const getStepIcon = () => {
      if (completedStep) {
        return CheckCircle;
      }
      if (hasError && isActiveStep) {
        return ErrorIcon;
      }
      if (isLastStep && !isActiveStep) {
        return SuccessIcon;
      }
      if (isLastStepDone) {
        return CheckCircle;
      }

      return SettingsIcon;
    };

    return {
      stepIcon: getStepIcon(index),
      isPercentShow: Boolean(percent) && percent !== 100 && isActiveStep && !hasError,
      isErrorMessageShow: isErrorStep && errorMessage,
      isActiveClass: isActiveStep && !isLastStep && !hasError,
      isDoneClass: index < activeKey || isLastStepDone,
      isErrorClass: isErrorStep,
    };
  };

  return (
    <div className="course-stepper">
      {steps.length ? steps.map(({ title, description }, index) => {
        const {
          stepIcon,
          isPercentShow,
          isErrorMessageShow,
          isActiveClass,
          isDoneClass,
          isErrorClass,
        } = getStepperSettings(index);

        return (
          <div
            className={classNames('course-stepper__step', {
              active: isActiveClass,
              done: isDoneClass,
              error: isErrorClass,
            })}
            key={title}
            data-testid="course-stepper__step"
          >
            <div className="course-stepper__step-icon">
              <Icon src={stepIcon} alt={title} data-testid={`${title}-icon`} />
            </div>
            <div className="course-stepper__step-info">
              <h3 className="h4 title course-stepper__step-title font-weight-600">{title}</h3>
              {isPercentShow && (
                <p
                  className="course-stepper__step-percent font-weight-400"
                  data-testid="course-stepper__step-percent"
                >
                  {percent}%
                </p>
              )}
              <p className="course-stepper__step-description font-weight-400">
                {isErrorMessageShow ? errorMessage : description}
              </p>
            </div>
          </div>
        );
      }) : null}
    </div>
  );
};

CourseStepper.defaultProps = {
  percent: false,
  hasError: false,
  errorMessage: '',
};

CourseStepper.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  })).isRequired,
  activeKey: PropTypes.number.isRequired,
  percent: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
  errorMessage: PropTypes.string,
  hasError: PropTypes.bool,
};

export default injectIntl(CourseStepper);
