import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import CourseStepper from '.';

const stepsMock = [
  {
    title: 'Preparing',
    description: 'Preparing to start the export',
  },
  {
    title: 'Exporting',
    description: 'Creating the export data files (You can now leave this page safely, but avoid making drastic changes to content until this export is complete',
  },
  {
    title: 'Compressing',
    description: 'Compressing the exported data and preparing it for download',
  },
  {
    title: 'Success',
    description: 'Your exported course can now be downloaded',
  },
];

const renderComponent = (props) => render(
  <IntlProvider locale="en">
    <CourseStepper steps={stepsMock} {...props} />
  </IntlProvider>,
);

describe('<CourseStepper />', () => {
  it('renders CourseStepper correctly', () => {
    const {
      getByText, getByTestId, getAllByTestId, queryByTestId,
    } = renderComponent({ activeKey: 0 });

    const steps = getAllByTestId('course-stepper__step');
    expect(steps.length).toBe(stepsMock.length);

    stepsMock.forEach((step) => {
      expect(getByText(step.title)).toBeInTheDocument();
      expect(getByText(step.description)).toBeInTheDocument();
      expect(getByTestId(`${step.title}-icon`)).toBeInTheDocument();
    });

    const percentElement = queryByTestId('course-stepper__step-percent');
    expect(percentElement).toBeNull();
  });

  it('marks the active and done steps correctly', () => {
    const activeKey = 1;
    const { getAllByTestId } = renderComponent({ activeKey });

    const steps = getAllByTestId('course-stepper__step');
    stepsMock.forEach((_, index) => {
      const stepElement = steps[index];
      if (index === activeKey) {
        expect(stepElement).toHaveClass('active');
        expect(stepElement).not.toHaveClass('done');
      }
      if (index < activeKey) {
        expect(stepElement).not.toHaveClass('active');
        expect(stepElement).toHaveClass('done');
      }
      if (index > activeKey) {
        expect(stepElement).not.toHaveClass('active');
        expect(stepElement).not.toHaveClass('done');
      }
    });
  });

  it('mark the error step correctly', () => {
    const { getAllByTestId } = renderComponent({ activeKey: 1, hasError: true });

    const errorStep = getAllByTestId('course-stepper__step')[1];
    expect(errorStep).toHaveClass('error');
  });

  it('shows error message for error step', () => {
    const errorMessage = 'Some error text';
    const { getAllByTestId } = renderComponent({ activeKey: 1, hasError: true, errorMessage });

    const errorStep = getAllByTestId('course-stepper__step')[1];
    expect(errorStep).toHaveClass('error');
  });

  it('shows percentage for active step', () => {
    const percent = 50;
    const { getByTestId } = renderComponent({ activeKey: 1, percent });

    const percentElement = getByTestId('course-stepper__step-percent');
    expect(percentElement).toBeInTheDocument();
    expect(percentElement).toHaveTextContent(`${percent}%`);
  });

  it('shows null when steps length equal to zero', () => {
    const { queryByTestId } = render(
      <IntlProvider locale="en">
        <CourseStepper steps={[]} activeKey={0} />
      </IntlProvider>,
    );

    const steps = queryByTestId('[data-testid="course-stepper__step"]');
    expect(steps).toBe(null);
  });
});
