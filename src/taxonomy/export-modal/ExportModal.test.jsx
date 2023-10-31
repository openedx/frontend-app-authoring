import React from 'react';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { render, fireEvent } from '@testing-library/react';
import ExportModal from '.';
import initializeStore from '../../store';
import { callExportTaxonomy } from '../api/hooks/selectors';

const onClose = jest.fn();
let store;
const taxonomyId = 1;

jest.mock('../api/hooks/selectors', () => ({
  callExportTaxonomy: jest.fn(),
}));

const ExportModalComponent = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <ExportModal intl={injectIntl} taxonomyId={taxonomyId} onClose={onClose} isOpen />
    </IntlProvider>
  </AppProvider>
);

describe('<ExportModal />', async () => {
  beforeEach(async () => {
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

  it('should render the modal', () => {
    const { getByText } = render(<ExportModalComponent />);
    expect(getByText('Select format to export')).toBeInTheDocument();
  });

  it('should call export endpoint', () => {
    const { getByText } = render(<ExportModalComponent />);

    fireEvent.click(getByText('JSON file'));
    fireEvent.click(getByText('Export'));

    expect(onClose).toHaveBeenCalled();
    expect(callExportTaxonomy).toHaveBeenCalledWith(taxonomyId, 'json');
  });
});
