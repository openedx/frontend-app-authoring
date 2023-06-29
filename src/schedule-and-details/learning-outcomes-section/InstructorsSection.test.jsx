import React from 'react';
import {
  act, fireEvent, render, waitFor,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { courseDetailsMock } from '../__mocks__';
import messages from './messages';
import LearningOutcomesSection from '.';

const onChangeMock = jest.fn();
const RootWrapper = (props) => (
  <IntlProvider locale="en">
    <LearningOutcomesSection {...props} />
  </IntlProvider>
);

const props = {
  learningInfo: courseDetailsMock.learningInfo,
  onChange: onChangeMock,
};

describe('<LearningOutcomesSection />', () => {
  it('renders section successfully', () => {
    const { getByText, getByRole } = render(<RootWrapper {...props} />);
    expect(getByText(messages.outcomesTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.outcomesDescription.defaultMessage)).toBeInTheDocument();
    expect(getByRole('button', { name: messages.outcomesAdd.defaultMessage })).toBeInTheDocument();
  });

  it('should create another learning outcome form on click Add learning outcome', () => {
    const { getAllByRole, getByRole } = render(<RootWrapper {...props} />);
    const addButton = getByRole('button', { name: messages.outcomesAdd.defaultMessage });
    act(() => {
      fireEvent.click(addButton);
    });

    waitFor(() => {
      const deleteButtons = getAllByRole('button', { name: messages.outcomesDelete.defaultMessage });
      expect(deleteButtons.length).toBe(2);
    });
  });

  it('should delete learning outcome form on click Delete', () => {
    const { getAllByRole, getByRole } = render(<RootWrapper {...props} />);
    const deleteButton = getByRole('button', { name: messages.outcomesDelete.defaultMessage });
    act(() => {
      fireEvent.click(deleteButton);
    });

    expect(onChangeMock).toHaveBeenCalledWith([], 'learningInfo');
    waitFor(() => {
      const deleteButtons = getAllByRole('button', { name: messages.outcomesDelete.defaultMessage });
      expect(deleteButtons.length).toBe(0);
    });
  });

  it('should call onChange if input value changed', () => {
    const { getByPlaceholderText } = render(<RootWrapper {...props} />);
    const input = getByPlaceholderText(messages.outcomesInputPlaceholder.defaultMessage);
    act(() => {
      fireEvent.change(input, { target: { value: 'abc' } });
    });

    expect(onChangeMock).toHaveBeenCalledWith(['abc'], 'learningInfo');
  });
});
