import {
  render, fireEvent, screen, waitFor,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { courseDetailsMock } from '../../__mocks__';
import scheduleMessage from '../../messages';
import messages from './messages';
import GradeRequirements from '.';

const onChangeMock = jest.fn();

const RootWrapper = (props) => (
  <IntlProvider locale="en">
    <GradeRequirements {...props} />
  </IntlProvider>
);

const props = {
  errorEffort: '',
  entranceExamMinimumScorePct: courseDetailsMock.entranceExamMinimumScorePct,
  onChange: onChangeMock,
};

describe('<GradeRequirements />', () => {
  it('renders successfully', () => {
    const { getByText, getByDisplayValue } = render(<RootWrapper {...props} />);
    expect(getByText(messages.requirementsEntranceCollapseLabel.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.requirementsEntranceCollapseHelpText.defaultMessage)).toBeInTheDocument();
    expect(getByDisplayValue(props.entranceExamMinimumScorePct)).toBeInTheDocument();
  });

  it('should call onChange on input change', () => {
    const { getByDisplayValue } = render(<RootWrapper {...props} />);
    const input = getByDisplayValue(props.entranceExamMinimumScorePct);
    fireEvent.change(input, { target: { valueAsNumber: '31' } });
    expect(props.onChange).toHaveBeenCalledWith('31', 'entranceExamMinimumScorePct');
  });

  it('should show feedback error', async () => {
    const errorMessage = scheduleMessage.errorMessage8.defaultMessage;
    render(<RootWrapper {...props} entranceExamMinimumScorePct="123" errorEffort={errorMessage} />);
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
