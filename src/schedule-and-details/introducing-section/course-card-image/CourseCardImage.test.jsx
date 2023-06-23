import React from 'react';
import { AppProvider } from '@edx/frontend-platform/react';
import { fireEvent, render, act } from '@testing-library/react';
import { initializeMockApp } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import initializeStore from '../../../store';
import { courseDetailsMock } from '../../__mocks__';
import messages from './messages';
import CourseCardImage from '.';

let store;

const onChangeMock = jest.fn();
const RootWrapper = (props) => (
  <IntlProvider locale="en">
    <AppProvider store={store}>
      <CourseCardImage {...props} />
    </AppProvider>
  </IntlProvider>
);

const props = {
  intl: {},
  courseId: 'foo-course-id',
  courseImageAssetPath: courseDetailsMock.courseImageAssetPath,
  onChange: onChangeMock,
};

describe('<CourseCardImage />', () => {
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
      getByText(messages.courseCardImageLabel.defaultMessage),
    ).toBeInTheDocument();
    expect(
      getByText(messages.courseCardImageHelpText.defaultMessage),
    ).toBeInTheDocument();
    expect(
      getByPlaceholderText(messages.courseCardImageInputPlaceholder.defaultMessage),
    ).toBeInTheDocument();
  });

  it('should call onChange if input value changed', async () => {
    const { getByPlaceholderText } = render(<RootWrapper {...props} />);
    const input = getByPlaceholderText(
      messages.courseCardImageInputPlaceholder.defaultMessage,
    );
    await act(() => {
      fireEvent.change(input, { target: { value: '/assets' } });
    });
    expect(onChangeMock).toHaveBeenCalledWith(
      '/assets',
      'courseImageAssetPath',
    );
  });

  it('should change body text if input cleared', () => {
    const initialProps = { ...props, courseImageAssetPath: '' };
    const { getByText } = render(<RootWrapper {...initialProps} />);
    expect(
      getByText(messages.courseCardImageEmpty.defaultMessage),
    ).toBeInTheDocument();
  });
});
