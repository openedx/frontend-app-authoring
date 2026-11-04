import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { render, waitFor, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import GradingScale from './GradingScale';
import GradingScaleHandle from './components/GradingScaleHandle';

const gradeCutoffs = { A: 0.9, B: 0.8, C: 0.7 };

const gradeLetters = ['A', 'B', 'C', 'D'];

const sortedGrades = [
  { current: 100, previous: 49 },
  { current: 49, previous: 41 },
  { current: 32, previous: 20 },
  { current: 20, previous: 0 },
];

const RootWrapper = () => (
  <IntlProvider locale="en" messages={{}}>
    <GradingScale
      gradeCutoffs={gradeCutoffs}
      gradeLetters={gradeLetters}
      sortedGrades={sortedGrades}
      resetDataRef={{ current: false }}
      showSavePrompt={jest.fn()}
      setShowSuccessAlert={jest.fn()}
      setGradingData={jest.fn()}
      setOverrideInternetConnectionAlert={jest.fn()}
      setEligibleGrade={jest.fn()}
    />
  </IntlProvider>
);

describe('<GradingScale />', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
  });

  it('renders grading scale ticks', async () => {
    const { getAllByTestId } = render(<RootWrapper />);
    await waitFor(() => {
      const ticks = getAllByTestId('grading-scale-tick');
      expect(ticks).toHaveLength(11); // 0 to 100, inclusive, with step 10
    });
  });

  it('renders grading scale segments', async () => {
    const { getAllByTestId } = render(<RootWrapper />);
    await waitFor(() => {
      const segments = getAllByTestId('grading-scale-segment');
      expect(segments).toHaveLength(5);
    });
  });

  it('should add a new grading segment when "Add new grading segment" button is clicked', async () => {
    const { debug, getAllByTestId } = render(<RootWrapper />);
    await waitFor(() => {
      const addNewSegmentBtn = getAllByTestId('grading-scale-btn-add-segment');
      expect(addNewSegmentBtn[0]).toBeInTheDocument();
      fireEvent.click(addNewSegmentBtn[0]);
      const segments = getAllByTestId('grading-scale-segment');
      expect(segments).toHaveLength(6);
      debug(addNewSegmentBtn);
    });
  });

  it('should remove grading segment when "Remove" button is clicked', async () => {
    const { getAllByTestId } = render(<RootWrapper />);
    await waitFor(() => {
      const segments = getAllByTestId('grading-scale-segment');
      const removeSegmentBtn = getAllByTestId('grading-scale-btn-remove');
      fireEvent.click(removeSegmentBtn[1]);
      expect(segments).toHaveLength(5);
    });
  });

  it('should update segment input value', async () => {
    const { getAllByTestId } = render(<RootWrapper />);
    await waitFor(() => {
      const segmentInputs = getAllByTestId('grading-scale-segment-input');
      expect(segmentInputs).toHaveLength(5);
      const segmentInput = segmentInputs[1];
      fireEvent.change(segmentInput, { target: { value: 'Test' } });
      expect(segmentInput).toHaveValue('Test');
    });
  });

  it('should render GradingScale component with short grade cutoffs and sorted grades', async () => {
    const shortGradeCutoffs = { Pass: 0.9 };
    const shortSortedGrades = [
      { current: 100, previous: 49 },
      { current: 20, previous: 0 },
    ];
    const { getAllByTestId } = render(
      <IntlProvider locale="en" messages={{}}>
        <GradingScale
          gradeCutoffs={shortGradeCutoffs}
          gradeLetters={['A']}
          sortedGrades={shortSortedGrades}
          resetDataRef={{ current: false }}
          showSavePrompt={jest.fn()}
          setShowSuccessAlert={jest.fn()}
          setGradingData={jest.fn()}
          setOverrideInternetConnectionAlert={jest.fn()}
          setEligibleGrade={jest.fn()}
        />
      </IntlProvider>,
    );
    await waitFor(() => {
      const segmentInputs = getAllByTestId('grading-scale-segment-input');
      expect(segmentInputs[0]).toHaveValue('Fail');
      fireEvent.change(segmentInputs[1], { target: { value: 'Test' } });
      expect(segmentInputs[1]).toHaveValue('Test');
    });
  });

  it('renders GradingScaleHandle with default isEditable=true when prop is omitted', () => {
    const gradingSegments = [
      { current: 90, previous: 0 },
      { current: 100, previous: 90 },
    ];
    const { container } = render(
      <GradingScaleHandle
        idx={0}
        value={90}
        gradingSegments={gradingSegments}
        getHandleProps={() => ({})}
      />,
    );
    expect(container.querySelector('.grading-scale-segment-btn-resize')).not.toBeDisabled();
  });

  it('should disable inputs and buttons when isEditable is false', async () => {
    const { getAllByTestId, queryAllByTestId } = render(
      <IntlProvider locale="en" messages={{}}>
        <GradingScale
          gradeCutoffs={gradeCutoffs}
          gradeLetters={gradeLetters}
          sortedGrades={sortedGrades}
          resetDataRef={{ current: false }}
          showSavePrompt={jest.fn()}
          setShowSuccessAlert={jest.fn()}
          setGradingData={jest.fn()}
          setOverrideInternetConnectionAlert={jest.fn()}
          setEligibleGrade={jest.fn()}
          isEditable={false}
        />
      </IntlProvider>,
    );
    await waitFor(() => {
      const segmentInputs = getAllByTestId('grading-scale-segment-input');
      segmentInputs.forEach((input) => expect(input).toBeDisabled());
      const removeButtons = queryAllByTestId('grading-scale-btn-remove');
      removeButtons.forEach((btn) => expect(btn).toBeDisabled());
    });
  });

  it('should render GradingScale component with more than 5 grades', async () => {
    const { getAllByTestId } = render(
      <IntlProvider locale="en" messages={{}}>
        <GradingScale
          gradeCutoffs={gradeCutoffs}
          gradeLetters={gradeLetters}
          sortedGrades={sortedGrades}
          resetDataRef={{ current: false }}
          showSavePrompt={jest.fn()}
          setShowSuccessAlert={jest.fn()}
          setGradingData={jest.fn()}
          setOverrideInternetConnectionAlert={jest.fn()}
          setEligibleGrade={jest.fn()}
          defaultGradeDesignations={['A', 'B', 'C', 'D', 'E']}
        />
      </IntlProvider>,
    );
    await waitFor(() => {
      const addNewSegmentBtn = getAllByTestId('grading-scale-btn-add-segment');
      expect(addNewSegmentBtn[0]).toBeInTheDocument();
      fireEvent.click(addNewSegmentBtn[0]);
      const segments = getAllByTestId('grading-scale-segment-number');
      // Calculation is based on 100/6 i.e A, B, C, D, E, F which comes to 16.666666666666657
      expect(segments[0].textContent).toEqual('83.33333333333333 - 100');
      expect(segments[6].textContent).toEqual('0 - 15.666666666666657');
    });
  });

  describe('accessibility', () => {
    const renderPassFail = () =>
      render(
        <IntlProvider locale="en" messages={{}}>
          <GradingScale
            gradeCutoffs={{ Pass: 0.5 }}
            gradeLetters={['Pass']}
            sortedGrades={[
              { current: 100, previous: 50 },
              { current: 50, previous: 0 },
            ]}
            resetDataRef={{ current: false }}
            showSavePrompt={jest.fn()}
            setShowSuccessAlert={jest.fn()}
            setGradingData={jest.fn()}
            setOverrideInternetConnectionAlert={jest.fn()}
            setEligibleGrade={jest.fn()}
          />
        </IntlProvider>,
      );

    it('names each grade range handle after the boundary it moves', async () => {
      render(<RootWrapper />);
      expect(await screen.findByRole('slider', { name: 'Boundary between A and B' })).toHaveAttribute(
        'aria-valuenow',
        '49',
      );
      expect(screen.getByRole('slider', { name: 'Boundary between B and C' })).toHaveAttribute('aria-valuenow', '32');
      expect(screen.getByRole('slider', { name: 'Boundary between C and F' })).toHaveAttribute('aria-valuenow', '20');
    });

    it('names the handle on the default Pass/Fail scale', async () => {
      renderPassFail();
      expect(await screen.findByRole('slider', { name: 'Boundary between Pass and Fail' })).toHaveAttribute(
        'aria-valuenow',
        '50',
      );
    });

    it('labels every grade name field', async () => {
      render(<RootWrapper />);
      const inputs = await screen.findAllByTestId('grading-scale-segment-input');
      expect(screen.getAllByLabelText('Grade name')).toHaveLength(inputs.length);
      inputs.forEach((input) => expect(input).toHaveAccessibleName('Grade name'));
    });

    it('labels every grade name field on the default Pass/Fail scale', async () => {
      renderPassFail();
      const inputs = await screen.findAllByTestId('grading-scale-segment-input');
      expect(inputs).toHaveLength(3);
      expect(screen.getAllByLabelText('Grade name')).toHaveLength(3);
      inputs.forEach((input) => expect(input).toHaveAccessibleName('Grade name'));
    });

    it('updates the handle names when a grade is renamed', async () => {
      const user = userEvent.setup();
      render(<RootWrapper />);
      const gradeB = await screen.findByDisplayValue('B');
      await user.type(gradeB, 'Merit', { initialSelectionStart: 0, initialSelectionEnd: 1 });
      expect(gradeB).toHaveValue('Merit');
      expect(screen.getByRole('slider', { name: 'Boundary between A and Merit' })).toHaveAttribute(
        'aria-valuenow',
        '49',
      );
      expect(screen.getByRole('slider', { name: 'Boundary between Merit and C' })).toHaveAttribute(
        'aria-valuenow',
        '32',
      );
    });
  });
});
