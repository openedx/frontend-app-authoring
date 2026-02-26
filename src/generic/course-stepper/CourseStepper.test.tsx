import { render, screen, initializeMocks } from '@src/testUtils';

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
  <CourseStepper steps={stepsMock} {...props} />,
);

describe('<CourseStepper />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders CourseStepper correctly', () => {
    renderComponent({ activeKey: 0 });

    const steps = screen.getAllByTestId('course-stepper__step');
    expect(steps.length).toBe(stepsMock.length);

    stepsMock.forEach((step) => {
      expect(screen.getByText(step.title)).toBeInTheDocument();
      expect(screen.getByText(step.description)).toBeInTheDocument();
      expect(screen.getByTestId(`${step.title}-icon`)).toBeInTheDocument();
    });

    expect(screen.queryByTestId('course-stepper__step-percent')).toBeNull();
  });

  it('marks the active and done steps correctly', () => {
    const activeKey = 1;
    renderComponent({ activeKey });

    const steps = screen.getAllByTestId('course-stepper__step');
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
    renderComponent({ activeKey: 1, hasError: true });

    const errorStep = screen.getAllByTestId('course-stepper__step')[1];
    expect(errorStep).toHaveClass('error');
  });

  it('shows error message for error step', () => {
    const errorMessage = 'Some error text';
    renderComponent({ activeKey: 1, hasError: true, errorMessage });

    const errorStep = screen.getAllByTestId('course-stepper__step')[1];
    expect(errorStep).toHaveClass('error');
  });

  it('shows percentage for active step', () => {
    const percent = 50;
    renderComponent({ activeKey: 1, percent });

    const percentElement = screen.getByTestId('course-stepper__step-percent');
    expect(percentElement).toBeInTheDocument();
    expect(percentElement).toHaveTextContent(`${percent}%`);
  });

  it('renders titleComponent instead of title when provided', () => {
    const customTitle = <span data-testid="custom-title">Custom Title Component</span>;
    const stepsWithTitleComponent = [
      { ...stepsMock[0], titleComponent: customTitle },
      ...stepsMock.slice(1),
    ];

    renderComponent({ steps: stepsWithTitleComponent, activeKey: 0 });

    expect(screen.getByTestId('custom-title')).toBeInTheDocument();
    expect(screen.queryByText(stepsMock[0].title)).not.toBeInTheDocument();
  });

  it('shows null when steps length equal to zero', () => {
    renderComponent({ steps: [], activeKey: 0 });

    const steps = screen.queryByTestId('[data-testid="course-stepper__step"]');
    expect(steps).toBe(null);
  });
});
