import { render, waitFor } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import initializeStore from '../../store';
import messages from '../messages';
import WithoutModes from './CertificateWithoutModes';

const courseId = 'course-123';
let store;

const renderComponent = (props) => render(
  <AppProvider store={store} messages={{}}>
    <IntlProvider locale="en">
      <WithoutModes courseId={courseId} {...props} />
    </IntlProvider>
  </AppProvider>,
);

describe('CertificateWithoutModes', () => {
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

  it('renders correctly', async () => {
    const { getByText, queryByText } = renderComponent();
    await waitFor(() => {
      expect(getByText(messages.withoutModesText.defaultMessage)).toBeInTheDocument();

      expect(queryByText(messages.headingActionsPreview.defaultMessage)).not.toBeInTheDocument();
      expect(queryByText(messages.headingActionsDeactivate.defaultMessage)).not.toBeInTheDocument();
    });
  });
});
