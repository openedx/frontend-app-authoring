import React from 'react';
import {
  render, fireEvent, act,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { courseDetailsMock, courseSettingsMock } from '../__mocks__';
import messages from './messages';
import entranceExamMessages from './entrance-exam/messages';
import RequirementsSection from '.';

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
    <RequirementsSection {...props} />
  </IntlProvider>
);
const {
  effort,
  entranceExamEnabled,
  preRequisiteCourses,
  entranceExamMinimumScorePct,
} = courseDetailsMock;

const {
  aboutPageEditable,
  isEntranceExamsEnabled,
  possiblePreRequisiteCourses,
  isPrerequisiteCoursesEnabled,
} = courseSettingsMock;

const props = {
  effort,
  errorFields: {},
  aboutPageEditable,
  preRequisiteCourses,
  entranceExamEnabled,
  isEntranceExamsEnabled,
  possiblePreRequisiteCourses,
  entranceExamMinimumScorePct,
  isPrerequisiteCoursesEnabled,
  onChange: onChangeMock,
};

describe('<RequirementsSection />', () => {
  it('renders successfully', () => {
    const {
      getByText, getByLabelText, getByDisplayValue, getAllByRole,
    } = render(<RootWrapper {...props} />);
    const checkboxList = getAllByRole('checkbox');
    expect(getByText(messages.requirementsTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.requirementsDescription.defaultMessage)).toBeInTheDocument();
    expect(getByLabelText(messages.timepickerLabel.defaultMessage)).toBeInTheDocument();
    expect(getByDisplayValue(props.effort)).toBeInTheDocument();
    expect(getByText(messages.timepickerHelpText.defaultMessage)).toBeInTheDocument();
    expect(getByLabelText(messages.dropdownLabel.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.dropdownHelpText.defaultMessage)).toBeInTheDocument();
    expect(getByText(entranceExamMessages.requirementsEntrance.defaultMessage)).toBeInTheDocument();
    expect(checkboxList.length).toBe(1);
    expect(checkboxList[0].checked).toBeTruthy();
  });

  it('should call onChange on input change', () => {
    const { getByDisplayValue } = render(<RootWrapper {...props} />);
    const input = getByDisplayValue(props.effort);
    act(() => {
      fireEvent.change(input, { target: { value: '12h' } });
    });
    expect(props.onChange).toHaveBeenCalledWith('12h', 'effort');
  });

  it('should hide content depend on flags', () => {
    const initialProps = {
      ...props,
      aboutPageEditable: false,
      isEntranceExamsEnabled: false,
      isPrerequisiteCoursesEnabled: false,
    };
    const { queryAllByLabelText } = render(<RootWrapper {...initialProps} />);
    expect(queryAllByLabelText(messages.timepickerLabel.defaultMessage).length).toBe(0);
    expect(queryAllByLabelText(messages.dropdownLabel.defaultMessage).length).toBe(0);
    expect(queryAllByLabelText(entranceExamMessages.requirementsEntrance.defaultMessage).length).toBe(0);
  });
});
