import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import ModalError from './ModalError';
import messages from './messages';

const handleUndoChangesMock = jest.fn();
const showErrorModalMock = jest.fn();

const errorList = [
  { key: 'setting1', message: 'Error 1' },
  { key: 'setting2', message: 'Error 2' },
];

const settingsData = {
  setting1: 'value1',
  setting2: 'value2',
};

const RootWrapper = () => (
  <IntlProvider locale="en">
    <ModalError
      isError
      handleUndoChanges={handleUndoChangesMock}
      showErrorModal={showErrorModalMock}
      errorList={errorList}
      settingsData={settingsData}
    />
  </IntlProvider>
);

describe('<ModalError />', () => {
  it('calls handleUndoChanges when "Undo changes" button is clicked', () => {
    const { getByText } = render(<RootWrapper />);
    const undoChangesButton = getByText(messages.modalErrorButtonUndoChanges.defaultMessage);
    fireEvent.click(undoChangesButton);
    expect(handleUndoChangesMock).toHaveBeenCalledTimes(1);
  });
  it('calls showErrorModal when "Change manually" button is clicked', () => {
    const { getByText } = render(<RootWrapper />);
    const changeManuallyButton = getByText(messages.modalErrorButtonChangeManually.defaultMessage);
    fireEvent.click(changeManuallyButton);
    expect(showErrorModalMock).toHaveBeenCalledTimes(1);
  });
  it('renders error message with correct values', () => {
    const { getByText } = render(<RootWrapper />);
    expect(getByText(/There was/i)).toBeInTheDocument();
    expect(getByText(/2 validation error/i)).toBeInTheDocument();
    expect(getByText(/while trying to save the course settings in the database. Please check the following validation feedbacks and reflect them in your course settings:/i)).toBeInTheDocument();
    expect(getByText(messages.modalErrorTitle.defaultMessage)).toBeInTheDocument();
  });
  it('renders correct number of errors', () => {
    const { getByText } = render(<RootWrapper />);
    expect(getByText('Error 1')).toBeInTheDocument();
    expect(getByText('Error 2')).toBeInTheDocument();
  });
});
