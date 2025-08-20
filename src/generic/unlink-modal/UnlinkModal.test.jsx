import { fireEvent, render, waitFor } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { UnlinkModal } from './UnlinkModal';
import messages from './messages';

const onUnlinkSubmitMock = jest.fn();
const closeMock = jest.fn();

const renderComponent = () => render(
  <IntlProvider locale="en">
    <UnlinkModal
      isOpen
      close={closeMock}
      category="chapter"
      displayName="Introduction to Testing"
      onDeleteSubmit={onUnlinkSubmitMock}
    />
  </IntlProvider>,
);

describe('<UnlinkModal />', () => {
  it('render UnlinkModal component correctly', () => {
    const { getByText, getByRole } = renderComponent();

    expect(getByText('Unlink Introduction to Testing?')).toBeInTheDocument();
    expect(getByText(/are you sure you want to unlink this library Section reference/i)).toBeInTheDocument();
    expect(
      getByText(/subsections contained in this Section will remain linked to their library versions./i),
    ).toBeInTheDocument();
    expect(getByRole('button', { name: messages.cancelButton.defaultMessage })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.unlinkButton.defaultMessage })).toBeInTheDocument();
  });

  it('calls onDeleteSubmit function when the "Unlink" button is clicked', async () => {
    const { getByRole } = renderComponent();

    const okButton = getByRole('button', { name: messages.unlinkButton.defaultMessage });
    fireEvent.click(okButton);
    waitFor(() => {
      expect(onUnlinkSubmitMock).toHaveBeenCalledTimes(1);
    });
  });

  it('calls the close function when the "Cancel" button is clicked', async () => {
    const { getByRole } = renderComponent();

    const cancelButton = getByRole('button', { name: messages.cancelButton.defaultMessage });
    fireEvent.click(cancelButton);
    expect(closeMock).toHaveBeenCalledTimes(1);
  });
});
