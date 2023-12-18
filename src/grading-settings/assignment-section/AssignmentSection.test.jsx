import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import AssignmentSection from '.';
import messages from './messages';

const testObj = {};

const defaultAssignments = {
  type: 'Test type',
  minCount: 1,
  dropCount: 1,
  shortLabel: 'TT',
  weight: 100,
  id: 0,
};

const setGradingData = (fn) => {
  testObj.graders = fn({}).graders;
};

const RootWrapper = (props = {}) => (
  <IntlProvider locale="en">
    <AssignmentSection
      handleRemoveAssignment={jest.fn()}
      setShowSavePrompt={jest.fn()}
      graders={[defaultAssignments]}
      setGradingData={jest.fn()}
      courseAssignmentLists={defaultAssignments}
      setShowSuccessAlert={jest.fn()}
      {...props}
    />
  </IntlProvider>
);

describe('<AssignmentSection />', () => {
  it('checking the correct display of titles, labels, descriptions', async () => {
    const { getByText } = render(<RootWrapper />);
    await waitFor(() => {
      expect(getByText(messages.assignmentTypeNameTitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.assignmentTypeNameDescription.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.abbreviationTitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.abbreviationDescription.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.weightOfTotalGradeTitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.weightOfTotalGradeDescription.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.totalNumberTitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.totalNumberDescription.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.numberOfDroppableTitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.numberOfDroppableDescription.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.assignmentAlertWarningDescription.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.assignmentDeleteButton.defaultMessage)).toBeInTheDocument();
    });
  });
  it('checking correct assignment abbreviation value', () => {
    const { getByTestId } = render(<RootWrapper setGradingData={setGradingData} />);
    const assignmentShortLabelInput = getByTestId('assignment-shortLabel-input');
    expect(assignmentShortLabelInput.value).toBe('TT');
    fireEvent.change(assignmentShortLabelInput, { target: { value: '123' } });
    expect(testObj.graders[0].shortLabel).toBe('123');
  });
  it('checking correct assignment weight of total grade value', async () => {
    const { getByTestId } = render(<RootWrapper setGradingData={setGradingData} />);
    await waitFor(() => {
      const assignmentWeightInput = getByTestId('assignment-weight-input');
      expect(assignmentWeightInput.value).toBe('100');
      fireEvent.change(assignmentWeightInput, { target: { value: '123' } });
      expect(testObj.graders[0].weight).toBe(123);
    });
  });
  it('checking correct assignment total number value', async () => {
    const { getByTestId } = render(<RootWrapper setGradingData={setGradingData} />);
    await waitFor(() => {
      const assignmentTotalNumberInput = getByTestId('assignment-minCount-input');
      expect(assignmentTotalNumberInput.value).toBe('1');
      fireEvent.change(assignmentTotalNumberInput, { target: { value: '123' } });
      expect(testObj.graders[0].minCount).toBe(123);
    });
  });
  it('checking correct assignment number of droppable value', async () => {
    const { getByTestId } = render(<RootWrapper setGradingData={setGradingData} />);
    await waitFor(() => {
      const assignmentNumberOfDroppableInput = getByTestId('assignment-dropCount-input');
      expect(assignmentNumberOfDroppableInput.value).toBe('1');
      fireEvent.change(assignmentNumberOfDroppableInput, { target: { value: '2' } });
      expect(testObj.graders[0].dropCount).toBe(2);
    });
  });
  it('checking correct error msg if dropCount have negative number or empty string', async () => {
    const { getByText, getByTestId } = render(<RootWrapper />);
    await waitFor(() => {
      const assignmentNumberOfDroppableInput = getByTestId('assignment-dropCount-input');
      expect(assignmentNumberOfDroppableInput.value).toBe('1');
      fireEvent.change(assignmentNumberOfDroppableInput, { target: { value: '-2' } });
      expect(getByText(messages.numberOfDroppableErrorMessage.defaultMessage)).toBeInTheDocument();
      fireEvent.change(assignmentNumberOfDroppableInput, { target: { value: '' } });
      expect(getByText(messages.numberOfDroppableErrorMessage.defaultMessage)).toBeInTheDocument();
    });
  });
  it('checking correct error msg if minCount have negative number or empty string', async () => {
    const { getByText, getByTestId } = render(<RootWrapper />);
    await waitFor(() => {
      const assignmentMinCountInput = getByTestId('assignment-minCount-input');
      expect(assignmentMinCountInput.value).toBe('1');
      fireEvent.change(assignmentMinCountInput, { target: { value: '-2' } });
      expect(getByText(messages.totalNumberErrorMessage.defaultMessage)).toBeInTheDocument();
      fireEvent.change(assignmentMinCountInput, { target: { value: '' } });
      expect(getByText(messages.totalNumberErrorMessage.defaultMessage)).toBeInTheDocument();
    });
  });
  it('checking correct error msg if total weight have negative number', async () => {
    const { getByText, getByTestId } = render(<RootWrapper />);
    await waitFor(() => {
      const assignmentWeightInput = getByTestId('assignment-weight-input');
      expect(assignmentWeightInput.value).toBe('100');
      fireEvent.change(assignmentWeightInput, { target: { value: '-100' } });
      expect(getByText(messages.weightOfTotalGradeErrorMessage.defaultMessage)).toBeInTheDocument();
    });
  });
});
