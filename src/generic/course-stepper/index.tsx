import { ReactElement } from 'react';
import classNames from 'classnames';
import {
  Settings as SettingsIcon,
  ManageHistory as SuccessIcon,
  Warning as ErrorIcon,
  CheckCircle,
} from '@openedx/paragon/icons';
import { Icon } from '@openedx/paragon';

export interface CourseStepperProps {
  steps: {
    title: string;
    description: string;
    titleComponent?: ReactElement;
  }[];
  activeKey: number;
  percent?: number | boolean;
  errorMessage?: string | null;
  hasError?: boolean;
}

const CourseStepper = ({
  steps,
  activeKey,
  percent = false,
  hasError = false,
  errorMessage = '',
}: CourseStepperProps) => {
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
      stepIcon: getStepIcon(),
      isPercentShow: Boolean(percent) && percent !== 100 && isActiveStep && !hasError,
      isErrorMessageShow: isErrorStep && errorMessage,
      isActiveClass: isActiveStep && !isLastStep && !hasError,
      isDoneClass: index < activeKey || isLastStepDone,
      isErrorClass: isErrorStep,
    };
  };

  return (
    <div className="course-stepper">
      {steps.length ? steps.map(({ title, description, titleComponent }, index) => {
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
              <Icon src={stepIcon} data-testid={`${title}-icon`} />
            </div>
            <div className="course-stepper__step-info">
              <h3 className="h4 title course-stepper__step-title font-weight-600">{titleComponent ?? title}</h3>
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

export default CourseStepper;
