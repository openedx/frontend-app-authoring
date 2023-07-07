import React from 'react';
import {
  render, fireEvent, act, waitFor,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { courseDetailsMock } from '../../__mocks__';
import gradeRequirementsMessages from '../grade-requirements/messages';
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

  it('should toggle grade requirements after checkbox click', () => {
    const { getByText, queryAllByText, getAllByRole } = render(
      <RootWrapper {...props} />,
    );
    const checkbox = getAllByRole('checkbox')[0];
    expect(
      getByText(gradeRequirementsMessages.requirementsEntranceCollapseLabel.defaultMessage),
    ).toBeInTheDocument();
    act(() => {
      fireEvent.click(checkbox);
    });
    waitFor(() => {
      expect(
        queryAllByText(gradeRequirementsMessages.requirementsEntranceCollapseLabel.defaultMessage).length,
      ).toBe(0);
    });
  });
});
