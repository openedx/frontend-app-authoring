import React from 'react';
import { initializeMockApp } from '@edx/frontend-platform';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { fireEvent, render, waitFor } from '@testing-library/react';

import initializeStore from '../../store';
import messages from './messages';
import FileSection from './FileSection';

let store;
const courseId = '123';

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <FileSection intl={injectIntl} courseId={courseId} />
    </IntlProvider>
  </AppProvider>
);

describe('<FileSection />', () => {
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
  it('should render without errors', async () => {
    const { getByText } = render(<RootWrapper />);
    await waitFor(() => {
      expect(getByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
    });
  });
  it('should displays Dropzone when import is not triggered or in success stage or has an error', async () => {
    const { getByTestId } = render(<RootWrapper />);
    await waitFor(() => {
      expect(getByTestId('dropzone')).toBeInTheDocument();
    });
  });
  it('should work Dropzone', async () => {
    const {
      getByText, getByTestId, queryByTestId, container,
    } = render(<RootWrapper />);

    const dropzoneElement = getByTestId('dropzone');

    const file = new File(['file contents'], 'example.tar.gz', { type: 'application/gzip' });
    fireEvent.drop(dropzoneElement, { dataTransfer: { files: [file], types: ['Files'] } });

    await waitFor(() => {
      expect(getByText('File chosen: example.tar.gz')).toBeInTheDocument();
      expect(queryByTestId(container, 'dropzone')).not.toBeInTheDocument();
    });
  });
});
