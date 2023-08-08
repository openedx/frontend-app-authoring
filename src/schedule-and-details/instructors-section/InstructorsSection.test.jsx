import React from 'react';
import {
  act, fireEvent, render, waitFor,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { courseDetailsMock } from '../__mocks__';
import messages from './messages';
import instructorMessages from './instructor-container/messages';
import InstructorsSection from '.';

const onChangeMock = jest.fn();
const courseIdMock = 'course-id-bar';

// Mock the TextareaAutosize component
jest.mock('react-textarea-autosize', () => jest.fn((props) => (
  <textarea
    {...props}
    onFocus={() => {}}
    onBlur={() => {}}
  />
)));

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useParams: () => ({
    courseId: courseIdMock,
  }),
}));

const RootWrapper = (props) => (
  <IntlProvider locale="en">
    <InstructorsSection {...props} />
  </IntlProvider>
);

const props = {
  instructors: courseDetailsMock.instructorInfo.instructors,
  onChange: onChangeMock,
};

describe('<InstructorsSection />', () => {
  it('renders section successfully', () => {
    const { getByText, getByRole } = render(<RootWrapper {...props} />);
    expect(getByText(messages.instructorsTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.instructorsDescription.defaultMessage)).toBeInTheDocument();
    expect(getByRole('button', { name: messages.instructorAdd.defaultMessage })).toBeInTheDocument();
  });

  it('should create another instructor form on click Add new instructor', () => {
    const { getAllByRole, getByRole } = render(<RootWrapper {...props} />);
    const addButton = getByRole('button', { name: instructorMessages.instructorDelete.defaultMessage });
    act(() => {
      fireEvent.click(addButton);
    });

    waitFor(() => {
      const deleteButtons = getAllByRole('button', { name: instructorMessages.instructorDelete.defaultMessage });
      expect(deleteButtons.length).toBe(2);
    });
  });

  it('should delete instructor form on click Delete', () => {
    const { getAllByRole, getByRole } = render(<RootWrapper {...props} />);
    const deleteButton = getByRole('button', { name: instructorMessages.instructorDelete.defaultMessage });
    act(() => {
      fireEvent.click(deleteButton);
    });

    expect(onChangeMock).toHaveBeenCalledWith({ instructors: [] }, 'instructorInfo');
    waitFor(() => {
      const deleteButtons = getAllByRole('button', { name: instructorMessages.instructorDelete.defaultMessage });
      expect(deleteButtons.length).toBe(0);
    });
  });

  it('should call onChange if input value changed', () => {
    const { getByPlaceholderText } = render(<RootWrapper {...props} />);
    const inputName = getByPlaceholderText(instructorMessages.instructorNameInputPlaceholder.defaultMessage);
    act(() => {
      fireEvent.change(inputName, { target: { value: 'abc' } });
    });

    expect(onChangeMock).toHaveBeenCalledWith({
      instructors: [{
        bio: props.instructors[0].bio,
        image: props.instructors[0].image,
        name: 'abc',
        organization: props.instructors[0].organization,
        title: props.instructors[0].title,
      }],
    }, 'instructorInfo');
  });
});
