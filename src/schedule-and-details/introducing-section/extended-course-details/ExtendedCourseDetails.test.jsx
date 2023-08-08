import React from 'react';
import { fireEvent, render, act } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { courseDetailsMock } from '../../__mocks__';
import messages from './messages';
import ExtendedCourseDetails from '.';

// Mock the TextareaAutosize component
jest.mock('react-textarea-autosize', () => jest.fn((props) => (
  <textarea
    {...props}
    onFocus={() => {}}
    onBlur={() => {}}
  />
)));

const onChangeMock = jest.fn();

const RootWrapper = (props) => (
  <IntlProvider locale="en">
    <ExtendedCourseDetails {...props} />
  </IntlProvider>
);

const props = {
  title: courseDetailsMock.title,
  subtitle: courseDetailsMock.subtitle,
  duration: courseDetailsMock.duration,
  description: courseDetailsMock.description,
  onChange: onChangeMock,
};

describe('<ExtendedCourseDetails />', () => {
  it('renders successfully', () => {
    const { getByText, getByLabelText } = render(<RootWrapper {...props} />);
    expect(getByLabelText(messages.extendedTitleLabel.defaultMessage)).toBeInTheDocument();
    expect(getByLabelText(messages.extendedSubtitleLabel.defaultMessage)).toBeInTheDocument();
    expect(getByLabelText(messages.extendedDurationLabel.defaultMessage)).toBeInTheDocument();
    expect(getByLabelText(messages.extendedDescriptionLabel.defaultMessage)).toBeInTheDocument();

    expect(getByText(messages.extendedTitleHelpText.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.extendedSubtitleHelpText.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.extendedDurationHelpText.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.extendedDescriptionHelpText.defaultMessage)).toBeInTheDocument();
  });

  it('should display input values', () => {
    const { getByDisplayValue } = render(
      <RootWrapper {...props} />,
    );

    expect(getByDisplayValue(props.title)).toBeInTheDocument();
    expect(getByDisplayValue(props.subtitle)).toBeInTheDocument();
    expect(getByDisplayValue(props.duration)).toBeInTheDocument();
    expect(getByDisplayValue(props.description)).toBeInTheDocument();
  });

  it('should call onChange if input value changed', async () => {
    const { getByLabelText } = render(<RootWrapper {...props} />);
    const input = getByLabelText(messages.extendedTitleAriaLabel.defaultMessage);
    act(() => {
      fireEvent.change(input, { target: { value: 'abc' } });
    });
    expect(onChangeMock).toHaveBeenCalledWith('abc', 'title');
  });
});
