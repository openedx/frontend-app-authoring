import React from 'react';
import userEvent from '@testing-library/user-event';
import { initializeMocks, render, screen } from '@src/testUtils';
import PublicReadToggle from './PublicReadToggle';
import messages from './messages';

jest.mock('../data/apiHooks', () => ({
  useContentLibrary: jest.fn(),
  useUpdateLibraryMetadata: jest.fn(),
}));

const mockUseContentLibrary = require('../data/apiHooks').useContentLibrary;
const mockUseUpdateLibraryMetadata = require('../data/apiHooks').useUpdateLibraryMetadata;

let mockShowToast;

describe('PublicReadToggle', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    mockShowToast = mocks.mockShowToast;
  });

  it('renders toggle when allowPublicRead is true and canEditToggle is true', () => {
    mockUseContentLibrary.mockReturnValue({ data: { allowPublicRead: true } });
    mockUseUpdateLibraryMetadata.mockReturnValue({ mutateAsync: jest.fn(), isPending: false });

    render(
      <PublicReadToggle libraryId="lib1" canEditToggle />,
    );
    expect(screen.getByText(messages.publicReadToggleLabel.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.publicReadToggleSubtext.defaultMessage)).toBeInTheDocument();
  });

  it('toggle is disabled when canEditToggle is false', () => {
    mockUseContentLibrary.mockReturnValue({ data: { allowPublicRead: true } });
    mockUseUpdateLibraryMetadata.mockReturnValue({ mutateAsync: jest.fn(), isPending: false });

    render(
      <PublicReadToggle libraryId="lib1" canEditToggle={false} />,
    );
    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('calls updateLibrary when toggle is changed', async () => {
    const user = userEvent.setup();
    const mockMutateAsync = jest.fn();
    mockUseContentLibrary.mockReturnValue({ data: { allowPublicRead: false } });
    mockUseUpdateLibraryMetadata.mockReturnValue({ mutateAsync: mockMutateAsync, isPending: false });

    render(
      <PublicReadToggle libraryId="lib1" canEditToggle />,
    );
    await user.click(screen.getByRole('switch'));
    expect(mockMutateAsync).toHaveBeenCalledWith(
      {
        id: 'lib1',
        allow_public_read: true,
      },
      expect.objectContaining({
        onError: expect.any(Function),
      }),
    );
  });

  it('shows error toast when updateLibrary fails', async () => {
    const user = userEvent.setup();
    const mockMutateAsync = jest.fn();

    const error = {
      customAttributes: {
        httpErrorStatus: 500,
      },
    };

    mockMutateAsync.mockImplementation((_, options) => {
      if (options?.onError) {
        options.onError(error);
      }
      return Promise.resolve();
    });

    mockUseContentLibrary.mockReturnValue({ data: { allowPublicRead: false } });
    mockUseUpdateLibraryMetadata.mockReturnValue({ mutateAsync: mockMutateAsync, isPending: false });

    render(
      <PublicReadToggle libraryId="lib1" canEditToggle />,
    );

    await user.click(screen.getByRole('switch'));

    expect(mockMutateAsync).toHaveBeenCalledWith(
      {
        id: 'lib1',
        allow_public_read: true,
      },
      expect.objectContaining({
        onError: expect.any(Function),
      }),
    );

    expect(mockShowToast).toHaveBeenCalledWith(messages.publicReadToggle500Error.defaultMessage);
  });
});
