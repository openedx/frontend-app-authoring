import {
  fireEvent,
  screen,
  render as defaultRender,
  waitFor,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { UnlinkModal } from './UnlinkModal';
import messages from './messages';

const onUnlinkSubmitMock = jest.fn();
const closeMock = jest.fn();

const renderforContainer = () => defaultRender(
  <IntlProvider locale="en">
    <UnlinkModal
      isOpen
      close={closeMock}
      category="chapter"
      displayName="Introduction to Testing"
      onUnlinkSubmit={onUnlinkSubmitMock}
    />
  </IntlProvider>,
);

const renderforComponent = () => defaultRender(
  <IntlProvider locale="en">
    <UnlinkModal
      isOpen
      close={closeMock}
      category="component"
      onUnlinkSubmit={onUnlinkSubmitMock}
    />
  </IntlProvider>,
);

describe('<UnlinkModal />', () => {
  it('render UnlinkModal component correctly for containers', () => {
    renderforContainer();

    expect(screen.getByText('Unlink Introduction to Testing?')).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to unlink this library Section reference/i)).toBeInTheDocument();
    expect(
      screen.getByText(/subsections contained in this Section will remain linked to their library versions./i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.cancelButton.defaultMessage })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.unlinkButton.defaultMessage })).toBeInTheDocument();
  });

  it('render UnlinkModal component correctly for components', () => {
    renderforComponent();

    expect(screen.getByText('Unlink this component?')).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to unlink this library Component reference/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/will remain linked to their library versions./i),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.cancelButton.defaultMessage })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.unlinkButton.defaultMessage })).toBeInTheDocument();
  });

  it('calls onDeleteSubmit function when the "Unlink" button is clicked', async () => {
    renderforContainer();

    const okButton = screen.getByRole('button', { name: messages.unlinkButton.defaultMessage });
    fireEvent.click(okButton);
    await waitFor(() => {
      expect(onUnlinkSubmitMock).toHaveBeenCalledTimes(1);
    });
  });

  it('calls the close function when the "Cancel" button is clicked', async () => {
    renderforContainer();

    const cancelButton = screen.getByRole('button', { name: messages.cancelButton.defaultMessage });
    fireEvent.click(cancelButton);
    expect(closeMock).toHaveBeenCalledTimes(1);
  });
});
