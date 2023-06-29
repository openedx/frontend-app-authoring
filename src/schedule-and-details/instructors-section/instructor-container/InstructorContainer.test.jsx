import React from 'react';
import { fireEvent, render, act } from '@testing-library/react';
import { AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';

import initializeStore from '../../../store';

import { courseDetailsMock } from '../../__mocks__';
import messages from './messages';
import InstructorContainer from '.';

let store;

const onDeleteMock = jest.fn();
const onChangeMock = jest.fn();
const courseIdMock = 'course-id-bar';
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useParams: () => ({
    courseId: courseIdMock,
  }),
}));

// Mock the TextareaAutosize component
jest.mock('react-textarea-autosize', () => jest.fn((props) => (
  <textarea
    {...props}
    onFocus={() => {}}
    onBlur={() => {}}
  />
)));

const RootWrapper = (props) => (
  <IntlProvider locale="en">
    <AppProvider store={store}>
      <InstructorContainer {...props} />
    </AppProvider>
  </IntlProvider>
);

const props = {
  instructor: courseDetailsMock.instructorInfo.instructors[0],
  idx: 0,
  onChange: onChangeMock,
  onDelete: onDeleteMock,
};

describe('<InstructorContainer />', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    store = initializeStore();
  });

  it('renders successfully', () => {
    const { getByText, getByPlaceholderText } = render(
      <RootWrapper {...props} />,
    );
    expect(
      getByText(messages.instructorNameLabel.defaultMessage),
    ).toBeInTheDocument();
    expect(
      getByText(messages.instructorTitleLabel.defaultMessage),
    ).toBeInTheDocument();
    expect(
      getByText(messages.instructorOrganizationLabel.defaultMessage),
    ).toBeInTheDocument();
    expect(
      getByText(messages.instructorBioLabel.defaultMessage),
    ).toBeInTheDocument();
    expect(
      getByText(messages.instructorPhotoLabel.defaultMessage),
    ).toBeInTheDocument();

    expect(
      getByPlaceholderText(messages.instructorNameInputPlaceholder.defaultMessage),
    ).toBeInTheDocument();
    expect(
      getByPlaceholderText(messages.instructorTitleInputPlaceholder.defaultMessage),
    ).toBeInTheDocument();
    expect(
      getByPlaceholderText(messages.instructorOrganizationInputPlaceholder.defaultMessage),
    ).toBeInTheDocument();
    expect(
      getByPlaceholderText(messages.instructorBioInputPlaceholder.defaultMessage),
    ).toBeInTheDocument();
    expect(
      getByPlaceholderText(messages.instructorPhotoInputPlaceholder.defaultMessage),
    ).toBeInTheDocument();
  });

  it('should display input values', () => {
    const { getByDisplayValue } = render(
      <RootWrapper {...props} />,
    );

    expect(getByDisplayValue(props.instructor.name)).toBeInTheDocument();
    expect(getByDisplayValue(props.instructor.title)).toBeInTheDocument();
    expect(getByDisplayValue(props.instructor.organization)).toBeInTheDocument();
    expect(getByDisplayValue(props.instructor.bio)).toBeInTheDocument();
    expect(getByDisplayValue(props.instructor.image)).toBeInTheDocument();
  });

  it('should call onChange if input value changed', async () => {
    const { getByPlaceholderText } = render(<RootWrapper {...props} />);
    const nameInput = getByPlaceholderText(messages.instructorNameInputPlaceholder.defaultMessage);
    await act(() => {
      fireEvent.change(nameInput, { target: { value: 'abc' } });
    });
    expect(onChangeMock).toHaveBeenCalledWith('abc', props.idx, 'name');
  });

  it('should call onDelete if button delete clicked', async () => {
    const { getByRole } = render(<RootWrapper {...props} />);
    const deleteBtn = getByRole('button', { name: messages.instructorDelete.defaultMessage });
    await act(() => {
      fireEvent.click(deleteBtn);
    });
    expect(onDeleteMock).toHaveBeenCalledWith(props.idx);
  });
});
