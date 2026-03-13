import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import userEvent from '@testing-library/user-event';
import PublicReadToggle from './PublicReadToggle';
import messages from './messages';

jest.mock('../data/apiHooks', () => ({
  useContentLibrary: jest.fn(),
  useUpdateLibraryMetadata: jest.fn(),
}));

const mockUseContentLibrary = require('../data/apiHooks').useContentLibrary;
const mockUseUpdateLibraryMetadata = require('../data/apiHooks').useUpdateLibraryMetadata;

const renderWithIntl = (ui: React.ReactElement) => render(
  <IntlProvider
    locale="en"
    messages={{
      publicReadToggleLabel: messages.publicReadToggleLabel.defaultMessage,
      publicReadToggleSubtext: messages.publicReadToggleSubtext.defaultMessage,
    }}
  >
    {ui}
  </IntlProvider>,
);

describe('PublicReadToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders toggle when allowPublicRead is true and canEditToggle is true', () => {
    mockUseContentLibrary.mockReturnValue({ data: { allowPublicRead: true } });
    mockUseUpdateLibraryMetadata.mockReturnValue({ mutateAsync: jest.fn(), isPending: false });

    const { getByText } = renderWithIntl(
      <PublicReadToggle libraryId="lib1" canEditToggle />,
    );
    expect(getByText(messages.publicReadToggleLabel.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.publicReadToggleSubtext.defaultMessage)).toBeInTheDocument();
  });

  it('toggle is disabled when canEditToggle is false', () => {
    mockUseContentLibrary.mockReturnValue({ data: { allowPublicRead: true } });
    mockUseUpdateLibraryMetadata.mockReturnValue({ mutateAsync: jest.fn(), isPending: false });

    const { getByRole } = renderWithIntl(
      <PublicReadToggle libraryId="lib1" canEditToggle={false} />,
    );
    expect(getByRole('switch')).toBeDisabled();
  });

  it('calls updateLibrary when toggle is changed', async () => {
    const user = userEvent.setup();
    const mockMutateAsync = jest.fn();
    mockUseContentLibrary.mockReturnValue({ data: { allowPublicRead: false } });
    mockUseUpdateLibraryMetadata.mockReturnValue({ mutateAsync: mockMutateAsync, isPending: false });

    const { getByRole } = renderWithIntl(
      <PublicReadToggle libraryId="lib1" canEditToggle />,
    );
    await user.click(getByRole('switch'));
    expect(mockMutateAsync).toHaveBeenCalledWith({
      id: 'lib1',
      allow_public_read: true,
    });
  });
});
