import {
  render, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { courseDetailsMock } from '../../__mocks__';
import messages from './messages';
import EntranceExam from '.';

const onChangeMock = jest.fn();
const courseIdMock = 'course-id-bar';

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useParams: () => ({
    courseId: courseIdMock,
  }),
}));

const RootWrapper = (props) => (
  <IntlProvider locale="en">
    <EntranceExam {...props} />
  </IntlProvider>
);

const props = {
  errorEffort: '',
  isCheckedString: courseDetailsMock.entranceExamEnabled,
  entranceExamMinimumScorePct: courseDetailsMock.entranceExamMinimumScorePct,
  onChange: onChangeMock,
};

describe('<EntranceExam />', () => {
  it('renders successfully', () => {
    const { getByText, getAllByRole } = render(<RootWrapper {...props} />);
    const checkboxList = getAllByRole('checkbox');
    expect(getByText(messages.requirementsEntrance.defaultMessage)).toBeInTheDocument();
    expect(checkboxList.length).toBe(1);
    expect(checkboxList[0].checked).toBeTruthy();
  });

  it('should toggle grade requirements after checkbox click', async () => {
    onChangeMock.mockClear();
    const ui = render(<RootWrapper {...props} />);
    const user = userEvent.setup();
    const checkbox = screen.getByRole('checkbox', { name: 'Require students to pass an exam before beginning the course.' });

    expect(checkbox).toBeChecked();
    expect(screen.queryByText('Grade requirements')).toBeInTheDocument();

    await user.click(checkbox);
    expect(onChangeMock).toHaveBeenCalledWith('false', 'entranceExamEnabled');
    ui.rerender(<RootWrapper {...props} isCheckedString="false" />);
    await waitFor(() => {
      expect(checkbox).not.toBeChecked();
      expect(screen.queryByText('Grade requirements')).not.toBeInTheDocument();
    });
  });
});
